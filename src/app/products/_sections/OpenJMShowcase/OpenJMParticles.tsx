"use client";

import { useEffect, useRef } from "react";
import { useProductMotion } from "../../_components/ProductMotion";
import { useProductAnimation } from "../../_components/useProductAnimation";
import styles from "./OpenJMParticles.module.css";

const POINT_COUNT = 480;
const REGION_SIZE = 180;
const points = Array.from({ length: POINT_COUNT }, (_, index) => {
  const y = 1 - index / (POINT_COUNT - 1) * 2;
  const radius = Math.sqrt(1 - y * y);
  const angle = Math.PI * (3 - Math.sqrt(5)) * index;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return { x, y, z, theta: Math.atan2(z, x), phi: Math.acos(y), band: Math.min(15, Math.floor((1 - y) * 8)) };
});

function frameParameters(elapsed: number) {
  // The reference cycles green -> blue -> green over five seconds.
  const segment = (elapsed % 5000) / (5000 / 3);
  const progress = segment < 1 ? segment : segment < 2 ? 2 - segment : 0;
  const blend = .5 - .5 * Math.cos(progress * Math.PI);
  const time = elapsed * .002;
  const rotation = time * .3;
  return {
    time, blend,
    sinX: Math.sin(-rotation), cosX: Math.cos(-rotation),
    sinY: Math.sin(rotation), cosY: Math.cos(rotation),
    scale: Math.pow(25, (-27.59 - 6.2 * blend) / 100),
    morph: .25 + .08 * blend,
  };
}

function project(point: typeof points[number], frame: ReturnType<typeof frameParameters>) {
  const radius = 1 + Math.sin(point.theta * 4 + frame.time * 2) * Math.cos(point.phi * 3 - frame.time) * frame.morph;
  const x = point.x * radius;
  const y = point.y * radius * frame.cosX - point.z * radius * frame.sinX;
  const z = point.y * radius * frame.sinX + point.z * radius * frame.cosX;
  const rotatedX = x * frame.cosY - z * frame.sinY;
  const rotatedZ = x * frame.sinY + z * frame.cosY;
  const scale = 3 / (3 + rotatedZ) * frame.scale;
  return { x: 90 + rotatedX * scale * 105, y: 90 + y * scale * 105, radius: Math.max(.5, scale * 2) };
}

function palette(blend: number) {
  const top = [43 * blend, 255 * (1 - blend), 145 + 110 * blend];
  const bottom = [9 + 73 * blend, 102 + 103 * blend, 114 + 107 * blend];
  return Array.from({ length: 16 }, (_, band) => `rgb(${top.map((value, channel) => Math.round(value + (bottom[channel] - value) * band / 15)).join(" ")})`);
}

const staticFrame = frameParameters(0);
const staticPalette = palette(0);

export function OpenJMParticles() {
  const region = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<((elapsed: number) => void) | null>(null);
  const active = useRef(false);
  const { inViewport, documentVisible } = useProductMotion();

  useEffect(() => {
    active.current = inViewport && documentVisible;
  }, [inViewport, documentVisible]);

  useEffect(() => {
    const element = canvas.current;
    const container = region.current;
    const context = element?.getContext("2d");
    if (!element || !container || !context) return;
    let lastElapsed = 0;
    let pendingResize = true;
    const resize = () => {
      const size = Math.min(360, Math.max(1, Math.round(container.clientWidth * Math.min(window.devicePixelRatio || 1, 2))));
      if (element.width !== size || element.height !== size) {
        element.width = size;
        element.height = size;
      }
      context.setTransform(size / REGION_SIZE, 0, 0, size / REGION_SIZE, 0, 0);
      pendingResize = false;
    };
    const draw = (elapsed: number) => {
      if (pendingResize) resize();
      lastElapsed = elapsed;
      const frame = frameParameters(elapsed);
      const colors = palette(frame.blend);
      context.clearRect(0, 0, REGION_SIZE, REGION_SIZE);
      for (let band = 0; band < 16; band++) {
        context.fillStyle = colors[band];
        context.beginPath();
        // Latitude ordering makes the color bands contiguous.
        for (let index = band * (POINT_COUNT / 16); index < (band + 1) * (POINT_COUNT / 16); index++) {
          const point = project(points[index], frame);
          context.moveTo(point.x + point.radius, point.y);
          context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        }
        context.fill();
      }
      container.dataset.ready = "true";
    };
    renderer.current = draw;
    const observer = new ResizeObserver(() => {
      pendingResize = true;
      if (active.current) draw(lastElapsed);
    });
    observer.observe(container);
    return () => {
      renderer.current = null;
      observer.disconnect();
      delete container.dataset.ready;
    };
  }, []);

  useProductAnimation(elapsed => renderer.current?.(elapsed ?? 0));

  return (
    <div ref={region} className={styles.region} data-testid="openjm-particles">
      <svg className={styles.fallback} viewBox="0 0 180 180" aria-hidden="true">
        {points.filter((_, index) => index % 3 === 0).map((point, index) => {
          const projected = project(point, staticFrame);
          // Normalize trigonometric results across server and browser JS engines.
          return <circle key={index} cx={projected.x.toFixed(3)} cy={projected.y.toFixed(3)}
            r={projected.radius.toFixed(3)} fill={staticPalette[point.band]} />;
        })}
      </svg>
      <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
    </div>
  );
}
