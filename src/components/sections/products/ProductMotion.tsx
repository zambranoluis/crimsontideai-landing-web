"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./ProductPreviews.module.css";

export function ProductMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const synchronize = () => { element.dataset.motion = visible && !document.hidden && !preference.matches ? "running" : "paused"; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; synchronize(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", synchronize);
    preference.addEventListener("change", synchronize);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", synchronize);
      preference.removeEventListener("change", synchronize);
      delete element.dataset.motion;
    };
  }, []);
  return <div ref={ref} className={styles.motion} aria-hidden="true">{children}</div>;
}
