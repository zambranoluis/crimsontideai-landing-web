import type { MeshVariant } from "./presets";

type RGB = readonly [number, number, number];
type MeshPalette = { line: RGB; dot: RGB; halo: RGB; glow: RGB; glowX: number; glowY: number };

const crimson: MeshPalette = { line: [255, 0, 51], dot: [255, 0, 51], halo: [255, 0, 51], glow: [51, 0, 9], glowX: .78, glowY: .65 };

// One palette supplies canvas ink, cached halos, background light and SSR fallbacks.
export const meshPalettes: Record<MeshVariant, MeshPalette> = {
  home: crimson,
  "company-mountains": crimson,
  openjm: { line: [16, 116, 109], dot: [23, 145, 132], halo: [14, 115, 108], glow: [2, 30, 29], glowX: .8, glowY: .5 },
  sentinel: { line: [30, 99, 187], dot: [40, 119, 219], halo: [26, 92, 181], glow: [5, 17, 39], glowX: .24, glowY: .55 },
};

export const meshColor = (rgb: RGB, alpha = 1) => `rgba(${rgb.join(",")},${alpha})`;

const orientations = {
  openjm: { angle: 26 * Math.PI / 180, x: .74, y: .5, shiftX: .02 },
  sentinel: { angle: -15 * Math.PI / 180, x: .5, y: .6, shiftX: -.23 },
};

// Rotate the projected sheet in the shared 1440x800 artboard, then fit it to
// the canvas. Wave equations and timing stay untouched. SVG uses this same pass;
// interaction and culling receive the final on-screen points, never a CSS rotation.
export function presentMesh(points: Float32Array, variant: MeshVariant, width: number, height: number) {
  if (variant !== "openjm" && variant !== "sentinel") return points;
  const { angle, x, y, shiftX } = orientations[variant];
  const cos = Math.cos(angle), sin = Math.sin(angle);
  for (let i = 0; i < points.length; i += 2) {
    const dx = (points[i] / width - x) * 1440;
    const dy = (points[i + 1] / height - y) * 800;
    points[i] = ((dx * cos - dy * sin) / 1440 + x + shiftX) * width;
    points[i + 1] = ((dx * sin + dy * cos) / 800 + y) * height;
  }
  return points;
}
