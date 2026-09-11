---
version: 1
slug: "src-app-contact-page-tsx"
primary_target: "src/app/contact/page.tsx"
related_targets:
  - "src/app/contact/_sections"
---

# Surface brief — Contact (`/contact`)

## Job and audience

Help visitors begin a conversation about products, solutions, software or partnerships. Visitor mode: **Operate**. Keep the published email, phone, both offices and hours visible before the form.

## Current behavior

The form validates name, work email and message. Organisation and topic are optional. Errors attach to their fields and focus moves to the first invalid field. Editing clears that field's error.

**Continue in email** prepares a draft addressed to `info@crimsontide.ai`, including the topic and entered details. The visitor sends through their email application. Keep all entered values visible; there is no delivery confirmation, simulated busy state or server submission endpoint. Direct email and phone links remain available.

Without JavaScript, the static contact channels remain usable and the form has a native mailto action; the composed multi-field draft and custom validation require JavaScript.

## Hero and motion

Preserve the existing heading, description, crimson punctuation, shared Reveal behavior and **Start a conversation** anchor to `#contact-form`.

The supplied v9.1.27 Contact web mock owns the terrain geometry, slow undulation and traveling red/blue light bands. Use a local canvas component, not an iframe. Its blue highlights belong to this explicitly supplied artwork and do not change global color roles.

Bound rendering to 30 fps on larger viewports and 24 fps on mobile, with capped pixel density and fewer mobile points. Cancel animation frames when offscreen, hidden, manually paused, reduced motion is requested, or the component unmounts. Resume without a time jump. Observe container resizing and remove all listeners and observers on unmount.

Reduced motion retains a static canvas frame. No JavaScript or unavailable canvas retains server-rendered SVG terrain. The animation is decorative; its canvas and fallback are hidden from assistive technology. Provide an accessible pause/play control for the optional loop.

## Scope and verification

Keep shared navigation, footer, product identity and published contact information intact. No booking, chat, consent claims or delivery promises. A delivery endpoint remains future work.

Playwright covers desktop/tablet/mobile, the encoded mailto draft, keyboard validation, retained values, narrow width overflow, static fallback, motion preferences, offscreen pause, manual pause and route cleanup. Screenshots verify the reference-inspired composition and readable form layout.
