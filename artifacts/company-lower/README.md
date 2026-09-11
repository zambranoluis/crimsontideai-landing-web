# Home Company: lower mountains

The terrain is anchored to the content grid: the bottom of Proprietary technology below 768px, and the bottom of About CrimsonTide on tablet/desktop. One mesh sits outside Reveal wrappers. Canvas and SVG share 55% opacity and edge fades. Principle paragraphs use the existing lead text token for contrast over the brighter mesh.

Copy, photo shading, section dimensions, foreground positions, mesh geometry and animation remain intact. Before/after geometry in `before.json` and `after.json` matches for all foreground elements at all six widths.

| Width | Before | Final production | No JavaScript | Minimum measured text contrast |
| --- | --- | --- | --- | --- |
| 360 | [Before](before-360.png) | [Final](production-360.png) | [Fallback](production-no-js-360.png) | 6.69:1 |
| 390 | [Before](before-390.png) | [Final](production-390.png) | [Fallback](production-no-js-390.png) | 6.20:1 |
| 768 | [Before](before-768.png) | [Final](production-768.png) | [Fallback](production-no-js-768.png) | 6.00:1 |
| 1024 | [Before](before-1024.png) | [Final](production-1024.png) | [Fallback](production-no-js-1024.png) | 5.58:1 |
| 1280 | [Before](before-1280.png) | [Final](production-1280.png) | [Fallback](production-no-js-1280.png) | 5.58:1 |
| 1440 | [Before](before-1440.png) | [Final](production-1440.png) | [Fallback](production-no-js-1440.png) | 5.67:1 |

Full-section captures hide fixed navigation. The 360px development baseline retains a Menu label from a descendant visibility override; final production captures hide the descendants too. Contrast samples use the brightest background pixel beneath each text rectangle in the static production composition; see `contrast.json`. No horizontal overflow at these widths.

Validation:

- Company composition, Home backgrounds, Company route, mesh and mesh-core suites ran with one worker: 83 passed, 40 intentionally skipped, 3 initially failed. One new 1024px assertion sampled Reveal translation; it now compares layout coordinates and passed its focused rerun. Two tablet initialization checks passed in isolated reruns (the cleanup check required a separate single-test run). Logs are in the parent artifacts directory as `company-lower-*-tests.log` and `company-lower-*-recheck.log`.
- Coverage includes content-based base alignment and content growth, stable section-relative placement in both scroll directions, timed animation, protected city area, pointer/tap behavior, visibility lifecycle and unmount cleanup, reduced motion, no JavaScript, canvas failure, overflow and keyboard navigation.
- Lint, typecheck, production build and `git diff --check` passed after the final edits.
- Impeccable detection reported only retained type sizes, mask black and the existing mesh red; no new unexplained findings.
- Chromium desktop/tablet/mobile emulation only; no physical-device or cross-browser claim.

All changes are uncommitted. Existing unrelated working-tree changes were preserved.
