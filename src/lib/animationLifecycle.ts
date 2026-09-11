export type AnimationLifecycleState = {
  viewportKnown: boolean;
  inViewport: boolean;
  documentVisible: boolean;
  reducedMotion: boolean;
  running: boolean;
};

export type AnimationLifecycleOptions = {
  minVisibleRatio?: number;
};

const initialState = (reducedMotion: boolean): AnimationLifecycleState => ({
  viewportKnown: false,
  inViewport: false,
  documentVisible: !document.hidden,
  reducedMotion,
  running: false,
});

/**
 * Shared lifecycle gate for recurring browser animation. Viewport state starts
 * unknown and paused; playback begins only after a zero-margin intersection.
 */
export function observeAnimationLifecycle(
  artwork: Element,
  onChange: (state: AnimationLifecycleState) => void,
  { minVisibleRatio = 0 }: AnimationLifecycleOptions = {},
) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let state = initialState(preference.matches);
  let disposed = false;

  const publish = (next: Omit<AnimationLifecycleState, "running">) => {
    if (disposed) return;
    const running = next.viewportKnown && next.inViewport && next.documentVisible && !next.reducedMotion;
    const updated = { ...next, running };
    if (
      updated.viewportKnown === state.viewportKnown
      && updated.inViewport === state.inViewport
      && updated.documentVisible === state.documentVisible
      && updated.reducedMotion === state.reducedMotion
      && updated.running === state.running
    ) return;
    state = updated;
    onChange(state);
  };

  const intersection = new IntersectionObserver(([entry]) => {
    publish({
      viewportKnown: true,
      inViewport: entry.isIntersecting && entry.intersectionRatio >= minVisibleRatio,
      documentVisible: !document.hidden,
      reducedMotion: preference.matches,
    });
  }, { threshold: minVisibleRatio > 0 ? [0, minVisibleRatio] : 0, rootMargin: "0px" });
  const synchronize = () => publish({
    viewportKnown: state.viewportKnown,
    inViewport: state.inViewport,
    documentVisible: !document.hidden,
    reducedMotion: preference.matches,
  });

  intersection.observe(artwork);
  document.addEventListener("visibilitychange", synchronize);
  preference.addEventListener("change", synchronize);
  onChange(state);

  return {
    get state() { return state; },
    dispose() {
      disposed = true;
      intersection.disconnect();
      document.removeEventListener("visibilitychange", synchronize);
      preference.removeEventListener("change", synchronize);
    },
  };
}
