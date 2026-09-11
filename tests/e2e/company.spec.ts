import { expect, test, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { morphState } from "../../src/app/company/_components/particles";

async function scrollToProgress(page: Page, progress: number) {
  await page.getByTestId("company-particles").evaluate((element, target) => {
    const rect = element.getBoundingClientRect();
    scrollTo({ top: scrollY + rect.top - innerHeight * .85 + target * (rect.height + innerHeight * .6), behavior: "instant" });
  }, progress);
  await expect.poll(async () => Number(await page.getByTestId("company-particles").getAttribute("data-progress"))).toBeCloseTo(progress, 2);
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
async function decoded(page: Page) {
  await expect.poll(() => page.locator("main img").evaluateAll(images => images.every(image => {
    const img = image as HTMLImageElement;
    return img.complete && img.naturalWidth > 0;
  }))).toBe(true);
}

test("Company scroll shapes follow forward, reverse and fast jumps", async ({ page }, testInfo) => {
  await page.goto("/company");
  const artwork = page.getByTestId("company-particles");
  for (const [progress, shape] of [[0, "brain"], [.5, "gear"], [1, "bulb"], [.5, "gear"], [0, "brain"], [1, "bulb"], [.25, "transition"]] as const) {
    await scrollToProgress(page, progress);
    await expect(artwork).toHaveAttribute("data-shape", shape);
    await expect(artwork).toHaveAttribute("data-ready", "true");
    await expect(artwork.locator("canvas")).toHaveCSS("opacity", "1");
    // Locator screenshots scroll the artwork to center, changing the very state
    // being captured. Export its actual canvas without moving the viewport.
    if (shape !== "transition") {
      const pixels = await artwork.locator("canvas").evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL().split(",")[1]);
      await writeFile(testInfo.outputPath(`${shape}.png`), Buffer.from(pixels, "base64"));
      expect(await artwork.locator("canvas").evaluate(element => {
        const canvas = element as HTMLCanvasElement;
        const { width, height } = canvas;
        const data = canvas.getContext("2d")!.getImageData(0, 0, width, height).data;
        for (let x = 0; x < width; x++) if (data[x * 4 + 3] || data[((height - 1) * width + x) * 4 + 3]) return false;
        for (let y = 0; y < height; y++) if (data[y * width * 4 + 3] || data[(y * width + width - 1) * 4 + 3]) return false;
        return true;
      })).toBe(true);
    }
  }
  const before = await artwork.getAttribute("data-particles");
  expect(Number(before)).toBeLessThanOrEqual(1800);
  await page.setViewportSize({ width: 360, height: 760 });
  await scrollToProgress(page, .5);
  await expect(artwork).toHaveAttribute("data-particles", "900");
  expect(await artwork.locator("canvas").evaluate(canvas => Math.max((canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height))).toBeLessThanOrEqual(1200);
  await noOverflow(page);
});

test("Company lifecycle pauses frames and resumes preferences and history", async ({ page }) => {
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.parentElement?.getAttribute("data-testid") === "company-particles") {
        this.canvas.dataset.draws = String(Number(this.canvas.dataset.draws ?? 0) + 1);
      }
      return original.apply(this, args);
    };
  });
  await page.goto("/company");
  const artwork = page.getByTestId("company-particles"), canvas = artwork.locator("canvas");
  await scrollToProgress(page, .5);
  await expect(artwork).toHaveAttribute("data-motion", "running");
  const draws = Number(await canvas.getAttribute("data-draws"));
  await expect.poll(async () => Number(await canvas.getAttribute("data-draws"))).toBeGreaterThan(draws);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(artwork).toHaveAttribute("data-motion", "paused");
  const paused = await canvas.getAttribute("data-draws");
  await page.waitForTimeout(180);
  expect(await canvas.getAttribute("data-draws")).toBe(paused);
  await scrollToProgress(page, .5);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(artwork).toHaveAttribute("data-motion", "paused");
  const hidden = await canvas.getAttribute("data-draws");
  await page.waitForTimeout(180);
  expect(await canvas.getAttribute("data-draws")).toBe(hidden);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: false }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(artwork).toHaveAttribute("data-motion", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(artwork.locator("img")).toBeVisible();
  await expect(canvas).toBeHidden();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(artwork).toHaveAttribute("data-motion", "running");
  await scrollToProgress(page, .5);
  const position = await page.evaluate(() => scrollY);
  await page.goto("/contact");
  await page.goBack();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, 0);
  await expect(artwork).toHaveAttribute("data-shape", "gear");
});

test("Company radar alignment, wave timing and suspension", async ({ page }) => {
  await page.goto("/company");
  const radar = page.getByTestId("company-radar");
  await radar.scrollIntoViewIfNeeded();
  await expect(radar).toHaveAttribute("data-motion", "running");
  const wave = radar.locator('circle[class*="wave"]').first();
  await expect(wave).toHaveCSS("animation-duration", "6.8s");
  await expect(wave).toHaveCSS("animation-play-state", "running");
  const alignment = await radar.evaluate(element => {
    const image = element.querySelector("img")!.getBoundingClientRect();
    const svg = element.querySelector("svg")!.getBoundingClientRect();
    return Math.abs(image.x - svg.x) + Math.abs(image.y - svg.y) + Math.abs(image.width - svg.width) + Math.abs(image.height - svg.height);
  });
  expect(alignment).toBeLessThan(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(wave).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(radar).toHaveAttribute("data-motion", "paused");
  await expect(wave).toHaveCSS("animation-play-state", "paused");
});

test("Company anchor, focus, contact and mobile menu remain usable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/company");
  const discover = page.getByRole("link", { name: "Discover CrimsonTide" });
  await discover.focus();
  await expect(discover).toBeFocused();
  await expect(discover).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#company-about$/);
  await expect.poll(() => page.locator("#company-about").evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThan(80);
  const bounds = await page.locator("#company-about").evaluate(el => ({ top: el.getBoundingClientRect().top, header: document.querySelector("header")!.getBoundingClientRect().bottom }));
  expect(bounds.top).toBeGreaterThanOrEqual(bounds.header - 1);
  await expect(page.getByRole("heading", { name: "We build technology to take ideas beyond intention." })).toBeVisible();
  const closing = page.locator('section[aria-labelledby="company-closing"]');
  await closing.getByRole("link", { name: "Contact CrimsonTide" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await page.goto("/company");
  const menu = page.getByRole("button", { name: /menu/i });
  if (await menu.isVisible()) {
    await menu.click();
    await page.locator("header").getByRole("link", { name: "Contact CrimsonTide" }).click();
    await expect(page).toHaveURL(/\/contact$/);
  }
  expect(errors).toEqual([]);
});

test("Company remains readable with no JavaScript and unavailable canvas", async ({ browser, baseURL, page: configuredPage }) => {
  const viewport = configuredPage.viewportSize()!;
  const context = await browser.newContext({ javaScriptEnabled: false, viewport });
  const page = await context.newPage();
  await page.goto(`${baseURL}/company`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("company-particles").locator("img")).toBeVisible();
  await expect(page.locator("#company-about h3")).toHaveCount(3);
  await page.getByTestId("company-radar").scrollIntoViewIfNeeded();
  await decoded(page);
  await expect(page.getByTestId("company-radar").locator("img")).toBeVisible();
  await noOverflow(page);
  await context.close();
  const fallback = await browser.newPage({ viewport });
  await fallback.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await fallback.goto(`${baseURL}/company`);
  await expect(fallback.getByTestId("company-particles").locator("img")).toBeVisible();
  await fallback.close();
});

test("Company images decode under constrained loading and narrow/zoom layouts", async ({ page }) => {
  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 200 * 1024, uploadThroughput: 100 * 1024 });
  await page.goto("/company");
  await page.getByTestId("company-radar").scrollIntoViewIfNeeded();
  await decoded(page);
  await client.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await page.setViewportSize({ width: 320, height: 740 });
  await noOverflow(page);
  await expect(page.locator("#company-jamaica li")).toHaveCount(4);
  // Browser 200% zoom on a 1280x800 display yields a 640x400 CSS viewport.
  // CSS zoom alone does not change media queries and is not browser zoom.
  await page.setViewportSize({ width: 640, height: 400 });
  await noOverflow(page);
  await expect(page.locator('section[aria-labelledby="company-closing"] a')).toBeVisible();
});

test("Company morph holds use the supplied three silhouettes", () => {
  expect(morphState(0)).toEqual({ segment: 0, blend: 0 });
  expect(morphState(.5)).toEqual({ segment: 1, blend: 0 });
  expect(morphState(1)).toEqual({ segment: 1, blend: 1 });
  expect(morphState(.25).blend).toBeCloseTo(.5);
  expect(morphState(.75).blend).toBeCloseTo(.5);
});

test("Company direct fragments, reveal re-entry, static hero and unmount cleanup", async ({ page }) => {
  await page.goto("/company#company-about");
  const artwork = page.getByTestId("company-particles");
  await expect(artwork).toHaveAttribute("data-progress", /\d/);
  await expect(page.locator("#company-about h2")).toBeVisible();
  const heroImage = page.locator('section[aria-labelledby="company-heading"] img');
  await expect(heroImage).toHaveCSS("transform", "none");
  await expect(heroImage).toHaveCSS("opacity", "1");
  const principle = page.locator("#company-about h3").first().locator("..");
  await principle.scrollIntoViewIfNeeded();
  await expect(principle).toHaveAttribute("data-reveal", "revealed");
  await page.getByTestId("company-radar").scrollIntoViewIfNeeded();
  await expect(principle).toHaveAttribute("data-reveal", "hidden");
  await principle.scrollIntoViewIfNeeded();
  await expect(principle).toHaveAttribute("data-reveal", "revealed");
  await scrollToProgress(page, .5);
  const detachedCanvas = await artwork.locator("canvas").elementHandle();
  await page.evaluate(() => (document.querySelector('header a[href="/contact"]') as HTMLAnchorElement).click());
  await expect(page).toHaveURL(/\/contact$/);
  expect(await detachedCanvas!.evaluate(canvas => canvas.isConnected)).toBe(false);
  await page.waitForTimeout(120);
  // Effect cleanup clears the ready flag on the detached artwork.
  expect(await detachedCanvas!.evaluate(canvas => canvas.parentElement?.dataset.ready)).toBeUndefined();
});
