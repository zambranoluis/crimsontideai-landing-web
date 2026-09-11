# Animation lifecycle

Recurring animation is scoped to the artwork that actually moves. Use `observeAnimationLifecycle` from `src/lib/animationLifecycle.ts` for new canvases, videos, SVG timelines and infinite CSS loops.

The observer starts paused until viewport intersection is known. Its derived `running` state requires all of the following:

- the animated artwork intersects the viewport with a zero-pixel playback margin;
- the document is visible;
- `prefers-reduced-motion` does not request reduced motion.

Home video and the Jamaica network retain their intentional minimum visible fractions. Other recurring artwork starts and stops at its actual viewport boundary. Observe the video, canvas, SVG or animated visual—not a larger section that can remain visible after the artwork exits.

On suspension, cancel recurring callbacks, pause media and retain elapsed time. Resume from the retained time without adding hidden/offscreen wall time. A `play()` promise must be invalidated or rechecked because it can resolve after playback has been suspended. Infinite CSS animations should remain declared with `animation-play-state: paused`; switch only their play state so re-entry continues instead of restarting or catching up.

Resize observers may record pending dimensions while hidden or offscreen, but must not resize or paint a canvas until its artwork is visible again. Keep deterministic server-rendered or poster fallbacks visible until the first successful frame. Clean up intersection, media-query, visibility, resize and input listeners on unmount.

Scroll-linked positioning and reveal entrances remain event-driven rather than recurring animation. Once an offscreen scene has received its correct before/after boundary state, avoid repeating equivalent style writes. Recompute on re-entry, resize, page restoration and motion-preference changes.

Regression checks should inspect observable work: canvas draw counts, media `currentTime`, SVG attributes and CSS animation `currentTime`/play state. State attributes alone are diagnostics, not proof of suspension.
