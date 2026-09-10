"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import { terrainFallback } from "./geometry";
import { footerTerrainPreset as p } from "./preset";
import { mountTerrainMesh } from "./runtime";
import styles from "./TerrainMesh.module.css";

// Two aspect ratios retain fixed pixel terrain relief on narrow screens.
const fallbacks = [terrainFallback(1584), terrainFallback(429)];
export function TerrainMesh({ className = "", style, testId = "terrain-mesh", interactionHostSelector }: {
  className?: string;
  style?: CSSProperties;
  testId?: string;
  interactionHostSelector: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null), id = useId();
  useEffect(() => {
    if (canvas.current) return mountTerrainMesh(canvas.current, interactionHostSelector);
  }, [interactionHostSelector]);
  return <div className={`${styles.mesh} ${className}`} style={style} aria-hidden="true">
    {fallbacks.map((paths, index) => {
      const width = index ? 429 : 1584, glowId = `${id}-${index}`;
      return <svg key={index} className={`${styles.fallback} ${index ? styles.narrow : styles.wide}`} viewBox={`0 0 ${width} 300`} preserveAspectRatio="none" data-terrain-fallback={index ? "narrow" : "wide"} opacity={p.opacity}>
        <defs><radialGradient id={glowId}><stop stopColor={p.highlightColor} stopOpacity={.105 * p.ambientGlow} /><stop offset="1" stopColor={p.primaryColor} stopOpacity="0" /></radialGradient></defs>
        {paths.rows.map((d, row) => <path key={row} d={d} strokeOpacity={p.lineOpacity * (.35 + row / 15 * .85)} />)}
        {paths.dots.map((d, row) => <path key={`dot-${row}`} d={d} fill={p.primaryColor} fillOpacity={.2 + row / 31 * .7} stroke="none" />)}
        <ellipse cx={width * (.73 + p.offsetX * .25)} cy={300 * (.78 + p.offsetY * .2)} rx={width * .28} ry={width * .28} fill={`url(#${glowId})`} stroke="none" />
      </svg>;
    })}
    <canvas ref={canvas} data-testid={testId} />
  </div>;
}
