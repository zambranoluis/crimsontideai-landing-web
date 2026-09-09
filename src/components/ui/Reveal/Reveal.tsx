"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Reveal.module.css";

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let initiallyVisible = element.getBoundingClientRect().top < innerHeight;
    const synchronize = () => {
      frame = 0;
      // Remove our animated displacement so motion cannot move its own trigger.
      const transform = getComputedStyle(element).transform;
      const displacement = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
      const top = element.getBoundingClientRect().top - displacement;
      const threshold = innerHeight * 0.92;
      if (top <= threshold || top >= innerHeight) initiallyVisible = false;
      element.dataset.reveal = preference.matches || initiallyVisible || top <= threshold
        ? "revealed" : "hidden";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(synchronize);
    };

    // Establish the initial state without animating content out after hydration.
    synchronize();
    frame = requestAnimationFrame(() => {
      frame = 0;
      element.dataset.revealReady = "true";
      synchronize();
    });
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", schedule);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", schedule);
      document.removeEventListener("visibilitychange", schedule);
      delete element.dataset.reveal;
      delete element.dataset.revealReady;
    };
  }, []);
  return <div ref={ref} className={`${styles.reveal} ${className}`}>{children}</div>;
}
