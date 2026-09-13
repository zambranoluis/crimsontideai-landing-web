# Animation lifecycle

Recurring animation is scoped to the artwork that actually moves. Use `observeAnimationLifecycle` from `src/lib/animationLifecycle.ts` for new canvases, videos, SVG timelines and infinite CSS loops.

The observer starts paused until viewport intersection is known. Its derived `running` state requires all of the following:

- the animated artwork intersects the viewport with a zero-pixel playback margin;
- the document is visible;
- `prefers-reduced-motion` does not request reduced motion.

Actual observation targets are part of each consumer's contract:

| Consumer | Observed target / minimum |
| --- | --- |
| Home warehouse video | video element, 10% visible |
| Home Jamaica network | map wrapper, 12% visible |
| Home product shimmer | each product card |
| Shared Mesh (Home Company and Products), footer TerrainMesh, Contact terrain | canvas |
| Product preview animation | ProductMotion preview wrapper |
| Company particles | particle artwork wrapper |
| Company radar | radar overlay wrapper |
| Solutions Context | hologram root including diagram and text panels |
| Solutions Delivery ambient effects | each stage artwork wrapper |
| Work orbit | orbit root, local zero-margin observer rather than this helper |

All use zero playback margin; unlisted minimum ratios are zero. Context's larger root and card/wrapper targets are intentional implementation exceptions to the preference for observing the smallest moving area. Do not describe Context as observing only its canvas or the whole route section.

On suspension, cancel recurring callbacks, pause media and retain elapsed time. Resume from the retained time without adding hidden/offscreen wall time. A `play()` promise must be invalidated or rechecked because it can resolve after playback has been suspended. Infinite CSS animations should remain declared with `animation-play-state: paused`; switch only their play state so re-entry continues instead of restarting or catching up.

Resize observers may record pending dimensions while hidden or offscreen, but must not resize or paint a canvas until its artwork is visible again. Keep deterministic server-rendered or poster fallbacks until the applicable renderer is ready. Jamaica deliberately gates its animated SVG scene until the initial pose is written; reduced-motion CSS and no-JavaScript output expose the full static composition. Mesh and Contact can paint a visible reduced-motion frame; TerrainMesh and Company use their static SVG fallback instead. Clean up intersection, media-query, visibility, resize and input listeners on unmount.

Scroll-linked positioning and reveal entrances remain event-driven rather than recurring animation. Once an offscreen scene has received its correct before/after boundary state, avoid repeating equivalent style writes. Recompute on re-entry, resize, page restoration and motion-preference changes.

Regression checks should inspect observable work: canvas draw counts, media `currentTime`, SVG attributes and CSS animation `currentTime`/play state. State attributes alone are diagnostics, not proof of suspension.
