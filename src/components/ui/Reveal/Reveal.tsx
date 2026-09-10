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
    const bounds = () => {
      const rect = element.getBoundingClientRect();
      const transform = getComputedStyle(element).transform;
      let displacement = 0;
      if (transform !== "none") {
        try { displacement = new DOMMatrixReadOnly(transform).m42; } catch { /* Keep layout bounds usable. */ }
      }
      return { top: rect.top - displacement, bottom: rect.bottom - displacement };
    };
    const initialBounds = bounds();
    let focused = element.contains(document.activeElement);
    let inViewport = initialBounds.bottom > 0 && initialBounds.top < innerHeight;
    let revealed = preference.matches || focused || inViewport;
    let previousScrollY = scrollY;
    let previousHeight = innerHeight;

    const reveal = (animate: boolean) => {
      if (!animate) delete element.dataset.revealReady;
      revealed = true;
      element.dataset.reveal = "revealed";
    };
    const reset = () => {
      // Remove the transition before restoring the hidden entrance pose. This is
      // an offscreen state reset, not an exit animation.
      delete element.dataset.revealReady;
      revealed = false;
      element.dataset.reveal = "hidden";
      void element.offsetHeight;
      element.dataset.revealReady = "true";
    };

    element.dataset.reveal = revealed ? "revealed" : "hidden";
    const unsubscribe = subscribeScrollFrame(({ height }) => {
      const currentScrollY = scrollY;
      const direction = Math.sign(currentScrollY - previousScrollY);
      previousScrollY = currentScrollY;
      const rect = bounds();
      const nextInViewport = rect.bottom > 0 && rect.top < height;

      if (preference.matches || focused) {
        reveal(false);
      } else if (revealed) {
        if (!nextInViewport) reset();
      } else if (nextInViewport) {
        if (direction > 0 && rect.top <= height * .78) reveal(true);
        else if (direction < 0 && rect.bottom >= height * .22) reveal(true);
        else if (direction === 0 && (!inViewport || height !== previousHeight)) reveal(false);
      }
      inViewport = nextInViewport;
      previousHeight = height;
      element.dataset.revealReady = "true";
    });
    const onFocusIn = () => { focused = true; reveal(false); };
    const onFocusOut = (event: FocusEvent) => {
      focused = event.relatedTarget instanceof Node && element.contains(event.relatedTarget);
      if (!focused) scheduleScrollFrame();
    };
    const onPreferenceChange = () => {
      if (preference.matches) reveal(false);
      scheduleScrollFrame();
    };
    element.addEventListener("focusin", onFocusIn);
    element.addEventListener("focusout", onFocusOut);
    preference.addEventListener("change", onPreferenceChange);
    return () => {
      unsubscribe();
      element.removeEventListener("focusin", onFocusIn);
      element.removeEventListener("focusout", onFocusOut);
      preference.removeEventListener("change", onPreferenceChange);
      delete element.dataset.reveal;
      delete element.dataset.revealReady;
    };
  }, []);
  return <div ref={ref} className={`${styles.reveal} ${className}`}
    style={{ "--reveal-delay": `${Math.max(0, Math.min(delayMs, 160))}ms` } as CSSProperties}>{children}</div>;
}
