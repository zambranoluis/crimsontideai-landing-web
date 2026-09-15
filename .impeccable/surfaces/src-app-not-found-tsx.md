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

See `docs/not-found-verification.md` for checks, screenshots, limitations, and asset provenance. The supplied illustration is not a pixel-perfect material promise: the chosen medium is real-time 3D.

## Detailed surface update — 2026-09-14

The approved hybrid material combines local 2K Solar System Scope normal/night maps and the Natural Earth land mask, packed into one GPU texture during lazy initialization. Shader lighting uses the existing crimson/cool-white palette, a thin edge, restrained flare sprites, dense mapped lights, and a faint geographic grid. The initial Americas pose, sphere geometry, motion/interaction API, and terrain stay intact. Cadence is fixed at 30fps and pixel ratio 1; the older adaptive-quality note above describes an earlier implementation. Credits are available in the 404 footer. The regenerated poster uses the camera's 1.24 minimum aspect so static and live artwork share their scale. See the dated verification update for measurements and remaining baseline test limitations.

## Procedural Earth reconstruction — 2026-09-15

The prior Solar System Scope normal/night maps, browser credit page, and footer credit link are replaced. The retained Natural Earth mask now combines with original, seeded 2048 x 1024 spherical-noise relief and land-masked settlement/transmitter maps. They remain packed into the same single `DataTexture`; the renderer, camera, pose, orbit system, flares, controls, lifecycle, fallbacks, and 30fps/ratio-1 setting remain unchanged. `public/not_found_page/planet.png` remains reference-only and is never sampled or projected. `docs/not-found-earth-reconstruction.md` owns the reconstruction specification, command, seed, tool revision, acceptance gates, and known single-view approximation; `SOURCES.md` owns the current artwork provenance. The 1116 x 900 poster was recaptured from this renderer. Credits are no longer presented in the page footer.
