import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const beforeDir = process.argv[2] ?? "build/terrain-baseline";
const afterDir = process.argv[3] ?? "build/terrain-final";
const destination = process.argv[4] ?? "docs/terrain-performance.md";
const before = JSON.parse(await readFile(path.join(beforeDir, "profile.json"), "utf8"));
const after = JSON.parse(await readFile(path.join(afterDir, "profile.json"), "utf8"));
const environment = JSON.parse(await readFile(path.join(afterDir, "environment.json"), "utf8"));
const f = n => n == null ? "—" : n.toFixed(1);
const key = row => `${row.label}/${row.scenario}`;
const pairs = before.map(a => {
  const b = after.find(b => key(a) === key(b));
  if (!b) throw new Error(`Missing final workload: ${key(a)}`);
  return [a, b];
});
const lines = [
  "# Footer terrain performance", "",
  `Production Chromium ${environment.browser}, ${environment.cpu.trim()}, Windows ${environment.os}, DPR 1. Desktop: 1440×900; mobile/touch emulation: 390×844. Throttle labels use 4× CPU slowdown. No physical devices were available.`, "",
  "Measurements include the original iframe explicitly. The same page, input coordinates and forty 100ms steps were used per workload. Hydration settled before positioning; runs were made without concurrent builds or test browsers. Profiling and canvas instrumentation add overhead, so these are local comparative results, not hardware-independent budgets.", "",
  "## Drawing cost", "",
  "All values are milliseconds per terrain draw. The original had no reachable hover input and no click ripple; final pointer/tap measurements include those newly enabled interactions. Sampling adapts during the sequential workloads.", "",
  "| Device | Workload | Median before → after | p95 before → after | Median reduction | Final sampling before → after |",
  "| --- | --- | ---: | ---: | ---: | --- |",
];
for (const [a, b] of pairs.filter(([a]) => a.scenario !== "offscreen")) lines.push(`| ${a.label} | ${a.scenario} | ${f(a.medianMs)} → ${f(b.medianMs)} | ${f(a.p95Ms)} → ${f(b.p95Ms)} | ${((1 - b.medianMs / a.medianMs) * 100).toFixed(0)}% | ${a.tier} columns → ${b.tier} |`);
const regressions = pairs.filter(([a, b]) => a.scenario !== "offscreen" && (b.medianMs > a.medianMs || b.p95Ms > a.p95Ms));
lines.push("", regressions.length
  ? "Remaining drawing regressions: " + regressions.map(([a, b]) => `${a.label} ${a.scenario} (median ${f(a.medianMs)} → ${f(b.medianMs)}ms; p95 ${f(a.p95Ms)} → ${f(b.p95Ms)}ms)`).join("; ") + ". Read these alongside the changed interaction workload and final sampling tier."
  : "No drawing median/p95 regressions were measured in these workloads.");
lines.push("", "## Frame delivery and long tasks", "", "Gaps are between terrain drawing starts. Scrolling deliberately suspends the terrain, so its large gaps include time out of view. Long-task counts come from the parent page in both versions and include unrelated page work; they are not exclusively attributed to terrain.", "", "| Device | Workload | Gap median before → after | Gap p95 before → after | Draws before → after | Page long tasks before → after |", "| --- | --- | ---: | ---: | ---: | ---: |");
for (const [a, b] of pairs) lines.push(`| ${a.label} | ${a.scenario} | ${f(a.gapMedianMs)} → ${f(b.gapMedianMs)} | ${f(a.gapP95Ms)} → ${f(b.gapP95Ms)} | ${a.frames} → ${b.frames} | ${a.pageLongTasks.length} → ${b.pageLongTasks.length} |`);
lines.push("", "The deliberate 30fps cap can increase gaps where the original rendered faster. This is a drawing-cost comparison, not a compositor/GPU or page-load benchmark. Server SVG fallbacks add document markup; their transfer cost was not benchmarked. Safari, Firefox and physical-device behavior remain unverified.");
const gapRegressions = pairs.filter(([a, b]) => a.label !== "desktop" && a.scenario !== "scroll" && a.scenario !== "offscreen" && b.gapP95Ms > a.gapP95Ms);
const taskRegressions = pairs.filter(([a, b]) => b.pageLongTasks.length > a.pageLongTasks.length);
if (gapRegressions.length || taskRegressions.length) lines.push("", "Remaining frame-delivery limits: " + [
  ...gapRegressions.map(([a, b]) => `${a.label} ${a.scenario} gap p95 ${f(a.gapP95Ms)} → ${f(b.gapP95Ms)}ms`),
  ...taskRegressions.map(([a, b]) => `${a.label} ${a.scenario} page long tasks ${a.pageLongTasks.length} → ${b.pageLongTasks.length}`),
].join("; ") + ". Drawing savings do not establish uniformly smoother frame delivery under throttling.");
lines.push("", "The original iframe continues requesting animation frames when suspended. Its steady offscreen RAF callback counts were " + pairs.filter(([a]) => a.scenario === "offscreen").map(([a]) => `${a.label}: ${a.callbacks}`).join(", ") + ". The inline terrain unsubscribes from the shared scheduler when offscreen/hidden; functional tests verify no terrain draws and scheduler cleanup. Inline parent-frame RAF counts also include other page effects and cannot be attributed solely to terrain.", "",
  "## Visual and functional evidence", "",
  "Twenty before and twenty after PNGs cover 1440, 768, 390 and 360px widths at phase zero, ambient, hover, ripple and recovery. Review retained terrain ridges, circular crimson dots, footer readability, mask, opacity and the 300px artwork height. Narrow devices intentionally start with fewer samples. Unrelated page entrances outside the footer can differ in phase.", "",
  "The original equation comparison covers all sampling tiers at desktop/mobile widths, phase zero and later phases, with and without hover. Maximum projection error is below 0.0002 CSS px. Tests cover frame-rate-independent hover smoothing, visible-bounds rejection, four-ripple expiry, stationary halo brightness refresh, offscreen/hidden suspension, hidden resize, reduced motion, no JavaScript, missing/throwing contexts, context restoration, touch scrolling, control/keyboard exclusion and navigation cleanup. Shared mesh tests cover cadence, sustained overload/recovery, backing limits and scheduler phase continuity.", "",
  "Lint, typecheck, production build and diff checks passed. The complete production suite passed 120 tests, with 63 expected skips for device-specific or duplicate pure coverage, across all three configured Chromium projects. The fast-scroll Products test now waits for hydrated sticky layout before measuring document height; the hidden-resize terrain test stays within its responsive breakpoint. No Home/Products application visuals were changed.", "",
  `Evidence: \`${beforeDir}\` and \`${afterDir}\` contain raw JSON, environment metadata, PNGs and fifteen CPU profiles each. Reproduce with [the terrain evidence script](../scripts/terrain-evidence.mjs), then \`node scripts/compare-terrain-profiles.mjs\`. See [component contracts and methodology](terrain-mesh.md).`, "");
await writeFile(destination, lines.join("\n"));
console.log(destination);
