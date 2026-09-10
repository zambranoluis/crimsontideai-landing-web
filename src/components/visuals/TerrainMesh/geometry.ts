import { footerTerrainPreset as p } from "./preset";

export type TerrainPointer = { inside: boolean; x: number; y: number; sx: number; sy: number };
const still: TerrainPointer = { inside: false, x: .72, y: .63, sx: 0, sy: 0 };
export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export class TerrainGeometry {
  readonly points: Float32Array;
  readonly heights: Float32Array;
  readonly ribbons: Float32Array;
  readonly shimmers: Float32Array;
  readonly pulses: Float32Array;
  private readonly terms: Float64Array;
  private readonly phases = new Float64Array(12);

  constructor(readonly columns: number, readonly rows: number) {
    const count = columns * rows;
    this.points = new Float32Array(count * 2);
    this.heights = new Float32Array(count);
    this.ribbons = new Float32Array(count);
    this.shimmers = new Float32Array(count);
    this.pulses = new Float32Array(rows);
    // x01,z, projected x/y factors, lift, parallax x/y, ridges, then six trig pairs.
    this.terms = new Float64Array(count * 20);
    for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) {
      const i = (r * columns + c) * 20, x01 = c / (columns - 1), z = r / (rows - 1), nx = x01 * 2 - 1;
      const depth = z ** 1.38, convergence = p.topSpread + (1 - p.topSpread) * depth;
      const cx = .5 + p.offsetX, cy = p.horizon + p.offsetY;
      const nearSpread = (.34 + (.17 + .83 * p.perspective) * .88) * p.scale * p.meshWidth;
      this.terms[i] = x01; this.terms[i + 1] = z;
      this.terms[i + 2] = cx + p.perspectiveDirection + (nx * nearSpread * .56 - p.perspectiveDirection) * convergence;
      this.terms[i + 3] = cy + 1.04 * p.scale * p.meshLength * depth + nx * p.tilt * (.3 + z) * depth;
      this.terms[i + 4] = (10 + z * 44) * p.verticalScale * (p.upperRelief + (1 - p.upperRelief) * depth);
      this.terms[i + 5] = (7 + z * 18) * p.parallax * depth;
      this.terms[i + 6] = (4 + z * 10) * p.parallax * depth;
      this.terms[i + 7] = Math.exp(-((x01 - p.ridge1X) ** 2 / (.032 * p.ridge1Width ** 2) + (z - p.ridge1Y) ** 2 / (.07 * p.ridge1Depth ** 2))) * p.ridge1Height
        + Math.exp(-((x01 - p.ridge2X) ** 2 / (.026 * p.ridge2Width ** 2) + (z - p.ridge2Y) ** 2 / (.085 * p.ridge2Depth ** 2))) * p.ridge2Height;
      const angles = [nx * p.waveFreqX, z * p.waveFreqY, (nx + z * .65) * (13.5 + p.detail * 1.2), nx * (19 + p.detail * 3) - z * 8.5, nx * 31 + z * 17, c * .72 + r * .55];
      for (let j = 0; j < 6; j++) { this.terms[i + 8 + j * 2] = Math.sin(angles[j]); this.terms[i + 9 + j * 2] = Math.cos(angles[j]); }
    }
  }

  project(width: number, height: number, elapsed: number, pointer = still) {
    const t = elapsed * .001 * p.speed, wt = t * p.waveDrift;
    // Addition identities keep invariant trigonometry out of the point loop.
    for (let j = 0; j < 6; j++) {
      const angle = j === 0 ? wt * .9 : j === 1 ? -wt * .68 : j === 2 ? wt * .56 : j === 3 ? wt * .23 : j === 4 ? -wt * .18 : t * p.shimmerSpeed;
      this.phases[j * 2] = Math.sin(angle); this.phases[j * 2 + 1] = Math.cos(angle);
    }
    const a = this.terms, s = this.phases, mouseZ = clamp((pointer.y - .24) / .76);
    for (let r = 0; r < this.rows; r++) {
      const z = r / (this.rows - 1), d = t * .42;
      const b1 = .52 + Math.sin(d + z * 5) * .022, b2 = .70 + Math.cos(d * .84 + z * 6) * .018, b3 = .86 + Math.sin(d * 1.12 + z * 4.2) * .016;
      let distance = Math.abs(z - (t * p.pulseSpeed * .16) % 1);
      distance = Math.min(distance, 1 - distance);
      this.pulses[r] = Math.exp(-distance * distance / (p.pulseWidth ** 2)) * p.pulseIntensity;
      for (let c = 0; c < this.columns; c++) {
        const index = r * this.columns + c, i = index * 20, x = a[i];
        const broad = (a[i + 8] * s[1] + a[i + 9] * s[0]) * .44 + (a[i + 11] * s[3] - a[i + 10] * s[2]) * .28;
        const detail = ((a[i + 12] * s[5] + a[i + 13] * s[4]) * .16 + (a[i + 15] * s[7] - a[i + 14] * s[6]) * .1 + (a[i + 16] * s[9] + a[i + 17] * s[8]) * .045) * p.detail;
        const lift = pointer.inside ? Math.exp(-((x - pointer.x) ** 2 + (z - mouseZ) ** 2) / (p.mouseRadius ** 2)) * p.mouseForce * (.54 + Math.sin(t * 1.8 + x * 7) * .08) : 0;
        const terrain = (broad + detail + a[i + 7] + lift) * p.waveHeight;
        this.heights[index] = terrain;
        this.points[index * 2] = width * a[i + 2] + pointer.sx * a[i + 5];
        this.points[index * 2 + 1] = height * a[i + 3] - terrain * a[i + 4] + pointer.sy * a[i + 6];
        this.ribbons[index] = Math.max(Math.exp(-((x - b1) ** 2) / .01) * .72, Math.exp(-((x - b2) ** 2) / .011), Math.exp(-((x - b3) ** 2) / .009) * .9);
        this.shimmers[index] = .5 + .5 * (a[i + 18] * s[11] + a[i + 19] * s[10]);
      }
    }
    return this.points;
  }
}

export function terrainFallback(width: number) {
  const geometry = new TerrainGeometry(72, 32), points = geometry.project(width, 300, 0);
  const rows: string[] = [], dots: string[] = [];
  for (let r = 0; r < geometry.rows; r++) {
    let line = "", cores = "";
    for (let c = 0; c < geometry.columns; c++) {
      const i = r * geometry.columns + c, x = points[i * 2], y = points[i * 2 + 1];
      line += `${c ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
      const radius = Math.max(1, Math.round(p.pointSize * (.46 + r / 31 * 1.12 + geometry.ribbons[i] * .36 + geometry.pulses[r] * .18) * 2)) / 2;
      cores += `M${(x - radius).toFixed(2)} ${y.toFixed(2)}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0`;
    }
    if (r % 2 === 0) rows.push(line);
    dots.push(cores);
  }
  return { rows, dots };
}
