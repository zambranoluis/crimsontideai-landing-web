import "server-only";
import nodemailer, { type SendMailOptions } from "nodemailer";
import { isEmail, type ContactValues } from "../../contact/contact-validation";

export const companyAddress = "info@crimsontide.ai";
export type Mailer = { mocked: boolean; sendMail: (mail: SendMailOptions) => Promise<{ accepted: unknown[] }> };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
const review = "We’ll review your message to understand the context and determine the best way to continue the conversation.";

export function contactEmails(values: ContactValues): [SendMailOptions, SendMailOptions] {
  const topic = values.topic || "General enquiry";
  const details = [["Name", values.name], ["Email", values.email], ["Organisation", values.organisation || "Not provided"], ["Topic", topic], ["Message", values.message]];
  const text = details.map(([label, value]) => `${label}: ${value}`).join("\n\n");
  const html = details.map(([label, value]) => `<p style="margin:0 0 20px;overflow-wrap:anywhere"><strong>${label}</strong><br>${escapeHtml(value).replace(/\n/g, "<br>")}</p>`).join("");
  const template = (heading: string, intro: string) => `<!doctype html><html lang="en"><body style="margin:0;background:#07090d;color:#f4f6f8;font:16px/1.6 Arial,sans-serif"><main style="max-width:600px;margin:auto;padding:32px"><p style="color:#ef3340;font-weight:bold">CrimsonTide</p><h1 style="font-size:26px">${heading}</h1><p>${escapeHtml(intro)}</p>${html}</main></body></html>`;
  const common = { from: { name: "CrimsonTide", address: companyAddress }, disableFileAccess: true, disableUrlAccess: true };
  const thanks = `Thank you, ${values.name}, for contacting CrimsonTide. ${review}`;
  return [
    { ...common, to: companyAddress, replyTo: { name: values.name, address: values.email }, subject: `Website enquiry — ${topic}`, text: `Website enquiry\n\n${text}`, html: template("Website enquiry", "A visitor submitted the following enquiry.") },
    { ...common, to: { name: values.name, address: values.email }, replyTo: companyAddress, subject: "We’ve received your enquiry — CrimsonTide", text: `${thanks}\n\n${text}`, html: template("We’ve received your enquiry", thanks) },
  ];
}

export function createContactMailer(env: NodeJS.ProcessEnv = process.env): Mailer {
  if (env.NODE_ENV !== "production") {
    // Development never connects to SMTP, even if credentials are present.
    const mock = nodemailer.createTransport({ jsonTransport: true });
    return { mocked: true, async sendMail(mail) { await mock.sendMail(mail); return { accepted: [mail.to] }; } };
  }
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_APP_PASSWORD?.replace(/\s/g, "");
  if (!user || !isEmail(user) || !pass) throw new Error("Contact SMTP configuration is missing or invalid.");
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com", port: 465, secure: true,
    auth: { user, pass }, tls: { minVersion: "TLSv1.2" },
    dnsTimeout: 10_000, connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000,
    disableFileAccess: true, disableUrlAccess: true,
  });
  return { mocked: false, sendMail: mail => transport.sendMail(mail) };
}

export function definitelyNotSent(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { code, responseCode, command } = error as { code?: string; responseCode?: number; command?: string };
  // Nodemailer also labels lost connections/timeouts after DATA as CONN.
  // Only an explicit rejection or an unambiguously pre-delivery error is safe.
  return (typeof responseCode === "number" && responseCode >= 400 && responseCode <= 599)
    || ["EAUTH", "EDNS", "EENVELOPE"].includes(code ?? "")
    || ["AUTH", "EHLO", "HELO", "MAIL FROM", "RCPT TO"].includes(command ?? "");
}
