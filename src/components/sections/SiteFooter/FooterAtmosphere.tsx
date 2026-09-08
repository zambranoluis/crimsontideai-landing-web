"use client";

import { useEffect, useRef } from "react";
import styles from "./FooterAtmosphere.module.css";

export function FooterAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = false;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const synchronize = () => { element.dataset.running = String(visible && !document.hidden && !preference.matches); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; synchronize(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", synchronize);
    preference.addEventListener("change", synchronize);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", synchronize); preference.removeEventListener("change", synchronize); };
  }, []);
  return <div ref={ref} className={styles.atmosphere} aria-hidden="true" data-testid="footer-atmosphere">
    <svg viewBox="0 0 1440 220" preserveAspectRatio="none">{Array.from({ length: 16 }, (_, i) => <path key={i} d={`M-100 ${110 + i * 8} Q400 ${-120 + i * 16} 800 ${130 + i * 7} T1540 ${90 + i * 9}`} />)}</svg>
  </div>;
}
