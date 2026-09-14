# Immersive 404 verification

Date: 2026-09-13. Local preview: http://localhost:3001/__404-preview (an intentionally unmatched URL).

## Implementation

Root `src/app/not-found.tsx` renders a branded recovery page with a real 404 response, page-specific metadata, Home and Contact actions, a linked wordmark, and a compact footer. All content and links are server-rendered. A small pathname-aware wrapper registers the actual missing path with the existing navigation provider.

The 404-only dynamic import loads Three.js 0.186.0. Its sphere has a procedural dark surface, Natural Earth continent points, atmosphere, three independently moving orbital signals, a slow ambient rotation, and a surface pulse triggered by click, tap, or keyboard. Dragging rotates the Earth and it resumes its ambient rotation on release; arrow keys and Home provide the keyboard equivalent without visible movement controls. The separate Canvas 2D terrain provides ambient waves, local mouse hover light/deformation, and up to three fading click ripples. Parallax moves artwork only. No scroll pinning is used.

Animation starts only after the shared scene visibility observer reports an intersection. It suspends offscreen, document-hidden, or reduced-motion. Hidden time does not accumulate. Unmount aborts texture loading, cancels frames, removes listeners, and disposes the GPU context. Context loss displays the poster until restoration. If both canvas paths fail, recurring work stops.

Reduced-motion and no-JavaScript compositions use transparent posters captured from the implemented renderers. Image origins are embedded in all three PNGs and recorded in `public/pages/not-found/SOURCES.md`. The source illustration is the composition reference; the user selected an authored 3D interpretation rather than pixel-identical illustrated material.

## Checks completed

| Check | Result |
| --- | --- |
| Focused Chromium development suite | 30 passed, 3 intentional mouse/touch skips |
| Focused Chromium production suite | 30 passed, 3 intentional mouse/touch skips |
| Terrain geometry/interaction checks | 3 passed |
| Final production metadata, nested missing paths, native recovery and existing 404 route-health checks | 6 passed after metadata correction |
| ESLint | Passed, no warnings |
| Typecheck | Passed |
| Isolated production build | Passed, final source |
| `git diff --check` | Passed (repository line-ending notices only) |
| Impeccable detector | Advisory findings only: reference grid, route-local atmospheric colors and display/decorative type sizes |
| Asset provenance scan | 3 rasters, 0 missing origins |

Functional coverage includes 404 response codes; one heading and one page title; local poster loading; Home/Contact destinations and focus; browser Back; stationary copy during parallax; bounded/expiring terrain clicks; mouse exit; click/tap/keyboard signals; drag rotation and ambient-spin resumption; mounted reduced-motion changes; no JavaScript; missing texture; canvas unavailability; actual WebGL context loss/restoration; offscreen pause; controlled document-visibility changes; unmount cleanup; 320px overflow; forced colors; and automated WCAG A/AA checks.

Commands and reports:

```powershell
$env:TEST_RUN_LABEL='not-found'
npx playwright test tests/e2e/not-found.spec.ts --workers=1

$env:TEST_GROUP='unit'
npx playwright test tests/e2e/not-found-core.spec.ts --workers=1

# Use a fresh PowerShell for the production commands.
$env:TEST_PRODUCTION_BUILD='1'
npm run build
node node_modules/next/dist/bin/next start --port 3101

# In another shell, against that running production server:
$env:TEST_BASE_URL='http://localhost:3101'
$env:TEST_RUN_LABEL='not-found-production'
npx playwright test tests/e2e/not-found.spec.ts --workers=1
```

The 404 suite is included in the existing production/cross-browser selection pattern. Firefox and WebKit were not executed in this task.

## Visual review

Two grouped capture rounds inspected desktop 1680×945, laptop 1280×800, tablet 768×1024, and mobile 390×844. The second round corrected desktop scene expansion and tablet footer crowding. Additional production captures inspect reduced-motion desktop and no-JavaScript mobile. All six final images were opened and checked.

Captures: `.impeccable/review/not-found/{desktop,laptop,tablet,mobile,reduced-desktop,nojs-mobile}.png`.

The desktop document is 952px tall at a 945px viewport; the small laptop document is 870px tall at an 800px viewport. Content remains in natural flow rather than being cropped to force an exact viewport height. No horizontal overflow was measured. Tablet and phone retain content → actions → globe → footer order.

Impeccable review disposition: **ship**, at the scope of the accepted 3D interpretation. Review was performed in-thread because a separate reviewer agent was unavailable. Full five-part review: `.impeccable/review/not-found/review.md`.

## Performance and limits

Production measurement on this Windows host used headless Chromium with ANGLE/SwiftShader software rendering, not the physical GPU:

| Profile | Measured draw rate | Adaptive tier |
| --- | --- | --- |
| 1680×945 desktop | 26.8fps | Low |
| 390×844 touch profile | 30.0fps | Low |

The measure counts completed scene draw calls over three seconds following warmup. These are local observations, not physical-device or cross-browser guarantees. The full desktop tier targets 60fps and degrades to a 30fps tier under sustained frame pressure. Mobile starts at the lower tier. The renderer retains its drawing buffer to support reproducible transparent poster captures; this has a GPU memory/bandwidth cost.

The production Home page did not request the chunk containing Three.js. Measurement output is `.impeccable/review/not-found/production-measurements.json`; that run preceded the metadata-only title correction, which the subsequent six production checks verify. Reproduce with `node scripts/verify-not-found-production.mjs` while port 3101 serves the isolated build.

The visible globe is smoother and less sculpted than the supplied illustration. Its rotation, lighting, occlusion, and interaction are real-time. Keyboard and tap provide the same decorative signal; no information is available exclusively through pointer motion.

## Design-system handoff

Existing `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, global tokens, Wordmark, and navigation conventions were checked. They remain unchanged. The 404 surface brief records its local composition and approved exceptions.

- Palette: existing crimson actions, dark field, cool-white decorative light.
- Type: existing Roboto; locally oversized 404 numerals and smaller decorative annotations.
- Layout: desktop split composition, responsive natural flow, compact footer.
- Motion: bounded art-only parallax, a 180-second Earth rotation, and the existing visibility/reduced-motion contract.
- Controls: native links, visible focus, keyboard/tap signal, and drag rotation without visible movement controls.

No global token or documentation drift was repaired. Changes are uncommitted; no deployment was performed. The temporary port-3101 verification server is stopped at handoff; the existing port-3001 development server is retained.
