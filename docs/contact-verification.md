# Contact verification — 2026-09-11

The Contact hero retains the supplied `Web-sections/contact/v9.1.27/resources/malla-contact.html` terrain, projection and traveling light bands in a route-local React canvas. This refinement removes the manual play/pause control and adds local mouse glow and click ripples. The existing title, invitation, anchor, published contact record, shared navigation and footer remain intact. The form still prepares an email draft.

## Behavior and accessibility

- Required-field validation, field-associated errors, keyboard submission and first-invalid focus were exercised in Chromium at desktop, tablet and mobile sizes.
- The mailto navigation contains the correct recipient, selected topic, name, work email, organisation and message, including ampersands, newlines and hash characters. Form values remain available after handoff. No server POST is made. Sending requires the visitor's configured email application; no delivery is asserted or tested.
- The play/pause button is absent. Canvas pixels change during ambient motion and remain unchanged during offscreen suspension and reduced motion. Returning upward and navigating away/back resume correctly. A retained detached canvas stops changing after route unmount.
- Actual rendered paths and pixels verify hover localization within 140 CSS pixels, an 8px combined displacement ceiling, brightening, expanding ripples and exact return to the baseline at 900ms. Live mouse input is checked against desktop and narrow responsive canvas offsets; hero text stays stationary. Hover approaches its target over approximately 250ms.
- Repeated clicks decay fully; a fourth click evicts the oldest of three ripples. Pointer exit/cancel clears input. Controls and keyboard clicks do not create ripples; the CTA still reaches `#contact-form`. Touch emulation and reduced motion disable cursor effects.
- “What happens next” and its exact approved paragraph appear immediately beneath Jamaica in the contact-details column. Computed layout confirms 32px separation, a 1px border and 24px inner spacing, with the previous 11px uppercase label treatment. The block precedes the form on mobile.
- Cold reduced-motion loading still paints a static frame. JavaScript-disabled rendering and an unavailable canvas context retain visible SVG artwork and direct contact links.
- A simulated `document.hidden` visibility event produced zero additional draws, including during a resize, and resumed with cleared input. Offscreen resize also leaves canvas pixels unchanged until re-entry. This checks the visibility handler, not real browser tab scheduling across engines.
- Desktop (1440 × 900), tablet (768 × 1024), mobile (390 × 844) and narrow (320 × 720) screenshots were inspected. No page errors or horizontal overflow occurred. Hover/click stills and a WebM recording capture the live effects.

## Automated checks

- `npx playwright test tests/e2e/contact.spec.ts --workers=1 --reporter=line --output=test-results/contact-final`: 21 passed across three configured Chromium projects (51.5s).
- An earlier wall-clock ripple observation missed the short-lived effect during a build; the unchanged case passed in isolation. Input tests now advance a controlled browser clock, and the complete final serial suite passed.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`: passed.
- Installed Next.js server/client and CSS guidance, Impeccable context, Contact surface brief and explicit detector were used. Remaining detector advisories concern unchanged alpha-mask black values (not displayed colors) and the retained 17px mobile lead size. The red/blue artwork colors follow the supplied reference. The reported stale global design sidecar was left untouched.
- Coverage is Chromium desktop and emulated tablet/mobile. Firefox, WebKit/Safari and physical devices were not exercised in this refinement.

## Rendering sample and limits

Rendering remains capped at 30 fps on larger viewports and 24 fps on mobile, with 44 × 18 and 28 × 12 points respectively. Pixel density remains capped at 1.35 desktop and 1.2 mobile. Those are ceilings, not guaranteed achieved rates. The existing loop processes input without React state updates or another animation loop. Shared lifecycle observation targets the canvas; frames, observers and input listeners are cleaned up on unmount.

The earlier pre-refinement implementation was sampled for three seconds with 4× CPU throttling: removing per-frame shadow blur reduced desktop frame-gap p95 from 136.4ms to 79.8ms, with draw-call p95 of 6.2ms desktop and 3.1ms mobile. Those historical measurements were not repeated for the pointer effects and are not current performance claims or evidence for other engines.

Local screenshots, capture scripts, `layout-results.json` and `contact-hover-ripple.webm` are in the ignored `test-results/contact-review/` directory. The final test command used a separate output directory to preserve this evidence. A future default Playwright run may clear it.
