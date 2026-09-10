"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ProductSceneContext, type ProductSceneState } from "./ProductSceneContext";
import styles from "./ProductPreviews.module.css";

const MotionContext = createContext<{ running: boolean; reducedMotion: boolean; scene: ProductSceneState | null }>({ running: false, reducedMotion: true, scene: null });

export function useProductMotion() {
  return useContext(MotionContext);
}

export function ProductMotion({ children, product }: { children: ReactNode; product: "openjm" | "sentinel" }) {
  const scene = useContext(ProductSceneContext);
  const controlled = scene !== null;
  const ref = useRef<HTMLDivElement>(null);
  const [motion, setMotion] = useState({ running: false, reducedMotion: true });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let visible = false;
    const resetTilt = () => {
      element.style.removeProperty("--pointer-x");
      element.style.removeProperty("--pointer-y");
    };
    const synchronize = () => {
      const reducedMotion = preference.matches;
      const running = visible && !document.hidden && !reducedMotion;
      if (!running || !pointer.matches) resetTilt();
      setMotion(previous => previous.running === running && previous.reducedMotion === reducedMotion
        ? previous : { running, reducedMotion });
    };
    const move = (event: PointerEvent) => {
      if (!pointer.matches || preference.matches || !visible || document.hidden) return;
      const bounds = element.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      element.style.setProperty("--pointer-x", `${(-y * 1.3).toFixed(3)}deg`);
      element.style.setProperty("--pointer-y", `${(x * 1.3).toFixed(3)}deg`);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      synchronize();
    });
    observer.observe(element);
    synchronize();
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", resetTilt);
    document.addEventListener("visibilitychange", synchronize);
    preference.addEventListener("change", synchronize);
    pointer.addEventListener("change", synchronize);
    return () => {
      observer.disconnect();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", resetTilt);
      document.removeEventListener("visibilitychange", synchronize);
      preference.removeEventListener("change", synchronize);
      pointer.removeEventListener("change", synchronize);
      resetTilt();
    };
  }, []);

  return (
    <MotionContext.Provider value={{ ...motion, scene }}>
      <div ref={ref} className={styles.motion} data-testid={`${product}-preview`}
        data-motion={motion.running ? "running" : "paused"} data-scene-controlled={controlled || undefined} data-scene-enabled={scene?.enabled} data-active-step={scene?.activeStep} aria-hidden="true">
        <div className={styles.tilt}>
          <div className={styles.float}>
            <div className={styles.depth} />
            {children}
          </div>
        </div>
      </div>
    </MotionContext.Provider>
  );
}
