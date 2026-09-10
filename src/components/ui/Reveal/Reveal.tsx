"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { scheduleScrollFrame, subscribeScrollFrame } from "@/lib/scrollFrame";
import styles from "./Reveal.module.css";

export function Reveal({ children, className = "", delayMs = 0 }: { children: ReactNode; className?: string; delayMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let revealed = element.getBoundingClientRect().top < innerHeight || preference.matches;
    const reveal = () => { revealed = true; element.dataset.reveal = "revealed"; };
    element.dataset.reveal = revealed ? "revealed" : "hidden";
    const unsubscribe = subscribeScrollFrame(({ height }) => {
      if (revealed) return;
      // Subtract this entrance's displacement to keep its trigger stable.
      const transform = getComputedStyle(element).transform;
      const displacement = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
      if (preference.matches || element.getBoundingClientRect().top - displacement <= height * .78) reveal();
      element.dataset.revealReady = "true";
    });
    element.addEventListener("focusin", reveal);
    preference.addEventListener("change", scheduleScrollFrame);
    return () => {
      unsubscribe();
      element.removeEventListener("focusin", reveal);
      preference.removeEventListener("change", scheduleScrollFrame);
      delete element.dataset.reveal;
      delete element.dataset.revealReady;
    };
  }, []);
  return <div ref={ref} className={`${styles.reveal} ${className}`}
    style={{ "--reveal-delay": `${Math.max(0, Math.min(delayMs, 160))}ms` } as CSSProperties}>{children}</div>;
}
