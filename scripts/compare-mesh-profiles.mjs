import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const [beforeDirectory, afterDirectory, destination = "build/mesh-performance.md"] = process.argv.slice(2);
if (!beforeDirectory || !afterDirectory) throw new Error("Usage: node scripts/compare-mesh-profiles.mjs BEFORE_DIRECTORY AFTER_DIRECTORY [REPORT.md]");
const before = JSON.parse(await readFile(path.join(beforeDirectory, "profile.json"), "utf8"));
const after = JSON.parse(await readFile(path.join(afterDirectory, "profile.json"), "utf8"));
const key = row => `${row.label}/${row.variant}/${row.scenario}`;
const originals = new Map(before.map(row => [key(row), row]));
const pairs = after.map(row => {
  const original = originals.get(key(row));
  if (!original) throw new Error(`Missing baseline: ${key(row)}`);
  return { before: original, after: row };
});
const number = value => Number(value).toFixed(2);
const percent = (a, b) => `${((b / a - 1) * 100).toFixed(1)}%`;
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
};
const lines = [
  "# Mesh performance comparison", "",
  "Production Chromium measurements on the same local machine. Mobile results are touch/mobile emulation, including 4× Chromium CPU throttling; no physical phone/tablet was measured.", "",
  "Drawing costs include geometry, interaction and cache updates, from the main canvas clear to its final draw command. They include instrumentation/profiler overhead and do not separately measure asynchronous GPU raster time. Functional CI does not enforce these hardware-dependent values.", "",
  "Aggregate costs below are medians of the four workload medians, not pooled frame samples. Lower drawing time is better; negative changes indicate improvement. Full workloads, frame gaps, long tasks, tiers and bounds are retained in the accompanying JSON and CPU profiles.", "",
  "| Condition | Mesh | Before ms | After ms | Change | Long tasks before → after |",
  "| --- | --- | ---: | ---: | ---: | ---: |",
];
for (const label of ["desktop", "desktop-4x", "mobile-4x"]) for (const variant of ["home", "openjm", "sentinel"]) {
  const group = pairs.filter(pair => pair.after.label === label && pair.after.variant === variant);
  const a = median(group.map(pair => pair.before.medianMs)), b = median(group.map(pair => pair.after.medianMs));
  const tasks = side => group.reduce((sum, pair) => sum + pair[side].longTasks.length, 0);
  lines.push(`| ${label} | ${variant} | ${number(a)} | ${number(b)} | ${percent(a, b)} | ${tasks("before")} → ${tasks("after")} |`);
}
lines.push("", "## Individual workloads", "", "| Condition / mesh / workload | Draw median before → after ms | Draw p95 before → after ms | Frame-gap p95 before → after ms | Final tier |", "| --- | ---: | ---: | ---: | --- |");
for (const { before: a, after: b } of pairs) lines.push(`| ${key(b)} | ${number(a.medianMs)} → ${number(b.medianMs)} | ${number(a.p95Ms)} → ${number(b.p95Ms)} | ${number(a.gapP95Ms)} → ${number(b.gapP95Ms)} | ${b.tier} |`);
lines.push("", "## Geometry checks", "", "Canvas bounds and the section under the workload pointer are recorded to distinguish renderer changes from hydration/scroll placement differences. Backing resolutions can differ through adaptive quality.", "", "| Condition / mesh / workload | Bounds match (within 1 px) | Pointer section before → after |", "| --- | --- | --- |");
for (const { before: a, after: b } of pairs) {
  const match = a.bounds && b.bounds && ["x", "y", "width", "height"].every(field => Math.abs(a.bounds[field] - b.bounds[field]) <= 1);
  lines.push(`| ${key(b)} | ${match ? "yes" : "no — inspect JSON"} | ${a.targetSection ?? "none"} → ${b.targetSection ?? "none"} |`);
}
await mkdir(path.dirname(path.resolve(destination)), { recursive: true });
await writeFile(destination, `${lines.join("\n")}\n`);
console.log(destination);
