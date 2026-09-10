import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { TerrainGeometry, terrainFallback, type TerrainPointer } from "../../src/components/visuals/TerrainMesh/geometry";
import { TerrainInteraction } from "../../src/components/visuals/TerrainMesh/interaction";
import { footerTerrainPreset, terrainTiers } from "../../src/components/visuals/TerrainMesh/preset";
import { TerrainRenderer } from "../../src/components/visuals/TerrainMesh/renderer";

test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop-chromium", "Pure checks run once."));

test("all tiers match the untouched original projection, shimmer, ribbons and pulses", () => {
  const html = readFileSync("public/pages/home/animation/footer.html", "utf8");
  const equations = html.slice(html.indexOf("function terrain("), html.indexOf("function timeline("));
  const reference = new Function("p", "W", "H", "pointer", `const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t;${equations};return {project,ribbon,pulse}`);
  let projectionError = 0, valueError = 0;
  for (const { columns, rows } of terrainTiers) for (const [width, height] of [[1584, 300], [396, 300]]) {
    const geometry = new TerrainGeometry(columns, rows);
    for (const elapsed of [0, 1600, 17000]) for (const inside of [false, true]) {
      const pointer: TerrainPointer = { inside, x: .8, y: .9, sx: .4, sy: .6 };
      const original = reference({ ...footerTerrainPreset, interactive: true }, width, height, pointer);
      const points = geometry.project(width, height, elapsed, pointer), t = elapsed * .001 * footerTerrainPreset.speed;
      expect(points).toBe(geometry.points);
      for (let r = 0; r < rows; r += 3) for (let c = 0; c < columns; c += 5) {
        const i = r * columns + c, q = original.project(c, r, columns, rows, t);
        projectionError = Math.max(projectionError, Math.abs(points[i * 2] - q.x), Math.abs(points[i * 2 + 1] - q.y));
        valueError = Math.max(valueError, Math.abs(geometry.heights[i] - q.ter), Math.abs(geometry.ribbons[i] - original.ribbon(q.x01, q.z, t)), Math.abs(geometry.pulses[r] - original.pulse(q.z, t)), Math.abs(geometry.shimmers[i] - (.5 + .5 * Math.sin(c * .72 + r * .55 + t * footerTerrainPreset.shimmerSpeed))));
      }
    }
  }
  expect(projectionError).toBeLessThan(.0002); expect(valueError).toBeLessThan(.000005);
  for (const width of [1584, 429]) {
    const points = new TerrainGeometry(72, 32).project(width, 300, 0);
    expect(terrainFallback(width).rows[0]).toContain(`M${points[0].toFixed(2)} ${points[1].toFixed(2)}`);
  }
});

test("whole-field smoothing is independent of frame rate and recovers after cancellation", () => {
  const bounds = () => ({ left: 0, top: 0, width: 1000, height: 300 }), viewport = { width: 1000, height: 300 };
  const results = [];
  for (const hz of [24, 30, 60, 120]) {
    const interaction = new TerrainInteraction(); interaction.move(800, 240);
    for (let i = 0; i < hz; i++) interaction.update(1000 / hz, bounds, viewport);
    results.push(interaction.pointer.sx);
    expect(interaction.pointer.sx).toBeCloseTo(.6 * (1 - .955 ** 60), 10);
    interaction.leave();
    for (let i = 0; i < hz * 3; i++) interaction.update(1000 / hz, bounds, viewport);
    expect(interaction.pointer.inside).toBe(false); expect(Math.abs(interaction.pointer.sx)).toBeLessThan(.001);
  }
  for (const value of results) expect(value).toBeCloseTo(results[0], 10);
});

test("only visible artwork input creates ripples; four waves expire at 1200ms", () => {
  const interaction = new TerrainInteraction(), bounds = () => ({ left: -50, top: 100, width: 1100, height: 300 });
  const viewport = { width: 1000, height: 350 }, points = new Float32Array([500, 200]);
  for (const [x, y] of [[-10, 200], [1010, 200], [100, 90], [100, 360]]) {
    interaction.move(x, y); interaction.tap(x, y); interaction.update(33, bounds, viewport);
    interaction.ripple.apply(points, 1100, 300, 0, 33, bounds);
    expect(interaction.pointer.inside).toBe(false); expect(interaction.ripple.ripples).toHaveLength(0);
  }
  for (let i = 0; i < 10; i++) interaction.tap(400 + i, 240);
  interaction.update(33, bounds, viewport); interaction.ripple.apply(points, 1100, 300, 0, 33, bounds);
  expect(interaction.ripple.ripples).toHaveLength(4);
  expect(interaction.ripple.pointer.strength).toBe(0);
  interaction.ripple.apply(points, 1100, 300, 1200, 33, bounds);
  expect(interaction.ripple.ripples).toHaveLength(0);
  interaction.clear(); expect(interaction.pointer.sx).toBe(0);
});

test("stationary halo cores refresh brightness instead of reusing stale glow", () => {
  const styles: string[] = [];
  const ctx = {
    fillStyle: "", clearRect() {}, setTransform() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, stroke() {}, fillRect() {}, drawImage() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    fill() { styles.push(this.fillStyle); },
  };
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document"), oldDpr = Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio");
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: () => ({ getContext: () => ctx }) } });
  Object.defineProperty(globalThis, "devicePixelRatio", { configurable: true, value: 1 });
  try {
    const canvas = { dataset: {} } as HTMLCanvasElement;
    const renderer = new TerrainRenderer(canvas, ctx as unknown as CanvasRenderingContext2D);
    renderer.resize(1000, 300, 0);
    // Fix movement while exercising the production renderer's actual halo buckets.
    const geometry = (renderer as unknown as { geometry: TerrainGeometry }).geometry;
    const points = new Float32Array(geometry.points.length).fill(-100);
    points[0] = 500; points[1] = 200;
    geometry.project = () => points;
    geometry.ribbons[0] = 1;
    const interaction = new TerrainInteraction(); interaction.update = () => {};
    const bounds = () => ({ left: 0, top: 0, width: 1000, height: 300 } as DOMRectReadOnly);
    geometry.shimmers[0] = 0; renderer.draw(0, 33, interaction, bounds);
    const dimHalo = styles[0]; styles.length = 0;
    geometry.shimmers[0] = 1; renderer.draw(0, 33, interaction, bounds);
    expect(styles[0]).not.toBe(dimHalo);
    expect(styles[0]).toMatch(/^rgba\(255,74,86,/);
  } finally {
    if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument); else Reflect.deleteProperty(globalThis, "document");
    if (oldDpr) Object.defineProperty(globalThis, "devicePixelRatio", oldDpr); else Reflect.deleteProperty(globalThis, "devicePixelRatio");
  }
});
