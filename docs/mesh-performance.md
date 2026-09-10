# Mesh performance comparison

The home target was met in every measured workload: drawing-time reductions ranged from 51.3% to 87.2%, with aggregate reductions of **60.6% desktop, 69.7% desktop at 4× CPU throttling, and 84.9% mobile emulation at 4× CPU throttling**.

The strict product no-regression target was not demonstrated across every metric. OpenJM's desktop aggregate increased by 0.05 ms (4.3%), driven by pointer movement; its other desktop workloads improved. Sentinel's mobile idle drawing median increased by 0.2 ms, and some throttled Sentinel frame gaps and page-wide long-task counts increased despite lower aggregate drawing time. These are individual local runs, not statistically established differences. Long tasks include the rest of the page; this measurement does not attribute them solely to the mesh.

Composition review retained the home reference and the distinct product silhouettes. All 36 workload pairs had matching canvas bounds within one pixel and matching sections under the tap point. There are 55 before and 55 after captures at the four requested sizes.

Local evidence: [baseline profile JSON](../build/mesh-baseline-comparison/profile.json), [updated profile JSON](../build/mesh-final-comparison/profile.json), [environment](../build/mesh-final-comparison/environment.json). PNGs and CPU profiles are beside those files in ignored `build/` directories. See [implementation and reproduction notes](mesh-rendering.md). The final follow-up fixes eligibility after hidden-tab resize; it does not change the profiled visible-page drawing path.

Production Chromium measurements on the same local machine. Mobile results are touch/mobile emulation, including 4× Chromium CPU throttling; no physical phone/tablet was measured.

Drawing costs include geometry, interaction and cache updates, from the main canvas clear to its final draw command. They include instrumentation/profiler overhead and do not separately measure asynchronous GPU raster time. Functional CI does not enforce these hardware-dependent values.

Aggregate costs below are medians of the four workload medians, not pooled frame samples. Lower drawing time is better; negative changes indicate improvement. Full workloads, frame gaps, long tasks, tiers and bounds are retained in the accompanying JSON and CPU profiles.

| Condition | Mesh | Before ms | After ms | Change | Long tasks before → after |
| --- | --- | ---: | ---: | ---: | ---: |
| desktop | home | 3.55 | 1.40 | -60.6% | 0 → 0 |
| desktop | openjm | 1.15 | 1.20 | 4.3% | 0 → 0 |
| desktop | sentinel | 1.10 | 0.95 | -13.6% | 0 → 0 |
| desktop-4x | home | 18.15 | 5.50 | -69.7% | 193 → 166 |
| desktop-4x | openjm | 10.55 | 4.25 | -59.7% | 141 → 14 |
| desktop-4x | sentinel | 6.75 | 3.35 | -50.4% | 252 → 257 |
| mobile-4x | home | 25.10 | 3.80 | -84.9% | 219 → 0 |
| mobile-4x | openjm | 5.30 | 2.90 | -45.3% | 0 → 0 |
| mobile-4x | sentinel | 3.85 | 3.70 | -3.9% | 1 → 33 |

## Individual workloads

| Condition / mesh / workload | Draw median before → after ms | Draw p95 before → after ms | Frame-gap p95 before → after ms | Final tier |
| --- | ---: | ---: | ---: | --- |
| desktop/home/idle | 3.10 → 1.40 | 4.40 → 1.70 | 44.40 → 42.20 | high |
| desktop/home/pointer | 3.30 → 1.40 | 4.30 → 1.90 | 44.10 → 34.50 | high |
| desktop/home/taps | 3.90 → 1.90 | 5.10 → 2.70 | 39.50 → 34.60 | high |
| desktop/home/scroll | 3.80 → 1.40 | 5.00 → 2.10 | 57.40 → 51.00 | high |
| desktop/openjm/idle | 1.10 → 1.00 | 1.70 → 1.30 | 51.20 → 50.20 | high |
| desktop/openjm/pointer | 1.00 → 1.30 | 2.00 → 2.70 | 59.90 → 48.10 | high |
| desktop/openjm/taps | 1.90 → 1.60 | 2.60 → 2.20 | 51.40 → 43.90 | high |
| desktop/openjm/scroll | 1.20 → 1.10 | 2.50 → 1.70 | 64.10 → 49.00 | high |
| desktop/sentinel/idle | 1.00 → 0.80 | 1.40 → 1.20 | 57.20 → 50.40 | high |
| desktop/sentinel/pointer | 1.00 → 1.00 | 1.40 → 1.50 | 51.00 → 45.30 | high |
| desktop/sentinel/taps | 1.90 → 1.50 | 2.60 → 2.00 | 58.50 → 47.20 | high |
| desktop/sentinel/scroll | 1.20 → 0.90 | 2.00 → 1.50 | 69.30 → 50.20 | high |
| desktop-4x/home/idle | 16.70 → 6.40 | 19.90 → 10.00 | 129.10 → 69.60 | medium |
| desktop-4x/home/pointer | 17.80 → 4.70 | 24.40 → 6.00 | 129.20 → 56.90 | medium |
| desktop-4x/home/taps | 22.00 → 6.30 | 28.40 → 8.90 | 131.40 → 65.10 | medium |
| desktop-4x/home/scroll | 18.50 → 3.10 | 31.80 → 4.90 | 181.20 → 53.80 | low |
| desktop-4x/openjm/idle | 5.60 → 4.80 | 9.60 → 7.50 | 83.30 → 61.00 | medium |
| desktop-4x/openjm/pointer | 14.90 → 4.50 | 22.10 → 15.00 | 115.60 → 72.20 | low |
| desktop-4x/openjm/taps | 11.70 → 4.00 | 17.30 → 5.90 | 86.50 → 58.20 | low |
| desktop-4x/openjm/scroll | 9.40 → 3.00 | 15.20 → 4.10 | 141.50 → 64.90 | low |
| desktop-4x/sentinel/idle | 6.60 → 4.30 | 8.70 → 6.70 | 97.60 → 115.50 | medium |
| desktop-4x/sentinel/pointer | 6.80 → 3.50 | 8.70 → 5.70 | 105.30 → 102.40 | low |
| desktop-4x/sentinel/taps | 11.40 → 3.20 | 16.30 → 9.80 | 94.80 → 99.90 | low |
| desktop-4x/sentinel/scroll | 6.70 → 2.40 | 11.10 → 3.60 | 95.90 → 78.80 | low |
| mobile-4x/home/idle | 28.90 → 3.70 | 36.70 → 5.10 | 179.20 → 34.30 | medium |
| mobile-4x/home/pointer | 22.10 → 3.60 | 35.50 → 4.70 | 146.80 → 34.90 | medium |
| mobile-4x/home/taps | 28.10 → 5.20 | 33.60 → 6.60 | 146.30 → 34.80 | medium |
| mobile-4x/home/scroll | 19.70 → 3.90 | 25.50 → 5.20 | 117.10 → 35.70 | medium |
| mobile-4x/openjm/idle | 5.60 → 3.10 | 7.70 → 4.70 | 50.60 → 37.40 | medium |
| mobile-4x/openjm/pointer | 4.20 → 2.70 | 5.40 → 3.80 | 51.70 → 35.70 | medium |
| mobile-4x/openjm/taps | 7.10 → 4.00 | 8.70 → 5.60 | 50.90 → 48.80 | medium |
| mobile-4x/openjm/scroll | 5.00 → 2.70 | 8.40 → 3.90 | 53.50 → 39.40 | medium |
| mobile-4x/sentinel/idle | 3.70 → 3.90 | 4.50 → 5.50 | 50.90 → 52.30 | medium |
| mobile-4x/sentinel/pointer | 3.70 → 3.50 | 4.30 → 5.00 | 50.80 → 50.00 | medium |
| mobile-4x/sentinel/taps | 6.90 → 4.80 | 9.00 → 6.80 | 51.60 → 60.40 | medium |
| mobile-4x/sentinel/scroll | 4.00 → 3.50 | 6.50 → 4.80 | 51.60 → 49.70 | medium |

## Geometry checks

Canvas bounds and the section under the workload pointer are recorded to distinguish renderer changes from hydration/scroll placement differences. Backing resolutions can differ through adaptive quality.

| Condition / mesh / workload | Bounds match (within 1 px) | Pointer section before → after |
| --- | --- | --- |
| desktop/home/idle | yes | home-heading → home-heading |
| desktop/home/pointer | yes | home-heading → home-heading |
| desktop/home/taps | yes | home-heading → home-heading |
| desktop/home/scroll | yes | home-heading → home-heading |
| desktop/openjm/idle | yes | openjm-heading → openjm-heading |
| desktop/openjm/pointer | yes | openjm-heading → openjm-heading |
| desktop/openjm/taps | yes | openjm-heading → openjm-heading |
| desktop/openjm/scroll | yes | openjm-heading → openjm-heading |
| desktop/sentinel/idle | yes | sentinel-heading → sentinel-heading |
| desktop/sentinel/pointer | yes | sentinel-heading → sentinel-heading |
| desktop/sentinel/taps | yes | sentinel-heading → sentinel-heading |
| desktop/sentinel/scroll | yes | sentinel-heading → sentinel-heading |
| desktop-4x/home/idle | yes | home-heading → home-heading |
| desktop-4x/home/pointer | yes | home-heading → home-heading |
| desktop-4x/home/taps | yes | home-heading → home-heading |
| desktop-4x/home/scroll | yes | home-heading → home-heading |
| desktop-4x/openjm/idle | yes | openjm-heading → openjm-heading |
| desktop-4x/openjm/pointer | yes | openjm-heading → openjm-heading |
| desktop-4x/openjm/taps | yes | openjm-heading → openjm-heading |
| desktop-4x/openjm/scroll | yes | openjm-heading → openjm-heading |
| desktop-4x/sentinel/idle | yes | sentinel-heading → sentinel-heading |
| desktop-4x/sentinel/pointer | yes | sentinel-heading → sentinel-heading |
| desktop-4x/sentinel/taps | yes | sentinel-heading → sentinel-heading |
| desktop-4x/sentinel/scroll | yes | sentinel-heading → sentinel-heading |
| mobile-4x/home/idle | yes | home-heading → home-heading |
| mobile-4x/home/pointer | yes | home-heading → home-heading |
| mobile-4x/home/taps | yes | home-heading → home-heading |
| mobile-4x/home/scroll | yes | home-heading → home-heading |
| mobile-4x/openjm/idle | yes | openjm-heading → openjm-heading |
| mobile-4x/openjm/pointer | yes | openjm-heading → openjm-heading |
| mobile-4x/openjm/taps | yes | openjm-heading → openjm-heading |
| mobile-4x/openjm/scroll | yes | openjm-heading → openjm-heading |
| mobile-4x/sentinel/idle | yes | sentinel-heading → sentinel-heading |
| mobile-4x/sentinel/pointer | yes | sentinel-heading → sentinel-heading |
| mobile-4x/sentinel/taps | yes | sentinel-heading → sentinel-heading |
| mobile-4x/sentinel/scroll | yes | sentinel-heading → sentinel-heading |
