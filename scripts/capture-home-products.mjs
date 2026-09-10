import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

// Local evidence only. Run against the existing server: node scripts/capture-home-products.mjs
const output = path.resolve(process.argv.slice(2).find(argument => !argument.startsWith("--")) ?? path.join(tmpdir(), "crimsontide-home-products"));
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const findings = [];
const sizes = [[1440, 900], [1366, 768], [1280, 800], [1024, 768], [768, 1024], [390, 844], [360, 740]];

async function jump(page, top) {
  await page.evaluate(top => scrollTo({ top, behavior: "instant" }), top);
  await page.waitForTimeout(850);
}

try {
  for (const [width, height] of (process.argv.includes("--scroll-only") ? [] : sizes)) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1024, isMobile: width < 768 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["/", "/products"]) {
      const name = route === "/" ? "home" : "products";
      await page.goto(`http://localhost:3000${route}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(900);
      await page.screenshot({ path: path.join(output, `after-${name}-${width}-initial.png`) });
      if (route === "/") {
        for (const progress of [.25, .65, 1]) {
          const top = await page.locator("[data-case-scene]").evaluate((e, progress) => scrollY + e.getBoundingClientRect().top - innerHeight * (.8 - progress * .5) + 2, progress);
          await jump(page, top);
          await page.screenshot({ path: path.join(output, `after-case-${width}-${progress}.png`) });
        }
      } else {
        for (const product of ["openjm", "sentinel"]) {
          const scene = page.getByTestId(`${product}-scene`);
          const enabled = await scene.getAttribute("data-scene-enabled") === "true";
          for (let index = 0; index < (enabled ? 3 : 1); index++) {
            const top = enabled ? await scene.locator("[data-feature-step]").nth(index).evaluate(e => {
              const rect = e.getBoundingClientRect();
              const header = document.querySelector("header").getBoundingClientRect().height;
              return scrollY + rect.top + rect.height / 2 - (header + (innerHeight - header) / 2) + 3;
            }) : await scene.evaluate(e => scrollY + e.getBoundingClientRect().top - 112);
            await jump(page, top);
            await page.screenshot({ path: path.join(output, `after-${product}-${width}-step-${enabled ? index : "flow"}.png`) });
          }
        }
      }
      await jump(page, await page.evaluate(() => document.body.scrollHeight));
      await jump(page, 0);
      await page.screenshot({ path: path.join(output, `after-${name}-${width}-full.png`), fullPage: true });
      findings.push({ route, width, height, overflow: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), errors: [...errors] });
      console.log(`Captured ${name} ${width}x${height}`);
    }
    await context.close();
  }
  if (findings.length) await writeFile(path.join(output, "capture-findings.json"), JSON.stringify(findings, null, 2));
  // Keep recording separate from full-page screenshots, which temporarily resize Chromium.
  const passes = [];
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    for (const route of ["/", "/products"]) {
      const name = route === "/" ? "home" : "products";
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1024, isMobile: width < 768,
        recordVideo: { dir: path.join(output, "after-video"), size: { width, height } } });
      const page = await context.newPage();
      const started = Date.now();
      await page.goto(`http://localhost:3000${route}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(900);
      const bottom = await page.evaluate(() => document.documentElement.scrollHeight);
      const times = { normal: (Date.now() - started) / 1000 };
      for (let y = 0; y < bottom; y += 180) { await page.mouse.wheel(0, 180); await page.waitForTimeout(350); }
      times.fast = (Date.now() - started) / 1000;
      await jump(page, 0);
      await jump(page, bottom);
      times.reverse = (Date.now() - started) / 1000;
      for (let y = bottom; y > 0; y -= 450) { await page.mouse.wheel(0, -450); await page.waitForTimeout(250); }
      await page.waitForTimeout(900);
      const video = page.video();
      await context.close();
      const file = `after-${name}-scroll-${width}.webm`;
      await video.saveAs(path.join(output, file));
      passes.push({ file, route, width, height, seconds: times });
      console.log(`Recorded ${name} ${width}: normal, fast, reverse`);
    }
  }
  await writeFile(path.join(output, "scroll-passes.json"), JSON.stringify(passes, null, 2));
  console.log(output);
} finally {
  await browser.close();
}
