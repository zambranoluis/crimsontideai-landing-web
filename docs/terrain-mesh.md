# TerrainMesh

`src/components/visuals/TerrainMesh/TerrainMesh.tsx` is the second mesh type. It keeps the original footer's terrain ridges, waves, shimmering circular dots, three brightness ribbons and travelling pulse. `public/pages/home/animation/footer.html` remains the untouched reference; the page no longer requests it.

`SiteFooter` and `FooterAtmosphere` remain server components. Only `TerrainMesh` starts browser effects. Existing footer layout, copy, links, 300px artwork height, crimson colors, 35% wrapper opacity and fade mask are preserved.

## Reuse contracts

| Component | Geometry and rendering | Inputs |
| --- | --- | --- |
| `Mesh` | Home, OpenJM and Sentinel presets; flowing line mesh with dot halos | `variant`, wrapper/fallback classes and canvas `testId`; nearest section receives input |
| `TerrainMesh` | Footer terrain preset; independent projection and numeric dot/halo buckets | Optional wrapper `className`, `style` and canvas `testId`; required `interactionHostSelector` matching an ancestor |

Provide a positioned wrapper with nonzero width/height using `className` or `style`. Canvas and SVG fill that wrapper. The host must contain the wrapper, may contain normal content and controls, and needs no browser logic of its own. For example:

```tsx
<div data-terrain-example>
  <TerrainMesh
    style={{ position: "relative", width: "100%", height: 300 }}
    interactionHostSelector="[data-terrain-example]"
    testId="example-terrain"
  />
</div>
```

The named `footerTerrainPreset` preserves the original export's parameters including its final `#EF3340` / `#FF4A56` color overrides. This component currently exposes styling and host selection, not an arbitrary parameter editor. A new terrain preset needs its own projection/fallback verification. Home/Products geometry and rendering are unchanged.

## Input and lifecycle

Fine-pointer hover intentionally departs from the original export's whole-field parallax and cursor-created terrain lift. After ambient terrain projection, the existing `MeshInteraction` gathers only points within 180 screen pixels toward the cursor, with a maximum 20 screen-pixel displacement. Entry, cursor following and release use the shared exponential easing. Points outside the influence radius retain their ambient positions. Leaving or cancelling eases the gathering fully away. Offscreen/hidden suspension clears interactions and freezes elapsed animation time.

The same interaction pass applies local gathering first and the existing click ripple second. Ripples remain 1,200ms with 18 screen-pixel amplitude, a 62 screen-pixel band and at most four concurrent waves. Input is measured at most once per rendered interaction frame and clipped to artwork/viewport bounds. Links, native/custom controls, non-primary and keyboard-generated clicks are ignored. Coarse pointers retain tap ripples without hover gathering. Passive listeners on the host and `pointer-events: none` on the artwork preserve native touch scrolling.

Both mesh types use `MeshScheduler`, `FrameCadence`, `AdaptiveQuality`, `backingSize` and `isMeshControl`. Terrain starts at 118×52 points on fine desktop, 92×40 on narrow/coarse devices; low quality is 72×32. Shared DPR caps are 1.5, 1.25 and 1, with 2160×1440 backing limits. The target is 30fps, falling to 24fps under sustained low-tier overload. Two overloaded two-second windows lower quality; ten seconds of headroom recover it. See [shared rendering](mesh-rendering.md) for exact thresholds.

Hidden or offscreen terrain has no scheduled draw. Reduced motion uses server-rendered phase-zero SVG and does not initialize canvas. Two SVG aspect ratios retain terrain relief on wide and narrow screens, including without JavaScript. Context acquisition/drawing failures expose the same fallback. Context loss permits restoration; restoration reconstructs geometry and caches. Resize rebuilds bounded buffers; hidden resize keeps eligibility for resume. Cleanup disconnects both observers and removes media, resize, context, host and scheduler listeners.

## Rendering costs

Typed arrays retain points, heights, ribbons, shimmer values, pulse values, static ridges, projection factors and trigonometric terms. Addition identities move invariant trigonometry out of each point calculation. Dots retain the export's exact quantization of radius, color and brightness. Numeric bucket heads/next indices replace per-frame object grids, string-keyed Maps and growing coordinate arrays. Lines use ten depth bands and one transverse pass.

Ambient glow is rendered to a bounded cache on resize/restoration. Dynamic halos are rebucketed and drawn every frame, so brightness changes refresh them even when movement is tiny. There is no moving halo bitmap to become stale.

Canvas readiness and visibility are written only when state changes, avoiding repeated SVG fallback style invalidation. A browser mutation check prevents repeated writes. The original export's `desynchronized: true` canvas context hint is retained: a controlled local 4× Chromium experiment found many more long tasks with synchronized presentation. Both draw timing and page long tasks must be reviewed when changing this renderer.

## Evidence

`scripts/terrain-evidence.mjs` compares the actual production footer before and after replacement. It explicitly instruments the original iframe using an init script in every frame. Drawing measurements run from the terrain canvas clear through its last draw, including geometry, interaction and buckets; the adaptive controller additionally counts resize/rebuild costs. Profiles include idle, pointer movement, repeated taps, scrolling in/out and steady offscreen workloads on desktop, desktop at 4× CPU throttle and mobile emulation at 4× throttle. Each workload runs forty 100ms steps and saves a CPU profile, cost median/p95, gap median/p95, long tasks, RAF callback count, final tier and backing dimensions. Workloads retain quality/interaction state in sequence.

The original iframe's pointer-events setting prevents hover input, and it has no click ripple. Its pointer/tap profiles measure that existing behavior; the new profiles include enabled interactions. Offscreen RAF counts in the inline version also include other page animations sharing the parent frame; terrain draw counts are isolated. CPU instrumentation adds overhead and emulation is not physical-device evidence. Scroll gap percentiles include intended suspension intervals.

Captures cover 1440, 768, 390 and 360px at DPR 1, with phase zero, ambient, hover, ripple and recovery images. RAF timestamps advance explicitly in 60Hz steps from phase zero. The original clamps elapsed deltas under load; functional projection tests also compare the untouched reference equations directly across times, sizes and sampling tiers.

Run against an otherwise idle production server:

```sh
npm run build
npx next start --port 3101
node scripts/terrain-evidence.mjs build/terrain-final
```

For baseline evidence, run the same script on the pre-replacement production build with `--baseline`. `--capture-only` / `--profile-only` split passes. `TERRAIN_URL` overrides the default `http://localhost:3101`. Generated PNGs, CPU profiles and JSON remain in ignored `build/` directories. See [measured results](terrain-performance.md).

The regular functional command is:

```sh
npx playwright test tests/e2e/terrain-core.spec.ts tests/e2e/terrain.spec.ts tests/e2e/mesh-core.spec.ts tests/e2e/mesh.spec.ts tests/e2e/home-products-motion.spec.ts tests/e2e/smoke.spec.ts --workers=2 --reporter=line
```

Production verification used `build/terrain-playwright.config.ts`, an ignored override that imports the repository config, retains all projects, sets `testDir: "../tests/e2e"`, `use.baseURL: "http://localhost:3101"` and `webServer: undefined`. Pass `--config build/terrain-playwright.config.ts` to use the already running production server. The final combined run is recorded in `build/terrain-suite.log`.
