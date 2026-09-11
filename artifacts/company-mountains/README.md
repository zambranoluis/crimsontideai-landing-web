# Home company mountain refinement

Added the `company-mountains` preset for Home's Jamaica photograph section. Its asymmetric peaks stay anchored while ambient motion varies height by at most four pixels on an 800px canvas. Existing Home, OpenJM and Sentinel equations remain unchanged. Photo shading and terrain masking are separate; the SVG samples the same mountain geometry and uses the same line and point opacity values. Pointer attraction, taps, adaptive quality, suspension and cleanup reuse the existing runtime.

The photograph, copy, content layout, links, footer and other routes are unchanged. At 360px the artwork moves down to accommodate additional text wrapping. Changes are uncommitted.

## Evidence

- [Desktop production](production-1440.png)
- [Small desktop production](production-1024.png)
- [Tablet production](production-768.png)
- [Mobile production](production-393.png)
- [Narrow mobile production](production-360.png)
- [Production without JavaScript](production-no-js-1440.png)
- Animated, reduced-motion, no-JavaScript and canvas-failure captures for all three Playwright device profiles are also in this directory.

Full-section screenshots hide the fixed header and skip link. Animated test captures expose offscreen Reveal content only during capture; real reveal visibility is checked separately. Production captures use reduced motion or JavaScript disabled.

## Verification

- Final serial run: `npx playwright test tests/e2e/company-mountains.spec.ts tests/e2e/mesh.spec.ts tests/e2e/home-backgrounds.spec.ts --workers=1 --reporter=line` — **40 passed, 8 intentional device-specific skips**. [Log](../company-mountains-final-tests.log)
- The broader serial run also covered all `mesh-core.spec.ts` and `home-products-motion.spec.ts` cases, including unchanged preset equations, geometry stability, pointer release, ripple bounds, scheduler lifecycle, bidirectional scrolling and route motion. Those cases passed. The initial run caught a screenshot-test reveal-threshold setup issue, corrected before the final run, and one hover timing failure that passed unchanged both in isolation and in the final serial run. [Original broad log](../company-mountains-tests.log)
- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check` passed.
- [Impeccable detector](impeccable.json): advisory findings only, for existing type sizes, existing mesh crimson, and black used as opacity-mask data.
- [Production contrast measurements](contrast.json): sampled the lightest background pixel throughout each heading/paragraph rectangle with its text hidden. Minimum sampled contrast was 4.68:1, 4.78:1, 7.04:1, 7.73:1 and 7.73:1 at widths 1440, 1024, 768, 393 and 360 respectively. No horizontal overflow. This is a conservative check of this composition, not a whole-site accessibility audit.
- Browser evidence is Chromium and emulated tablet/mobile, not physical-device, Safari or Firefox coverage. The temporary production server on port 3002 was stopped; the existing development server on port 3001 was preserved.
