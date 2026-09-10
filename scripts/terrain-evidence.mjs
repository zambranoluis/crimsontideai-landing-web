import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { cpus, release } from "node:os";
import path from "node:path";

const output = path.resolve(process.argv[2] ?? "build/terrain-evidence");
const baseURL = process.env.TERRAIN_URL ?? "http://localhost:3101";
const baseline = process.argv.includes("--baseline");
const captureOnly = process.argv.includes("--capture-only");
const profileOnly = process.argv.includes("--profile-only");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const source = page => baseline ? page.frames().find(f => f.url().endsWith("/footer.html")) : page.mainFrame();
async function position(page) {
  await page.goto(baseURL);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(6000);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  if (baseline) await page.locator("footer iframe").contentFrame().locator("canvas").waitFor({ state: "attached", timeout: 60000 });
  else await page.locator('[data-testid="footer-terrain-mesh"][data-ready="true"]').waitFor();
}
const findings = [];
try {
  await writeFile(path.join(output, "environment.json"), JSON.stringify({ browser: browser.version(), node: process.version, os: release(), cpu: cpus()[0]?.model, baseline, baseURL, dpr: 1, physicalDevices: false }, null, 2));
  if (!profileOnly) for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [360, 740]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1024, isMobile: width < 768, deviceScaleFactor: 1 });
    const page = await context.newPage();
    // Start the terrain at phase zero on every draw, then advance explicitly.
    await page.addInitScript(() => {
      const raf = requestAnimationFrame;
      window.__terrainPhase = 0;
      window.requestAnimationFrame = callback => raf(() => callback(window.__terrainPhase));
    });
    await position(page);
    const frame = source(page);
    // Original starts its lastFrame from performance.now(); negative deltas clamp to zero.
    for (const [state, phase] of [["phase-0", 0], ["ambient", 1600], ["hover", 1900], ["ripple", 2200], ["recovered", 4000]]) {
      if (state === "hover") await page.mouse.move(width * .8, height - 25);
      if (state === "ripple") {
        if (width < 1024) await page.touchscreen.tap(width * .8, height - 25);
        else await page.mouse.click(width * .8, height - 25);
      }
      if (state === "recovered") await page.mouse.move(0, 0);
      const previous = await frame.evaluate(() => window.__terrainPhase);
      // Advance at 60 Hz so the original's delta clamp and both cadence policies agree.
      for (let t = previous + 1000 / 60; t <= phase + .01; t += 1000 / 60) {
        await frame.evaluate(t => { window.__terrainPhase = t; }, t);
        await page.waitForTimeout(18);
      }
      await page.screenshot({ path: path.join(output, `footer-${width}-${state}.png`) });
    }
    await context.close();
    console.log(`Captured ${width}`);
  }
  if (!captureOnly) for (const [label, width, height, rate] of [["desktop", 1440, 900, 1], ["desktop-4x", 1440, 900, 4], ["mobile-4x", 390, 844, 4]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1024, isMobile: width < 768, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate });
    // Init scripts run inside the original same-origin iframe too, explicitly measuring it.
    await page.addInitScript(() => {
      window.__terrainSamples = []; window.__terrainLongTasks = []; window.__terrainCallbacks = 0;
      new PerformanceObserver(list => window.__terrainLongTasks.push(...list.getEntries().map(e => e.duration))).observe({ type: "longtask" });
      let pending;
      const proto = CanvasRenderingContext2D.prototype;
      for (const method of ["clearRect", "fill", "stroke", "drawImage", "fillRect", "restore"]) {
        const original = proto[method];
        proto[method] = function (...args) {
          if (this.canvas.id !== "crimsontide-network" && this.canvas.dataset.testid !== "footer-terrain-mesh") return original.apply(this, args);
          if (method === "clearRect") pending = { start: performance.now() };
          const result = original.apply(this, args);
          if (pending) pending.end = performance.now();
          return result;
        };
      }
      const raf = requestAnimationFrame;
      window.requestAnimationFrame = callback => raf(time => {
        window.__terrainCallbacks++;
        callback(time);
        if (pending) window.__terrainSamples.push({ ...pending, cost: pending.end - pending.start });
        pending = undefined;
      });
    });
    await position(page);
    await page.waitForTimeout(1500);
    const frame = source(page);
    for (const scenario of ["idle", "pointer", "taps", "scroll", "offscreen"]) {
      if (scenario === "offscreen") {
        await page.evaluate(() => scrollTo({ top: document.body.scrollHeight - 1800, behavior: "instant" }));
        await page.waitForTimeout(1000);
      }
      await frame.evaluate(() => { window.__terrainSamples = []; window.__terrainLongTasks = []; window.__terrainCallbacks = 0; });
      await page.evaluate(() => { window.__terrainLongTasks = []; });
      await cdp.send("Profiler.enable"); await cdp.send("Profiler.start");
      for (let i = 0; i < 40; i++) {
        if (scenario === "pointer") await page.mouse.move(width * (.7 + .15 * Math.sin(i)), height - 25);
        if (scenario === "taps" && i % 3 === 0) {
          if (width < 1024) await page.touchscreen.tap(width * .8, height - 25);
          else await page.mouse.click(width * .8, height - 25);
        }
        if (scenario === "scroll" && i % 5 === 0) await page.evaluate(out => scrollTo({ top: document.body.scrollHeight - (out ? 1800 : 0), behavior: "instant" }), i % 10 === 0);
        await page.waitForTimeout(100);
      }
      const { profile } = await cdp.send("Profiler.stop");
      await writeFile(path.join(output, `${label}-${scenario}.cpuprofile`), JSON.stringify(profile));
      const data = await frame.evaluate(() => {
        const canvas = document.querySelector('#crimsontide-network, [data-testid="footer-terrain-mesh"]');
        return { samples: window.__terrainSamples, longTasks: window.__terrainLongTasks, callbacks: window.__terrainCallbacks, tier: canvas.dataset.quality ?? window.CrimsonTideNetwork?.params.columns, backing: [canvas.width, canvas.height] };
      });
      const sorted = data.samples.map(s => s.cost).sort((a, b) => a - b);
      const gaps = data.samples.slice(1).map((s, i) => s.start - data.samples[i].start).sort((a, b) => a - b);
      const p = (values, percentile) => values[Math.floor((values.length - 1) * percentile)] ?? null;
      findings.push({ label, scenario, frames: sorted.length, medianMs: p(sorted, .5), p95Ms: p(sorted, .95), gapMedianMs: p(gaps, .5), gapP95Ms: p(gaps, .95), ...Object.fromEntries(Object.entries(data).filter(([k]) => k !== "samples")), pageLongTasks: await page.evaluate(() => window.__terrainLongTasks) });
      console.log(`Profiled ${label} ${scenario}`);
      await writeFile(path.join(output, "profile.json"), JSON.stringify(findings, null, 2));
    }
    await context.close();
  }
  if (findings.length) await writeFile(path.join(output, "profile.json"), JSON.stringify(findings, null, 2));
} finally { await browser.close(); }
