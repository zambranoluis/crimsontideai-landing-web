import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const [beforeDir, afterDir, destination = "test-results/terrain-performance.md"] = process.argv.slice(2);
if (!beforeDir || !afterDir) throw new Error("Usage: node scripts/compare-terrain-profiles.mjs BEFORE AFTER [REPORT.md]");
const before = JSON.parse(await readFile(path.join(beforeDir, "profile.json"), "utf8"));
const after = JSON.parse(await readFile(path.join(afterDir, "profile.json"), "utf8"));
const environment = JSON.parse(await readFile(path.join(afterDir, "environment.json"), "utf8"));
const key = row => `${row.label}/${row.scenario}`;
if (new Set(before.map(key)).size !== before.length || new Set(after.map(key)).size !== after.length || before.length !== after.length) {
  throw new Error("Profile inputs must contain the same uniquely named workloads.");
}
const f = value => typeof value === "number" ? value.toFixed(2) : "n/a";
const lines = ["# Footer terrain comparison", "", `Browser ${environment.browser}; ${environment.cpu.trim()}; OS ${environment.os}; ${environment.baseURL}.`, "",
  "Two recorded runs on the same machine. Timings include instrumentation overhead. This report establishes neither functional test results nor physical-device performance; there are no CI timing thresholds.", "",
  "| Workload | Median before ms | Median after ms | p95 before ms | p95 after ms |", "| --- | ---: | ---: | ---: | ---: |"];
for (const row of after) {
  const original = before.find(item => key(item) === key(row));
  if (!original) throw new Error(`Missing baseline workload: ${key(row)}`);
  lines.push(`| ${key(row)} | ${f(original.medianMs)} | ${f(row.medianMs)} | ${f(original.p95Ms)} | ${f(row.p95Ms)} |`);
}
lines.push("", `Raw inputs: ${beforeDir} and ${afterDir}. See their environment.json, profile.json and CPU profiles.`, "");
await mkdir(path.dirname(path.resolve(destination)), { recursive: true });
await writeFile(destination, lines.join("\n"));
console.log(destination);
