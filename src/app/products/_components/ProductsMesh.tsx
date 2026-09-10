"use client";

import { useEffect, useRef } from "react";
import styles from "./ProductsMesh.module.css";

type MeshVariant = "openjm" | "sentinel";
const presets = {
  openjm: { rows: 30, columns: 64, frequency: 7.2, amplitude: .26, depth: .46, speed: .000123 },
  sentinel: { rows: 26, columns: 72, frequency: 11.1, amplitude: .19, depth: .35, speed: .000165 },
} as const;

export function ProductsMesh({ variant }: { variant: MeshVariant }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    // Listen on the section so the decorative canvas never blocks content or links.
    const section = element.closest("section");
    if (!section) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerPreference = window.matchMedia("(hover: hover) and (pointer: fine)");
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
    const pointer = { clientX: 0, clientY: 0, active: false, strength: 0 };
    const pulses: { x: number; y: number; started: number }[] = [];
    const pulseDuration = 2200;
    const draw = () => {
      if (!width || !height) return;
      context.clearRect(0, 0, width, height);
      const phase = preference.matches ? 0 : elapsed * speed;
      const bounds = element.getBoundingClientRect();
      const pointerX = pointer.clientX - bounds.left;
      const pointerY = pointer.clientY - bounds.top;
      const hoverRadius = Math.min(240, width * .25);
      const hoverActive = pointer.active && pointerX >= 0 && pointerX <= width && pointerY >= 0 && pointerY <= height;
      pointer.strength += ((hoverActive && !preference.matches ? 1 : 0) - pointer.strength) * .14;
      while (pulses.length && elapsed - pulses[0].started >= pulseDuration) pulses.shift();
      const waves = pulses.map(pulse => {
        const age = (elapsed - pulse.started) / pulseDuration;
        const x = pulse.x * width;
        const y = pulse.y * height;
        return { x, y, radius: age * Math.hypot(Math.max(x, width - x), Math.max(y, height - y)), spread: 42 + age * 90, strength: 48 * (1 - age) ** 2 };
      });
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
          if (!preference.matches) {
            let x = points[index];
            let y = points[index + 1];
            const dx = x - pointerX;
            const dy = y - pointerY;
            const distance = Math.hypot(dx, dy);
            const bend = Math.exp(-((distance / hoverRadius) ** 2) * 2) * 22 * pointer.strength;
            x += dx / Math.max(1, distance) * bend;
            y += dy / Math.max(1, distance) * bend;
            for (const pulse of waves) {
              const px = points[index] - pulse.x;
              const py = points[index + 1] - pulse.y;
              const distance = Math.hypot(px, py);
              const offset = (distance - pulse.radius) / pulse.spread;
              // A widening wave front disperses the grid and settles behind itself.
              const displacement = Math.exp(-offset * offset * 2) * Math.cos(offset * 2) * pulse.strength;
              x += px / Math.max(1, distance) * displacement;
              y += py / Math.max(1, distance) * displacement;
            }
            points[index] = x;
            points[index + 1] = y;
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
      if (!visible || document.hidden || preference.matches) { frame = 0; return; }
      elapsed += previous ? Math.min(time - previous, 64) : 0;
      previous = time;
      if (time - lastDraw >= 1000 / 30) { draw(); lastDraw = time; }
      frame = requestAnimationFrame(tick);
    };
    const synchronize = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (!visible || document.hidden || preference.matches) {
        pointer.active = false;
        pointer.strength = 0;
        pulses.length = 0;
      }
      if (visible && !document.hidden && width && height) {
        draw();
        lastDraw = performance.now();
        if (!preference.matches) frame = requestAnimationFrame(tick);
      }
    };
    const move = (event: PointerEvent) => {
      if (preference.matches || !pointerPreference.matches || event.pointerType === "touch") return;
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;
      pointer.active = true;
    };
    const leave = () => { pointer.active = false; };
    const pulse = (event: MouseEvent) => {
      if (preference.matches || !visible || document.hidden || event.detail === 0) return;
      if (event.target instanceof Element && event.target.closest("a, button, input, textarea, select, [role='button']")) return;
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / width;
      const y = (event.clientY - bounds.top) / height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      if (pulses.length >= 6) pulses.shift();
      pulses.push({ x, y, started: elapsed });
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
    pointerPreference.addEventListener("change", leave);
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointerleave", leave);
    section.addEventListener("pointercancel", leave);
    section.addEventListener("click", pulse);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", synchronize);
      preference.removeEventListener("change", synchronize);
      pointerPreference.removeEventListener("change", leave);
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
      section.removeEventListener("pointercancel", leave);
      section.removeEventListener("click", pulse);
    };
  }, [variant]);

  return <div className={`${styles.mesh} ${styles[variant]}`} aria-hidden="true">
    <svg className={styles.fallback} viewBox="0 0 1440 800" preserveAspectRatio="none">{Array.from({ length: 18 }, (_, i) => <path key={i} d={variant === "openjm" ? `M${780 + i * 20} -80 C${500 + i * 18} 270 ${1500 - i * 12} 480 ${700 + i * 28} 880` : `M-100 ${420 + i * 10} C380 ${100 + i * 17} 680 ${760 + i * 8} 1540 ${300 + i * 15}`} />)}</svg>
    <canvas ref={canvas} data-testid={`products-mesh-${variant}`} />
  </div>;
}
