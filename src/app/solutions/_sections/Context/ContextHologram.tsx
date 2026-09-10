"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./Context.module.css";

type ContextItem = {
  readonly title: string;
  readonly kicker: string;
  readonly body: string;
  readonly icon: string;
};

function drawMesh(canvas: HTMLCanvasElement, time: number) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const targetWidth = Math.max(1, Math.round(width * ratio));
  const targetHeight = Math.max(1, Math.round(height * ratio));
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  const centreX = width / 2;
  const centreY = height * .53;
  const radius = Math.min(width, height) * .215;
  const phase = time * .00032;
  const rows = 11;
  const columns = 34;
  const points: Array<Array<{ x: number; y: number; depth: number }>> = [];

  for (let row = 0; row <= rows; row += 1) {
    const latitude = ((row / rows) - .5) * Math.PI;
    const rowPoints = [];
    for (let column = 0; column < columns; column += 1) {
      const longitude = (column / columns) * Math.PI * 2 + phase;
      const depth = Math.cos(latitude) * Math.sin(longitude);
      const ripple = Math.sin(longitude * 3 - phase * 5 + row * .54) * radius * .025;
      rowPoints.push({
        x: centreX + Math.cos(latitude) * Math.cos(longitude) * (radius + ripple),
        y: centreY + Math.sin(latitude) * radius * .42 + depth * radius * .08,
        depth,
      });
    }
    points.push(rowPoints);
  }

  context.lineWidth = .65;
  for (let row = 0; row < points.length; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const point = points[row][column];
      const next = points[row][(column + 1) % columns];
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.strokeStyle = `rgba(239, 51, 64, ${.08 + (point.depth + 1) * .07})`;
      context.stroke();
      if (row < points.length - 1 && column % 2 === 0) {
        const below = points[row + 1][column];
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(below.x, below.y);
        context.strokeStyle = "rgba(239, 51, 64, .1)";
        context.stroke();
      }
      const alpha = .28 + (point.depth + 1) * .23;
      context.beginPath();
      context.arc(point.x, point.y, point.depth > .25 ? 1.25 : .8, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, ${65 + Math.round(alpha * 55)}, ${82 + Math.round(alpha * 45)}, ${alpha})`;
      context.fill();
    }
  }
}

export function ContextHologram({ items }: { items: readonly ContextItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let isIntersecting = false;
    let animationFrame = 0;
    let frameCount = 0;
    let lastTime = 0;

    const stop = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };
    const animate = (time: number) => {
      lastTime = time;
      drawMesh(canvas, time);
      frameCount += 1;
      root.dataset.hologramFrame = String(frameCount);
      animationFrame = requestAnimationFrame(animate);
    };
    const sync = () => {
      stop();
      if (reducedMotion.matches) {
        root.dataset.hologramMotion = "static";
        drawMesh(canvas, 0);
      } else if (isIntersecting && !document.hidden) {
        root.dataset.hologramMotion = "running";
        animationFrame = requestAnimationFrame(animate);
      } else {
        root.dataset.hologramMotion = "paused";
        drawMesh(canvas, lastTime);
      }
    };

    const intersection = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      sync();
    }, { rootMargin: "120px 0px" });
    const resize = new ResizeObserver(() => drawMesh(canvas, lastTime));
    const onVisibilityChange = () => sync();
    const onPreferenceChange = () => sync();

    drawMesh(canvas, 0);
    intersection.observe(root);
    resize.observe(canvas);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onPreferenceChange);

    return () => {
      stop();
      intersection.disconnect();
      resize.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  return <div ref={rootRef} className={styles.hologram} data-testid="context-hologram" data-hologram-motion="static" data-hologram-frame="0">
    <div className={styles.visual} aria-hidden="true">
      <svg className={styles.geometry} viewBox="0 0 720 540" role="presentation">
        <defs>
          <radialGradient id="contextCore" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ef3340" stopOpacity=".2" />
            <stop offset=".65" stopColor="#ef3340" stopOpacity=".045" />
            <stop offset="1" stopColor="#ef3340" stopOpacity="0" />
          </radialGradient>
          <filter id="contextGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <circle cx="360" cy="278" r="190" fill="none" stroke="#ef3340" strokeOpacity=".13" strokeDasharray="2 7" />
        <circle cx="360" cy="278" r="147" fill="none" stroke="#ef3340" strokeOpacity=".1" strokeDasharray="1 10" />
        <circle cx="360" cy="278" r="102" fill="url(#contextCore)" stroke="#ef3340" strokeOpacity=".12" />
        <path className={styles.triangleGlow} d="M360 89 188 407h344Z" />
        <path className={styles.triangle} d="M360 89 188 407h344Z" />
        <path className={styles.innerTriangle} d="M360 151 241 374h238Z" />
        <circle className={`${styles.orbitParticle} ${styles.particleOne}`} cx="360" cy="88" r="4" />
        <circle className={`${styles.orbitParticle} ${styles.particleTwo}`} cx="186" cy="408" r="4" />
        <circle className={`${styles.orbitParticle} ${styles.particleThree}`} cx="533" cy="408" r="4" />
        <g className={styles.meshFallback}>
          <ellipse cx="360" cy="286" rx="86" ry="34" />
          <ellipse cx="360" cy="286" rx="68" ry="27" />
          <ellipse cx="360" cy="286" rx="49" ry="20" />
          <path d="M276 286c34-48 134-48 168 0M292 299c31-31 105-31 136 0M312 312c27-17 69-17 96 0" />
        </g>
      </svg>
      <canvas ref={canvasRef} className={styles.canvas} />
      <span className={`${styles.beacon} ${styles.beaconTop}`}><Image src={items[0].icon} alt="" width={34} height={34} /></span>
      <span className={`${styles.beacon} ${styles.beaconLeft}`}><Image src={items[1].icon} alt="" width={34} height={34} /></span>
      <span className={`${styles.beacon} ${styles.beaconRight}`}><Image src={items[2].icon} alt="" width={34} height={34} /></span>
    </div>
    <div className={styles.panels}>
      {items.map((item, index) => <article key={item.title} className={`${styles.panel} ${styles[`panel${index + 1}`]}`}>
        <div className={styles.panelHeading}>
          <span className={styles.panelIcon} aria-hidden="true"><Image src={item.icon} alt="" width={26} height={26} /></span>
          <p className={styles.number}>0{index + 1}</p>
        </div>
        <h3>{item.title}</h3>
        <p className={styles.kicker}>{item.kicker}</p>
        <span className={styles.panelRule} aria-hidden="true" />
        <p className={styles.body}>{item.body}</p>
      </article>)}
    </div>
  </div>;
}
