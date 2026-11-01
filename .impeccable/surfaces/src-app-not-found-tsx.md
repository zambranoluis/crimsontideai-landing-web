---
version: 1
slug: "src-app-not-found-tsx"
primary_target: "src/app/not-found.tsx"
related_targets:
  - "src/app/_not-found"
---

# Surface brief — 404

## Job and audience

A visitor has followed an unavailable URL. Make the problem clear and provide immediate routes home or to contact. The surrounding scene expresses CrimsonTide's existing Deep Field identity. Visitor mode: Experience, with recovery actions always available.

## Direction contract

**THESIS:** Signal returning. A dimensional Earth and rolling illuminated terrain turn a missing destination into a moment of exploration.

**OWN-WORLD:** Existing Roboto, CrimsonTide wordmark, instrument-black ground, crimson signals, cool-white light, fine orbital lines. Preserve the site's primary action and focus colors.

**STORY:** Read the error, recover immediately, or explore the globe. Activating the globe emits a surface wave and an orbital pulse. No informational content requires interaction.

**FIRST VIEWPORT:** Large 404 and actions on the left, Earth on the right, terrain across the lower foreground. Home-linked logo above; compact footer below. Mobile follows copy/actions, globe, then footer in normal flow.

**FORM:** User-supplied image is composition authority. User explicitly chose true 3D, cinematic response, and reference framing, then requested implementation of the proposed plan. Code-authored geometry is the approved medium, with an interpreted globe material rather than an extracted raster plate. No concept roll or generated replacement comp is needed for this supplied and confirmed composition.

**BUILD PATH:** Code-led implementation of the accepted true-3D plan, local to this surface. The global comp default and shared design system remain unchanged. Browser captures of the authored renderer supply static posters.

## Behavior and boundaries

The 404 is rendered through Next's root `not-found` convention and the existing navigation provider. Unknown paths retain real 404 responses and native links. Other routes and their visual renderers are unchanged.

One lazy Three.js scene owns globe, stars, atmosphere, survey guides, and three depth-sorted orbits. A separate Canvas 2D renderer owns terrain. Pointer parallax affects artwork only. Globe activation has click, tap, and keyboard paths. Terrain hover/click effects are mouse-only, local, bounded, and transient. Controls are excluded.

Pause is session-local. Reduced motion and forced colors disable enhancement. Posters retain a complete composition without JavaScript or when rendering fails. Shared lifecycle observation targets the 404 scene container; it pauses offscreen and document-hidden, and unmount disposes the context and listeners. Adaptive quality reduces density and pixel ratio under load.

## Evidence

See `docs/not-found-verification.md` for tests, asset regeneration, performance and limits. The supplied illustration is not a pixel-perfect material promise: the chosen medium is real-time 3D.

## Globe surface

Shader lighting uses the existing crimson/cool-white palette, a thin edge, restrained flares, mapped settlement lights and a faint geographic grid; the initial Americas pose, sphere geometry, motion/interaction API and terrain are fixed. The Natural Earth mask combines with original, seeded 2048 x 1024 spherical-noise relief and land-masked settlement/transmitter maps, packed into a single `DataTexture`; the scene runs at 30fps with pixel ratio 1. `public/not_found_page/planet.png` is reference-only and is never sampled or projected. `docs/not-found-earth-reconstruction.md` owns the reconstruction specification, command, seed, tool revision, acceptance gates, and known single-view approximation; `SOURCES.md` owns the current artwork provenance. The 1116 x 900 poster is captured from this renderer at the camera's 1.24 minimum aspect, so static and live artwork share their scale. The page footer shows no credits.
