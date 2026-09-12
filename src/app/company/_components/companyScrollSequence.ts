import { clampProgress, scheduleScrollFrame } from "@/lib/scrollFrame";

/** Company-only geometry. The sticky child never supplies scroll progress. */
export function companyScrollSequence(artwork: HTMLElement) {
  const track = artwork.closest<HTMLElement>("#company-about")!;
  const scene = track.querySelector<HTMLElement>("[data-company-scene]")!;
  const artworkTrack = artwork.closest<HTMLElement>("[data-company-artwork-track]")!;
  const responsive = matchMedia("(max-width: 1024px), (pointer: coarse)");
  const motion = matchMedia("(prefers-reduced-motion: no-preference)");
  const eligibility = matchMedia("(min-width: 1025px) and (min-height: 700px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
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
  const measure = ({ height, header }: { height: number; header: number }) => {
    const usable = Math.max(0, height - header);
    const limit = `${Math.max(0, usable - 48)}px`;
    if (artworkTrack.style.getPropertyValue("--artwork-limit") !== limit) artworkTrack.style.setProperty("--artwork-limit", limit);
    if (responsive.matches && motion.matches && available && usable - 48 >= 240) {
      // Remove a previous full-scene hold before measuring the normal-flow origin.
      track.dataset.pinned = "false";
      delete track.dataset.sceneEntered;
      track.style.removeProperty("--track-height");
      track.style.removeProperty("--pin-top");
      track.dataset.mode = "artwork-only";
      const artworkHeight = artwork.getBoundingClientRect().height;
      const distance = usable * 2.5;
      const top = header + (usable - artworkHeight) / 2;
      const trackHeight = `${artworkHeight + distance}px`;
      const pinTop = `${top}px`;
      if (artworkTrack.style.getPropertyValue("--track-height") !== trackHeight) artworkTrack.style.setProperty("--track-height", trackHeight);
      if (artworkTrack.style.getPropertyValue("--pin-top") !== pinTop) artworkTrack.style.setProperty("--pin-top", pinTop);
      artworkTrack.dataset.pinned = "true";
      const rect = artworkTrack.getBoundingClientRect();
      alignInitialFragment(`${scrollY + rect.top}/${height}/${header}/${trackHeight}`);
      return clampProgress((top - rect.top) / distance);
    }
    // The artwork wrapper is transparent to desktop layout and never supplies
    // progress there. Clear it before checking the complete scene's natural fit.
    artworkTrack.dataset.pinned = "false";
    artworkTrack.style.removeProperty("--track-height");
    artworkTrack.style.removeProperty("--pin-top");
    const sceneHeight = scene.getBoundingClientRect().height;
    const origin = scrollY + track.getBoundingClientRect().top;
    const pinned = available && eligibility.matches && sceneHeight <= height - header;
    if (pinned) {
      const distance = (height - header) * 2.5;
      const top = height - sceneHeight;
      const trackHeight = `${sceneHeight + distance}px`;
      const pinTop = `${top}px`;
      if (track.style.getPropertyValue("--track-height") !== trackHeight) track.style.setProperty("--track-height", trackHeight);
      if (track.style.getPropertyValue("--pin-top") !== pinTop) track.style.setProperty("--pin-top", pinTop);
      track.dataset.pinned = "true";
      track.dataset.mode = "full-scene";
      alignInitialFragment(`${origin}/${height}/${header}/${trackHeight}`);
      const rect = track.getBoundingClientRect();
      // On tall displays the cards can sit below Reveal's 78% entrance gate
      // for the entire hold. Resolve the complete composition once it fits.
      track.dataset.sceneEntered = String(rect.top <= top && rect.bottom > 0);
      return clampProgress((top - rect.top) / distance);
    }
    clear();
    alignInitialFragment(`${origin}/${height}/${header}/${sceneHeight}`);
    const rect = artwork.getBoundingClientRect();
    return clampProgress((height * .85 - rect.top) / (rect.height + height * .6));
  };
  const resize = new ResizeObserver(scheduleScrollFrame);
  resize.observe(scene, { box: "border-box" });
  resize.observe(artwork, { box: "border-box" });
  responsive.addEventListener("change", scheduleScrollFrame);
  motion.addEventListener("change", scheduleScrollFrame);
  eligibility.addEventListener("change", scheduleScrollFrame);
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
    unavailable() { available = false; clear(); scheduleScrollFrame(); },
    dispose() {
      cancelInitialFragment();
      resize.disconnect();
      responsive.removeEventListener("change", scheduleScrollFrame);
      motion.removeEventListener("change", scheduleScrollFrame);
      eligibility.removeEventListener("change", scheduleScrollFrame);
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
