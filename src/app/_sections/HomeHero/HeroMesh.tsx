"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroMesh.module.css";

type Ripple = { startedAt: number; u: number; v: number };

export function HeroMesh() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const section = element.closest("section");
    if (!section) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rows = 36;
    const columns = 100;
    const rippleDuration = 1200;
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;
    let elapsed = 0;
    let previous = 0;
    let lastDraw = 0;
    let lastDeformation = 0;
    const points = new Float32Array((rows + 1) * (columns + 1) * 2);
    let ripples: Ripple[] = [];
    const pointer = {
      active: false,
      clientX: 0,
      clientY: 0,
      x: 0,
      y: 0,
      strength: 0,
    };
    const clearInteraction = () => {
      pointer.active = false;
      pointer.strength = 0;
      ripples = [];
    };
    const canvasCoordinates = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * width / rect.width,
        y: (clientY - rect.top) * height / rect.height,
        scale: ((rect.width / width) + (rect.height / height)) / 2,
      };
    };
    const draw = (time = performance.now()) => {
      context.clearRect(0, 0, width, height);
      const glow = context.createRadialGradient(width * .78, height * .65, 0, width * .78, height * .65, width * .48);
      glow.addColorStop(0, "rgba(51,0,9,.62)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      const deformationDelta = lastDeformation ? Math.min(time - lastDeformation, 64) : 32;
      lastDeformation = time;
      const targetStrength = pointer.active ? 1 : 0;
      const ease = 1 - Math.exp(-deformationDelta / 90);
      pointer.strength += (targetStrength - pointer.strength) * ease;
      ripples = ripples.filter(ripple => time - ripple.startedAt < rippleDuration);
      let interactionScale = 1;
      if (pointer.active) {
        const target = canvasCoordinates(pointer.clientX, pointer.clientY);
        interactionScale = target.scale;
        pointer.x += (target.x - pointer.x) * ease;
        pointer.y += (target.y - pointer.y) * ease;
      } else if (pointer.strength > .001 || ripples.length) {
        const rect = element.getBoundingClientRect();
        interactionScale = ((rect.width / width) + (rect.height / height)) / 2;
      }
      const hoverRadius = 180 / interactionScale;
      const hoverLimit = 20 / interactionScale;
      const rippleLimit = 18 / interactionScale;
      const rippleExtent = Math.hypot(width, height) * .72;
      const rippleBand = 62 / interactionScale;
      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= columns; col++) {
          const u = col / columns;
          const depth = row / rows;
          let x = u * width * 1.22 - width * .11;
          let y = height * (.44 + depth * .55) + Math.sin(u * 8.5 + depth * 3.5 + elapsed * .00016) * height * (.06 + depth * .065) + Math.cos(u * 5 - elapsed * .0001) * height * .07 - u * height * .13;
          if (pointer.strength > .001) {
            const dx = pointer.x - x;
            const dy = pointer.y - y;
            const distance = Math.hypot(dx, dy);
            if (distance < hoverRadius) {
              const falloff = (1 - distance / hoverRadius) ** 2;
              const displacement = Math.min(distance * .45, hoverLimit * falloff) * pointer.strength;
              if (distance > 0) {
                x += dx / distance * displacement;
                y += dy / distance * displacement;
              }
            }
          }
          for (const ripple of ripples) {
            const progress = (time - ripple.startedAt) / rippleDuration;
            const dx = x - ripple.u * width;
            const dy = y - ripple.v * height;
            const distance = Math.hypot(dx, dy);
            const ring = Math.max(0, 1 - Math.abs(distance - progress * rippleExtent) / rippleBand);
            const displacement = ring * Math.sin(progress * Math.PI) * rippleLimit;
            if (distance > 0) {
              x += dx / distance * displacement;
              y += dy / distance * displacement;
            }
          }
          const index = (row * (columns + 1) + col) * 2;
          points[index] = x;
          points[index + 1] = y;
        }
      }
      for (let row = 0; row <= rows; row++) {
        context.beginPath();
        for (let col = 0; col <= columns; col++) {
          const index = (row * (columns + 1) + col) * 2;
          if (col === 0) context.moveTo(points[index], points[index + 1]); else context.lineTo(points[index], points[index + 1]);
        }
        context.strokeStyle = `rgba(255,0,51,${.07 + (row / rows) * .17})`;
        context.lineWidth = .65;
        context.stroke();
      }
      for (let col = 0; col <= columns; col++) {
        context.beginPath();
        for (let row = 0; row <= rows; row++) {
          const index = (row * (columns + 1) + col) * 2;
          if (row === 0) context.moveTo(points[index], points[index + 1]); else context.lineTo(points[index], points[index + 1]);
        }
        context.strokeStyle = "rgba(255,0,51,.09)";
        context.stroke();
      }
      context.shadowColor = "#FF0033";
      context.shadowBlur = 3.78;
      for (let row = 0; row <= rows; row += 2) {
        for (let col = 0; col <= columns; col++) {
          const index = (row * (columns + 1) + col) * 2;
          context.fillStyle = `rgba(255,0,51,${.22 + (row / rows) * .5})`;
          context.beginPath();
          context.arc(points[index], points[index + 1], .65 + (row / rows) * .45, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.shadowBlur = 0;
      element.dataset.ready = "true";
    };
    const tick = (time: number) => {
      if (!visible || document.hidden || preference.matches) { frame = 0; return; }
      elapsed += previous ? Math.min(time - previous, 64) : 0;
      previous = time;
      if (time - lastDraw >= 32) { draw(time); lastDraw = time; }
      frame = requestAnimationFrame(tick);
    };
    const synchronize = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      lastDeformation = 0;
      if (!visible || document.hidden || preference.matches) clearInteraction();
      element.dataset.running = String(visible && !document.hidden && !preference.matches);
      if (visible && !document.hidden) {
        draw();
        if (!preference.matches) frame = requestAnimationFrame(tick);
      }
    };
    const resize = new ResizeObserver(() => {
      width = element.clientWidth;
      height = element.clientHeight;
      const ratio = Math.min(devicePixelRatio, 1.5);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      synchronize();
    });
    const move = (event: PointerEvent) => {
      if (!width || !height || event.pointerType === "touch" || preference.matches || !visible || document.hidden) return;
      const target = canvasCoordinates(event.clientX, event.clientY);
      if (!pointer.active) {
        pointer.x = target.x;
        pointer.y = target.y;
      }
      pointer.active = true;
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
    };
    const leave = () => { pointer.active = false; };
    const click = (event: MouseEvent) => {
      if (!width || !height || preference.matches || !visible || document.hidden) return;
      if (event.target instanceof Element && event.target.closest("a, button")) return;
      const point = canvasCoordinates(event.clientX, event.clientY);
      const ripple = { startedAt: performance.now(), u: point.x / width, v: point.y / height };
      ripples = [...ripples.slice(-3), ripple];
    };
    resize.observe(element);
    intersection.observe(element);
    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", leave);
    section.addEventListener("click", click);
    document.addEventListener("visibilitychange", synchronize);
    preference.addEventListener("change", synchronize);
    return () => {
      cancelAnimationFrame(frame);
      clearInteraction();
      resize.disconnect();
      intersection.disconnect();
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
      section.removeEventListener("click", click);
      document.removeEventListener("visibilitychange", synchronize);
      preference.removeEventListener("change", synchronize);
    };
  }, []);
  return <div className={styles.mesh} aria-hidden="true">
    <svg className={styles.fallback} viewBox="0 0 1440 800" preserveAspectRatio="none">{Array.from({ length: 20 }, (_, i) => <path key={i} d={`M-100 ${400 + i * 17} C350 ${800 + i * 5} 750 ${100 + i * 25} 1540 ${400 + i * 14}`} />)}</svg>
    <canvas ref={canvas} data-testid="hero-mesh" />
  </div>;
}
