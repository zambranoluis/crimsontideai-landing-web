"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroMesh.module.css";

export function HeroMesh() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;
    let elapsed = 0;
    let previous = 0;
    let lastDraw = 0;
    const draw = () => {
      context.clearRect(0, 0, width, height);
      const glow = context.createRadialGradient(width * .78, height * .65, 0, width * .78, height * .65, width * .48);
      glow.addColorStop(0, "rgba(51,0,9,.62)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      const rows = 36;
      const columns = 100;
      const point = (row: number, col: number) => {
        const u = col / columns;
        const depth = row / rows;
        return {
          x: u * width * 1.22 - width * .11,
          y: height * (.44 + depth * .55) + Math.sin(u * 8.5 + depth * 3.5 + elapsed * .00016) * height * (.06 + depth * .065) + Math.cos(u * 5 - elapsed * .0001) * height * .07 - u * height * .13,
        };
      };
      for (let row = 0; row <= rows; row++) {
        context.beginPath();
        for (let col = 0; col <= columns; col++) {
          const p = point(row, col);
          if (col === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y);
        }
        context.strokeStyle = `rgba(255,0,51,${.07 + (row / rows) * .17})`;
        context.lineWidth = .65;
        context.stroke();
      }
      for (let col = 0; col <= columns; col++) {
        context.beginPath();
        for (let row = 0; row <= rows; row++) {
          const p = point(row, col);
          if (row === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y);
        }
        context.strokeStyle = "rgba(255,0,51,.09)";
        context.stroke();
      }
      context.shadowColor = "#FF0033";
      context.shadowBlur = 3.78;
      for (let row = 0; row <= rows; row += 2) {
        for (let col = 0; col <= columns; col++) {
          const p = point(row, col);
          context.fillStyle = `rgba(255,0,51,${.22 + (row / rows) * .5})`;
          context.beginPath();
          context.arc(p.x, p.y, .65 + (row / rows) * .45, 0, Math.PI * 2);
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
      if (time - lastDraw >= 32) { draw(); lastDraw = time; }
      frame = requestAnimationFrame(tick);
    };
    const synchronize = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
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
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; synchronize(); });
    resize.observe(element);
    intersection.observe(element);
    document.addEventListener("visibilitychange", synchronize);
    preference.addEventListener("change", synchronize);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect(); document.removeEventListener("visibilitychange", synchronize); preference.removeEventListener("change", synchronize); };
  }, []);
  return <div className={styles.mesh} aria-hidden="true">
    <svg className={styles.fallback} viewBox="0 0 1440 800" preserveAspectRatio="none">{Array.from({ length: 20 }, (_, i) => <path key={i} d={`M-100 ${400 + i * 17} C350 ${800 + i * 5} 750 ${100 + i * 25} 1540 ${400 + i * 14}`} />)}</svg>
    <canvas ref={canvas} data-testid="hero-mesh" />
  </div>;
}
