"use client";

import { useEffect, useRef } from "react";
import styles from "./ProductsMesh.module.css";

type MeshVariant = "hero" | "openjm" | "sentinel";
const presets = {
  hero: { rows: 18, columns: 80, frequency: 7.2, amplitude: .14, depth: .22, speed: .00016 },
  openjm: { rows: 30, columns: 64, frequency: 7.2, amplitude: .26, depth: .46, speed: .000123 },
  sentinel: { rows: 26, columns: 72, frequency: 11.1, amplitude: .19, depth: .35, speed: .000165 },
} as const;

export function ProductsMesh({ variant }: { variant: MeshVariant }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const { rows, columns, frequency, amplitude, depth, speed } = presets[variant];
    // Compute each point once per draw, then reuse it for both grid axes and dots.
    const points = new Float32Array((rows + 1) * (columns + 1) * 2);
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;
    let elapsed = 0;
    let previous = 0;
    let lastDraw = 0;
    const draw = () => {
      if (!width || !height) return;
      context.clearRect(0, 0, width, height);
      const phase = preference.matches ? 0 : elapsed * speed;
      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= columns; col++) {
          const u = col / columns;
          const v = row / rows;
          const index = (row * (columns + 1) + col) * 2;
          const wave = Math.sin(u * frequency + v * 3 + phase) * amplitude * (.4 + v * .6);
          if (variant === "openjm") {
            points[index] = width * (.53 + v * .46 + wave - u * .12);
            points[index + 1] = height * (u * 1.2 - .1);
          } else {
            points[index] = width * (u * 1.14 - .07);
            points[index + 1] = height * (.45 + v * depth + wave - u * .1);
          }
        }
      }
      context.lineWidth = .6;
      context.strokeStyle = "rgba(215,25,63,.18)";
      context.beginPath();
      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= columns; col++) {
          const index = (row * (columns + 1) + col) * 2;
          if (col === 0) context.moveTo(points[index], points[index + 1]);
          else context.lineTo(points[index], points[index + 1]);
        }
      }
      for (let col = 0; col <= columns; col++) {
        for (let row = 0; row <= rows; row++) {
          const index = (row * (columns + 1) + col) * 2;
          if (row === 0) context.moveTo(points[index], points[index + 1]);
          else context.lineTo(points[index], points[index + 1]);
        }
      }
      context.stroke();
      context.fillStyle = "rgba(255,54,89,.56)";
      context.beginPath();
      for (let index = 0; index < points.length; index += 4) {
        context.moveTo(points[index] + .85, points[index + 1]);
        context.arc(points[index], points[index + 1], .85, 0, Math.PI * 2);
      }
      context.fill();
      element.dataset.ready = "true";
    };
    const tick = (time: number) => {
      if (!visible || document.hidden || preference.matches || variant !== "hero") { frame = 0; return; }
      elapsed += previous ? Math.min(time - previous, 64) : 0;
      previous = time;
      if (time - lastDraw >= 1000 / 30) { draw(); lastDraw = time; }
      frame = requestAnimationFrame(tick);
    };
    const synchronize = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (visible && !document.hidden && width && height) {
        draw();
        lastDraw = performance.now();
        if (!preference.matches && variant === "hero") frame = requestAnimationFrame(tick);
      }
    };
    const resize = new ResizeObserver(() => {
      const bounds = element.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      // Bound both density and total canvas dimensions on very wide screens.
      const ratio = Math.min(window.devicePixelRatio, 1.5, 2160 / Math.max(width, 1), 1440 / Math.max(height, 1));
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      synchronize();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      synchronize();
    });
    resize.observe(element);
    intersection.observe(element);
    document.addEventListener("visibilitychange", synchronize);
    preference.addEventListener("change", synchronize);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", synchronize);
      preference.removeEventListener("change", synchronize);
    };
  }, [variant]);

  return <div className={`${styles.mesh} ${styles[variant]}`} aria-hidden="true">
    <svg className={styles.fallback} viewBox="0 0 1440 800" preserveAspectRatio="none">{Array.from({ length: 18 }, (_, i) => <path key={i} d={variant === "openjm" ? `M${780 + i * 20} -80 C${500 + i * 18} 270 ${1500 - i * 12} 480 ${700 + i * 28} 880` : `M-100 ${420 + i * 10} C380 ${100 + i * 17} 680 ${760 + i * 8} 1540 ${300 + i * 15}`} />)}</svg>
    <canvas ref={canvas} data-testid={`products-mesh-${variant}`} />
  </div>;
}
