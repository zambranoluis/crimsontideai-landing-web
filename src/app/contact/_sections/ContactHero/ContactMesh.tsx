"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { observeAnimationLifecycle, type AnimationLifecycleState } from "@/lib/animationLifecycle";
import { drawContactMesh, type ContactMeshInput } from "./contact-mesh";
import styles from "./ContactHero.module.css";

export function ContactMesh({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const hero = root?.closest("section");
    if (!root || !canvas || !hero) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let lifecycleState: AnimationLifecycleState | undefined;
    let needsResize = true;
    let frame = 0;
    let lastDraw = 0;
    let time = 0;
    let width = 1;
    let height = 1;
    let compact = false;
    const input: ContactMeshInput = { pointer: { x: 0, y: 0, strength: 0 }, ripples: [] };
    let target: { x: number; y: number } | null = null;

    const resetInput = () => {
      target = null;
      input.pointer = { x: 0, y: 0, strength: 0 };
      input.ripples = [];
    };

    const paint = () => {
      drawContactMesh(context, width, height, compact ? 28 : 44, compact ? 12 : 18, time, input);
      root.dataset.ready = "true";
    };
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - lastDraw < 1000 / (compact ? 24 : 30)) return;
      const elapsed = (now - lastDraw) / 1000;
      time += Math.min(elapsed, .05);
      lastDraw = now;
      // About 95% settled after 250ms, independent of the rendering frame cap.
      const blend = 1 - Math.exp(-elapsed / .083);
      if (target) {
        input.pointer.x += (target.x - input.pointer.x) * blend;
        input.pointer.y += (target.y - input.pointer.y) * blend;
        input.pointer.strength += (1 - input.pointer.strength) * blend;
      }
      input.ripples = input.ripples.filter(ripple => {
        ripple.age += elapsed;
        return ripple.age < .9;
      });
      paint();
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      compact = matchMedia("(max-width: 767px)").matches;
      const ratio = Math.min(devicePixelRatio || 1, compact ? 1.2 : 1.35);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      needsResize = false;
      paint();
    };
    const canPaint = () => lifecycleState?.inViewport && lifecycleState.documentVisible;
    const lifecycle = observeAnimationLifecycle(canvas, state => {
      lifecycleState = state;
      cancelAnimationFrame(frame);
      frame = 0;
      resetInput();
      root.dataset.motion = state.running ? "running" : "paused";
      // Hidden/offscreen resize work is deferred; cold reduced motion still paints.
      if (canPaint()) {
        if (needsResize) resize();
        else paint();
      }
      if (state.running) {
        lastDraw = performance.now();
        frame = requestAnimationFrame(tick);
      }
    });
    const resizeObserver = new ResizeObserver(() => {
      needsResize = true;
      resetInput();
      if (canPaint()) resize();
    });
    resizeObserver.observe(canvas);

    const coordinates = (event: MouseEvent) => {
      // The field extends beyond the hero and changes its offset on mobile.
      const bounds = canvas.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };
    const eligible = (event: MouseEvent) => lifecycleState?.running && finePointer.matches
      && (!(event instanceof PointerEvent) || event.pointerType === "mouse");
    const move = (event: PointerEvent) => {
      if (!eligible(event)) return;
      target = coordinates(event);
      if (input.pointer.strength === 0) {
        input.pointer.x = target.x;
        input.pointer.y = target.y;
      }
    };
    const click = (event: MouseEvent) => {
      if (!eligible(event) || event.detail === 0 || event.button !== 0 || event.defaultPrevented) return;
      if (event.target instanceof Element && event.target.closest("a, button, input, select, textarea, summary, [role='button'], [role='link'], [contenteditable]")) return;
      const point = coordinates(event);
      if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) return;
      input.ripples = [...input.ripples.slice(-2), { ...point, age: 0 }];
    };
    const clear = () => {
      const hadInput = input.pointer.strength > 0 || input.ripples.length > 0;
      resetInput();
      if (hadInput && canPaint()) paint();
    };
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", clear);
    hero.addEventListener("pointercancel", clear);
    hero.addEventListener("click", click);
    finePointer.addEventListener("change", clear);

    return () => {
      cancelAnimationFrame(frame);
      lifecycle.dispose();
      resizeObserver.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", clear);
      hero.removeEventListener("pointercancel", clear);
      hero.removeEventListener("click", click);
      finePointer.removeEventListener("change", clear);
      resetInput();
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
    </div>
  );
}
