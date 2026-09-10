export type MeshVariant = "home" | "openjm" | "sentinel";

// Shape only: these are the original hero and product wave equations.
export const presets = {
  home: { frequency: 8.5, depthPhase: 3.5, speed: .00016 },
  openjm: { frequency: 7.2, depthPhase: 3, speed: .000123 },
  sentinel: { frequency: 11.1, depthPhase: 3, speed: .000165 },
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
  const geometry = new MeshGeometry(variant, 20, 52);
  const points = geometry.project(1440, 800, 0);
  const at = (row: number, col: number) => {
    const i = (row * 53 + col) * 2;
    return `${points[i].toFixed(2)} ${points[i + 1].toFixed(2)}`;
  };
  return {
    rows: Array.from({ length: 21 }, (_, row) => Array.from({ length: 53 }, (_, col) => `${col ? "L" : "M"}${at(row, col)}`).join("")),
    columns: Array.from({ length: 53 }, (_, col) => Array.from({ length: 21 }, (_, row) => `${row ? "L" : "M"}${at(row, col)}`).join("")).join(""),
    dots: Array.from({ length: 11 }, (_, row) => Array.from({ length: 53 }, (_, col) => {
      const i = (row * 2 * 53 + col) * 2;
      const radius = .65 + row / 10 * .45;
      return `M${(points[i] - radius).toFixed(2)} ${points[i + 1].toFixed(2)}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0`;
    }).join("")),
  };
}
