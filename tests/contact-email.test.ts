import assert from "node:assert/strict";
import { test, mock } from "node:test";
import nodemailer, { type SendMailOptions } from "nodemailer";
import { handleContact } from "../src/app/api/contact/handler";
import { contactEmails, createContactMailer, definitelyNotSent, type Mailer } from "../src/app/api/contact/mail";
import { initialValues, limits, validateContact } from "../src/app/contact/contact-validation";

const valid = { ...initialValues, name: "Avery Brown", email: "avery@example.com", organisation: "A&B Jamaica", topic: "AI Solutions", message: "Cameras & AI?\nLet's discuss #1." };
const request = (data: unknown = valid, headers: HeadersInit = {}) => new Request("https://crimsontide.ai/api/contact", {
  method: "POST", headers: { "content-type": "application/json", origin: "https://crimsontide.ai", ...headers }, body: JSON.stringify(data),
});
const accepted = { accepted: ["recipient@example.com"] };

test("validation preserves full messages, normalizes single lines and permits optional fields", () => {
  const checked = validateContact({ name: "  Élodie 王  ", email: "avery+contact@example.com", message: "  A&B\r\nNext line\rLast line  " });
  assert.deepEqual(checked.errors, {});
  assert.equal(checked.values.name, "Élodie 王");
  assert.equal(checked.values.message, "  A&B\nNext line\nLast line  ");
  assert.equal(checked.values.topic, "");
  for (const [key, max] of Object.entries(limits)) {
    const value = key === "email" ? `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}` : "a".repeat(max);
    assert.equal(validateContact({ ...valid, [key]: value }).errors[key as keyof typeof limits], undefined);
    assert.ok(validateContact({ ...valid, [key]: value + "a" }).errors[key as keyof typeof limits]);
  }
});

test("validation rejects missing fields, header injection, lists, unknown topics and honeypots", () => {
  for (const input of [null, [], "bad", {}, { ...valid, name: 42 }, { ...valid, message: " \n " },
    { ...valid, name: "Avery\r\nBcc: attacker@example.com" }, { ...valid, email: "a@example.com,b@example.com" },
    { ...valid, email: "a@example.com\n" }, { ...valid, email: "Avery <a@example.com>" },
    { ...valid, organisation: "Company\u0000" }, { ...valid, topic: "Unknown" }, { ...valid, website: "bot" },
    { ...valid, website: {} }, { ...valid, topic: [] }]) {
    assert.ok(Object.keys(validateContact(input).errors).length);
  }
});

test("both emails use separate recipients, correct Reply-To, escaped HTML and complete plain text", async () => {
  const values = { ...valid, name: "<Avery> & '王'", message: "<img src=x onerror=alert(1)>\n& \"quoted\"" };
  const [company, visitor] = contactEmails(values);
  assert.equal(company.to, "info@crimsontide.ai");
  assert.deepEqual(company.from, { name: "CrimsonTide", address: "info@crimsontide.ai" });
  assert.deepEqual(company.replyTo, { name: values.name, address: valid.email });
  assert.deepEqual(visitor.to, { name: values.name, address: valid.email });
  assert.equal(visitor.replyTo, "info@crimsontide.ai");
  assert.equal(company.subject, "Website enquiry — AI Solutions");
  assert.equal(visitor.subject, "We’ve received your enquiry — CrimsonTide");
  assert.match(String(visitor.text), /We’ll review your message to understand the context and determine the best way to continue the conversation\./);
  for (const mail of [company, visitor]) {
    assert.ok(String(mail.text).includes(values.message));
    assert.ok(String(mail.text).includes("Organisation: A&B Jamaica"));
    assert.match(String(mail.html), /&lt;img src=x onerror=alert\(1\)&gt;<br>&amp; &quot;quoted&quot;/);
    assert.doesNotMatch(String(mail.html), /<img|<Avery>/);
    assert.equal(mail.cc, undefined);
    assert.equal(mail.bcc, undefined);
    assert.equal(mail.disableFileAccess, true);
    assert.equal(mail.disableUrlAccess, true);
    const transport = nodemailer.createTransport({ streamTransport: true, buffer: true });
    const rendered = await transport.sendMail(mail);
    const mime = rendered.message.toString();
    assert.match(mime, /multipart\/alternative/);
    assert.match(mime, /Content-Type: text\/plain/);
    assert.match(mime, /Content-Type: text\/html/);
    assert.deepEqual(rendered.envelope.to, [mail === company ? "info@crimsontide.ai" : valid.email]);
  }
  assert.equal(contactEmails({ ...valid, topic: "" })[0].subject, "Website enquiry — General enquiry");
});

test("company send finishes before acknowledgement, and the response awaits both", async () => {
  const calls: SendMailOptions[] = [];
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  let secondRelease: () => void = () => {};
  const secondGate = new Promise<void>(resolve => { secondRelease = resolve; });
  const mailer: Mailer = { mocked: true, async sendMail(mail) {
    calls.push(mail);
    await (calls.length === 1 ? gate : secondGate);
    return accepted;
  } };
  let completed = false;
  const pending = handleContact(request(), () => mailer).then(response => { completed = true; return response; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].to, "info@crimsontide.ai");
  release();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls.length, 2);
  assert.equal(completed, false);
  secondRelease();
  const response = await pending;
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { outcome: "success", mocked: true });
});

for (const [title, failure, outcome] of [
  ["authentication", { code: "EAUTH" }, "submission_failed"],
  ["explicit SMTP rejection", { responseCode: 550, command: "DATA" }, "submission_failed"],
  ["timeout after DATA", { code: "ETIMEDOUT", command: "CONN" }, "uncertain"],
  ["closed connection after DATA", { code: "ECONNECTION", command: "CONN" }, "uncertain"],
  ["socket error after DATA", { code: "ESOCKET", command: "CONN" }, "uncertain"],
  ["unknown failure", new Error("private SMTP detail"), "uncertain"],
] as const) {
  test(`${title} never triggers acknowledgement or automatic resend`, async () => {
    let sends = 0;
    const response = await handleContact(request(), () => ({ mocked: false, async sendMail() { sends++; throw failure; } }));
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { outcome });
    assert.equal(sends, 1);
  });
}

test("nonaccepted company email fails; acknowledgement errors are partial success", async () => {
  for (const throws of [false, true]) {
    let sends = 0;
    const response = await handleContact(request(), () => ({ mocked: true, async sendMail() {
      sends++;
      if (sends === 1) return accepted;
      if (throws) throw { code: "ETIMEDOUT", command: "CONN" };
      return { accepted: [] };
    } }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { outcome: "confirmation_failed", mocked: true });
    assert.equal(sends, 2);
  }
  let sends = 0;
  const response = await handleContact(request(), () => ({ mocked: true, async sendMail() { sends++; return { accepted: [] }; } }));
  assert.deepEqual(await response.json(), { outcome: "submission_failed" });
  assert.equal(sends, 1);
});

test("bad requests are rejected before transport creation, including streamed size limits", async () => {
  const noMailer = () => { assert.fail("Transport must not be created"); };
  const cases: [Request, number][] = [
    [request({}, {}), 400], [request({ ...valid, website: "bot" }), 400],
    [request(valid, { origin: "https://attacker.example" }), 403],
    [request(valid, { origin: "null" }), 403],
    [request(valid, { "sec-fetch-site": "cross-site" }), 403],
    [request(valid, { "sec-fetch-site": "same-site" }), 403],
    [request(valid, { "content-type": "text/plain" }), 415],
    [request(valid, { "content-length": "32769" }), 413],
    [request({ ...valid, message: "王".repeat(12000) }), 413],
    [new Request("https://crimsontide.ai/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }), 400],
    [new Request("https://crimsontide.ai/api/contact", { method: "POST", headers: { "content-type": "application/json" } }), 400],
  ];
  let cancelled = false;
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(20000)); controller.enqueue(new Uint8Array(13000)); }, cancel() { cancelled = true; } });
  cases.push([new Request("https://crimsontide.ai/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: stream, duplex: "half" } as RequestInit), 413]);
  for (const [input, status] of cases) assert.equal((await handleContact(input, noMailer)).status, status);
  assert.equal(cancelled, true);
  const response = await handleContact(request(valid), () => { throw new Error("secret config"); });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { outcome: "submission_failed" });
});

test("development always uses an in-memory mock and production requires private credentials", async () => {
  const dev = createContactMailer({ NODE_ENV: "development", SMTP_USER: "unused@example.com", SMTP_APP_PASSWORD: "unused" });
  assert.equal(dev.mocked, true);
  assert.ok((await dev.sendMail(contactEmails(valid)[0])).accepted.length);
  assert.throws(() => createContactMailer({ NODE_ENV: "production" }));
  assert.throws(() => createContactMailer({ NODE_ENV: "production", SMTP_USER: "bad\nheader", SMTP_APP_PASSWORD: "unused" }));
  const create = mock.method(nodemailer, "createTransport", () => ({ sendMail: async () => accepted }));
  try {
    const production = createContactMailer({ NODE_ENV: "production", SMTP_USER: "sender@example.com", SMTP_APP_PASSWORD: "abcd efgh ijkl mnop" });
    assert.equal(production.mocked, false);
    const options = create.mock.calls[0].arguments[0] as { host: string; port: number; secure: boolean; auth: { user: string; pass: string }; tls: { minVersion: string } };
    assert.equal(options.host, "smtp.gmail.com");
    assert.equal(options.port, 465);
    assert.equal(options.secure, true);
    assert.deepEqual(options.auth, { user: "sender@example.com", pass: "abcdefghijklmnop" });
    assert.equal(options.tls.minVersion, "TLSv1.2");
  } finally { create.mock.restore(); }
  assert.equal(definitelyNotSent({ code: "EDNS" }), true);
  assert.equal(definitelyNotSent(null), false);
});
