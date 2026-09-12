"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { mountContextTerrain } from "./contextTerrain";
import styles from "./Context.module.css";

type ContextItem = {
  readonly title: string;
  readonly kicker: string;
  readonly body: string;
  readonly icon: string;
};

export function ContextHologram({ items }: { items: readonly ContextItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!rootRef.current || !coreRef.current || !canvasRef.current) return;
    return mountContextTerrain(rootRef.current, coreRef.current, canvasRef.current);
  }, []);

  return <div
    ref={rootRef}
    className={styles.hologram}
    data-testid="context-hologram"
    data-hologram-motion="static"
    data-hologram-frame="0"
    data-hologram-pulse-count="0"
    data-hologram-pointer-strength="0.000"
    data-context-columns="36"
    data-context-rows="18"
  >
    <div className={styles.diagram} data-testid="context-diagram">
      <svg className={styles.geometry} viewBox="0 0 1000 540" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="contextOuterRed" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7f2632" stopOpacity=".38" />
            <stop offset=".3" stopColor="#e53a47" stopOpacity=".58" />
            <stop offset=".62" stopColor="#69232d" stopOpacity=".28" />
            <stop offset="1" stopColor="#c72d3d" stopOpacity=".5" />
          </linearGradient>
          <linearGradient id="contextInnerGray" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#68727e" stopOpacity=".16" />
            <stop offset=".32" stopColor="#b75b65" stopOpacity=".13" />
            <stop offset=".67" stopColor="#46515e" stopOpacity=".22" />
            <stop offset="1" stopColor="#8d97a2" stopOpacity=".14" />
          </linearGradient>
          <linearGradient id="contextTriangleGray" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#77818c" stopOpacity=".2" />
            <stop offset=".38" stopColor="#963641" stopOpacity=".2" />
            <stop offset=".7" stopColor="#414c58" stopOpacity=".24" />
            <stop offset="1" stopColor="#7e8994" stopOpacity=".14" />
          </linearGradient>
          <linearGradient id="contextSpokeGray" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9aa4af" stopOpacity=".09" />
            <stop offset=".5" stopColor="#65717d" stopOpacity=".16" />
            <stop offset="1" stopColor="#b04450" stopOpacity=".12" />
          </linearGradient>
          <linearGradient id="contextConnector" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#68737f" stopOpacity=".18" />
            <stop offset=".52" stopColor="#a42e3d" stopOpacity=".32" />
            <stop offset="1" stopColor="#e13a47" stopOpacity=".44" />
          </linearGradient>
        </defs>
        <circle className={`${styles.orbitLine} ${styles.orbitOuter}`} cx="500" cy="270" r="218" />
        <circle className={`${styles.orbitLine} ${styles.orbitMiddle}`} cx="500" cy="270" r="174" />
        <circle className={`${styles.orbitLine} ${styles.orbitInner}`} cx="500" cy="270" r="130" />
        <path className={styles.triangleLine} d="M500 96 L324 392 L676 392 Z" />
        <path className={styles.spokeLine} d="M500 96 L500 270 M324 392 L500 270 M676 392 L500 270" />
        <path className={styles.cardLine} d="M500 96 H650 M324 392 H170 M676 392 H830" />
        <g className={`${styles.orbitParticle} ${styles.particleOne}`}><circle cx="500" cy="52" r="4" /></g>
        <g className={`${styles.orbitParticle} ${styles.particleTwo}`}><circle cx="500" cy="96" r="3.5" /></g>
        <g className={`${styles.orbitParticle} ${styles.particleThree}`}><circle cx="500" cy="140" r="3" /></g>
        <g className={`${styles.orbitParticle} ${styles.particleFour}`}><circle cx="500" cy="52" r="2.5" /></g>
      </svg>

      <button
        ref={coreRef}
        type="button"
        className={styles.core}
        aria-label="Interact with the solution terrain"
        data-testid="context-core"
      >
        <span className={`${styles.coreRing} ${styles.ringOne}`} aria-hidden="true" />
        <span className={`${styles.coreRing} ${styles.ringTwo}`} aria-hidden="true" />
        <span className={styles.coreWave} aria-hidden="true" />
        <span className={styles.coreFallback} data-testid="context-core-fallback" aria-hidden="true">
          <svg viewBox="0 0 150 150" focusable="false">
            {Array.from({ length: 9 }, (_, index) => <path key={index} d={`M${12 + index * 2} ${63 + index * 7} C 34 ${42 + index * 6}, 52 ${82 + index * 3}, 73 ${57 + index * 5} S 111 ${72 + index * 4}, ${140 - index * 2} ${51 + index * 7}`} />)}
          </svg>
        </span>
        <canvas ref={canvasRef} className={styles.canvas} data-testid="context-terrain-canvas" aria-hidden="true" />
      </button>

      {items.map((item, index) => <span
        key={item.title}
        className={`${styles.node} ${styles[`node${index + 1}`]}`}
        data-context-node={index + 1}
        aria-hidden="true"
      >
        <span><Image src={item.icon} alt="" width={42} height={42} /></span>
      </span>)}
    </div>

    <div className={styles.panels}>
      {items.map((item, index) => <article
        key={item.title}
        className={`${styles.panel} ${styles[`panel${index + 1}`]}`}
        data-context-card={index + 1}
      >
        <span className={styles.panelIcon} aria-hidden="true"><Image src={item.icon} alt="" width={28} height={28} /></span>
        <h3>{item.title}</h3>
        <p className={styles.kicker}>{item.kicker}</p>
        <span className={styles.panelRule} aria-hidden="true" />
        <p className={styles.body}>{item.body}</p>
      </article>)}
    </div>
  </div>;
}
