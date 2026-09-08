"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Reveal.module.css";

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;
    const resolve = () => {
      animation?.finish();
      delete element.dataset.pending;
    };
    if (preference.matches || element.getBoundingClientRect().top < innerHeight) return;
    element.dataset.pending = "true";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      delete element.dataset.pending;
      if (!preference.matches) {
        animation = element.animate(
          [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 750, easing: "cubic-bezier(.2,.75,.2,1)" },
        );
      }
      observer.disconnect();
    }, { threshold: 0.08 });
    const onVisibility = () => { if (document.hidden) resolve(); };
    const onPreference = () => { if (preference.matches) { resolve(); observer.disconnect(); } };
    observer.observe(element);
    document.addEventListener("visibilitychange", onVisibility);
    preference.addEventListener("change", onPreference);
    return () => { observer.disconnect(); animation?.cancel(); delete element.dataset.pending; document.removeEventListener("visibilitychange", onVisibility); preference.removeEventListener("change", onPreference); };
  }, []);
  return <div ref={ref} className={`${styles.reveal} ${className}`}>{children}</div>;
}
