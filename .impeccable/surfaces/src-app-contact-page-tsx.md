---
version: 1
slug: "src-app-contact-page-tsx"
primary_target: "src/app/contact/page.tsx"
related_targets:
  - "src/app/contact/_sections"
  - "src/app/api/contact"
---

# Surface brief — Contact (`/contact`)

## Job and audience

Help visitors begin a conversation about products, solutions, software or partnerships. Visitor mode: **Operate**. Keep the published email, phone, both offices and hours visible before the form.

## Current behavior

The form validates name, work email and message on both client and server. Organisation and topic are optional. Limits are 120 characters for name, 254 for email, 200 for organisation and 5,000 for message; topics are allowlisted. Errors attach to their fields and focus moves to the first invalid field. Editing clears that field's error.

**Start Conversation** submits JSON to `POST /api/contact`. The Node.js endpoint sends an enquiry to `info@crimsontide.ai`, then awaits a separate visitor acknowledgement through Google Workspace SMTP. Each includes the complete submitted details. Credentials stay server-side. Keep the form layout and published direct email/phone channels.

Guidance reads “Send your enquiry directly to our team. We’ll email you a confirmation and a copy of your message.” The button progresses **Start Conversation → Sending… → Message sent**; disable overlapping submissions and field edits while sending. After success or confirmation failure, clear the fields, retain the corresponding accessible status, and restore the button label after three seconds. Confirmation failure explains that the enquiry was sent and need not be submitted again. Other failures preserve values. Lost connections, malformed gateway responses and timeouts report uncertain delivery; never retry automatically. Abort the client request and clear the reset timer on unmount.

The server rejects cross-origin browser submissions, header controls, a filled honeypot and bodies larger than 32 KB. These are basic protections, not a defence against targeted automation. Development always uses a mock and explicitly says no emails were sent. Production success means SMTP acceptance, not proven inbox receipt. See `docs/contact-email-setup.md` for setup and manual delivery verification.

Without JavaScript, form controls and submission remain disabled, and a visible message directs visitors to email `info@crimsontide.ai`. Direct contact links and static artwork remain usable. A persistent polite live region announces sending and results outside the busy fieldset; validation errors retain field associations and focus handling.

## Hero and motion

Preserve the existing heading, description, crimson punctuation, shared Reveal behavior and **Start a conversation** anchor to `#contact-form`.

The supplied v9.1.27 Contact web mock owns the terrain geometry, slow undulation and traveling red/blue light bands. Use a local canvas component, not an iframe. Its blue highlights belong to this explicitly supplied artwork and do not change global color roles.

Bound rendering to 30 fps on larger viewports and 24 fps on mobile, with capped pixel density and fewer mobile points. Cancel animation frames when the canvas is offscreen, hidden, reduced motion is requested, or the component unmounts. Resume without a time jump. Defer hidden/offscreen resizing until visible and remove all listeners and observers on unmount.

Reduced motion retains a static canvas frame. No JavaScript or unavailable canvas retains server-rendered SVG terrain. The animation is decorative; its canvas and fallback are hidden from assistive technology. The user explicitly requested removal of the pause/play control; ambient motion runs whenever eligible.

Fine mouse pointers gently brighten and lift points within 140px of the cursor, smoothing over approximately 250ms. Background clicks send an expanding, fading 900ms ripple; retain at most three. Combined displacement never exceeds 8px. Coordinates are relative to the responsive canvas. Text stays stationary; links, buttons and keyboard clicks do not launch ripples. Reset all input on pointer exit/cancel, suspension, resizing and navigation. Touch and reduced motion retain ambient/static artwork without cursor effects.

Under Jamaica, retain “What happens next” in the previous small uppercase label style and the approved review paragraph in body typography. Separate it with 32px space, a 1px existing border-token divider and 24px inner space. Keep it in the contact-details column, before the form on mobile.

## Scope and verification

Keep shared navigation, footer, product identity and published contact information intact. No booking, chat, consent claims or response-time promises. No database, queue or automatic resend service.

Playwright covers desktop/tablet/mobile, server submission, sending locks, success/reset, partial success, failures, uncertain timeouts, keyboard validation/order, status semantics, retained values, narrow width overflow, no-JavaScript fallback, motion preferences, offscreen/hidden suspension, pointer and ripple behavior, and route cleanup. Backend tests cover validation, request rejection, escaped multipart templates, separate recipients/Reply-To, sequential sends and transport failures. Visual checks preserve the reference-inspired composition and readable form layout.
