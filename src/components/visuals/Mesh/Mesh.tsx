"use client";

import { useEffect, useId, useRef } from "react";
import { fallbackPaths, type MeshVariant } from "./presets";
import { mountMesh } from "./runtime";

const fallbacks = { home: fallbackPaths("home"), openjm: fallbackPaths("openjm"), sentinel: fallbackPaths("sentinel") };

export function Mesh({ variant, className, fallbackClassName, testId }: {
  variant: MeshVariant;
  className: string;
  fallbackClassName: string;
  testId: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const glowId = useId();
  useEffect(() => { if (canvas.current) return mountMesh(canvas.current, variant); }, [variant]);
  const paths = fallbacks[variant];
  return <div className={className} aria-hidden="true">
    <svg className={fallbackClassName} viewBox="0 0 1440 800" preserveAspectRatio="none" data-mesh-fallback={variant}>
      <defs><radialGradient id={glowId}><stop stopColor="#330009" stopOpacity=".62" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx={variant === "openjm" ? 1152 : 1123.2} cy="520" rx="691.2" ry="691.2" fill={`url(#${glowId})`} stroke="none" />
      {paths.rows.map((d, row) => <path key={row} d={d} strokeOpacity={.07 + row / 20 * .17} />)}
      <path d={paths.columns} strokeOpacity=".09" />
      {paths.dots.map((d, row) => <path key={`dots-${row}`} d={d} fill="#ff0033" fillOpacity={.22 + row / 10 * .5} stroke="none" />)}
    </svg>
    <canvas ref={canvas} data-testid={testId} />
  </div>;
}
