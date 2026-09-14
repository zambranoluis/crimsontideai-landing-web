import { test, expect } from "@playwright/test";
import { fieldInfluence, terrainPoint, type FieldInput } from "../../src/app/_not-found/terrain";

test("hover is bounded and local; released terrain returns to its ambient position", () => {
  const input: FieldInput = { x: 300, y: 120, strength: 1, ripples: [] };
  expect(fieldInfluence(300, 120, 0, input).lift).toBe(6);
  expect(fieldInfluence(350, 120, 0, input).lift).toBeLessThan(6);
  expect(fieldInfluence(451, 120, 0, input)).toEqual({ lift: 0, light: 0 });
  input.strength = 0;
  expect(fieldInfluence(300, 120, 0, input)).toEqual({ lift: 0, light: 0 });
});

test("click waves propagate outward and expire completely", () => {
  const input: FieldInput = { x: 0, y: 0, strength: 0, ripples: [{ x: 300, y: 120, born: 4 }] };
  expect(fieldInfluence(440, 120, 4.5, input).light).toBeGreaterThan(0);
  expect(fieldInfluence(300, 120, 4.5, input).light).toBe(0);
  expect(fieldInfluence(440, 120, 5.01, input)).toEqual({ lift: 0, light: 0 });
  expect(fieldInfluence(300, 120, 3, input)).toEqual({ lift: 0, light: 0 });
});

test("ambient geometry scales with its container and has no time-wrap discontinuity", () => {
  for (const u of [0, .3, .7, 1]) for (const v of [0, .5, 1]) {
    const a = terrainPoint(u, v, 180, 1600, 300);
    const b = terrainPoint(u, v, 180, 800, 150);
    expect(a.x).toBeCloseTo(b.x * 2);
    expect(a.y).toBeCloseTo(b.y * 2);
    expect(Math.abs(a.y - terrainPoint(u, v, 180.016, 1600, 300).y)).toBeLessThan(1);
  }
});
