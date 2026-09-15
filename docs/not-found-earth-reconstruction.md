# 404 Earth reconstruction

## Scope and reference assessment

`public/not_found_page/planet.png` is visual reference only. It depicts a near-spherical Earth with a dark metallic ocean, geographically legible land masses, cool-white settlement clusters, small crimson transmitters, shallow clustered relief, and cool/crimson rim illumination. The reference also contains orbit lines, atmosphere and a red exterior field; those existing scene elements remain separately authored by the renderer.

The reconstruction does not copy, project, sample, or otherwise use reference pixels. It does not use the removed Solar System Scope normal or night textures. The only geographic input is the existing public-domain Natural Earth land mask; hidden geography and all surface variation are inferred. The reference passes suitability conditionally for a stylized procedural Earth surface, not an exact material reproduction: a single view cannot evidence an exact hidden-side material.

## Reconstruction specification

The retained sphere is a continuous, radially symmetric shell. Its existing 160 x 96 topology, Americas-facing initial pose, camera, controls, atmosphere, angled rim flares, orbit geometry, signal pulse, sky hit testing, lazy loading, cancellation, bitmap cleanup, failure fallback, and `GlobeRenderer` interface are out of scope.

The offline generator creates two deterministic 2048 x 1024 equirectangular maps with seed `crimsontide-404-earth-v1`:

- `earth-relief.png` stores an original tangent-space relief field from periodic spherical noise. Land receives the stronger layered ridge field while oceans retain low-amplitude texture. Longitude wraps exactly at the left/right seam.
- `earth-lights.png` stores land-masked, irregular cool-white settlement clusters and sparse crimson transmitter candidates. The clustered field is original procedural data, not a night-light map.

At initialization, the renderer packs relief XY, light intensity, and the land mask into one GPU `DataTexture`. It keeps a single surface texture sample in the fragment shader and performs no texture generation per frame.

## Acceptance gates

- Form: recognizable continents stay locked to the rotating sphere; all longitudes, poles, and the seam remain continuous.
- Material: dark oceans, restrained metallic relief, dense but non-uniform cool-white clusters, and sparse crimson transmitters read without flattening the globe.
- Integration: the live surface and 1116 x 900 transparent poster share the initial camera pose and scale; no second scene, loop, controller, or Three.js copy is introduced.
- Resilience: all three replacement texture failure cases preserve the poster, pending loading can abort, decoded bitmaps close, render failure disables the globe control, and context restoration can resume.
- Boundaries: no explosion effect, new control, direct projection, or change outside the 404 assets, renderer, tests, and documentation.

## Reproduction and provenance

Run `node scripts/generate-not-found-earth-surface.mjs` from the repository root. The script records its fixed seed in the generated manifest and is deterministic; a byte-for-byte SHA-256 comparison is part of verification. The supplied reference remains in `public/not_found_page/` untouched.

The reconstruction process used img2threejs 2.0.0 at revision `6e60b5e22419464b4853e01ddb6c0e6f6659a733`, installed locally for development under its Apache-2.0 license. It is tooling only, not a runtime dependency and not a credit for the page artwork. Natural Earth land data remains separately attributed in `public/pages/not-found/SOURCES.md`.

## Known approximation

The source image is a single stylized view. The new procedural maps provide geographic continuity and a comparable material character, but they intentionally do not reproduce its painted red field, exact city placement, or individual relief marks.
