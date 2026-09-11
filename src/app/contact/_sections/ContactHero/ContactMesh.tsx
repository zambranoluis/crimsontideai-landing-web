"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { drawContactMesh } from "./contact-mesh";
import styles from "./ContactHero.module.css";

export function ContactMesh({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let frame = 0;
    let lastDraw = 0;
    let time = 0;
    let width = 1;
    let height = 1;
    let compact = false;

    const paint = () => {
      drawContactMesh(context, width, height, compact ? 28 : 44, compact ? 12 : 18, time);
      root.dataset.ready = "true";
    };
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - lastDraw < 1000 / (compact ? 24 : 30)) return;
      time += Math.min((now - lastDraw) / 1000, .05);
      lastDraw = now;
      paint();
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      const active = visible && !document.hidden && !preference.matches && !pausedRef.current;
      root.dataset.motion = active ? "running" : "paused";
      if (active) {
        lastDraw = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    syncRef.current = sync;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      compact = matchMedia("(max-width: 767px)").matches;
      const ratio = Math.min(devicePixelRatio || 1, compact ? 1.2 : 1.35);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint();
    };
    const resizeObserver = new ResizeObserver(resize);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    resize();
    resizeObserver.observe(canvas);
    observer.observe(root);
    document.addEventListener("visibilitychange", sync);
    preference.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      preference.removeEventListener("change", sync);
      syncRef.current = () => {};
      delete root.dataset.ready;
      delete root.dataset.motion;
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.artwork} data-testid="contact-mesh">
      <div className={styles.field} aria-hidden="true">
        {children}
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <button className={styles.motionControl} type="button" onClick={() => {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
        syncRef.current();
      }}>{paused ? "Play animation" : "Pause animation"}</button>
    </div>
  );
}
