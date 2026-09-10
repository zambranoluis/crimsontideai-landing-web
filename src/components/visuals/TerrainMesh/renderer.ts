import { backingSize } from "../Mesh/quality";
import { TerrainGeometry, clamp } from "./geometry";
import { TerrainInteraction } from "./interaction";
import { footerTerrainPreset as p, terrainTiers } from "./preset";

// Same color/alpha/radius bins as the export, with intrusive numeric lists.
class DotBuckets {
  readonly heads: Int32Array;
  readonly next: Int32Array;
  constructor(readonly styles: string[], readonly radii: number[], count: number) {
    this.heads = new Int32Array(styles.length); this.next = new Int32Array(count);
  }
  reset() { this.heads.fill(-1); }
  add(bucket: number, point: number) { this.next[point] = this.heads[bucket]; this.heads[bucket] = point; }
  paint(ctx: CanvasRenderingContext2D, points: Float32Array) {
    for (let b = 0; b < this.heads.length; b++) {
      if (this.heads[b] === -1) continue;
      ctx.beginPath();
      const radius = this.radii[b];
      for (let i = this.heads[b]; i !== -1; i = this.next[i]) {
        const x = points[i * 2], y = points[i * 2 + 1];
        ctx.moveTo(x + radius, y); ctx.arc(x, y, radius, 0, Math.PI * 2);
      }
      ctx.fillStyle = this.styles[b]; ctx.fill();
    }
  }
}
const coreStyles: string[] = [], coreRadii: number[] = [], glowStyles: string[] = [], glowRadii: number[] = [];
for (let m = 0; m < 8; m++) for (let a = 0; a < 10; a++) for (let r = 1; r <= 8; r++) {
  coreStyles.push(`rgba(${Math.round(239 + 16 * m / 7)},${Math.round(51 + 23 * m / 7)},${Math.round(64 + 22 * m / 7)},${a / 9})`); coreRadii.push(r / 2);
}
for (let a = 0; a < 8; a++) for (let r = 1; r <= 24; r++) {
  glowStyles.push(`rgba(255,74,86,${a / 7 * .045 * p.glow})`); glowRadii.push(r);
}
const lineStyles = Array.from({ length: 10 }, (_, band) => `rgba(239,51,64,${p.lineOpacity * (.35 + band / 9 * .85)})`);

export class TerrainRenderer {
  private geometry!: TerrainGeometry;
  private cores!: DotBuckets;
  private halos!: DotBuckets;
  private background = document.createElement("canvas");
  private width = 0;
  private height = 0;
  constructor(private canvas: HTMLCanvasElement, private context: CanvasRenderingContext2D) {}
  resize(width: number, height: number, tier: number) {
    this.width = width; this.height = height;
    const size = backingSize(width, height, devicePixelRatio, tier), sampling = terrainTiers[tier];
    this.canvas.width = this.background.width = size.width;
    this.canvas.height = this.background.height = size.height;
    this.context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
    this.geometry = new TerrainGeometry(sampling.columns, sampling.rows);
    this.cores = new DotBuckets(coreStyles, coreRadii, sampling.columns * sampling.rows);
    this.halos = new DotBuckets(glowStyles, glowRadii, sampling.columns * sampling.rows);
    const bg = this.background.getContext("2d");
    if (!bg) throw new Error("Terrain background canvas unavailable");
    bg.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
    const gx = width * (.73 + p.offsetX * .25), gy = height * (.78 + p.offsetY * .2);
    const gradient = bg.createRadialGradient(gx, gy, 0, gx, gy, width * .28);
    gradient.addColorStop(0, `rgba(255,74,86,${.105 * p.ambientGlow})`); gradient.addColorStop(1, "rgba(239,51,64,0)");
    bg.fillStyle = gradient; bg.fillRect(0, 0, width, height);
    this.canvas.dataset.quality = sampling.name;
  }
  draw(elapsed: number, delta: number, interaction: TerrainInteraction, bounds: () => DOMRectReadOnly) {
    const ctx = this.context, width = this.width, height = this.height, g = this.geometry;
    // Profile includes geometry, hover, ripple and bucket updates.
    ctx.clearRect(0, 0, width, height);
    interaction.update(delta, bounds);
    const points = g.project(width, height, elapsed, interaction.pointer);
    interaction.ripple.apply(points, width, height, elapsed, delta, bounds);
    ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = p.opacity; ctx.lineWidth = p.lineWidth;
    for (let band = 0; band < 10; band++) {
      ctx.beginPath();
      for (let r = 0; r < g.rows; r += 2) {
        if (Math.round(r / (g.rows - 1) * 9) !== band) continue;
        for (let c = 0; c < g.columns; c++) {
          const i = (r * g.columns + c) * 2;
          if (c) ctx.lineTo(points[i], points[i + 1]); else ctx.moveTo(points[i], points[i + 1]);
        }
      }
      ctx.strokeStyle = lineStyles[band]; ctx.stroke();
    }
    ctx.beginPath();
    for (let c = 0; c < g.columns; c += 3) for (let r = 0; r < g.rows; r++) {
      const i = (r * g.columns + c) * 2;
      if (r) ctx.lineTo(points[i], points[i + 1]); else ctx.moveTo(points[i], points[i + 1]);
    }
    ctx.strokeStyle = "rgba(239,51,64,.0476)"; ctx.stroke();
    this.cores.reset(); this.halos.reset();
    for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.columns; c++) {
      const i = r * g.columns + c, x = points[i * 2], y = points[i * 2 + 1];
      if (x < -20 || x > width + 20 || y < -20 || y > height + 20) continue;
      const depth = r / (g.rows - 1), rb = g.ribbons[i], pu = g.pulses[r];
      const shimmer = 1 + (g.shimmers[i] - .5) * p.shimmer * .7;
      const m = clamp(.14 + rb * .62 + pu * .24 + Math.max(0, g.heights[i]) * .05);
      const alpha = clamp((.13 + depth * .72 + rb * .22 + pu * .19) * shimmer);
      const radius = Math.max(.25, p.pointSize * (.46 + depth * 1.12 + rb * .36 + pu * .18));
      this.cores.add((Math.round(m * 7) * 10 + Math.round(alpha * 9)) * 8 + Math.max(1, Math.round(radius * 2)) - 1, i);
      if (rb > .34 || pu > .34) this.halos.add(Math.round(alpha * 7) * 24 + Math.max(1, Math.round(radius * (2.2 + p.glow * 1.3))) - 1, i);
    }
    // Halos refresh for brightness AND movement. Only ambient glow is cached.
    this.halos.paint(ctx, points); this.cores.paint(ctx, points);
    ctx.drawImage(this.background, 0, 0, width, height);
  }
}
