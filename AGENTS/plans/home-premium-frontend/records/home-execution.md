# Home execution evidence

This record owns detailed observed execution evidence. The complete plan owns scope.

## Stage 1 - Foundations and navigation

Foundations, shared controls, home shell, header and footer implemented. Typecheck passed after the header accessibility correction. Source/diff review found no out-of-scope source changes. Headless navigation probe passed all three configured Chromium profiles (3/3, 7.3s); covered current route, menu opening focus, Escape return, outside pointer dismissal, navigation dismissal, destinations and no horizontal overflow. Run: `npm run test:e2e -- -- tests/e2e/home-premium.probe.spec.ts --grep 'navigation and focus' --reporter=line --output=test-results/home-premium-stage1-corrected --workers=1`.

The first probe exposed the summary's generic accessibility role; an explicit button role and expanded state corrected it. A later probe clicked content covered by the open menu; the outside-pointer test now targets the actual outside region. At 1024–1279px the desktop header uses a second navigation row to preserve readable full navigation.

Operational limitation: npm consumed the first run's options with a single separator, so Playwright used its default output directories and replaced the pre-existing report and last-run metadata. They were not backed up and cannot be claimed preserved. Subsequent runs use verified double-separator forwarding, a line reporter and unique output directories. The existing port-3000 server is reused, not owned by this execution.

## Stage 2 - Complete home experience

Implemented all five home sections, separate product visuals, labelled conceptual case media, approved company principles, closing CTA, hero canvas, entrance reveals and footer atmosphere. Typecheck and lint passed. Headless complete-composition probes passed desktop, tablet and mobile (3/3, 18.9s), checking approved Home copy extracted directly from docs/content.md, five-section structure, product/case/company/solution destinations, unresolved link absence, canvas readiness, console errors and overflow. Full-page screenshots for all three profiles were reviewed; desktop case and tablet company captures received focused review. Stage 3 will improve the case illustration centering and inspect the wider responsive/motion matrix. Focused section captures can include the sticky header; subsequent isolated composition captures will hide it only during capture, while sticky-header behavior is checked separately. Run output: test-results/home-premium-stage2.

## Stage 3 - Visual and behavioral refinement

Stage 3 corrections centered the conceptual case illustration, removed its tablet letterboxing, enlarged wordmark hit areas, preserved keyboard focus across both directions of the 1024px navigation breakpoint, and added product-panel border feedback. Final screenshot review covered desktop/tablet/mobile; the final width matrix covered 360, 390, 768, 900, 1024, 1280, 1440 and 1920px with no horizontal overflow, clipped measured text or undersized measured controls. Final matrix: 3/3 passed in 12.1s (test-results/home-premium-final-widths).

Observed headless runs through the existing repository server:

- Complete composition after illustration refinement: 3/3 passed, 19.3s; test-results/home-premium-final-composition. Copy/link/console checks and screenshots for all three profiles.
- Final tablet/mobile navigation, composition and actual touchscreen taps with reduced motion: 6/6 passed, 20.2s; test-results/home-premium-final-touch-visuals.
- Final desktop navigation, composition, card-border intermediate states and longer content: 3/3 passed, 10.9s; test-results/home-premium-final-desktop.
- Mounted navigation focus, keyboard anchors and skip link, button/reveal intermediate samples, stable geometry, live/stopped mesh pixels, footer animation, preference changes, no-JavaScript content and native menu, visibility seam and unmount: 4/4 passed, 13.1s; test-results/home-premium-behavior-final. JSON timing samples retained there. An earlier offscreen assertion failed because part of the hero was still onscreen; the corrected probe explicitly scrolled past it, then observed stopped pixels.

Limits: native 200% browser zoom did not respond to headless keyboard input (devicePixelRatio remained 1); a 640x400 CSS viewport equivalent of 1280x800 at 200% passed, but native zoom remains unverified. Document-hidden handling was tested with a deterministic document.hidden override and visibility event, not physical tab switching. Chromium emulation does not prove physical devices or Safari. Screenshots are reviewed captures, not approved snapshot baselines. Future routes remain unavailable; the /company navigation in the cleanup test established unmount only, not a completed cross-page journey.

Source review retained static copy, separate products, non-attribution of the case to a product, conceptual-media labelling and unresolved destination absence. Scoped formatting preserved emitted TSX JavaScript and CSS non-whitespace content. The existing body flex foundation was retained and the width matrix rerun successfully. Stage 4 remains: remove disposable probe, execute final checks, reconcile plan and tracking.

## Stage 4 - Final verification and closure

Final completion checks passed: `npm run lint` (exit 0), `npm run typecheck` (exit 0), and `npm run build` (exit 0). The production build compiled, completed TypeScript, generated four static pages, finalized optimization and reported `/` and `/_not-found` as static routes. Relevant tracked diff and all new source files were reviewed; `git diff --check` and per-new-file whitespace checks passed. The temporary `tests/e2e/home-premium.probe.spec.ts` was removed; `git diff --exit-code -- docs package.json package-lock.json playwright.config.ts tests/e2e` passed.

Bounded final reconciliation compared the complete approved action plan including Planning basis with route composition, globals/layout, header/footer, section and UI components, directly observed runs and all tracking artifacts. Approved copy and factual boundaries, independent products, code-generated conceptual media, exact future-route destinations, existing framework/Roboto/CSS Modules and port-3000 runtime remain intact. No new dependency, route or canonical test was added. The change-summary row separator was repaired during tracking review; approval and original planning basis were preserved. No implementation omission remains. Native zoom and real tab switching remain verification limits, and the first-run report replacement remains an operational preservation failure, as detailed above; closure does not claim those requirements were verified or preserved.

All Playwright runs terminated and no Chrome processes remained at final process inspection. The compatible pre-existing development server (PID 21860, port 3000) remains running and was not stopped. Generated screenshots and diagnostics from this execution remain ignored. No staging, commit or push was performed. Final handoff: implementation complete with the recorded verification limits.
