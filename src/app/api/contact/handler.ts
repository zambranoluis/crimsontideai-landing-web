import "server-only";
import { validateContact, type ContactOutcome, type ContactErrors } from "../../contact/contact-validation";
import { contactEmails, createContactMailer, definitelyNotSent, type Mailer } from "./mail";

const maxBytes = 32 * 1024;
const respond = (outcome: ContactOutcome, status: number, extra: { errors?: ContactErrors; mocked?: boolean } = {}) => Response.json({ outcome, ...extra }, { status, headers: { "Cache-Control": "no-store" } });

export async function handleContact(request: Request, getMailer: () => Mailer = createContactMailer): Promise<Response> {
  const origin = request.headers.get("origin");
  // Configure the host/proxy to preserve the public request URL. Do not trust forwarded headers here.
  if ((origin && origin !== new URL(request.url).origin) || ["cross-site", "same-site"].includes(request.headers.get("sec-fetch-site") ?? "")) return respond("rejected", 403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return respond("rejected", 415);
  if (Number(request.headers.get("content-length")) > maxBytes) return respond("rejected", 413);
  let input: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return respond("rejected", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); return respond("rejected", 413); }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { return respond("rejected", 400); }
  const { values, errors } = validateContact(input);
  if (errors.website) return respond("rejected", 400);
  if (Object.keys(errors).length) return respond("invalid", 400, { errors });
  let mailer: Mailer;
  try { mailer = getMailer(); } catch { return respond("submission_failed", 503); }
  const [enquiry, acknowledgement] = contactEmails(values);
  try {
    const info = await mailer.sendMail(enquiry);
    if (!info.accepted.length) return respond("submission_failed", 502);
  } catch (error) { return respond(definitelyNotSent(error) ? "submission_failed" : "uncertain", 502); }
  try {
    const info = await mailer.sendMail(acknowledgement);
    if (!info.accepted.length) return respond("confirmation_failed", 200, { mocked: mailer.mocked });
  } catch { return respond("confirmation_failed", 200, { mocked: mailer.mocked }); }
  return respond("success", 200, { mocked: mailer.mocked });
}
