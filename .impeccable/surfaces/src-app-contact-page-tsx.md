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

The hero Reveal plus navigation, fragment, footer, and history behavior follows the shared rules in `DESIGN.md`. The support and form region is intentionally static rather than a Reveal group.

## Ordered experience walkthrough

1. **Initial appearance:** the hero is immediately readable. *Start a conversation* targets `#contact-form`, where support details precede form controls in document order.
2. **Downward entry:** the hero stays visible until it fully exits and then resets offscreen. The support and form do not gain entrance choreography; direct email, phone, office details, hours, expectations, and all fields are immediately readable at their destination.
3. **Upward re-entry:** returning toward the top replays the hero at the shared 22% upward gate. Direction changes while it is still visible do not restart it.
4. **Validation and focus:** submitting empty or malformed required fields shows field-associated errors and moves focus to the first invalid field. Editing a field clears its own error. Name, work email, and message are required; organisation and topic remain optional.
5. **Busy and confirmation:** a valid demo submission sets `aria-busy`, disables the submit button, and labels it *Preparing demo confirmation…*. After 650ms, focus moves to the prominent *Your message was not sent* confirmation. *Start another demo* restores a fresh empty form. No network request is made.
6. **Actions and destinations:** `mailto:info@crimsontide.ai` and `tel:+18764584187` remain direct alternatives before and inside confirmation. Header/footer, the form fragment, and browser-history return follow the shared rules.
7. **Mobile:** support remains before the form, controls stack with touch-accessible labels and targets, and validation/confirmation behavior is identical without hover.
8. **Reduced motion and no JavaScript:** reduced motion keeps the hero and all static content visible and removes transition-dependent feedback. Without JavaScript the rendered contact details and form fields remain readable, but the client-side demonstration validation, busy state, and confirmation do not run; direct contact alternatives remain available.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA — including target size and consistent help, which this route exercises more than any other.

**Decisions:** name, work email, and message are required; organisation and topic are optional. The form makes no network request and does not imply delivery. `info@crimsontide.ai` and `+1 (876) 458-4187` remain reachable as direct alternatives. A real submission destination and the associated privacy/consent design remain future work.

Reuses: SiteHeader, SiteFooter, ActionLink, and the implemented contact form controls.
