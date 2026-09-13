import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { TerrainGeometry, terrainFallback } from "../../src/components/visuals/TerrainMesh/geometry";
import { TerrainInteraction } from "../../src/components/visuals/TerrainMesh/interaction";
import { footerTerrainPreset, terrainTiers } from "../../src/components/visuals/TerrainMesh/preset";
import { TerrainAdaptiveQuality } from "../../src/components/visuals/TerrainMesh/quality";
import { TerrainRenderer } from "../../src/components/visuals/TerrainMesh/renderer";

test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop-chromium", "Pure checks run once."));

test("all tiers match the untouched original ambient projection, shimmer, ribbons and pulses", () => {
  const html = readFileSync("tests/fixtures/terrain/footer.html", "utf8");
  const equations = html.slice(html.indexOf("function terrain("), html.indexOf("function timeline("));
  const reference = new Function("p", "W", "H", "pointer", `const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t;${equations};return {project,ribbon,pulse}`);
  let projectionError = 0, valueError = 0;
  for (const { columns, rows } of terrainTiers) for (const [width, height] of [[1584, 300], [396, 300]]) {
    const geometry = new TerrainGeometry(columns, rows);
    for (const elapsed of [0, 1600, 17000]) {
      const original = reference({ ...footerTerrainPreset, interactive: false }, width, height, { inside: false, x: .8, y: .9, sx: 0, sy: 0 });
      const points = geometry.project(width, height, elapsed), t = elapsed * .001 * footerTerrainPreset.speed;
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

test("hover locally gathers projected points in screen pixels and eases fully away", () => {
  const offsets: number[] = [];
  for (const scale of [1, 1.08]) {
    const width = 1000, height = 300, geometry = new TerrainGeometry(72, 32);
    const ambient = new Float32Array(geometry.project(width, height, 1600));
    let near = -1;
    for (let i = 0; i < ambient.length / 2; i++) {
      const x = ambient[i * 2], y = ambient[i * 2 + 1];
      if (x > 250 && x < 700 && y > 100 && y < 285) { near = i; break; }
    }
    expect(near).toBeGreaterThanOrEqual(0);
    const nearX = ambient[near * 2], nearY = ambient[near * 2 + 1];
    const cursorX = nearX + 60 / scale, cursorY = nearY;
    let far = -1;
    for (let i = 0; i < ambient.length / 2; i++) {
      if (Math.hypot((ambient[i * 2] - cursorX) * scale, (ambient[i * 2 + 1] - cursorY) * scale) > 181) { far = i; break; }
    }
    expect(far).toBeGreaterThanOrEqual(0);
    const rect = { left: 100, top: 100, width: width * scale, height: height * scale };
    const bounds = () => rect, viewport = { width: 1400, height: 800 };
    const interaction = new TerrainInteraction();
    interaction.move(rect.left + cursorX * scale, rect.top + cursorY * scale);
    let points = new Float32Array(ambient);
    for (let elapsed = 0; elapsed <= 700; elapsed += 33) {
      points = new Float32Array(ambient);
      interaction.update(bounds, viewport);
      interaction.deformation.apply(points, width, height, elapsed, 33, bounds);
    }
    const dx = (points[near * 2] - nearX) * scale, dy = (points[near * 2 + 1] - nearY) * scale;
    let maximum = 0;
    for (let i = 0; i < ambient.length / 2; i++) {
      const displacement = Math.hypot(points[i * 2] - ambient[i * 2], points[i * 2 + 1] - ambient[i * 2 + 1]) * scale;
      maximum = Math.max(maximum, displacement);
      const distance = Math.hypot((ambient[i * 2] - cursorX) * scale, (ambient[i * 2 + 1] - cursorY) * scale);
      if (distance >= 180) expect(displacement).toBe(0);
    }
    expect(dx).toBeGreaterThan(0);
    expect(Math.hypot(dx, dy)).toBeLessThanOrEqual(20);
    expect(maximum).toBeLessThanOrEqual(20);
    expect(points[far * 2]).toBe(ambient[far * 2]);
    expect(points[far * 2 + 1]).toBe(ambient[far * 2 + 1]);
    offsets.push(Math.hypot(dx, dy));

    interaction.leave();
    for (let elapsed = 733; elapsed <= 4000; elapsed += 33) {
      points = new Float32Array(ambient);
      interaction.update(bounds, viewport);
      interaction.deformation.apply(points, width, height, elapsed, 33, bounds);
    }
    expect(interaction.deformation.pointer.strength).toBe(0);
    expect(points[near * 2]).toBe(nearX);
    expect(points[near * 2 + 1]).toBe(nearY);
  }
  expect(offsets[1]).toBeCloseTo(offsets[0], 3);
});

test("only visible artwork input creates ripples; four waves expire at 1200ms", () => {
  const interaction = new TerrainInteraction(), bounds = () => ({ left: -50, top: 100, width: 1100, height: 300 });
  const viewport = { width: 1000, height: 350 }, points = new Float32Array([500, 200]);
  for (const [x, y] of [[-10, 200], [1010, 200], [100, 90], [100, 360]]) {
    interaction.move(x, y); interaction.tap(x, y); interaction.update(bounds, viewport);
    interaction.deformation.apply(points, 1100, 300, 0, 33, bounds);
    expect(interaction.deformation.pointer.active).toBe(false); expect(interaction.deformation.ripples).toHaveLength(0);
  }
  for (let i = 0; i < 10; i++) interaction.tap(400 + i, 240);
  interaction.update(bounds, viewport); interaction.deformation.apply(points, 1100, 300, 0, 33, bounds);
  expect(interaction.deformation.ripples).toHaveLength(4);
  expect(interaction.deformation.pointer.strength).toBe(0);
  interaction.deformation.apply(points, 1100, 300, 1200, 33, bounds);
  expect(interaction.deformation.ripples).toHaveLength(0);
  interaction.clear(); expect(interaction.deformation.pointer.strength).toBe(0);
});

test("stationary halo cores refresh brightness instead of reusing stale glow", () => {
  const styles: string[] = [];
  const ctx = {
    fillStyle: "", clearRect() {}, setTransform() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, stroke() {}, fillRect() {}, drawImage() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    fill() { styles.push(this.fillStyle); },
  };
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document"), oldDpr = Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio");
  const oldWidth = Object.getOwnPropertyDescriptor(globalThis, "innerWidth"), oldHeight = Object.getOwnPropertyDescriptor(globalThis, "innerHeight");
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: () => ({ getContext: () => ctx }) } });
  Object.defineProperty(globalThis, "devicePixelRatio", { configurable: true, value: 1 });
  Object.defineProperty(globalThis, "innerWidth", { configurable: true, value: 1000 });
  Object.defineProperty(globalThis, "innerHeight", { configurable: true, value: 300 });
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
    const bounds = { left: 0, top: 0, width: 1000, height: 300 } as DOMRectReadOnly;
    geometry.shimmers[0] = 0; renderer.draw(0, 33, interaction, bounds);
    const dimHalo = styles[0]; styles.length = 0;
    geometry.shimmers[0] = 1; renderer.draw(0, 33, interaction, bounds);
    expect(styles[0]).not.toBe(dimHalo);
    expect(styles[0]).toMatch(/^rgba\(255,74,86,/);
  } finally {
    if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument); else Reflect.deleteProperty(globalThis, "document");
    if (oldDpr) Object.defineProperty(globalThis, "devicePixelRatio", oldDpr); else Reflect.deleteProperty(globalThis, "devicePixelRatio");
    if (oldWidth) Object.defineProperty(globalThis, "innerWidth", oldWidth); else Reflect.deleteProperty(globalThis, "innerWidth");
    if (oldHeight) Object.defineProperty(globalThis, "innerHeight", oldHeight); else Reflect.deleteProperty(globalThis, "innerHeight");
  }
});

test("footer quality reacts in 500ms windows and requires sustained recovery", () => {
  const quality = new TerrainAdaptiveQuality(1);
  for (let index = 0; index < 32; index += 1) quality.sample(9, 34);
  expect(quality.tier).toBe(2);
  expect(quality.fps).toBe(30);

  for (let index = 0; index < 32; index += 1) quality.sample(9, 34);
  expect(quality.tier).toBe(2);
  expect(quality.fps).toBe(24);

  for (let index = 0; index < 310; index += 1) quality.sample(1, 42);
  expect(quality.tier).toBe(1);
  expect(quality.fps).toBe(30);
});

test("size-only terrain resizes retain sampling geometry and buffers", () => {
  const ctx = {
    setTransform() {}, fillRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
  };
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document"), oldDpr = Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio");
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: () => ({ getContext: () => ctx }) } });
  Object.defineProperty(globalThis, "devicePixelRatio", { configurable: true, value: 1 });
  try {
    const renderer = new TerrainRenderer({ dataset: {} } as HTMLCanvasElement, ctx as unknown as CanvasRenderingContext2D);
    renderer.resize(1000, 300, 1);
    const first = renderer as unknown as { geometry: TerrainGeometry; cores: unknown; halos: unknown };
    const geometry = first.geometry, cores = first.cores, halos = first.halos;
    renderer.resize(900, 280, 1);
    expect(first.geometry).toBe(geometry);
    expect(first.cores).toBe(cores);
    expect(first.halos).toBe(halos);
    renderer.resize(900, 280, 2);
    expect(first.geometry).not.toBe(geometry);
  } finally {
    if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument); else Reflect.deleteProperty(globalThis, "document");
    if (oldDpr) Object.defineProperty(globalThis, "devicePixelRatio", oldDpr); else Reflect.deleteProperty(globalThis, "devicePixelRatio");
  }
});

test("terrain culling rejects invisible primitives but keeps crossing segments", () => {
  let lines = 0, arcs = 0;
  const ctx = {
    fillStyle: "", strokeStyle: "", globalCompositeOperation: "source-over", globalAlpha: 1, lineWidth: 1,
    clearRect() {}, setTransform() {}, beginPath() {}, moveTo() {}, lineTo() { lines += 1; }, arc() { arcs += 1; },
    stroke() {}, fill() {}, fillRect() {}, drawImage() {}, createRadialGradient: () => ({ addColorStop() {} }),
  };
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document"), oldDpr = Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio");
  const oldWidth = Object.getOwnPropertyDescriptor(globalThis, "innerWidth"), oldHeight = Object.getOwnPropertyDescriptor(globalThis, "innerHeight");
  Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: () => ({ getContext: () => ctx }) } });
  Object.defineProperty(globalThis, "devicePixelRatio", { configurable: true, value: 1 });
  Object.defineProperty(globalThis, "innerWidth", { configurable: true, value: 1000 });
  Object.defineProperty(globalThis, "innerHeight", { configurable: true, value: 300 });
  try {
    const renderer = new TerrainRenderer({ dataset: {} } as HTMLCanvasElement, ctx as unknown as CanvasRenderingContext2D);
    renderer.resize(1000, 300, 2);
    const geometry = (renderer as unknown as { geometry: TerrainGeometry }).geometry;
    const points = new Float32Array(geometry.points.length).fill(-1000);
    geometry.project = () => points;
    const interaction = new TerrainInteraction(); interaction.update = () => {};
    const bounds = { left: 0, top: 0, width: 1000, height: 300 } as DOMRectReadOnly;
    renderer.draw(0, 33, interaction, bounds);
    expect(lines).toBe(0);
    expect(arcs).toBe(0);

    points[0] = -100; points[1] = 150;
    points[2] = 1100; points[3] = 150;
    renderer.draw(0, 33, interaction, bounds);
    expect(lines).toBeGreaterThan(0);
  } finally {
    if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument); else Reflect.deleteProperty(globalThis, "document");
    if (oldDpr) Object.defineProperty(globalThis, "devicePixelRatio", oldDpr); else Reflect.deleteProperty(globalThis, "devicePixelRatio");
    if (oldWidth) Object.defineProperty(globalThis, "innerWidth", oldWidth); else Reflect.deleteProperty(globalThis, "innerWidth");
    if (oldHeight) Object.defineProperty(globalThis, "innerHeight", oldHeight); else Reflect.deleteProperty(globalThis, "innerHeight");
  }
});
