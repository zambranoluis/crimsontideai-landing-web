# Footer terrain performance

Production Chromium 153.0.8010.12, AMD Ryzen 7 5800U with Radeon Graphics, Windows 10.0.26200, DPR 1. Desktop: 1440×900; mobile/touch emulation: 390×844. Throttle labels use 4× CPU slowdown. No physical devices were available.

## Lifecycle and adaptive-quality follow-up

A later matched production run compares the pre-change footer in `build/footer-suspension-before` / `build/footer-entry-before` with `build/footer-suspension-after`. This is one local run per condition, so it does not satisfy the requested repeated-run confidence threshold.

| Condition | First-entry gap p95 | First-entry draw p95 | Page long tasks |
| --- | ---: | ---: | ---: |
| desktop | 40.3 → 40.4ms (+0.2%) | 4.2 → 3.0ms (-28.6%) | 0 → 0 |
| desktop, 4× CPU | 113.5 → 92.3ms (-18.7%) | 11.4 → 8.9ms (-21.9%) | 5 → 4 |
| mobile emulation, 4× CPU | 93.7 → 78.8ms (-15.9%) | 13.9 → 11.5ms (-17.3%) | 3 → 0 |

The 25% first-entry frame-gap target was not reached in this run. Desktop idle gap p95 improved 49.7 → 34.5ms, idle draw p95 improved 5.4 → 3.2ms, and desktop tap gap p95 improved 62.5 → 37.3ms. Offscreen terrain draws remained zero. Page-wide long tasks were not uniformly lower: desktop 4× taps measured 20 → 22, mobile 4× taps 0 → 6, and mobile 4× scroll 2 → 4. Those workloads include the entire page and profiler overhead, but they remain limitations rather than demonstrated wins.

The follow-up capture set covers ambient, gathering, ripple and recovery at 1440, 768, 390 and 360px. Review retained the terrain silhouette, local gathering, ripple location, mask, footer readability and narrow layout. Safari, Firefox, physical devices and repeated hardware runs remain unverified.

Measurements include the original iframe explicitly. The same page, input coordinates and forty 100ms steps were used per workload. Hydration settled before positioning; runs were made without concurrent builds or test browsers. Profiling and canvas instrumentation add overhead, so these are local comparative results, not hardware-independent budgets.

## Drawing cost

All values are milliseconds per terrain draw. The original had no reachable hover input and no click ripple; final pointer/tap measurements include those newly enabled interactions. Sampling adapts during the sequential workloads.

| Device | Workload | Median before → after | p95 before → after | Median reduction | Final sampling before → after |
| --- | --- | ---: | ---: | ---: | --- |
| desktop | idle | 6.0 → 2.8 | 7.9 → 3.7 | 53% | 118 columns → high |
| desktop | pointer | 3.6 → 3.2 | 5.6 → 3.7 | 11% | 92 columns → high |
| desktop | taps | 3.7 → 4.0 | 4.4 → 4.6 | -8% | 92 columns → high |
| desktop | scroll | 3.6 → 3.2 | 4.3 → 4.2 | 11% | 92 columns → high |
| desktop-4x | idle | 16.4 → 8.2 | 19.1 → 10.8 | 50% | 92 columns → low |
| desktop-4x | pointer | 13.0 → 9.1 | 18.9 → 11.2 | 30% | 72 columns → low |
| desktop-4x | taps | 10.8 → 10.9 | 12.6 → 14.3 | -1% | 72 columns → low |
| desktop-4x | scroll | 12.4 → 9.0 | 13.9 → 10.9 | 27% | 72 columns → low |
| mobile-4x | idle | 26.8 → 9.1 | 35.3 → 13.7 | 66% | 118 columns → low |
| mobile-4x | pointer | 24.7 → 8.5 | 29.1 → 10.7 | 66% | 92 columns → low |
| mobile-4x | taps | 17.6 → 9.8 | 20.2 → 12.2 | 44% | 92 columns → low |
| mobile-4x | scroll | 11.2 → 8.2 | 13.1 → 9.7 | 27% | 72 columns → low |

Remaining drawing regressions: desktop taps (median 3.7 → 4.0ms; p95 4.4 → 4.6ms); desktop-4x taps (median 10.8 → 10.9ms; p95 12.6 → 14.3ms). Read these alongside the changed interaction workload and final sampling tier.

## Frame delivery and long tasks

Gaps are between terrain drawing starts. Scrolling deliberately suspends the terrain, so its large gaps include time out of view. Long-task counts come from the parent page in both versions and include unrelated page work; they are not exclusively attributed to terrain.

| Device | Workload | Gap median before → after | Gap p95 before → after | Draws before → after | Page long tasks before → after |
| --- | --- | ---: | ---: | ---: | ---: |
| desktop | idle | 34.6 → 33.3 | 40.2 → 36.8 | 130 → 134 | 0 → 0 |
| desktop | pointer | 22.8 → 33.4 | 34.3 → 37.0 | 212 → 154 | 0 → 0 |
| desktop | taps | 23.6 → 33.3 | 28.5 → 36.7 | 195 → 138 | 0 → 0 |
| desktop | scroll | 24.6 → 35.6 | 33.1 → 50.3 | 104 → 64 | 0 → 0 |
| desktop | offscreen | — → — | — → — | 0 → 0 | 0 → 0 |
| desktop-4x | idle | 110.6 → 84.9 | 116.3 → 95.9 | 45 → 57 | 0 → 0 |
| desktop-4x | pointer | 84.5 → 87.4 | 122.5 → 105.8 | 67 → 86 | 5 → 0 |
| desktop-4x | taps | 74.4 → 88.5 | 82.9 → 108.5 | 72 → 60 | 26 → 11 |
| desktop-4x | scroll | 86.3 → 97.9 | 468.3 → 581.5 | 45 → 41 | 9 → 5 |
| desktop-4x | offscreen | — → — | — → — | 0 → 0 | 0 → 0 |
| mobile-4x | idle | 121.5 → 65.9 | 130.2 → 93.6 | 41 → 67 | 1 → 0 |
| mobile-4x | pointer | 113.1 → 62.5 | 138.4 → 76.2 | 62 → 87 | 4 → 1 |
| mobile-4x | taps | 84.6 → 63.7 | 94.0 → 80.4 | 87 → 106 | 23 → 18 |
| mobile-4x | scroll | 57.1 → 60.1 | 499.4 → 560.6 | 57 → 53 | 0 → 6 |
| mobile-4x | offscreen | — → — | — → — | 0 → 0 | 0 → 0 |

The deliberate 30fps cap can increase gaps where the original rendered faster. This is a drawing-cost comparison, not a compositor/GPU or page-load benchmark. Server SVG fallbacks add document markup; their transfer cost was not benchmarked. Safari, Firefox and physical-device behavior remain unverified.

Remaining frame-delivery limits: desktop-4x taps gap p95 82.9 → 108.5ms; mobile-4x scroll page long tasks 0 → 6. Drawing savings do not establish uniformly smoother frame delivery under throttling.

The original iframe continues requesting animation frames when suspended. Its steady offscreen RAF callback counts were desktop: 264, desktop-4x: 265, mobile-4x: 264. The inline terrain unsubscribes from the shared scheduler when offscreen/hidden; functional tests verify no terrain draws and scheduler cleanup. Inline parent-frame RAF counts also include other page effects and cannot be attributed solely to terrain.

## Visual and functional evidence

Twenty before and twenty after PNGs cover 1440, 768, 390 and 360px widths at phase zero, ambient, hover, ripple and recovery. Review retained terrain ridges, circular crimson dots, footer readability, mask, opacity and the 300px artwork height. Narrow devices intentionally start with fewer samples. Unrelated page entrances outside the footer can differ in phase.

The original equation comparison covers ambient terrain projection across all sampling tiers at desktop/mobile widths, phase zero and later phases. Hover intentionally diverges from the export: deterministic tests cover localized inward gathering, the 180 screen-pixel cutoff, the 20 screen-pixel cap, transform-independent displacement and full release. Tests also cover visible-bounds rejection, four-ripple expiry, stationary halo brightness refresh, offscreen/hidden suspension, hidden resize, reduced motion, no JavaScript, missing/throwing contexts, context restoration, touch scrolling, control/keyboard exclusion and navigation cleanup. Shared mesh tests cover cadence, sustained overload/recovery, backing limits and scheduler phase continuity.

Lint, typecheck, production build and diff checks passed. The complete production suite passed 120 tests, with 63 expected skips for device-specific or duplicate pure coverage, across all three configured Chromium projects. The fast-scroll Products test now waits for hydrated sticky layout before measuring document height; the hidden-resize terrain test stays within its responsive breakpoint. No Home/Products application visuals were changed.

Evidence: `build/terrain-baseline` and `build/terrain-final` contain raw JSON, environment metadata, PNGs and fifteen CPU profiles each. Reproduce with [the terrain evidence script](../scripts/terrain-evidence.mjs), then `node scripts/compare-terrain-profiles.mjs`. See [component contracts and methodology](terrain-mesh.md).
