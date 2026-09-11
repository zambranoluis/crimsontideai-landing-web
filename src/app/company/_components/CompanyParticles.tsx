"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { observeAnimationLifecycle } from "@/lib/animationLifecycle";
import { scheduleScrollFrame, subscribeScrollFrame } from "@/lib/scrollFrame";
import { appearance, clamp, createParticleTargets, drawParticles, type Point } from "./particles";
import styles from "./CompanyParticles.module.css";

export function CompanyParticles() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = ref.current, canvas = canvasRef.current;
    if (!element || !canvas) return;
    let context: CanvasRenderingContext2D | null;
    try { context = canvas.getContext("2d", { alpha: true }); } catch { return; }
    if (!context) return;
    const ctx = context;
    let targets: Point[][] | null = null;
    let width = 0, height = 0, count = 0, progress = 0;
    let running = false, frame = 0, previous = 0, elapsed = 0, lastDraw = 0;
    let failed = false;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      progress = clamp((innerHeight * .85 - rect.top) / (rect.height + innerHeight * .6));
      element.dataset.progress = progress.toFixed(4);
      element.dataset.shape = progress <= .05 ? "brain" : progress >= .95 ? "bulb" : progress >= .45 && progress <= .55 ? "gear" : "transition";
      if (width === rect.width && height === rect.height) return;
      width = rect.width; height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.75, 1200 / width, 1200 / height);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      if (!running || failed) return;
      const density = innerWidth < 768 ? 900 : innerWidth < 1024 ? 1200 : appearance.density;
      if (!targets || count !== density) {
        try { targets = createParticleTargets(density); } catch { targets = null; }
        if (!targets) { failed = true; element.dataset.motion = "unavailable"; return; }
        count = density;
        element.dataset.particles = String(count);
      }
      drawParticles(ctx, targets, width, height, progress, elapsed / 1000);
      element.dataset.ready = "true";
    };
    const tick = (time: number) => {
      if (!running || failed) { frame = 0; return; }
      if (previous) elapsed += Math.min(time - previous, 64);
      previous = time;
      if (time - lastDraw >= 1000 / 30) { draw(); lastDraw = time; }
      frame = requestAnimationFrame(tick);
    };
    const synchronize = () => { measure(); draw(); };
    measure();
    const lifecycle = observeAnimationLifecycle(element, state => {
      running = state.running;
      element.dataset.motion = failed ? "unavailable" : running ? "running" : "paused";
      element.dataset.reducedMotion = String(state.reducedMotion);
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      if (running) { synchronize(); frame = requestAnimationFrame(tick); }
    });
    const unsubscribe = subscribeScrollFrame(synchronize);
    const resize = new ResizeObserver(synchronize);
    resize.observe(element);
    window.addEventListener("hashchange", scheduleScrollFrame);
    window.addEventListener("popstate", scheduleScrollFrame);
    const lost = (event: Event) => {
      event.preventDefault(); failed = true;
      cancelAnimationFrame(frame); delete element.dataset.ready;
      element.dataset.motion = "unavailable";
    };
    canvas.addEventListener("contextlost", lost);
    return () => {
      running = false; cancelAnimationFrame(frame);
      lifecycle.dispose(); unsubscribe(); resize.disconnect();
      window.removeEventListener("hashchange", scheduleScrollFrame);
      window.removeEventListener("popstate", scheduleScrollFrame);
      canvas.removeEventListener("contextlost", lost);
      delete element.dataset.ready;
    };
  }, []);
  return <div ref={ref} className={styles.artwork} data-testid="company-particles" aria-hidden="true">
    <Image className={styles.fallback} src="/pages/company/company/images/company-particles.svg" alt="" fill sizes="(max-width: 767px) 100vw, 45vw" />
    <canvas ref={canvasRef} className={styles.canvas} />
  </div>;
}
