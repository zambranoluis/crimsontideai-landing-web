# Immersive 404

Local preview: any unmatched URL, for example `http://localhost:3001/__404-preview`.

## Implementation

Root `src/app/not-found.tsx` renders a branded recovery page with a real 404 response, page-specific metadata, Home and Contact actions, a linked wordmark and a compact footer. All content and links are server-rendered. A small pathname-aware wrapper registers the actual missing path with the existing navigation provider.

A 404-only dynamic import loads Three.js 0.186.0; the Home page never requests that chunk. The globe has a procedural surface, atmosphere, a finer geographic grid, mapped settlement clusters, three independently moving orbital signals with depth-tested orbits, a slow ambient rotation (one turn in 180 seconds, starting Americas-facing) and a surface pulse triggered by click, tap or keyboard. Dragging rotates the Earth and ambient rotation resumes on release; arrow keys and Home do the same from the keyboard, without visible movement controls. Two fixed crimson rim flares (a warm-white center, a long tapered ray, a shorter crossing ray and a narrow crimson fringe) sit at the sphere's perspective silhouette, about 45 degrees diagonal; they stay in the fixed world group, do not write depth and use no radial glow texture. Orbital glow stays local to the moving sprites; there is no bloom pass. A separate Canvas 2D terrain provides ambient waves, local hover light and deformation, and up to three fading click ripples. Parallax moves artwork only; nothing pins on scroll.

The surface loads `land-mask.png`, `earth-relief.png` and `earth-lights.png` and packs relief XY, settlement intensity and land coverage into one RGBA `DataTexture`; longitude and tangent-basis calculations run in the vertex shader, and inactive pulses skip the wave calculation. Loading is lazy and abortable, and every decoded bitmap is closed, including when a sibling map fails or navigation aborts loading.

Animation starts only after the shared scene visibility observer reports an intersection, and suspends offscreen, while the document is hidden or with reduced motion; hidden time does not accumulate. Unmount aborts texture loading, cancels frames, removes listeners and disposes the GPU context. Texture, GPU, initialization or render failure keeps the poster and disables the globe control; context loss shows the poster until restoration. If both canvas paths fail, recurring work stops.

Reduced-motion and no-JavaScript compositions use transparent posters captured from the implemented renderers (`globe-poster.png` at 1116×900, whose 1.24 aspect matches the camera's narrow-view limit, and `terrain-poster.png`).

## Assets and regeneration

`public/pages/not-found/` holds the land mask, the generated relief and lights maps, both posters, `earth-surface-manifest.json` (file hashes of the generated maps) and `SOURCES.md` (Natural Earth and generated-asset provenance). The land mask is the only geographic source. `public/not_found_page/planet.png` is a material and composition reference only; none of its pixels are projected, sampled or shipped.

- `node scripts/generate-not-found-earth-surface.mjs` regenerates both 2048×1024 maps from fixed seed `crimsontide-404-earth-v1`; repeated runs produce an identical manifest. [404 Earth reconstruction](not-found-earth-reconstruction.md) holds the detailed specification and known approximation.
- `node scripts/capture-not-found.mjs --globe-poster` regenerates the globe poster from the live renderer; add `--poster-only` to leave the terrain poster and viewport captures alone. `node scripts/capture-not-found-states.mjs` captures the state matrix.

## Performance

The scene draws at most 30 frames a second with pixel ratio 1. The renderer keeps its drawing buffer so transparent posters can be captured reproducibly, at some GPU memory and bandwidth cost. Under headless Chromium with ANGLE/SwiftShader software rendering, the mobile profile holds 30fps and the desktop profile stays below it; this says nothing about physical GPUs, Safari, Firefox or devices. `node scripts/measure-not-found.mjs current` measures draw rate, and `node scripts/verify-not-found-production.mjs` checks the production build on port 3101; run them apart from other browser suites and builds.

## Tests

`tests/e2e/not-found.spec.ts` covers 404 response codes, one heading and page title, local poster loading, Home and Contact destinations and focus, browser Back, stationary copy during parallax, bounded and expiring terrain clicks, mouse exit, click/tap/keyboard signals, drag rotation and resumption, reset, navigation while maps are pending and bitmap cleanup, mounted reduced-motion changes, no JavaScript, each missing map, draw failure, canvas unavailability, WebGL context loss and restoration, offscreen pause, controlled document visibility, unmount cleanup, cold-load buffer stability, 320px overflow, forced colors and automated WCAG A/AA checks. `tests/e2e/not-found-core.spec.ts` holds the terrain unit checks.

```powershell
$env:TEST_RUN_LABEL='not-found'
npx playwright test tests/e2e/not-found.spec.ts --workers=1

$env:TEST_GROUP='unit'
npx playwright test tests/e2e/not-found-core.spec.ts --workers=1

# Production: in a fresh PowerShell
$env:TEST_PRODUCTION_BUILD='1'
npm run build
node node_modules/next/dist/bin/next start --port 3101

# In another shell, against that server:
$env:TEST_BASE_URL='http://localhost:3101'
$env:TEST_RUN_LABEL='not-found-production'
npx playwright test tests/e2e/not-found.spec.ts --workers=1
```

The 404 suite follows the production and cross-browser selection pattern; Firefox and WebKit runs of it are not recorded.

Known failure: the desktop-only viewport-fit assertion expects a 568px document at 320×568, but the page is 595px tall (footer bottom 595.25px) with no horizontal overflow, and the visitor can scroll to the footer. The composition is kept rather than shrinking copy, artwork or controls; the enlarged-text part of that test is not reached.

## Layout and design notes

The desktop document is slightly taller than the viewport (952px at 945px, 870px at 800px): content stays in natural flow rather than being cropped to an exact height. Tablet and phone keep content → actions → globe → footer order. The page uses the existing crimson actions, dark field and cool-white decorative light; Roboto with locally oversized 404 numerals and smaller decorative annotations; a desktop split composition; native links with visible focus. The thin red circle in keyboard captures is the focus outline. The globe is smoother and less sculpted than the reference illustration; it is an interactive interpretation, not a reproduction. Keyboard and tap provide the same decorative signal, so nothing depends on pointer motion alone. The 404 surface brief records the local composition and approved exceptions.
