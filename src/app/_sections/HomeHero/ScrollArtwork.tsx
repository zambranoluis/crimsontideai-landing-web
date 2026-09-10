"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { clampProgress, scheduleScrollFrame, subscribeScrollFrame } from "@/lib/scrollFrame";
import styles from "./HeroMesh.module.css";

/** The section is the measurement anchor; only its artwork is transformed. */
export function ScrollArtwork({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const section = element?.closest("section");
    if (!element || !section) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const unsubscribe = subscribeScrollFrame(({ height }) => {
      const top = section.getBoundingClientRect().top + scrollY;
      const progress = preference.matches ? 0 : clampProgress(scrollY / (height * .7));
      // The page hero starts below the header; progress still starts at document zero.
      if (scrollY > top + section.offsetHeight + height) return;
      element.style.setProperty("--hero-scale", String(1 + progress * .08));
      element.style.setProperty("--hero-y", `${-40 * progress}px`);
    });
    preference.addEventListener("change", scheduleScrollFrame);
    return () => { unsubscribe(); preference.removeEventListener("change", scheduleScrollFrame); };
  }, []);
  return <div ref={ref} className={styles.scrollArtwork} data-testid="hero-artwork">{children}</div>;
}
