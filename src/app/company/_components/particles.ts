import { particlePaths } from "./particlePaths";

export type Point = { x: number; y: number; z: number };
export const appearance = { density: 1800, flow: 2, flowSpeed: 1.35, drift: .5, depth: 1, size: 1.9 } as const;
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function hash(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
}
function mortonCode(p: Point) {
  const x = Math.floor(clamp((p.x + 1) / 2) * 255);
  const y = Math.floor(clamp((p.y + 1) / 2) * 255);
  let code = 0;
  for (let i = 0; i < 8; i++) {
    code |= ((x >> i) & 1) << (2 * i);
    code |= ((y >> i) & 1) << (2 * i + 1);
  }
  return code;
}

/** Sample the original filled silhouettes; correspondence never changes with direction. */
export function createParticleTargets(count: number): Point[][] | null {
  const mask = document.createElement("canvas");
  mask.width = mask.height = 500;
  const context = mask.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  return Object.values(particlePaths).map((paths, shape) => {
    context.clearRect(0, 0, 500, 500);
    context.fillStyle = "#fff";
    paths.forEach(path => context.fill(new Path2D(path), "nonzero"));
    const data = context.getImageData(0, 0, 500, 500).data;
    const candidates: [number, number][] = [];
    for (let y = 1; y < 499; y += 2) for (let x = 1; x < 499; x += 2) {
      if (data[(y * 500 + x) * 4 + 3] > 32) candidates.push([x, y]);
    }
    const salt = [11, 23, 37][shape];
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(hash(i * 2.71 + salt * 17.3) * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    return Array.from({ length: count }, (_, i) => {
      const [x, y] = candidates[i % candidates.length];
      return {
        x: (x + (hash(i * 5.21 + salt) - .5) * 1.4 - 250) / 250 * .94,
        y: (y + (hash(i * 7.83 + salt * 2) - .5) * 1.4 - 250) / 250 * .94,
        z: (hash(i * 13.17 + salt * 5.3) - .5) * 2,
      };
    }).sort((a, b) => mortonCode(a) - mortonCode(b));
  });
}

/** Brain 0–12%, gear 42–58%, bulb 88–100%; no spring lag on jumps. */
export function morphState(progress: number) {
  const segment = progress < .5 ? 0 : 1;
  const local = clamp((progress - (segment === 0 ? .12 : .58)) / .30);
  return { segment, blend: local * local * (3 - 2 * local) };
}

export function drawParticles(ctx: CanvasRenderingContext2D, targets: Point[][], width: number, height: number, progress: number, time: number) {
  const { segment, blend } = morphState(progress);
  const from = targets[segment], to = targets[segment + 1];
  const scale = Math.min(width, height) * .5;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < from.length; i++) {
    const a = from[i], b = to[i];
    const phase = hash(i * 19.3) * 730;
    const speed = (.55 + hash(i * 3.1) * .65) * appearance.flowSpeed;
    const flowRadius = .5 + hash(i * 5.7) * .55;
    const energy = Math.sin(Math.PI * blend);
    const flowAmp = appearance.flow * .0155 * flowRadius * (1 + .22 * energy);
    const flowX = (Math.sin(time * .82 * speed + phase) + .42 * Math.sin(time * 1.48 * speed + phase * 1.74)) * flowAmp;
    const flowY = (Math.cos(time * .7 * speed + phase * 1.24) + .39 * Math.sin(time * 1.26 * speed + phase * 2.14)) * flowAmp;
    const flowZ = Math.sin(time * .58 * speed + phase * .59) * flowAmp * 2.2;
    const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy) || 1;
    const swirl = energy * appearance.flow * .022 * (.7 + flowRadius * .35) * Math.sin(phase + blend * Math.PI * 2.05);
    const drift = appearance.drift * .003;
    const x = lerp(a.x, b.x, blend) + flowX - dy / length * swirl + Math.sin(time * .32 + phase * 1.82) * drift;
    const y = lerp(a.y, b.y, blend) + flowY + dx / length * swirl + Math.cos(time * .27 + phase * 1.44) * drift;
    const depth = clamp(((lerp(a.z, b.z, blend) + flowZ) * appearance.depth + 1) / 2);
    const alpha = (.18 + depth * .70) * (.92 + Math.sin(time * 1.15 + phase * 2.2) * .08);
    const radius = appearance.size * (.7 + hash(i * 7.9) * .75) * (.57 + depth * .74) * Math.min(1, width / 500);
    // Dual-color JSON baseline: #ff0a0a at the back, #470000 at the front.
    ctx.fillStyle = `rgba(${Math.round(lerp(255, 71, depth))},${Math.round(10 * (1 - depth))},${Math.round(10 * (1 - depth))},${alpha})`;
    ctx.beginPath();
    ctx.arc(width * .5 + x * scale, height * .49 + y * scale, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
