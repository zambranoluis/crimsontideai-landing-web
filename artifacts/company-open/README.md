# Home Company: open mountain mesh

Implemented locally on 2026-09-11; changes remain uncommitted.

## Result

- Broad asymmetric left-hand ridges descend toward the centre. The desktop mask ends at 65.28% of section width; tablet and phone masks end at 72.96% and 74.88% respectively.
- Canvas bounds are 500px tall on desktop, 350px on tablet and 220px on phones. Tablet copy has 60px of extra space beneath it so exposed connections remain open.
- Company grids: high 18 by 60, medium 14 by 46, low 10 by 34. The SVG fallback samples the same medium configuration at time zero.
- A 12-second traveling swell reaches approximately 8 CSS pixels on desktop and 5 on narrower canvases. The skyline, horizontal coordinates and outer boundaries remain fixed during ambient motion.
- Local masks attenuate the mesh beneath copy independently of the photograph. Existing photo, copy, principles, CTA, interactions and lifecycle remain in place.

## Evidence

Production reduced-motion and no-JavaScript captures: `production-{width}.png` and `production-no-js-{width}.png`, for widths 1440, 1280, 768, 390 and 360.

Timed animated captures: `{width}-0s.png` and `{width}-3s.png`. These names describe the interval between captures, not the animation's absolute phase. The screenshot-only style exposes Reveal content and disables its transitions; separate behavioral tests exercise the real Reveal lifecycle. Fixed navigation is hidden for section captures.

`contrast.json` measures computed text colors against the lightest photograph/mesh pixel within each heading and paragraph rectangle, with text temporarily hidden. All five production layouts pass, without horizontal overflow; minimum ratios are 6.27, 7.48, 7.30, 7.73 and 7.73 respectively. This is a conservative static composition measurement, not a complete accessibility audit.

## Verification

- Serial focused matrix (`company-mountains`, `mesh`, `mesh-core`, `home-backgrounds`): 56 passed, 38 intentional project skips and two desktop failures on the initial run (`../company-open-tests.log`).
- The fractional-width assertion was corrected to compare visual bounds with computed CSS width rather than integer `clientWidth`. Both desktop checks then passed in isolation (`../company-open-recheck.log`); the other failure was a one-off initial canvas readiness timeout.
- After correcting tablet text contrast: five tablet composition/CTA checks passed, six project-specific cases skipped (`../company-open-tablet-confirmation.log`), and the explicit 768px timed motion test passed (`../company-open-tablet-motion.log`).
- Deterministic geometry checks cover all quality tiers, separated rows, displacement bounds, descending ridges, fixed skyline, traveling swell, cycle closure and SVG coordinate agreement. Existing equations for other variants remain covered.
- Browser checks cover timed pixel changes with zero changes in the protected city, up/down scroll placement, pointer release, tap recovery, control exclusions, touch scrolling, keyboard CTA navigation, offscreen/document-hidden pause/resume, reduced motion, no JavaScript, canvas failure/restoration and navigation cleanup.
- ESLint, TypeScript, production build and `git diff --check` passed.
- Impeccable output is in `impeccable.json`. Findings are advisory: retained typography, the existing crimson mesh color, and black/alpha values used as masks. No design identity changes were made to silence them.

Browser evidence is Chromium desktop and emulated tablet/phone coverage; it does not claim physical-device, Safari or Firefox verification.

Reproduce production captures with `node artifacts/company-open-production.mjs` while the current production build is served on port 3002.
