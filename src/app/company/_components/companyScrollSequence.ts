import { clampProgress, scheduleScrollFrame } from "@/lib/scrollFrame";

/** Company-only geometry. The sticky child never supplies scroll progress. */
export function companyScrollSequence(artwork: HTMLElement) {
  const track = artwork.closest<HTMLElement>("#company-about")!;
  const scene = track.querySelector<HTMLElement>("[data-company-scene]")!;
  const artworkTrack = artwork.closest<HTMLElement>("[data-company-artwork-track]")!;
  const responsive = matchMedia("(max-width: 1024px), (pointer: coarse)");
  const motion = matchMedia("(prefers-reduced-motion: no-preference)");
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  let initialFragment = navigation?.type === "navigate" ? location.hash : "";
  let fragmentGeometry = "";
  let fragmentFrame = 0;
  const cancelInitialFragment = () => { initialFragment = ""; cancelAnimationFrame(fragmentFrame); };
  const alignInitialFragment = (geometry: string) => {
    if (!initialFragment || document.fonts.status !== "loaded" || fragmentGeometry === geometry) return;
    const fragment = initialFragment;
    if (location.hash !== fragment) { cancelInitialFragment(); return; }
    fragmentGeometry = geometry;
    // Native fragment navigation precedes hydration. Resolve its destination
    // again after track sizing, without overriding reload/history positions.
    try {
      const target = document.getElementById(decodeURIComponent(fragment.slice(1)));
      cancelAnimationFrame(fragmentFrame);
      // Let sibling effects and the browser's initial fragment scroll settle.
      fragmentFrame = requestAnimationFrame(() => {
        if (initialFragment === fragment && location.hash === fragment) target?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    }
    catch { /* A malformed fragment has no matching destination. */ }
  };
  let available = true;
  const clear = () => {
    track.dataset.mode = "normal-flow";
    track.dataset.pinned = "false";
    artworkTrack.dataset.pinned = "false";
    artworkTrack.style.removeProperty("--track-height");
    artworkTrack.style.removeProperty("--pin-top");
    delete track.dataset.sceneEntered;
    track.style.removeProperty("--track-height");
    track.style.removeProperty("--pin-top");
  };
  let dirty = true;
  let geometry = "";
  let distance = 0;
  let top = 0;
  const invalidate = () => { dirty = true; scheduleScrollFrame(); };
  const measure = ({ height, header }: { height: number; header: number }) => {
    const usable = Math.max(0, height - header);
    const nextGeometry = `${innerWidth}/${height}/${header}/${motion.matches}/${responsive.matches}`;
    if (dirty || geometry !== nextGeometry) {
      dirty = false;
      geometry = nextGeometry;
      // Restore the natural desktop/stacked layout before testing fit. Neither
      // a previous artwork track nor a sticky scene contributes to measurement.
      clear();
      artworkTrack.style.setProperty("--artwork-limit", `${Math.max(0, usable - 48)}px`);
      const sceneHeight = scene.getBoundingClientRect().height;
      distance = usable * 2.5;
      if (available && motion.matches && !responsive.matches && sceneHeight <= usable) {
        top = height - sceneHeight;
        track.style.setProperty("--track-height", `${sceneHeight + distance}px`);
        track.style.setProperty("--pin-top", `${top}px`);
        track.dataset.pinned = "true";
        track.dataset.mode = "full-scene";
      } else if (available && motion.matches && usable >= 288) {
        track.dataset.mode = "artwork-only";
        // Select the stacked layout and its natural artwork size first. Apply
        // the extended track only after that size has been measured.
        artworkTrack.dataset.pinned = "true";
        const artworkHeight = artwork.getBoundingClientRect().height;
        top = header + (usable - artworkHeight) / 2;
        artworkTrack.style.setProperty("--track-height", `${artworkHeight + distance}px`);
        artworkTrack.style.setProperty("--pin-top", `${top}px`);
      }
    }
    const mode = track.dataset.mode;
    const activeTrack = mode === "artwork-only" ? artworkTrack : track;
    const rect = activeTrack.getBoundingClientRect();
    alignInitialFragment(`${scrollY + rect.top}/${height}/${header}/${rect.height}`);
    if (mode === "full-scene") {
      // On tall displays the principles can sit below Reveal's entrance gate.
      track.dataset.sceneEntered = String(rect.top <= top && rect.bottom > 0);
    }
    if (mode !== "normal-flow") return clampProgress((top - rect.top) / distance);
    const art = artwork.getBoundingClientRect();
    return clampProgress((height * .85 - art.top) / (art.height + height * .6));
  };
  const resize = new ResizeObserver(invalidate);
  resize.observe(scene, { box: "border-box" });
  resize.observe(artwork, { box: "border-box" });
  // Copy can grow inside an already taller grid row without resizing the scene.
  scene.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => resize.observe(element, { box: "border-box" }));
  responsive.addEventListener("change", invalidate);
  motion.addEventListener("change", invalidate);
  document.fonts.addEventListener("loadingdone", invalidate);
  window.addEventListener("hashchange", scheduleScrollFrame);
  window.addEventListener("popstate", scheduleScrollFrame);
  window.addEventListener("wheel", cancelInitialFragment, { passive: true });
  window.addEventListener("touchstart", cancelInitialFragment, { passive: true });
  window.addEventListener("keydown", cancelInitialFragment);
  window.addEventListener("pointerdown", cancelInitialFragment);
  window.addEventListener("hashchange", cancelInitialFragment);
  window.addEventListener("popstate", cancelInitialFragment);
  return {
    measure,
    unavailable() { available = false; clear(); invalidate(); },
    dispose() {
      cancelInitialFragment();
      resize.disconnect();
      responsive.removeEventListener("change", invalidate);
      motion.removeEventListener("change", invalidate);
      document.fonts.removeEventListener("loadingdone", invalidate);
      window.removeEventListener("hashchange", scheduleScrollFrame);
      window.removeEventListener("popstate", scheduleScrollFrame);
      window.removeEventListener("wheel", cancelInitialFragment);
      window.removeEventListener("touchstart", cancelInitialFragment);
      window.removeEventListener("keydown", cancelInitialFragment);
      window.removeEventListener("pointerdown", cancelInitialFragment);
      window.removeEventListener("hashchange", cancelInitialFragment);
      window.removeEventListener("popstate", cancelInitialFragment);
      clear();
      delete track.dataset.pinned;
      delete track.dataset.mode;
      delete artworkTrack.dataset.pinned;
      artworkTrack.style.removeProperty("--artwork-limit");
    },
  };
}
