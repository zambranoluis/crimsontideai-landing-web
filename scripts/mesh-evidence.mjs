import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cpus, release } from "node:os";

// Same instrumented production-page workload before and after. No CI timing assertions.
const output = path.resolve(process.argv[2] ?? "test-results/mesh-evidence");
const profileOnly = process.argv.includes("--profile-only");
const captureOnly = process.argv.includes("--capture-only");
const quick = process.argv.includes("--quick");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
await writeFile(path.join(output, "environment.json"), JSON.stringify({
  browser: browser.version(), node: process.version, platform: process.platform, osRelease: release(),
  cpu: cpus()[0]?.model, logicalCpus: cpus().length, physicalMobileDevices: false,
}, null, 2));
const variants = ["home", "openjm", "sentinel"];
async function position(page, variant) {
  await page.goto(`http://localhost:3001${variant === "home" ? "/" : `/products#products-${variant}`}`);
  await page.evaluate(() => document.fonts.ready);
  if (variant !== "home") await page.locator(`#products-${variant}`).evaluate(e => scrollTo({ top: scrollY + e.getBoundingClientRect().top - 100, behavior: "instant" }));
}
try {
  if (!profileOnly) for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [360, 740]]) {
    for (const variant of variants) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1024, isMobile: width < 768 });
      const page = await context.newPage();
      // A paused browser clock makes ripple age and animation phases reproducible too.
      await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
      await page.clock.pauseAt(new Date("2026-01-01T00:00:00Z"));
      await position(page, variant);
      await page.clock.runFor(1600);
      // Hydration can change product scene heights; align again after it has settled.
      if (variant !== "home") await page.locator(`#products-${variant}`).evaluate(e => scrollTo({ top: scrollY + e.getBoundingClientRect().top - 100, behavior: "instant" }));
      await page.screenshot({ path: path.join(output, `${variant}-${width}-phase-1600.png`) });
      await page.clock.runFor(1000);
      await page.screenshot({ path: path.join(output, `${variant}-${width}-ambient.png`) });
      const point = { x: width * .95, y: height * .85 };
      if (width >= 1024) await page.mouse.move(point.x, point.y);
      else await page.touchscreen.tap(point.x, point.y);
      await page.clock.runFor(300);

      await page.screenshot({ path: path.join(output, `${variant}-${width}-interaction.png`) });
      if (width >= 1024) {
        await page.mouse.click(point.x, point.y);
        await page.clock.runFor(300);
        await page.screenshot({ path: path.join(output, `${variant}-${width}-ripple.png`) });
      }
      await page.mouse.move(0, 0);
      await page.clock.runFor(1500);
      await page.screenshot({ path: path.join(output, `${variant}-${width}-recovered.png`) });
      if (variant === "home") {
        await page.evaluate(() => scrollTo({ top: 180, behavior: "instant" }));
        await page.clock.runFor(300);
        await page.screenshot({ path: path.join(output, `${variant}-${width}-transformed.png`) });
      }
      await context.close();
      console.log(`Captured ${variant} ${width}x${height}`);
    }
  }
  const findings = [];
  if (!captureOnly) for (const [label, width, height, rate] of [["desktop", 1440, 900, 1], ["desktop-4x", 1440, 900, 4], ["mobile-4x", 390, 844, 4]]) {
    if (quick && label !== "desktop") continue;
    for (const variant of variants) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1024, isMobile: width < 768 });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate });
      await page.addInitScript(() => {
        window.__meshSamples = []; window.__meshLongTasks = [];
        new PerformanceObserver(list => window.__meshLongTasks.push(...list.getEntries().map(e => e.duration))).observe({ type: "longtask", buffered: false });
        const pending = new Map();
        const proto = CanvasRenderingContext2D.prototype;
        for (const method of ["clearRect", "fill", "stroke", "drawImage"]) {
          const original = proto[method];
          proto[method] = function (...args) {
            const id = this.canvas.dataset.testid;
            if (!id?.includes("mesh")) return original.apply(this, args);
            if (method === "clearRect") pending.set(id, { id, start: performance.now() });
            const result = original.apply(this, args);
            if (pending.has(id)) pending.get(id).end = performance.now();
            return result;
          };
        }
        const raf = requestAnimationFrame;
        window.requestAnimationFrame = callback => raf(time => {
          callback(time);
          for (const sample of pending.values()) window.__meshSamples.push({ ...sample, cost: sample.end - sample.start });
          pending.clear();
        });
      });
      await position(page, variant);
      await page.waitForTimeout(1200);
      if (variant !== "home") await page.locator(`#products-${variant}`).evaluate(e => scrollTo({ top: scrollY + e.getBoundingClientRect().top - 100, behavior: "instant" }));
      await page.waitForTimeout(300);
      for (const scenario of ["idle", "pointer", "taps", "scroll"]) {
        if (quick && scenario !== "idle") continue;
        await page.evaluate(() => { window.__meshSamples = []; window.__meshLongTasks = []; });
        await cdp.send("Profiler.enable"); await cdp.send("Profiler.start");
        for (let i = 0; i < 30; i++) {
          if (scenario === "pointer") await page.mouse.move(width * (.65 + .15 * Math.sin(i)), height * .65);
          if (scenario === "taps" && i % 3 === 0) {
            if (width < 1024) await page.touchscreen.tap(width * .95, height * .85);
            else await page.mouse.click(width * .95, height * .85);
          }
          if (scenario === "scroll") await page.evaluate(delta => scrollBy({ top: delta, behavior: "instant" }), i % 2 ? -30 : 30);
          await page.waitForTimeout(100);
        }
        const { profile } = await cdp.send("Profiler.stop");
        await writeFile(path.join(output, `${label}-${variant}-${scenario}.cpuprofile`), JSON.stringify(profile));
        const data = await page.evaluate(id => {
          const canvas = document.querySelector(`[data-testid="${id}"]`);
          const rect = canvas.getBoundingClientRect();
          return { samples: window.__meshSamples.filter(s => s.id === id), longTasks: window.__meshLongTasks, tier: canvas.dataset.quality,
            bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, backing: { width: canvas.width, height: canvas.height },
            targetSection: document.elementFromPoint(innerWidth * .95, innerHeight * .85)?.closest("section")?.getAttribute("aria-labelledby") };
        }, variant === "home" ? "hero-mesh" : `products-mesh-${variant}`);
        const sorted = data.samples.map(s => s.cost).sort((a, b) => a - b);
        const gaps = data.samples.slice(1).map((s, i) => s.start - data.samples[i].start).sort((a, b) => a - b);
        const percentile = (values, p) => values[Math.floor((values.length - 1) * p)] ?? null;
        findings.push({ label, variant, scenario, frames: sorted.length, medianMs: percentile(sorted, .5), p95Ms: percentile(sorted, .95), gapP95Ms: percentile(gaps, .95), longTasks: data.longTasks, tier: data.tier ?? "original", bounds: data.bounds, backing: data.backing, targetSection: data.targetSection });
      }
      await context.close();
      console.log(`Profiled ${label} ${variant}`);
    }
  }
  if (findings.length) await writeFile(path.join(output, "profile.json"), JSON.stringify(findings, null, 2));
} finally { await browser.close(); }

