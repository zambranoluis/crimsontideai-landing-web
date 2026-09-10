---
version: 1
slug: "src-app-contact-page-tsx"
primary_target: "src/app/contact/page.tsx"
related_targets: []
---

# Surface brief — Contact (`/contact`)

**Status: demo implemented.** The route is an accessible client-side form demonstration; no submission endpoint exists and no message is delivered.

## Job and audience

Someone who has decided to talk to CrimsonTide and is carrying context from wherever they came from — a product, a solution, the case study, or a partnership interest. They are at the point of highest intent and lowest patience. Visitor mode: **Operate**.

## Outcome and proof

**Primary task:** provide a safe, accessible demonstration of the enquiry interaction and make direct fallback channels available.

**Success:** a clear confirmation that states the demonstration did not send a message, with direct email and phone fallback.

This is the site's primary conversion. Every other route exists to deliver a visitor here.

## Selected direction

Sequence: hero invitation → support and contact context → form → follow-up expectation.

Support precedes the form in document order, with *What happens next* inside the support area — so the visitor knows what they are committing to before they start typing.

The published contact record (email, phone, both offices with hours) belongs in the support area. For a corporate buyer, a real address and a phone number are part of the credibility argument, not just fallback channels.

**Focal moment:** the confirmation state. It is the last thing the visitor sees and the only proof the site keeps its promise.

## Scope and boundaries

**Anti-goals:** no booking-calendar integration, no chat widget, no automatic topic preselection from the referring route (no mechanism exists), no modal.

## States and ranges

The form has more states than the rest of the site combined, and every one must be designed:

- **Empty** — the default.
- **Invalid** — per field, with the error associated to its own field, not only to a shared status region.
- **Submitting** — the button must be unmistakably busy and re-submission blocked.
- **Demo confirmation** — an explicit, prominent statement that no message was sent, not a silent reset or delivery claim.

The published contact details must remain reachable in the failed state; if the form breaks, the phone number is the fallback.

## Interaction and layout

Labels are visible, never placeholder-only. Errors are associated to their fields and announced. Focus moves to the first invalid field on a failed submit, and to the confirmation on success.

Everything works by keyboard and touch without hover. Reduced motion removes transitions without removing feedback.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA — including target size and consistent help, which this route exercises more than any other.

**Decisions:** name, work email, and message are required; organisation and topic are optional. The form makes no network request and does not imply delivery. `info@crimsontide.ai` and `+1 (876) 458-4187` remain reachable as direct alternatives. A real submission destination and the associated privacy/consent design remain future work.

Reuses: SiteHeader, SiteFooter, SectionLabel, ActionLink, and the implemented contact form controls.
