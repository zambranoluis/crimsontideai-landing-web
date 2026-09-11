import { expect, test } from "@playwright/test";
import { MeshGeometry, companyMountainGrids, fallbackPaths } from "../../src/components/visuals/Mesh/presets";
import { AdaptiveQuality, FrameCadence, backingSize, qualityTiers } from "../../src/components/visuals/Mesh/quality";
import { MeshInteraction } from "../../src/components/visuals/Mesh/interaction";
import { MeshScheduler } from "../../src/components/visuals/Mesh/scheduler";
import { traceGrid } from "../../src/components/visuals/Mesh/renderer";
import { presentMesh, meshPalettes } from "../../src/components/visuals/Mesh/presentation";

test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop-chromium", "Pure deterministic coverage runs once."));

test("all sampling tiers retain the original shape equations and reuse point buffers", () => {
  for (const variant of ["home", "openjm", "sentinel"] as const) for (const { rows, columns } of qualityTiers) {
    const geometry = new MeshGeometry(variant, rows, columns);
    for (const time of [0, 1200, 17000]) {
      const points = geometry.project(1440, 800, time);
      expect(points).toBe(geometry.points);
      for (const [row, col] of [[0, 0], [rows / 2, columns / 2], [rows, columns]]) {
        const u = col / columns, v = row / rows, i = (row * (columns + 1) + col) * 2;
        const wave = Math.sin(u * (variant === "openjm" ? 7.2 : 11.1) + v * 3 + time * (variant === "openjm" ? .000123 : .000165)) * (variant === "openjm" ? .26 : .19) * (.4 + v * .6);
        const x = variant === "home" ? u * 1440 * 1.22 - 1440 * .11 : variant === "openjm" ? 1440 * (.53 + v * .46 + wave - u * .12) : 1440 * (u * 1.14 - .07);
        const y = variant === "home" ? 800 * (.44 + v * .55) + Math.sin(u * 8.5 + v * 3.5 + time * .00016) * 800 * (.06 + v * .065) + Math.cos(u * 5 - time * .0001) * 800 * .07 - u * 800 * .13 : variant === "openjm" ? 800 * (u * 1.2 - .1) : 800 * (.45 + v * .35 + wave - u * .1);
        expect(points[i]).toBeCloseTo(x, 3); expect(points[i + 1]).toBeCloseTo(y, 3);
      }
    }
    const paths = fallbackPaths(variant);
    const first = presentMesh(new MeshGeometry(variant, 20, 52).project(1440, 800, 0), variant, 1440, 800);
    expect(paths.rows[0]).toContain(`M${first[0].toFixed(2)} ${first[1].toFixed(2)}`);
  }
  expect(new Set(["home", "openjm", "sentinel"].map(v => fallbackPaths(v as "home").rows[0])).size).toBe(3);
});

test("product framing preserves wave distances, fallback projection, and pointer-local attraction", () => {
  for (const variant of ["openjm", "sentinel"] as const) {
    const geometry = new MeshGeometry(variant, 20, 52);
    for (const time of [0, 1200, 17000]) {
      const original = geometry.project(1440, 800, time).slice();
      const points = presentMesh(geometry.points, variant, 1440, 800);
      expect(points).toBe(geometry.points);
      for (let i = 2; i < points.length; i += 2) {
        expect(Math.hypot(points[i] - points[i - 2], points[i + 1] - points[i - 1]))
          .toBeCloseTo(Math.hypot(original[i] - original[i - 2], original[i + 1] - original[i - 1]), 3);
      }
    }
    const desktop = presentMesh(geometry.project(1440, 800, 0), variant, 1440, 800).slice();
    const paths = fallbackPaths(variant);
    const mobile = presentMesh(geometry.project(390, 1100, 0), variant, 390, 1100);
    for (let i = 0; i < desktop.length; i += 2) {
      expect(mobile[i]).toBeCloseTo(desktop[i] / 1440 * 390, 3);
      expect(mobile[i + 1]).toBeCloseTo(desktop[i + 1] / 800 * 1100, 3);
      expect(paths.rows[Math.floor(i / 2 / 53)]).toContain(`${desktop[i].toFixed(2)} ${desktop[i + 1].toFixed(2)}`);
    }
    const target = desktop.findIndex((x, i) => i % 2 === 0 && x > 200 && x < 1100 && desktop[i + 1] > 200 && desktop[i + 1] < 600);
    expect(target).toBeGreaterThanOrEqual(0);
    const pointer = { x: desktop[target] + 60, y: desktop[target + 1] };
    const input = new MeshInteraction();
    input.move(pointer.x, pointer.y);
    const moved = desktop.slice();
    input.apply(moved, 1440, 800, 0, 33, () => ({ left: 0, top: 0, width: 1440, height: 800 }));
    expect(moved[target]).toBeGreaterThan(desktop[target]);
    expect(moved[target + 1]).toBe(desktop[target + 1]);
    for (let i = 0; i < moved.length; i += 2) {
      if (Math.hypot(desktop[i] - pointer.x, desktop[i + 1] - pointer.y) >= 180) {
        expect(moved[i]).toBe(desktop[i]); expect(moved[i + 1]).toBe(desktop[i + 1]);
      }
    }
  }
  for (const variant of ["home", "company-mountains"] as const) {
    const points = new MeshGeometry(variant, 20, 52).project(1440, 800, 1200);
    const before = points.slice();
    expect(presentMesh(points, variant, 1440, 800)).toEqual(before);
    expect(meshPalettes[variant]).toEqual({ line: [255, 0, 51], dot: [255, 0, 51], halo: [255, 0, 51], glow: [51, 0, 9], glowX: .78, glowY: .65 });
  }
});

test("cadence carries remainder at 60, 90, 120 and irregular display intervals", () => {
  for (const hz of [60, 90, 120, 144]) for (const fps of [30, 24]) {
    const cadence = new FrameCadence();
    let draws = 0;
    for (let i = 0; i < hz * 10; i++) if (cadence.advance(1000 / hz, fps)) draws++;
    expect(draws).toBe(fps * 10);
  }
  const cadence = new FrameCadence();
  expect(cadence.advance(20, 30)).toBe(0);
  expect(cadence.advance(20, 30)).toBe(40);
  expect(cadence.advance(27, 30)).toBe(27);
  cadence.reset(); expect(cadence.advance(20, 30)).toBe(0);
});

test("batched connections interpolate every grid vertex, including deformations and trailing edges", () => {
  for (const count of [21, 29, 37, 53, 73, 101]) {
    const points = new Float32Array(Array.from({ length: count * 2 }, (_, i) => Math.sin(i * .29) * 180 + i * 3));
    let vertex = 0, curves = 0;
    const context = {
      moveTo(x: number, y: number) { expect([x, y]).toEqual([points[0], points[1]]); },
      bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
        const x0 = points[vertex * 2], y0 = points[vertex * 2 + 1];
        for (const step of [1, 2, 3]) {
          const t = step / 3, s = 1 - t;
          expect(s ** 3 * x0 + 3 * s * s * t * x1 + 3 * s * t * t * x2 + t ** 3 * x3).toBeCloseTo(points[(vertex + step) * 2], 4);
          expect(s ** 3 * y0 + 3 * s * s * t * y1 + 3 * s * t * t * y2 + t ** 3 * y3).toBeCloseTo(points[(vertex + step) * 2 + 1], 4);
        }
        vertex += 3; curves++;
      },
      lineTo(x: number, y: number) { vertex++; expect([x, y]).toEqual([points[vertex * 2], points[vertex * 2 + 1]]); },
    } as CanvasRenderingContext2D;
    traceGrid(context, points, 0, 2, count);
    expect(vertex).toBe(count - 1); expect(curves).toBe(Math.floor((count - 1) / 3));
  }
});

test("quality requires sustained overload and ten seconds of headroom, with bounded resolution", () => {
  const quality = new AdaptiveQuality(0);
  const feed = (cost: number, gap: number, count: number) => { for (let i = 0; i < count; i++) quality.sample(cost, gap); };
  feed(12, 40, 50); expect(quality.tier).toBe(0);
  feed(12, 40, 50); expect(quality.tier).toBe(1);
  feed(1, 80, 50); expect(quality.tier).toBe(2);
  feed(12, 40, 100); expect(quality.fps).toBe(24);
  feed(1, 40, 200); expect(quality.tier).toBe(2);
  feed(1, 40, 50); expect(quality.tier).toBe(1); expect(quality.fps).toBe(30);
  feed(1, 40, 200); quality.resetWindow(); feed(1, 40, 50); expect(quality.tier).toBe(1);
  for (const tier of [0, 1, 2]) for (const [width, height] of [[1440, 900], [390, 3000], [9000, 6000]]) {
    const size = backingSize(width, height, 3, tier);
    expect(size.width).toBeLessThanOrEqual(2160); expect(size.height).toBeLessThanOrEqual(1440);
    expect(size.ratio).toBeLessThanOrEqual(qualityTiers[tier].dpr);
    expect(Math.abs(size.width - width * size.ratio)).toBeLessThan(1);
    expect(Math.abs(size.height - height * size.ratio)).toBeLessThan(1);
  }
});

test("viewport culling rejects invisible spans but preserves curves crossing the viewport", () => {
  let commands = 0;
  const context = { moveTo() { commands++; }, lineTo() { commands++; }, bezierCurveTo() { commands++; } } as unknown as CanvasRenderingContext2D;
  const clip = { left: 0, right: 10, top: 0, bottom: 30 };
  traceGrid(context, new Float32Array([-20, 0, -20, 10, -20, 20, -20, 30]), 0, 2, 4, clip);
  expect(commands).toBe(0);
  traceGrid(context, new Float32Array([-20, 10, 20, 10, 20, 10, -20, 10]), 0, 2, 4, clip);
  expect(commands).toBe(2);
  commands = 0;
  traceGrid(context, new Float32Array([-20, 10, 20, 10]), 0, 2, 2, clip);
  expect(commands).toBe(2);
});

test("hover attracts, eases away, and remains constant in screen pixels after transforms", () => {
  const displacement = (scale: number) => {
    const input = new MeshInteraction();
    input.move(300, 200);
    const rect = { left: 100, top: 100, width: 1000 * scale, height: 800 * scale };
    const original = [200 / scale - 60 / scale, 100 / scale];
    let points = new Float32Array(original);
    for (let t = 0; t < 700; t += 33) {
      points = new Float32Array(original); input.apply(points, 1000, 800, t, 33, () => rect);
    }
    const offset = (points[0] - original[0]) * scale;
    expect(offset).toBeGreaterThan(0); expect(offset).toBeLessThanOrEqual(20);
    input.leave();
    for (let t = 700; t < 2000; t += 33) input.apply(new Float32Array(original), 1000, 800, t, 33, () => rect);
    expect(input.pointer.strength).toBe(0);
    input.apply(new Float32Array(original), 1000, 800, 2033, 33, () => { throw new Error("idle must not measure"); });
    return offset;
  };
  expect(displacement(1.08)).toBeCloseTo(displacement(1), 3);
});

test("rapid taps cap at four and ripples recover after 1200ms with one bounds read per frame", () => {
  const input = new MeshInteraction();
  for (let i = 0; i < 10; i++) input.tap(100 + i, 100);
  let reads = 0;
  const rect = () => { reads++; return { left: 0, top: 0, width: 1000, height: 800 }; };
  input.apply(new Float32Array([500, 100]), 1000, 800, 0, 33, rect);
  expect(input.ripples).toHaveLength(4); expect(reads).toBe(1);
  expect(input.ripples[0].u).toBe(.106);
  const original = [107 + Math.hypot(1000, 800) * .72 * .5, 100];
  const points = new Float32Array(original);
  input.apply(points, 1000, 800, 600, 33, rect);
  expect(points[0]).toBeGreaterThan(original[0]);
  input.apply(new Float32Array(original), 1000, 800, 1200, 33, rect);
  expect(input.ripples).toHaveLength(0); expect(reads).toBe(2);
});

test("one scheduler serves visible meshes, pauses without time jumps, and releases everything", () => {
  let hidden = false, id = 0, listener: (() => void) | undefined, cancellations = 0;
  const queue = new Map<number, FrameRequestCallback>();
  const scheduler = new MeshScheduler({
    request: callback => { queue.set(++id, callback); return id; },
    cancel: key => { cancellations++; queue.delete(key); }, hidden: () => hidden,
    listen: callback => { listener = callback; return () => { listener = undefined; }; },
  });
  const step = (time: number) => { const callbacks = [...queue.values()]; queue.clear(); callbacks.forEach(callback => callback(time)); };
  const a: number[] = [], b: number[] = [];
  const first = scheduler.subscribe(delta => a.push(delta), () => {}), second = scheduler.subscribe(delta => b.push(delta), () => {});
  first.setActive(true); second.setActive(true); expect(queue.size).toBe(1);
  step(100); step(133); expect(a).toEqual([0, 33]); expect(b).toEqual(a);
  first.setActive(false); step(166); expect(a).toHaveLength(2); expect(b).toHaveLength(3);
  hidden = true; listener!(); expect(queue.size).toBe(0);
  hidden = false; listener!(); step(50000); expect(b.at(-1)).toBe(0);
  first.setActive(true); step(50033); expect(a.at(-1)).toBe(0);
  first.dispose(); second.dispose(); expect(queue.size).toBe(0); expect(listener).toBeUndefined(); expect(cancellations).toBeGreaterThan(0);
});

test("company ridges descend from the left with a bounded traveling shoulder swell at every tier", () => {
  expect(companyMountainGrids.map(({ rows, columns }) => [rows, columns])).toEqual([[18, 60], [14, 46], [10, 34]]);
  for (const { rows, columns } of companyMountainGrids) for (const [width, height, limit] of [[980, 500, 8], [584, 350, 5], [304, 220, 5]]) {
    const geometry = new MeshGeometry("company-mountains", rows, columns);
    const original = geometry.project(width, height, 0).slice();
    let maximum = 0;
    const traveling: number[] = [];
    for (let time = 0; time <= 12000; time += 500) {
      const points = geometry.project(width, height, time);
      expect(points).toBe(geometry.points);
      let displacement = 0, gap = Infinity, movingColumn = 0;
      for (let row = 0; row <= rows; row++) for (let col = 0; col <= columns; col++) {
        const i = (row * (columns + 1) + col) * 2;
        if (points[i] !== original[i]) throw new Error("Ambient motion changed the city boundary");
        const offset = original[i + 1] - points[i + 1];
        if (offset > displacement) { displacement = offset; movingColumn = col; }
        if ((row === 0 || row === rows || col === 0 || col === columns) && Math.abs(offset) > .001) throw new Error("Outer boundary moved");
        if (row < rows) gap = Math.min(gap, points[i + (columns + 1) * 2 + 1] - points[i + 1]);
      }
      expect(displacement).toBeLessThanOrEqual(limit + .001);
      expect(gap).toBeGreaterThan(1.5); // Connections remain separated, even on the smallest canvas.
      maximum = Math.max(maximum, displacement);
      if (time === 3000 || time === 9000) traveling.push(movingColumn / columns);
      const skyline = Array.from({ length: columns + 1 }, (_, col) => points[col * 2 + 1]);
      const summit = skyline.indexOf(Math.min(...skyline)) / columns;
      expect(summit).toBeGreaterThan(.08);
      expect(summit).toBeLessThan(.18);
      const y = (u: number) => skyline[Math.round(u * columns)];
      expect(y(.12)).toBeLessThan(y(.43));
      expect(y(.43)).toBeLessThan(y(.68));
      expect(y(.68)).toBeLessThan(y(.95));
    }
    expect(maximum).toBeGreaterThan(limit * .85);
    expect(traveling[1] - traveling[0]).toBeGreaterThan(.35);
    expect(geometry.project(width, height, 12000)).toEqual(original);
  }
});

test("company fallback agrees with every row and column of its shared medium grid", () => {
  const paths = fallbackPaths("company-mountains");
  const { rows, columns } = companyMountainGrids[1];
  const points = new MeshGeometry("company-mountains", rows, columns).project(1440, 800, 0);
  expect(paths.rows).toHaveLength(rows + 1);
  expect(paths.dots).toHaveLength(rows / 2 + 1);
  for (let row = 0; row <= rows; row++) for (let col = 0; col <= columns; col++) {
    const i = (row * (columns + 1) + col) * 2;
    expect(paths.rows[row]).toContain(`${col ? "L" : "M"}${points[i].toFixed(2)} ${points[i + 1].toFixed(2)}`);
    expect(paths.columns).toContain(`${row ? "L" : "M"}${points[i].toFixed(2)} ${points[i + 1].toFixed(2)}`);
  }
  // At time zero pixel projection scales exactly like preserveAspectRatio=none,
  // including reduced motion and no-JS phone layouts.
  const phone = new MeshGeometry("company-mountains", rows, columns).project(304, 220, 0);
  for (let i = 0; i < points.length; i += 2) {
    expect(phone[i]).toBeCloseTo(points[i] / 1440 * 304, 3);
    expect(phone[i + 1]).toBeCloseTo(points[i + 1] / 800 * 220, 3);
  }
});
