"use client";

import { useEffect, useId, useRef } from "react";
import { companyMountainInk, fallbackPaths, type MeshVariant } from "./presets";
import { mountMesh } from "./runtime";
import { meshColor, meshPalettes } from "./presentation";

const fallbacks = { home: fallbackPaths("home"), "company-mountains": fallbackPaths("company-mountains"), openjm: fallbackPaths("openjm"), sentinel: fallbackPaths("sentinel") };

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
  const mountain = variant === "company-mountains";
  const palette = meshPalettes[variant];
  const product = variant === "openjm" || variant === "sentinel";
  const ink = mountain ? companyMountainInk : { row: .07, rowDepth: .17, column: .09, dot: .22, dotDepth: .5, lineWidth: .65 };
  return <div className={className} aria-hidden="true">
    <svg className={fallbackClassName} viewBox="0 0 1440 800" preserveAspectRatio="none" data-mesh-fallback={variant} strokeWidth={ink.lineWidth} style={product ? { stroke: meshColor(palette.line) } : undefined}>
      <defs><radialGradient id={glowId}><stop stopColor={meshColor(palette.glow)} stopOpacity=".62" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
      {!mountain && <ellipse cx={palette.glowX * 1440} cy={palette.glowY * 800} rx="691.2" ry="691.2" fill={`url(#${glowId})`} stroke="none" />}
      {paths.rows.map((d, row) => <path key={row} d={d} strokeOpacity={ink.row + row / (paths.rows.length - 1) * ink.rowDepth} vectorEffect={mountain ? "non-scaling-stroke" : undefined} />)}
      <path d={paths.columns} strokeOpacity={ink.column} vectorEffect={mountain ? "non-scaling-stroke" : undefined} />
      {paths.dots.map((d, row) => <path key={`dots-${row}`} d={d} fill={meshColor(palette.dot)} fillOpacity={ink.dot + row / (paths.dots.length - 1) * ink.dotDepth} stroke={mountain ? meshColor(palette.dot) : "none"} strokeOpacity={mountain ? ink.dot : undefined} strokeWidth={mountain ? .6 : undefined} vectorEffect={mountain ? "non-scaling-stroke" : undefined} />)}
    </svg>
    <canvas ref={canvas} data-testid={testId} />
  </div>;
}
