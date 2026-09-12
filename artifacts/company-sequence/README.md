# Company sequence review

The complete About composition holds at the viewport bottom while the particles morph. The hold adds exactly 2.5 times the usable viewport height, then releases into Jamaica. The hero now contains the network image and its aligned pulse; the closing section uses the static photograph.

## Comparable captures

| State | Desktop 1440 × 900 | Laptop 1366 × 768 |
| --- | --- | --- |
| Hero | [Desktop](1440-hero.png) | [Laptop](1366-hero.png) |
| Brain hold | [Desktop](1440-brain.png) | [Laptop](1366-brain.png) |
| Brain → gear | [Desktop](1440-brain-gear.png) | [Laptop](1366-brain-gear.png) |
| Gear hold | [Desktop](1440-gear.png) | [Laptop](1366-gear.png) |
| Gear → bulb | [Desktop](1440-gear-bulb.png) | [Laptop](1366-gear-bulb.png) |
| Bulb hold | [Desktop](1440-bulb.png) | [Laptop](1366-bulb.png) |
| End of hold | [Desktop](1440-final-hold.png) | [Laptop](1366-final-hold.png) |
| Release | [Desktop](1440-release.png) | [Laptop](1366-release.png) |
| Closing | [Desktop](1440-closing.png) | [Laptop](1366-closing.png) |

[Motion recording: entry, full sequence, release and reverse](laptop-entry-release-reverse.webm). It begins with the individual state captures, followed by continuous forward and reverse scrolling. A frame was extracted and inspected as `recording-check.png`.

`geometry.json` records the measured scene/track heights. Desktop adds 2027.5px; laptop adds 1697.5px. The 1024 × 800 scene does not fit below its measured header and correctly remains in normal flow.

## Fallback evidence

The `mobile-*`, `tablet-*`, `short-*`, `does-not-fit-*`, `reduced-*`, `no-js-*` and `canvas-failure-*` images capture hero, About and closing. Their measured track height equals their scene height: no extra scroll interval. `preliminary/` contains the original desktop baseline and first implementation inspection, not the final reference set.

## Verification scope

Final Company result: **38 passed, 4 skipped** (the two desktop-only tests on tablet/mobile), serial Chromium. Lint, typecheck, production build and `git diff --check` passed. The final result is in [company-final.log](logs/company-final.log); the [1920 × 1080 capture](1920-hold.png) confirms tall-screen principle visibility.

Automated coverage includes whole-scene stationarity, forward/reverse morphs, fast jumps, final hold/release, tall-screen card visibility, header and scene resize, coarse pointers, direct fragments, history/reload restoration, keyboard actions, image decoding/preload, SVG alignment/timing, offscreen/hidden suspension, no JavaScript, canvas failure/context loss and unmount cleanup.

The earlier broad Company/navigation run had a tablet Products active-route position check differ by 4px. That unchanged navigation check passed on its serial rerun. Historical logs are retained alongside the final Company results.

Coverage is Chromium on desktop and emulated tablet/mobile. Firefox, WebKit/Safari and physical devices were not tested. Hidden-tab suspension uses a synthetic visibility signal, and the zoom check uses an equivalent CSS viewport. This is not a full WCAG audit.

The explicit Impeccable scan reports advisory palette/type findings for the preserved supplied artwork and responsive/compact sizes. No shared design metadata was regenerated.

Reproduce the visual capture with `node artifacts/company-sequence/capture.mjs` while the app serves port 3001.
