# Contact verification — 2026-09-11

The Contact hero adapts the supplied `Web-sections/contact/v9.1.27/resources/malla-contact.html` terrain, projection and traveling light bands into a route-local React canvas. The existing title, invitation, anchor, published contact record, shared navigation and footer remain intact. The form now prepares an email draft instead of running a demonstration confirmation.

## Behavior and accessibility

- Required-field validation, field-associated errors, keyboard submission and first-invalid focus were exercised in Chromium at desktop, tablet and mobile sizes.
- The mailto navigation contains the correct recipient, selected topic, name, work email, organisation and message, including ampersands, newlines and hash characters. Form values remain available after handoff. No server POST is made. Sending requires the visitor's configured email application; no delivery is asserted or tested.
- Canvas pixels change during motion and remain unchanged during manual pause, offscreen pause and reduced motion. Returning upward and navigating away/back resume correctly. A retained detached canvas stops changing after route unmount.
- Cold reduced-motion loading still paints a static frame. JavaScript-disabled rendering and an unavailable canvas context retain visible SVG artwork and direct contact links.
- A simulated `document.hidden` visibility event produced zero additional draws and resumed correctly. This checks the visibility handler, not real browser tab scheduling across engines.
- Desktop (1440 × 900), tablet (768 × 1024) and mobile (390 × 844) screenshots were inspected. No page errors or horizontal overflow occurred. A separate 320px test also passes.

## Automated checks

- `npx playwright test tests/e2e/contact.spec.ts --workers=1 --reporter=line`: 12 passed across three Chromium projects.
- Shared smoke suite: 46 passed, one expected desktop mobile-menu skip, one tablet Products same-route scroll mismatch (5px). That unchanged navigation case passed in isolation with one worker. No shared navigation code was changed.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`: passed.
- Impeccable context, Contact surface brief and detector were used. Remaining detector advisories concern alpha-mask black values (not displayed colors) and the retained 17px mobile lead size. The red/blue artwork colors follow the user's supplied reference, as recorded in the Contact brief.

## Rendering sample and limits

Rendering is capped at 30 fps on larger viewports and 24 fps on mobile, with 44 × 18 and 28 × 12 points respectively. Those are ceilings, not guaranteed achieved rates. Pixel density is capped; frames, observers and listeners are cleaned up on unmount.

A three-second local Chromium sample with 4× CPU throttling found the mock's per-frame shadow blur expensive. Removing it while retaining the batched halo paths reduced desktop frame-gap p95 from 136.4ms to 79.8ms. Final draw-call p95 was 6.2ms desktop and 3.1ms mobile; mobile frame-gap p95 was 51.7ms. Throttled desktop rendering therefore remains below the configured frame-rate ceiling. These are short development-server observations, not hardware-wide benchmarks or evidence for Firefox/Safari.

Local screenshots, the sampling script and JSON measurements are in the ignored `test-results/contact-review/` directory. Playwright may clear ignored test output on future runs.
