# Contact email setup

`POST /api/contact` runs in the Next.js Node.js runtime. It sends the company enquiry to `info@crimsontide.ai`, then awaits a separate acknowledgement to the visitor. Both messages use `CrimsonTide <info@crimsontide.ai>` as From. The company message uses the visitor as Reply-To; the acknowledgement uses `info@crimsontide.ai`.

## Development and automated checks

`npm run dev` always uses Nodemailer's in-memory JSON transport, even if SMTP credentials exist. It never connects to SMTP, logs message content, writes enquiries to disk or sends email. Successful responses include `mocked: true`, and the form explicitly says no emails were sent. Do not expose a development server as a live contact service.

```bash
npm run test:contact
npx playwright test tests/e2e/contact.spec.ts tests/e2e/contact-email.spec.ts --workers=1
npm run lint
npm run typecheck
npm run build
```

The backend runner uses the `react-server` condition solely to load server-only modules in Node tests. Backend tests inject mock transports; browser tests intercept outcome responses, except one check per viewport against the real local development endpoint and its in-memory transport. These checks do not prove SMTP connectivity or inbox receipt. Run the browser suite against `npm run dev`, not a credentialed production server.

## Production configuration

Hosting is not selected. Use a Node.js host that permits outbound TCP on port 465. This endpoint cannot run from a static export or an Edge-only host. Its route duration is 120 seconds; ensure the host and proxy allow that duration. The browser times out after 125 seconds and reports uncertain delivery. Preserve the public URL origin in the request received by Next.js; the handler compares Origin against `request.url` and deliberately does not trust arbitrary forwarded headers. Check this behind the chosen proxy before launch.

Add these private environment variables through the host's secret settings, or an ignored root `.env.local` when deliberately running a local production smoke test:

```dotenv
SMTP_USER=info@crimsontide.ai
SMTP_APP_PASSWORD=
```

Set `SMTP_APP_PASSWORD` privately to a Google app password. Never paste it into chat, commit it, or use a `NEXT_PUBLIC_` variable. Spaces in an app password are stripped. Production fails with a generic unavailable response if credentials are missing; it never falls back to a mock.

Authentication must use an actual Google Workspace mailbox. If `info@crimsontide.ai` is an alias, authenticate with its owning mailbox and authorize `info@crimsontide.ai` as that mailbox's sending identity. A Google Group cannot authenticate as a mailbox: provision or select an authorized mailbox and configure the permitted From identity before testing. Gmail may rewrite an unauthorized From address. The company recipient and From remain fixed in server code; visitors cannot override them. See [Nodemailer's Gmail guide](https://nodemailer.com/guides/using-gmail) for sender behavior.

The mailbox needs two-step verification and permission to create an app password. Workspace policy can prevent app passwords; verify this with the administrator. See [Google's app-password requirements](https://support.google.com/accounts/answer/185833?hl=en). SMTP connects to `smtp.gmail.com:465` with immediate TLS, certificate verification and a minimum of TLS 1.2. See [Nodemailer SMTP configuration](https://nodemailer.com/smtp).

## Outcomes and limits

| Outcome | Meaning | Form behavior |
| --- | --- | --- |
| `success` (200) | SMTP accepted both messages | Clear fields; retain success status |
| `confirmation_failed` (200) | Company email accepted; visitor email rejected or its acceptance uncertain | Clear fields; explain no resubmission is needed |
| `submission_failed` (502/503) | Explicit SMTP rejection, pre-delivery failure or unavailable configuration | Preserve fields; offer retry/direct email |
| `uncertain` (502) | Company acceptance cannot be established | Preserve fields; advise checking before resending |
| `invalid` (400) | Field validation failed | Preserve fields; focus first invalid field |
| `rejected` (400/403/413/415) | Honeypot, origin, size, JSON or content-type rejection | Preserve fields; direct email guidance |

Client network failures, malformed responses and timeouts are also uncertain. Nodemailer may label a dropped connection after DATA as `CONN`; that label alone is not proof the message was unsent. A browser abort does not recall an email or guarantee cancellation of server work. There are no automatic resends, durable idempotency records, database, queue or confirmation retry service. Manually repeating an uncertain submission can send a duplicate.

Request bodies are limited to 32 KB, including streamed bodies. Client and server validate name, email and message, allowlisted optional topics and optional organisation. Header controls and recipient lists are rejected, submitted HTML is escaped, and email content cannot read files or URLs. Cross-origin browser submissions and a hidden honeypot are checked. These basic controls do not stop targeted scripts that can forge headers; no rate limiter or CAPTCHA is included in this selected first scope.

## Manual two-inbox smoke test

After configuring the intended Node.js host and authorized mailbox:

1. Open `/contact` on the actual public origin. Use a controlled visitor inbox and a uniquely identifiable test message, including a topic, organisation, punctuation and a line break.
2. Submit once. Confirm the sending lock and eventual status, cleared fields and three-second button reset. If delivery is uncertain, check both inboxes before considering a repeat.
3. In the company inbox, check the enquiry subject, complete fields/message, visible From and visitor Reply-To. Include Spam/Junk in the check.
4. In the visitor inbox, check the acknowledgement subject, full message copy, exact review paragraph and company Reply-To. Inspect both HTML and plain-text presentation.
5. Record the origin, test time and which inboxes actually received the messages, without credentials or personal message content. Distinguish a 200 response/SMTP acceptance from each independently verified inbox receipt.

No live delivery or deployment has been verified by the automated checks. The 2026-09-13 implementation audit reported Next.js, sharp and js-yaml advisories; that is historical audit evidence, not a refreshed advisory inventory. Reassess current dependencies separately before release; the email implementation did not upgrade the framework.
