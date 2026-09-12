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
    if (!section || !scene || !copy || !art) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const update = ({ height, header }: { height: number; header: number }) => {
      const available = Math.max(1, height - header);
      const sceneStyle = getComputedStyle(scene);
      const gap = parseFloat(getComputedStyle(art).marginTop);
      const required = copy.offsetHeight + parseFloat(sceneStyle.paddingTop) + gap + 160;
      const mode = reduced.matches ? "static" : required <= available ? "pinned" : "flow";
      section.style.setProperty("--earth-header", `${header}px`);
      section.style.setProperty("--earth-available", `${available}px`);
      if (section.dataset.earthMode !== mode) section.dataset.earthMode = mode;

      // Measure the outer track, never the stationary sticky scene. No easing or time state.
      const top = section.getBoundingClientRect().top;
      const progress = mode === "static" ? 1 : mode === "pinned"
        ? clampProgress((header - top) / (available * .85))
        : clampProgress((height - top) / available);
      section.style.setProperty("--earth-glow", String(progress));
      section.style.setProperty("--earth-atmosphere", String(progress * .55));
    };
    // Establish track height before the router restores a cached route's scroll.
    update({ height: innerHeight, header: document.querySelector("header")?.getBoundingClientRect().height ?? 88 });
    const unsubscribe = subscribeScrollFrame(update);
    const resize = new ResizeObserver(scheduleScrollFrame);
    resize.observe(copy, { box: "border-box" });
    resize.observe(scene);
    reduced.addEventListener("change", scheduleScrollFrame);
    // The shared scheduler also covers header/body resize, fonts, images, pageshow and visibility.
    window.addEventListener("popstate", scheduleScrollFrame);
    return () => {
      unsubscribe();
      resize.disconnect();
      reduced.removeEventListener("change", scheduleScrollFrame);
      window.removeEventListener("popstate", scheduleScrollFrame);
      // Keep the last geometry on a cached route. Collapsing its track during
      // effect cleanup can change the scroll position captured for browser Back.
    };
  }, []);

  return <section ref={ref} className={className} aria-labelledby="solutions-closing-title" data-testid="solutions-earth">{children}</section>;
}
