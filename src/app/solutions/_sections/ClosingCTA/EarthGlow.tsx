"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { clampProgress, scheduleScrollFrame, subscribeScrollFrame } from "@/lib/scrollFrame";

/** Content is server rendered; enhancement only measures fit and paints scroll light. */
export function EarthGlow({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = ref.current;
    const scene = section?.querySelector<HTMLElement>("[data-earth-scene]");
    const copy = section?.querySelector<HTMLElement>("[data-earth-copy]");
    const art = section?.querySelector<HTMLElement>("[data-earth-art]");
    const artworkTrack = section?.querySelector<HTMLElement>("[data-earth-artwork-track]");
    if (!section || !scene || !copy || !art || !artworkTrack) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let dirty = true;
    let geometry = "";
    const invalidate = () => { dirty = true; scheduleScrollFrame(); };
    const update = ({ height, header }: { height: number; header: number }) => {
      const available = Math.max(1, height - header);
      const nextGeometry = `${innerWidth}/${height}/${header}/${reduced.matches}`;
      if (dirty || geometry !== nextGeometry) {
        dirty = false;
        geometry = nextGeometry;
        section.style.setProperty("--earth-header", `${header}px`);
        section.style.setProperty("--earth-available", `${available}px`);
        // Reset to natural layout before measuring either composition. A previous
        // sticky height must never become an input to the next fit decision.
        section.dataset.earthMode = "flow";
        const required = () => copy.offsetHeight + parseFloat(getComputedStyle(scene).paddingTop)
          + parseFloat(getComputedStyle(art).marginTop) + 160;
        let mode = "static";
        if (!reduced.matches && available >= 208) {
          mode = "pinned";
          if (required() > available) {
            section.dataset.earthMode = "compact-pinned";
            mode = required() <= available ? "compact-pinned" : "artwork-only";
          }
        }
        section.dataset.earthMode = mode;
      }
      const mode = section.dataset.earthMode;

      // Measure the outer track, never the stationary sticky scene. No easing or time state.
      const top = (mode === "artwork-only" ? artworkTrack : section).getBoundingClientRect().top;
      const progress = mode === "static" ? 1 : clampProgress((header - top) / (available * .85));
      section.style.setProperty("--earth-glow", String(progress));
      section.style.setProperty("--earth-atmosphere", String(progress * .55));
    };
    // Establish track height before the router restores a cached route's scroll.
    update({ height: innerHeight, header: document.querySelector("header")?.getBoundingClientRect().height ?? 88 });
    const unsubscribe = subscribeScrollFrame(update);
    const resize = new ResizeObserver(invalidate);
    resize.observe(copy, { box: "border-box" });
    resize.observe(scene);
    reduced.addEventListener("change", invalidate);
    document.fonts.addEventListener("loadingdone", invalidate);
    // The shared scheduler also covers header/body resize, fonts, images, pageshow and visibility.
    window.addEventListener("popstate", scheduleScrollFrame);
    return () => {
      unsubscribe();
      resize.disconnect();
      reduced.removeEventListener("change", invalidate);
      document.fonts.removeEventListener("loadingdone", invalidate);
      window.removeEventListener("popstate", scheduleScrollFrame);
      // Keep the last geometry on a cached route. Collapsing its track during
      // effect cleanup can change the scroll position captured for browser Back.
    };
  }, []);

  return <section ref={ref} className={className} aria-labelledby="solutions-closing-title" data-testid="solutions-earth">{children}</section>;
}
