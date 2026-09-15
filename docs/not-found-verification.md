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

## Detailed globe upgrade — 2026-09-14

The 404 retains its content, recovery links, terrain, initial Americas-facing orientation, trackball, keyboard/reset controls, signal behavior, 30fps cadence, and pixel ratio of 1. The Earth now uses local Solar System Scope 2K normal and night maps alongside the Natural Earth mask. A thin atmosphere, two restrained crimson edge flares, finer geographic grid, mapped city clusters, and sharp depth-tested orbits replace the broader haze and uniform continent dots. The sphere geometry is unchanged. Orbital glow remains local to the moving sprites; there is no bloom pass or extra orbit tube geometry.

The three source maps are fetched and decoded in the existing lazy, abortable initialization. Every completed bitmap is closed, including when a sibling map fails or navigation aborts loading. Normal XY, square-root linear night luminance, and land coverage are packed into one RGBA DataTexture. Longitude and tangent basis calculations run in the vertex shader. Inactive pulses skip the wave calculation. These changes reduce per-pixel work and texture sampling. Texture/GPU/initialization failures preserve the poster; a render exception now also disposes the renderer and disables its control. Context restoration retains the existing behavior.

Attribution and modification details are in `public/pages/not-found/SOURCES.md` and browser-readable `credits.html`. The server-rendered footer links to the credits. The normal TIFF-to-PNG conversion was verified to preserve every decoded pixel. The poster is regenerated from the final renderer at 1116×900: its 1.24 aspect matches the camera's narrow-view limit, maintaining consistent canvas/poster scale and providing room for the outer orbit.

Visual evidence lives in `.impeccable/review/not-found-detail/`. Desktop, laptop, tablet, mobile, small phone, landscape, short laptop, full-turn samples every 60 degrees, both pole views, reduced-motion desktop, and no-JavaScript mobile were captured in Chromium. The thin red circle in keyboard rotation captures is the existing keyboard focus outline, not a surface signal or orbit. Flares remain local and geography stays attached to the rotating surface. The renderer is an interactive interpretation of `planet.png`, not a reproduction of its exaggerated illustrated relief.

Performance was measured in headless Chromium on this Windows host using ANGLE/SwiftShader software rendering, three 3-second samples after 2.5 seconds of warmup. The initial original-renderer baseline averaged 22.2fps desktop and 29.9fps mobile. An early detailed material regressed to about 12.5fps desktop; removing anisotropic filtering, packing maps, moving geographic calculations to vertices, removing orbit glow tubes, and skipping inactive pulse calculations recovered performance. The final optimized measurement averaged 18.5fps desktop and 30.0fps mobile. A directly following original-renderer recheck averaged 18.7fps desktop and 29.9fps mobile. The near-contemporaneous original and final results are comparable; this software-rendered desktop does not achieve the 30fps target in either version. These observations are not physical GPU, device, Safari, or Firefox proof. JSON measurements retain both the early baseline and the later comparison; the exploratory `isotropic` run overlapped functional checks and is not used for acceptance.

Reproduction:

```powershell
$env:CAPTURE_OUTPUT='.impeccable/review/not-found-detail'
node scripts/capture-not-found.mjs --globe-poster
node scripts/capture-not-found-states.mjs
node scripts/measure-not-found.mjs current
$env:TEST_RUN_LABEL='not-found-detail'
npx playwright test tests/e2e/not-found.spec.ts --workers=1
```

Keep performance runs separate from other browser suites and builds. `--globe-poster --poster-only` regenerates only the globe poster without altering the terrain poster or capturing the viewport matrix.

The Impeccable detector reported advisory findings for the already-approved background grid, route-owned artwork colors, and decorative type sizes. The hook also reported an existing DESIGN.md/design.json timestamp mismatch; no shared design metadata was changed. The unrelated `.codex/config.toml` edit was present at the start and remains untouched.

Final verification notes:

- Final-source ESLint, TypeScript, isolated production build, and `git diff --check` passed. Detector: 35 advisory findings, no blocking findings. Three terrain unit checks passed.
- The initial development suite exposed a missing company suffix in the 404 document title; the local absolute title now matches the existing test contract. A navigation timing failure from the first development run passed in the production follow-up. Nine production follow-up checks passed, including navigation while the normal map was still pending and closure of the other decoded bitmaps.
- Remaining baseline limitation: the viewport-fit test expects a document/footer height of exactly 568px at 320×568. The page is 595px tall (footer bottom 595.25px), with no horizontal overflow. Removing the added credit link produced exactly the same dimensions; the layout CSS is otherwise unchanged. The visitor can scroll to the footer. This pre-existing composition was retained rather than shrinking copy, artwork, or controls to satisfy the assertion. Its early failure means the later enlarged-text portion of that particular test was not reached in this run.
- Final serial production Chromium suite: **66 passed, 8 intentional pointer/device skips, 1 unchanged 320×568 footer-fit failure**, in 4.2 minutes. Report: `test-results/reports/not-found-detail-final.json`; HTML: `playwright-report/not-found-detail-final/index.html`. This run used a freshly restarted server with the final build. Rotation, touch/keyboard signals, reset, navigation, lifecycle pause/resume, reduced motion, no JavaScript, all three missing maps, draw failure, context loss/restoration, pending-load abort/bitmap cleanup, and cold-load/buffer stability passed on the applicable desktop/tablet/mobile profiles.
- Changes remain uncommitted. The temporary production verification server on port 3101 was stopped; the existing development server on port 3001 was retained.

## Angled rim flares — 2026-09-14

Only the two fixed illumination flares in `globe.ts` changed. They share a procedural shader and plane geometry, disposed through the existing scene traversal. Each has a tiny warm-white center, a long tapered tangential ray, a shorter crossing ray, and a narrow crimson fringe with transparent edges. No radial glow texture is used for these flares. Their positions are calculated from the unit sphere's perspective silhouette at the existing camera distance; the dominant rays sit approximately 45 degrees diagonally. They stay in the fixed world group through Earth rotation. The optical overlays do not write depth, preserving orbital occlusion. Surface lighting, orbital nodes, renderer API, placement, controls, and lifecycle code are unchanged.

The 1116×900 globe poster was regenerated with `node scripts/capture-not-found.mjs --globe-poster`. Desktop, tablet, mobile, landscape, rotated views, both pole views, reduced-motion desktop, and no-JavaScript mobile were visually inspected. Both glints meet the rim without detached circular halos or clipped rays. Captures are in `artifacts/not-found-flares/`; the existing red circle in keyboard captures is the focus outline.

An isolated comparison rendered the previous committed renderer and the new renderer at 1116×900 and 390×315, sampling orbital times 0, 40, and 80 seconds with corresponding Earth rotations. All six RGBA comparisons had **zero changed pixels outside the two local flare neighborhoods**, confirming that the sampled surface and orbital occlusion are preserved. Script and results: `artifacts/not-found-flares/compare-renderers.mjs` and `renderer-comparison.json`.

Final checks:

- Serial production Chromium 404 suite: **66 passed, 8 intentional device/pointer skips, 1 unchanged layout failure** (3.2 minutes). This includes keyboard/touch rotation, signals, reset, navigation cleanup, reduced motion, no JavaScript, missing textures, render failure, context restoration, offscreen/document lifecycle, and cold-load stability. Report: `test-results/reports/not-found-flares-production.json`.
- The sole failure remains the 320×568 footer-fit assertion: document height 595px, footer bottom 595.25px, width 320px. Content can scroll to the footer; no layout code changed. The later enlarged-text assertions in that test were not reached.
- Three terrain unit checks, ESLint, typecheck, isolated production build, and `git diff --check` passed. Impeccable source detection returned no findings. The detector could not scan the PNG when included as a target; rerunning on the changed TypeScript source succeeded, and the poster was checked visually.
- Browser evidence is Chromium on Windows, including emulated mobile/tablet profiles; Firefox, Safari, and physical devices were not checked in this pass.
- Changes remain uncommitted. The production test server on port 3101 exited after the suite; the existing development server on port 3001 was retained.

## Procedural Earth reconstruction — 2026-09-15

The 404 globe surface no longer loads Solar System Scope normal/night textures. It loads `land-mask.png` plus the original deterministic `earth-relief.png` and `earth-lights.png`, then packs relief XY, settlement intensity, and land coverage into the existing single RGBA `DataTexture`. The original land mask remains the only geographic source. The supplied `public/not_found_page/planet.png` was visually assessed and used only as a material/composition reference: no reference pixels were projected, sampled, or shipped in generated maps.

`node scripts/generate-not-found-earth-surface.mjs` regenerates both 2048 x 1024 maps with fixed seed `crimsontide-404-earth-v1`. The current file hashes are captured in `public/pages/not-found/earth-surface-manifest.json`; two consecutive runs produced identical manifests. The generator uses seamless spherical noise for relief and irregular land-masked clusters for cool-white settlements plus sparse transmitter candidates. `docs/not-found-earth-reconstruction.md` contains the detailed specification, scope exclusions, img2threejs 2.0.0 revision (`6e60b5e22419464b4853e01ddb6c0e6f6659a733`), and known approximation. Its Apache-2.0 notice is tooling provenance, not an artwork credit.

The transparent 1116 x 900 `globe-poster.png` was regenerated from the final renderer. Chromium captures at desktop, laptop, tablet, mobile, small phone, landscape and short laptop, plus full turns at 60-degree increments, both poles, reduced motion and no JavaScript, are in `artifacts/not-found-earth-rebuild/final/`. The globe stayed geographically legible across the turntable; wrapping and poles have no visible seam. The thin red circle in keyboard captures remains the existing focus outline, not surface geometry.

Fresh dev-server performance measurements used headless Chromium with ANGLE/SwiftShader software rendering and three three-second samples after warmup. The pre-rebuild baseline averaged 13.35fps desktop and 29.71fps mobile; the post-rebuild run averaged 20.37fps desktop and 30.00fps mobile. These Windows software-renderer observations are comparable local evidence, not physical-GPU, Safari, Firefox, or device guarantees. The mobile profile retained the existing 30fps target; desktop remains below it under SwiftShader.

Final-source checks passed: ESLint, Next type generation plus TypeScript, deterministic generation, `git diff --check`, visual captures, and the serial 404 Chromium suite. The suite result was **75 passed, 8 intentional pointer/device skips, 1 unchanged failure** in 4.3 minutes. The failed desktop-only 320 x 568 footer-fit assertion is the established 595px document / 595.25px footer condition; the globe and footer layout were not changed to compensate, and the 320px width remains free of horizontal overflow. The suite covers desktop/tablet/mobile, reduced motion, no JavaScript, keyboard/touch interactions, navigation, all replacement-map failures, pending-load abort and bitmap cleanup, render failure, context restoration, lifecycle, accessibility, and buffer stability.

The old map files and `credits.html` were removed only after the replacement maps, live renderer and poster were captured. The server-rendered footer no longer exposes “Globe credits”; Natural Earth and generated-asset provenance remain in `public/pages/not-found/SOURCES.md`.
