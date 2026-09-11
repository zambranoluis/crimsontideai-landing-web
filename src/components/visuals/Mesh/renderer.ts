import { companyMountainGrids, companyMountainInk, MeshGeometry, type MeshVariant } from "./presets";
import { backingSize, qualityTiers } from "./quality";
import { MeshInteraction } from "./interaction";

const BANDS = 10;
const GLOW_DOWNSAMPLE = 4;
const color = (alpha: number) => `rgba(255,0,51,${alpha})`;
type Clip = { left: number; top: number; right: number; bottom: number };

export function traceGrid(ctx: CanvasRenderingContext2D, points: Float32Array, start: number, stride: number, count: number, clip?: Clip) {
  let penUp = true;
  let point = 0;
  // Each cubic passes through all four sampled vertices (at t=0, 1/3, 2/3, 1).
  // Three connections share one canvas command; interaction vertices remain exact.
  for (; point + 3 < count; point += 3) {
    const a = start + point * stride, b = a + stride, c = b + stride, d = c + stride;
    const x1 = (-5 * points[a] + 18 * points[b] - 9 * points[c] + 2 * points[d]) / 6;
    const y1 = (-5 * points[a + 1] + 18 * points[b + 1] - 9 * points[c + 1] + 2 * points[d + 1]) / 6;
    const x2 = (2 * points[a] - 9 * points[b] + 18 * points[c] - 5 * points[d]) / 6;
    const y2 = (2 * points[a + 1] - 9 * points[b + 1] + 18 * points[c + 1] - 5 * points[d + 1]) / 6;
    // A Bézier stays inside its control hull; reject only wholly invisible spans.
    if (clip && (Math.max(points[a], x1, x2, points[d]) < clip.left || Math.min(points[a], x1, x2, points[d]) > clip.right ||
      Math.max(points[a + 1], y1, y2, points[d + 1]) < clip.top || Math.min(points[a + 1], y1, y2, points[d + 1]) > clip.bottom)) { penUp = true; continue; }
    if (penUp) { ctx.moveTo(points[a], points[a + 1]); penUp = false; }
    ctx.bezierCurveTo(x1, y1, x2, y2, points[d], points[d + 1]);
  }
  for (point++; point < count; point++) {
    const i = start + point * stride;
    const previous = i - stride;
    if (clip && (Math.max(points[previous], points[i]) < clip.left || Math.min(points[previous], points[i]) > clip.right ||
      Math.max(points[previous + 1], points[i + 1]) < clip.top || Math.min(points[previous + 1], points[i + 1]) > clip.bottom)) { penUp = true; continue; }
    if (penUp) { ctx.moveTo(points[previous], points[previous + 1]); penUp = false; }
    ctx.lineTo(points[i], points[i + 1]);
  }
}

export class MeshRenderer {
  width = 0;
  height = 0;
  private geometry: MeshGeometry;
  private background = document.createElement("canvas");
  private glowSprite = document.createElement("canvas");
  private glowPixels?: ImageData;
  private glowPoints = new Float32Array(0);
  private glowDirty = true;
  private rowBands: number[][] = [];
  private dotBands: number[][] = [];
  private dotPaths: Path2D[] = [];
  private ratio = 1;
  private clip: Clip = { left: 0, top: 0, right: 0, bottom: 0 };
  private hasDrawn = false;

  constructor(private canvas: HTMLCanvasElement, private context: CanvasRenderingContext2D, private variant: MeshVariant, tier: number) {
    const quality = variant === "company-mountains" ? companyMountainGrids[tier] : qualityTiers[tier];
    this.geometry = new MeshGeometry(variant, quality.rows, quality.columns);
  }

  resize(width: number, height: number, tier: number) {
    this.width = width; this.height = height;
    const quality = this.variant === "company-mountains" ? companyMountainGrids[tier] : qualityTiers[tier];
    const size = backingSize(width, height, window.devicePixelRatio, tier);
    this.ratio = size.ratio;
    this.canvas.width = this.background.width = size.width;
    this.canvas.height = this.background.height = size.height;
    this.context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
    if (this.geometry.rows !== quality.rows) this.geometry = new MeshGeometry(this.variant, quality.rows, quality.columns);
    const { rows, columns } = this.geometry;
    this.rowBands = Array.from({ length: BANDS }, () => []);
    this.dotBands = Array.from({ length: BANDS }, () => []);
    for (let row = 0; row <= rows; row++) {
      const band = Math.min(BANDS - 1, Math.round(row / rows * (BANDS - 1)));
      this.rowBands[band].push(row);
      if (row % 2 === 0) for (let col = 0; col <= columns; col++) this.dotBands[band].push((row * (columns + 1) + col) * 2);
    }
    const background = this.background.getContext("2d");
    if (!background) throw new Error("Mesh background context unavailable");
    background.setTransform(size.ratio, 0, 0, size.ratio, 0, 0);
    const glowX = width * (this.variant === "openjm" ? .8 : .78), glowY = height * .65;
    const glow = background.createRadialGradient(glowX, glowY, 0, glowX, glowY, width * .48);
    glow.addColorStop(0, "rgba(51,0,9,.62)"); glow.addColorStop(1, "rgba(0,0,0,0)");
    background.fillStyle = glow;
    if (this.variant !== "company-mountains") background.fillRect(0, 0, width, height);
    // Soft halos need fewer backing pixels than sharp cores and lines.
    this.glowSprite.width = Math.max(1, Math.ceil(size.width / GLOW_DOWNSAMPLE));
    this.glowSprite.height = Math.max(1, Math.ceil(size.height / GLOW_DOWNSAMPLE));
    const sprite = this.glowSprite.getContext("2d");
    if (!sprite) throw new Error("Mesh glow context unavailable");
    this.glowPixels = sprite.createImageData(this.glowSprite.width, this.glowSprite.height);
    this.glowPoints = new Float32Array(this.geometry.points.length);
    this.glowDirty = true;
    this.hasDrawn = false;
    this.canvas.dataset.quality = qualityTiers[tier].name;
  }

  private prepareCores(points: Float32Array) {
    this.dotPaths = this.dotBands.map((indices, band) => {
      const depth = band / (BANDS - 1), radius = .65 + depth * .45;
      const path = new Path2D();
      for (const i of indices) {
        if (!this.inClip(points[i], points[i + 1])) continue;
        path.moveTo(points[i] + radius, points[i + 1]); path.arc(points[i], points[i + 1], radius, 0, Math.PI * 2);
      }
      return path;
    });
  }

  private inClip(x: number, y: number) {
    return x >= this.clip.left && x <= this.clip.right && y >= this.clip.top && y <= this.clip.bottom;
  }

  private cores(ctx: CanvasRenderingContext2D) {
    for (let band = 0; band < BANDS; band++) {
      ctx.fillStyle = color(this.variant === "company-mountains"
        ? companyMountainInk.dot + band / (BANDS - 1) * companyMountainInk.dotDepth
        : .22 + band / (BANDS - 1) * .5); ctx.fill(this.dotPaths[band]);
    }
  }

  private updateGlow(points: Float32Array) {
    // Cache a field of halos as one sprite, avoiding thousands of image submissions.
    // Invalidate before any halo drifts half a CSS pixel from its current dot core.
    if (!this.glowDirty) outer: for (const indices of this.dotBands) for (const i of indices) {
      if (Math.abs(points[i] - this.glowPoints[i]) > .5 || Math.abs(points[i + 1] - this.glowPoints[i + 1]) > .5) {
        this.glowDirty = true; break outer;
      }
    }
    if (!this.glowDirty) return;
    const sprite = this.glowSprite.getContext("2d");
    const pixels = this.glowPixels;
    if (!sprite || !pixels) throw new Error("Mesh glow context unavailable");
    const ratio = this.ratio / GLOW_DOWNSAMPLE;
    const { data, width: pixelWidth, height: pixelHeight } = pixels;
    data.fill(0);
    const splat = (x: number, y: number, alpha: number) => {
      if (x < 0 || y < 0 || x >= pixelWidth || y >= pixelHeight) return;
      const i = (y * pixelWidth + x) * 4;
      data[i] = 255; data[i + 2] = 51;
      data[i + 3] += alpha * (1 - data[i + 3] / 255);
    };
    // Rasterize the low-resolution halo sprite directly into a reused pixel buffer.
    // Bilinear splats conserve each dot's light energy and avoid synchronous canvas
    // path rasterization/readbacks when the sprite is copied to the main canvas.
    for (let band = 0; band < BANDS; band++) {
      const depth = band / (BANDS - 1), radius = .65 + depth * .45;
      const energy = (.22 + depth * .5) * Math.PI * radius * radius * ratio * ratio * 255;
      for (const i of this.dotBands[band]) {
        if (!this.inClip(points[i], points[i + 1])) continue;
        const x = points[i] * ratio - .5, y = points[i + 1] * ratio - .5;
        const left = Math.floor(x), top = Math.floor(y), u = x - left, v = y - top;
        splat(left, top, energy * (1 - u) * (1 - v));
        splat(left + 1, top, energy * u * (1 - v));
        splat(left, top + 1, energy * (1 - u) * v);
        splat(left + 1, top + 1, energy * u * v);
      }
    }
    sprite.putImageData(pixels, 0, 0);
    this.glowPoints.set(points);
    this.glowDirty = false;
  }

  draw(elapsed: number, delta: number, interaction: MeshInteraction, bounds: () => DOMRectReadOnly, view: DOMRectReadOnly) {
    const { width, height, context: ctx, geometry } = this;
    if (!width || !height) return;
    // Keep a margin for halos and scroll updates; coordinates remain in CSS pixels.
    const scaleX = width / view.width, scaleY = height / view.height;
    const left = this.hasDrawn ? Math.max(-8, -view.left * scaleX - 64) : -8;
    const top = this.hasDrawn ? Math.max(-8, -view.top * scaleY - 64) : -8;
    const right = this.hasDrawn ? Math.min(width + 8, (innerWidth - view.left) * scaleX + 64) : width + 8;
    const bottom = this.hasDrawn ? Math.min(height + 8, (innerHeight - view.top) * scaleY + 64) : height + 8;
    if (left !== this.clip.left || top !== this.clip.top || right !== this.clip.right || bottom !== this.clip.bottom) this.glowDirty = true;
    this.clip = { left, top, right, bottom };
    // Prime the complete canvas once. Later frames retain unseen pixels so a fast
    // scroll reveals a still mesh until the next scheduled update, never a blank edge.
    ctx.save();
    ctx.beginPath(); ctx.rect(left, top, Math.max(0, right - left), Math.max(0, bottom - top)); ctx.clip();
    ctx.clearRect(0, 0, width, height);
    try {
      const points = geometry.project(width, height, elapsed);
      interaction.apply(points, width, height, elapsed, delta, bounds);
      this.prepareCores(points);
      if (this.variant !== "company-mountains") this.updateGlow(points);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(this.background, 0, 0);
      ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
      const mountain = this.variant === "company-mountains";
      ctx.lineWidth = mountain ? companyMountainInk.lineWidth : .65;
      const { rows, columns } = geometry;
      for (let band = 0; band < BANDS; band++) {
        ctx.beginPath();
        for (const row of this.rowBands[band]) traceGrid(ctx, points, row * (columns + 1) * 2, 2, columns + 1, this.clip);
        ctx.strokeStyle = color(mountain ? companyMountainInk.row + band / (BANDS - 1) * companyMountainInk.rowDepth : .07 + band / (BANDS - 1) * .17); ctx.stroke();
      }
      ctx.beginPath();
      for (let col = 0; col <= columns; col++) traceGrid(ctx, points, col * 2, (columns + 1) * 2, rows + 1, this.clip);
      ctx.strokeStyle = color(mountain ? companyMountainInk.column : .09); ctx.stroke();
      if (!mountain) ctx.drawImage(this.glowSprite, 0, 0, this.glowSprite.width * GLOW_DOWNSAMPLE / this.ratio, this.glowSprite.height * GLOW_DOWNSAMPLE / this.ratio);
      this.cores(ctx);
      this.hasDrawn = true;
      this.canvas.dataset.ready = "true";
    } finally { ctx.restore(); }
  }
}
