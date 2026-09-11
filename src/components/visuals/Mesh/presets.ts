export type MeshVariant = "home" | "company-mountains" | "openjm" | "sentinel";

// Shape only: these are the original hero and product wave equations.
export const presets = {
  home: { frequency: 8.5, depthPhase: 3.5, speed: .00016 },
  openjm: { frequency: 7.2, depthPhase: 3, speed: .000123 },
  sentinel: { frequency: 11.1, depthPhase: 3, speed: .000165 },
  "company-mountains": { frequency: 9, depthPhase: 4, speed: .00012 },
} as const;

// Fixed, asymmetric summits: depth reveals successive shoulders rather than
// translating the silhouette. All quality tiers and the SSR fallback sample this.
export function companyMountainHeight(u: number, depth: number) {
  const peak = (center: number, left: number, right: number) =>
    Math.exp(-(((u - center) / (u < center ? left : right)) ** 2));
  const ridge = .48 * peak(.12, .19, .20) + .29 * peak(.43, .12, .17) + .12 * peak(.68, .10, .17);
  // Depth opens the foreground connections while retaining the left-to-right descent.
  const shoulder = .025 * Math.sin(u * 15 + depth * 3) * Math.sin(Math.PI * depth);
  return .72 + depth * .25 - ridge * (1 - depth * .68) + shoulder;
}

export const companyMountainGrids = [
  { rows: 18, columns: 60 },
  { rows: 14, columns: 46 },
  { rows: 10, columns: 34 },
] as const;

// Shared by canvas and SVG so a failed or disabled canvas keeps the same light.
export const companyMountainInk = {
  row: .48, rowDepth: .16, column: .34, dot: .78, dotDepth: .18, lineWidth: .9,
} as const;

export class MeshGeometry {
  readonly points: Float32Array;
  private readonly base: Float32Array;
  private readonly waves: Float32Array;

  constructor(readonly variant: MeshVariant, readonly rows: number, readonly columns: number) {
    const count = (rows + 1) * (columns + 1);
    this.points = new Float32Array(count * 2);
    this.base = new Float32Array(count * 2);
    this.waves = new Float32Array(count * 5);
    const preset = presets[variant];
    for (let row = 0; row <= rows; row++) for (let col = 0; col <= columns; col++) {
      const u = col / columns, depth = row / rows;
      const i = row * (columns + 1) + col;
      if (variant === "company-mountains") {
        this.base[i * 2] = u * 1.06 - .06;
        this.base[i * 2 + 1] = companyMountainHeight(u, depth);
        this.waves[i * 5] = u;
        this.waves[i * 5 + 1] = Math.sin(Math.PI * depth) * Math.sin(Math.PI * u);
        continue;
      }
      this.base[i * 2] = variant === "home" ? u * 1.22 - .11 : variant === "openjm" ? .53 + depth * .46 - u * .12 : u * 1.14 - .07;
      this.base[i * 2 + 1] = variant === "home" ? .44 + depth * .55 - u * .13 : variant === "openjm" ? u * 1.2 - .1 : .45 + depth * .35 - u * .1;
      const angle = u * preset.frequency + depth * preset.depthPhase;
      this.waves[i * 5] = Math.sin(angle);
      this.waves[i * 5 + 1] = Math.cos(angle);
      this.waves[i * 5 + 2] = variant === "home" ? .06 + depth * .065 : (variant === "openjm" ? .26 : .19) * (.4 + depth * .6);
      this.waves[i * 5 + 3] = Math.cos(u * 5);
      this.waves[i * 5 + 4] = Math.sin(u * 5);
    }
  }

  project(width: number, height: number, elapsed: number) {
    if (this.variant === "company-mountains") {
      // One soft swell traverses the shoulders every twelve seconds. A stationary
      // skyline and tapered edges preserve the mountain orientation and city gap.
      // Pixel displacement is independent of canvas height and quality tier.
      const cycle = (elapsed % 12000) / 12000;
      const center = -.2 + cycle * 1.4;
      const amplitude = (width < 600 ? 5 : 8) * Math.sin(Math.PI * cycle) ** 2;
      for (let i = 0, j = 0; i < this.points.length; i += 2, j += 5) {
        const swell = Math.exp(-(((this.waves[j] - center) / .22) ** 2));
        this.points[i] = width * this.base[i];
        this.points[i + 1] = height * this.base[i + 1] - amplitude * swell * this.waves[j + 1];
      }
      return this.points;
    }
    const phase = elapsed * presets[this.variant].speed;
    const sin = Math.sin(phase), cos = Math.cos(phase);
    const extraSin = Math.sin(elapsed * .0001), extraCos = Math.cos(elapsed * .0001);
    for (let i = 0, j = 0; i < this.points.length; i += 2, j += 5) {
      const wave = (this.waves[j] * cos + this.waves[j + 1] * sin) * this.waves[j + 2];
      this.points[i] = width * (this.base[i] + (this.variant === "openjm" ? wave : 0));
      this.points[i + 1] = height * (this.base[i + 1] + (this.variant === "openjm" ? 0 : wave) +
        (this.variant === "home" ? (this.waves[j + 3] * extraCos + this.waves[j + 4] * extraSin) * .07 : 0));
    }
    return this.points;
  }
}

// Used during SSR as well as hydration; no browser API or unrelated Bézier approximation.
export function fallbackPaths(variant: MeshVariant) {
  const { rows, columns } = variant === "company-mountains" ? companyMountainGrids[1] : { rows: 20, columns: 52 };
  const geometry = new MeshGeometry(variant, rows, columns);
  const points = geometry.project(1440, 800, 0);
  const at = (row: number, col: number) => {
    const i = (row * (columns + 1) + col) * 2;
    return `${points[i].toFixed(2)} ${points[i + 1].toFixed(2)}`;
  };
  return {
    rows: Array.from({ length: rows + 1 }, (_, row) => Array.from({ length: columns + 1 }, (_, col) => `${col ? "L" : "M"}${at(row, col)}`).join("")),
    columns: Array.from({ length: columns + 1 }, (_, col) => Array.from({ length: rows + 1 }, (_, row) => `${row ? "L" : "M"}${at(row, col)}`).join("")).join(""),
    dots: Array.from({ length: rows / 2 + 1 }, (_, row) => Array.from({ length: columns + 1 }, (_, col) => {
      const i = (row * 2 * (columns + 1) + col) * 2;
      const radius = .65 + row / (rows / 2) * .45;
      return `M${(points[i] - radius).toFixed(2)} ${points[i + 1].toFixed(2)}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0`;
    }).join("")),
  };
}
