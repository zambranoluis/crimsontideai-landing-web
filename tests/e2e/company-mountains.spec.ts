import { expect, test, type Locator } from "@playwright/test";
import { companyMountainInk, fallbackPaths } from "../../src/components/visuals/Mesh/presets";
import sharp from "sharp";

const captureStyle = 'header, a[href="#main-content"], nextjs-portal { visibility: hidden !important; } [data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }';

async function expectContentAnchoredBase(section: Locator) {
  const alignment = await section.evaluate(s => {
    const mesh = s.querySelector<HTMLCanvasElement>('[data-testid="company-mesh"]')!;
    const landmark = innerWidth < 768
      ? [...s.querySelectorAll('h3')].find(e => e.textContent === 'Proprietary technology')!.parentElement!.parentElement!
      : s.querySelector('a')!.parentElement!;
    // Reveal's visual translation must never move the decorative grid layer.
    const translation = new DOMMatrixReadOnly(getComputedStyle(landmark).transform).m42;
    return { base: mesh.getBoundingClientRect().bottom, landmark: landmark.getBoundingClientRect().bottom - translation };
  });
  expect(Math.abs(alignment.base - alignment.landmark)).toBeLessThan(1);
}

for (const mode of ["animated", "reduced", "no-js", "canvas-failure"] as const) {
  test(`Company mountain composition: ${mode}`, async ({ browser }, info) => {
    const context = await browser.newContext({
      ...info.project.use,
      javaScriptEnabled: mode !== "no-js",
      reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
    });
    if (mode === "canvas-failure") await context.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
        if (this.dataset.testid === "company-mesh") return null;
        return original.apply(this, args);
      } as typeof original;
    });
    const page = await context.newPage();
    await page.goto("http://localhost:3001/");
    const section = page.locator('section[aria-labelledby="company-heading"]');
    const canvas = page.getByTestId("company-mesh");
    await canvas.scrollIntoViewIfNeeded();
    const photo = page.getByTestId("company-image");
    await expect.poll(() => photo.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
    const fallback = section.locator('[data-mesh-fallback="company-mountains"]');
    await expect(fallback.locator("path").first()).toHaveAttribute("d", fallbackPaths("company-mountains").rows[0]);
    await expect(fallback.locator("path").first()).toHaveAttribute("stroke-opacity", String(companyMountainInk.row));
    expect(await canvas.boundingBox()).toEqual(await fallback.boundingBox());
    await expect(canvas.locator('..')).toHaveCSS('opacity', '0.55');
    await expect(canvas.locator('..')).toHaveCSS('pointer-events', 'none');
    expect(await canvas.evaluate(e => e.closest('[data-reveal]'))).toBeNull();
    await expectContentAnchoredBase(section);
    if (mode === "animated" || mode === "reduced") {
      await expect(canvas).toHaveAttribute("data-ready", "true");
      await expect(canvas).toHaveAttribute("data-running", String(mode === "animated"));
      await expect(fallback).toHaveCSS("visibility", "hidden");
    } else await expect(fallback).toBeVisible();

    const frame = () => canvas.evaluate(e => {
      const a = e.getBoundingClientRect(), b = e.closest("section")!.getBoundingClientRect();
      return [a.x - b.x, a.y - b.y, a.width, a.height].map(v => Math.round(v * 10) / 10);
    });
    const initial = await frame();
    for (const distance of [180, -360, 180]) {
      await page.evaluate(d => scrollBy({ top: d, behavior: "instant" }), distance);
      expect(await frame()).toEqual(initial);
      await expectContentAnchoredBase(section);
    }
    for (const content of await section.locator("[data-reveal]").all()) {
      await content.evaluate(e => scrollTo({ top: scrollY + e.getBoundingClientRect().top - innerHeight * .3, behavior: "instant" }));
      await expect(content).toBeVisible();
      await expect(content).toHaveCSS("opacity", "1");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
    await expect(section.getByRole("link", { name: "About CrimsonTide" })).toHaveAttribute("href", "/company#company-about");
    await canvas.scrollIntoViewIfNeeded();
    // Full-section evidence hides fixed navigation and exposes offscreen Reveal
    // content only for the capture; its real lifecycle is asserted above.
    await section.screenshot({
      path: `artifacts/company-mountains/${info.project.name}-${mode}.png`,
      style: captureStyle,
    });
    await context.close();
  });
}

test("narrow phones keep mountain summits below the longer main copy", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile-chromium", "Narrow touch layout coverage runs once.");
  await page.setViewportSize({ width: 360, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator('section[aria-labelledby="company-heading"]');
  await section.scrollIntoViewIfNeeded();
  const copy = section.locator("[data-reveal]").first().locator("p").last();
  const bottom = await copy.evaluate(e => e.getBoundingClientRect().bottom);
  const summit = await section.locator('[data-mesh-fallback="company-mountains"]').evaluate(svg => {
    const rect = svg.getBoundingClientRect();
    const crest = svg.querySelector("path")!.getBBox();
    return rect.top + crest.y / 800 * rect.height;
  });
  expect(summit).toBeGreaterThan(bottom + 8);
});

for (const [width, height] of [[1440, 1000], [1280, 800], [1024, 800], [768, 1024], [390, 844], [360, 740]]) {
  test(`open Company terrain and timed swell at ${width}px`, async ({ browser }, info) => {
    test.skip(info.project.name !== "desktop-chromium", "Explicit viewport matrix runs once.");
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 1024 });
    const page = await context.newPage();
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const canvas = page.getByTestId("company-mesh");
    const section = canvas.locator("xpath=ancestor::section[1]");
    await canvas.scrollIntoViewIfNeeded();
    await expect(canvas).toHaveAttribute("data-running", "true");
    await page.getByTestId("company-image").evaluate((e: HTMLImageElement) => e.decode());
    const bounds = await canvas.boundingBox();
    const protectedX = Math.ceil(width * (width >= 1024 ? .66 : .76));
    // No terrain can enter the protected city, even after pointer deformation.
    expect(bounds!.x + bounds!.width * .96).toBeLessThanOrEqual(protectedX);
    await expectContentAnchoredBase(section);
    const summit = await section.locator('[data-mesh-fallback="company-mountains"]').evaluate(svg => {
      const rect = svg.getBoundingClientRect();
      return rect.top + svg.querySelector('path')!.getBBox().y / 800 * rect.height;
    });
    const copyBottom = await section.locator('h2').locator('..').locator('p').last().evaluate(e =>
      e.getBoundingClientRect().bottom - new DOMMatrixReadOnly(getComputedStyle(e.parentElement!).transform).m42);
    expect(summit).toBeGreaterThan(copyBottom + 8);
    const first = await section.screenshot({ path: `artifacts/company-open/${width}-0s.png`, style: captureStyle });
    await page.waitForTimeout(3000);
    const second = await section.screenshot({ path: `artifacts/company-open/${width}-3s.png`, style: captureStyle });
    const a = await sharp(first).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(second).removeAlpha().raw().toBuffer();
    let changedTerrain = 0, changedCity = 0;
    for (let y = 0; y < a.info.height; y++) for (let x = 0; x < a.info.width; x++) {
      const i = (y * a.info.width + x) * 3;
      if (Math.max(Math.abs(a.data[i] - b[i]), Math.abs(a.data[i + 1] - b[i + 1]), Math.abs(a.data[i + 2] - b[i + 2])) < 8) continue;
      if (x >= protectedX) changedCity++; else changedTerrain++;
    }
    expect(changedTerrain).toBeGreaterThan(100);
    expect(changedCity).toBe(0);
    await context.close();
  });
}

test('Company mountain base follows wrapped content at mobile, tablet and desktop sizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="company-heading"]');
  await section.scrollIntoViewIfNeeded();
  const mesh = page.getByTestId('company-mesh');
  await expectContentAnchoredBase(section);
  const before = await mesh.boundingBox();
  // Grow the real content's line boxes without changing the approved copy.
  await section.locator('h3').evaluateAll(headings => headings.forEach(e => { e.style.lineHeight = '3'; }));
  await expectContentAnchoredBase(section);
  const after = await mesh.boundingBox();
  expect(after!.y + after!.height).toBeGreaterThan(before!.y + before!.height + 20);
  expect(after!.height).toBe(before!.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test("Company CTA is reachable by keyboard and opens the company route at the top", async ({ page }) => {
  await page.goto("/");
  const section = page.locator('section[aria-labelledby="company-heading"]');
  const action = section.getByRole("link", { name: "About CrimsonTide" });
  await action.scrollIntoViewIfNeeded();
  await action.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(action).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/company$/);
  await expect(page.locator("main h1")).toBeInViewport();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});
