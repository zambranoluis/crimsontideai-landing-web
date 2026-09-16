# Error-page preview verification

## Surface direction

`/error-preview` is a development-only, immersive recovery-page preview in the existing Deep Field world. Its desktop composition follows the supplied 1672 × 941 reference: recovery copy on the left, a cropped crimson planet at upper right, astronaut and terrain in the foreground, then the compact CrimsonTide footer. On narrow screens the reading order is copy and recovery actions, scene, then footer.

The interaction is decorative and artwork-local. Fine-pointer movement adds eased depth to the supplied clouds, planet, dust, terrain, and grounded astronaut; alpha masks derived from the supplied planet, terrain, and astronaut PNGs reject transparent image rectangles. The Canvas 2D layer owns the searchlight, sparse cloud wisps, terrain glow, and capped dust particles. Planet, terrain, astronaut, and cloud interactions receive distinct hover feedback; click or tap produces a short disturbance without intercepting recovery content.

Once Canvas initializes, the astronaut is a named button: arrow keys aim the searchlight, Home resets it, and Enter or Space emits a dust disturbance at the aimed location. A compact Pause animation button stops/resumes ambient motion. Touch taps aim and disturb without preventing page scrolling; touch does not enable camera parallax. Reduced motion disables parallax, drifting, and scattering but keeps steady aiming and brief illumination feedback. The shared lifecycle gate pauses the one animation frame loop when the artwork is hidden, offscreen, reduced, manually paused, or unmounted. The server-rendered PNG layers, content, and links remain usable if Canvas or module initialization fails and without JavaScript.

## Asset provenance

All scene imagery is supplied in `public/error_page/`:

- `cloud-stars.png`, `planet.png`, `red-dust.png`, `terrain.png`, and `astronaut.png` are the five separately rendered scene layers used by the route.
- `preview.png` is the supplied 1672 × 941 visual reference only. It is not rendered by the page.

No generated replacement artwork or extracted preview composite is shipped.

## Verification

- `npx eslint src/app/error-preview tests/e2e/error-preview.spec.ts`, `npm run typecheck`, and `git diff --check` passed. ESLint has no configured CSS parser, so it reports the module stylesheet as ignored rather than linting it.
- Serial Chromium: `TEST_RUN_LABEL=error-preview-atmospheric npx playwright test tests/e2e/error-preview.spec.ts --workers=1` passed 17 checks with 7 intentional single-coverage skips. It covers desktop, tablet, mobile, 320 × 568, transformed layer depth and pointer exit, alpha-mask targeting, planet/terrain hover states, bounded click bursts, repeated keyboard activation, pause/resume, live reduced-motion changes, offscreen suspension, recovery-navigation cleanup, touch aiming/scrolling, Canvas failure, and no JavaScript.
- The active desktop Canvas pass measured `0.30ms` draw time with 100 particles, 12 wisps, and pixel ratio 1. The runtime caps pixel ratio at 1.5 and reduces particle density after sustained over-budget draws.
- Neutral, terrain-hover, and burst captures were reviewed at 1280 × 800: `artifacts/error-preview-atmospheric-{neutral,terrain-hover,burst}.png`. The supplied layers retain clean clipping and grounded feet; the hint and pause control remain legible without crossing annotations or recovery content.
- One scoped Impeccable detection pass is run after the route files are final. Any local palette/type advisories are assessed against the supplied artwork composition rather than normalized into shared primitives.

Browser coverage is Chromium on Windows with emulated tablet/mobile profiles. Firefox, WebKit, physical-device performance, and production-route availability were not exercised in this enhancement pass; `/error-preview` remains development-only by its existing route guard.
