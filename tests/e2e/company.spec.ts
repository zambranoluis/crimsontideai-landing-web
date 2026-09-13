import { expect, test, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { morphState } from "../../src/app/company/_components/particles";

async function scrollToProgress(page: Page, progress: number) {
  await expect(page.getByTestId("company-particles")).toHaveAttribute("data-progress", /\d/);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  await page.getByTestId("company-particles").evaluate((element, target) => {
    const track = element.closest<HTMLElement>("#company-about")!;
    if (track.dataset.mode === "artwork-only") {
      const stationary = element.closest<HTMLElement>("[data-company-artwork-track]")!;
      const top = parseFloat(stationary.style.getPropertyValue("--pin-top"));
      const distance = stationary.getBoundingClientRect().height - element.getBoundingClientRect().height;
      scrollTo({ top: scrollY + stationary.getBoundingClientRect().top - top + target * distance, behavior: "instant" });
      return;
    }
    if (track.dataset.pinned === "true") {
      const height = track.querySelector("[data-company-scene]")!.getBoundingClientRect().height;
      const header = document.querySelector("header")!.getBoundingClientRect().height;
      scrollTo({ top: scrollY + track.getBoundingClientRect().top - innerHeight + height + target * (innerHeight - header) * 2.5, behavior: "instant" });
      return;
    }
    const rect = element.getBoundingClientRect();
    scrollTo({ top: scrollY + rect.top - innerHeight * .85 + target * (rect.height + innerHeight * .6), behavior: "instant" });
  }, progress);
  await expect.poll(async () => Number(await page.getByTestId("company-particles").getAttribute("data-progress"))).toBeCloseTo(Math.max(0, Math.min(1, progress)), 2);
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
  await scrollToProgress(page, .5);
  await expect(artwork).toHaveAttribute("data-motion", "running");
  await scrollToProgress(page, .5);
  const position = await page.evaluate(() => scrollY);
  await page.goto("/contact");
  await page.goBack();
  await expect(artwork).toHaveAttribute("data-progress", /\d/);
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, 0);
  await expect(artwork).toHaveAttribute("data-shape", "gear");
  await page.reload();
  await expect(artwork).toHaveAttribute("data-shape", "gear");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, 0);
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
  await page.locator('[aria-labelledby="company-closing"]').scrollIntoViewIfNeeded();
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
  await expect(page).toHaveURL(/\/company$/);
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
  await expect(page.locator("[data-company-artwork-track]")).toHaveCSS("height", await page.getByTestId("company-particles").evaluate(element => matchMedia("(max-width: 1024px), (pointer: coarse)").matches ? `${element.getBoundingClientRect().height}px` : "auto"));
  expect(await page.locator("#company-about").evaluate(element => element.getBoundingClientRect().height - element.firstElementChild!.getBoundingClientRect().height)).toBeCloseTo(0);
  await page.getByTestId("company-radar").scrollIntoViewIfNeeded();
  await page.locator('[aria-labelledby="company-closing"]').scrollIntoViewIfNeeded();
  await decoded(page);
  await expect(page.getByTestId("company-radar").locator("img")).toBeVisible();
  await noOverflow(page);
  await context.close();
  const fallback = await browser.newPage({ viewport });
  await fallback.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await fallback.goto(`${baseURL}/company`);
  await expect(fallback.getByTestId("company-particles").locator("img")).toBeVisible();
  expect(await fallback.locator("[data-company-artwork-track]").evaluate(element => element.getAttribute("style"))).toBeNull();
  expect(await fallback.locator("#company-about").evaluate(element => element.getBoundingClientRect().height - element.firstElementChild!.getBoundingClientRect().height)).toBeCloseTo(0);
  await fallback.close();
});

test("Company images decode under constrained loading and narrow/zoom layouts", async ({ page }) => {
  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 200 * 1024, uploadThroughput: 100 * 1024 });
  await page.goto("/company");
  await page.getByTestId("company-radar").scrollIntoViewIfNeeded();
  await page.locator('[aria-labelledby="company-closing"]').scrollIntoViewIfNeeded();
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
  expect(morphState(.12)).toEqual({ segment: 0, blend: 0 });
  expect(morphState(.42).blend).toBeCloseTo(1);
  expect(morphState(.58)).toEqual({ segment: 1, blend: 0 });
  expect(morphState(.88).blend).toBeCloseTo(1);
  expect(morphState(.27).blend).toBeCloseTo(.5);
  expect(morphState(.73).blend).toBeCloseTo(.5);
});

test("Company direct fragments, reveal re-entry, static framing and unmount cleanup", async ({ page }) => {
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
  const detachedTrack = await page.locator("#company-about").elementHandle();
  const detachedArtworkTrack = await page.locator("[data-company-artwork-track]").elementHandle();
  await page.evaluate(() => (document.querySelector('header a[href="/contact"]') as HTMLAnchorElement).click());
  await expect(page).toHaveURL(/\/contact$/);
  expect(await detachedCanvas!.evaluate(canvas => canvas.isConnected)).toBe(false);
  await page.waitForTimeout(120);
  // Effect cleanup clears the ready flag on the detached artwork.
  expect(await detachedCanvas!.evaluate(canvas => canvas.parentElement?.dataset.ready)).toBeUndefined();
  expect(await detachedArtworkTrack!.evaluate(track => ({ pinned: track.dataset.pinned, styles: track.getAttribute("style") }))).toEqual({ pinned: undefined, styles: "" });
  expect(await detachedTrack!.evaluate(track => ({ pinned: track.dataset.pinned, height: track.style.getPropertyValue("--track-height") }))).toEqual({ pinned: undefined, height: "" });
});

test("Company holds the complete scene for 2.5 usable viewports then releases", async ({ page }) => {
  test.skip(page.viewportSize()!.width <= 1024, "Pinning is a desktop enhancement.");
  await page.goto("/company");
  await page.evaluate(() => document.fonts.ready);
  const track = page.locator("#company-about");
  await expect(track).toHaveAttribute("data-pinned", "true");
  const layout = await track.evaluate(element => {
    const scene = element.querySelector("[data-company-scene]")!.getBoundingClientRect();
    const header = document.querySelector("header")!.getBoundingClientRect().height;
    return { height: innerHeight, header, sceneHeight: scene.height, trackHeight: element.getBoundingClientRect().height };
  });
  expect(layout.trackHeight - layout.sceneHeight).toBeCloseTo((layout.height - layout.header) * 2.5, 1);
  let positions: number[] | undefined;
  for (const progress of [.01, .10, .27, .50, .73, .90, .99, .73, .50, .27, .01, .99]) {
    await scrollToProgress(page, progress);
    await expect(page.locator("#company-about [data-reveal]").first()).toHaveCSS("opacity", "1");
    for (const card of await page.locator("#company-about h3").all()) {
      await expect(card.locator("..")).toHaveCSS("opacity", "1");
      await expect(card.locator("..")).toHaveCSS("transform", "none");
    }
    const bounds = await track.evaluate(element => [...element.querySelectorAll("h2, p, h3, canvas")].map(child => {
      const rect = child.getBoundingClientRect();
      return [rect.top, rect.bottom];
    }).flat());
    expect(Math.min(...bounds)).toBeGreaterThanOrEqual(layout.header);
    expect(Math.max(...bounds)).toBeLessThanOrEqual(layout.height);
    if (positions) bounds.forEach((value, index) => expect(value).toBeCloseTo(positions![index], 0));
    else positions = bounds;
  }
  await scrollToProgress(page, 1.1);
  const releasedTop = await page.locator("[data-company-scene]").evaluate(element => element.getBoundingClientRect().top);
  expect(releasedTop).toBeCloseTo(layout.height - layout.sceneHeight - (layout.height - layout.header) * .25, 0);
  await expect(page.locator("#company-jamaica")).toBeInViewport();
  // A changed header or expanded scene must invalidate a previously valid fit.
  await page.locator("header").evaluate(element => { element.style.height = "300px"; });
  await expect(track).toHaveAttribute("data-pinned", "false");
  await page.locator("header").evaluate(element => { element.style.removeProperty("height"); });
  await expect(track).toHaveAttribute("data-pinned", "true");
  await page.locator("[data-company-scene]").evaluate(element => { (element as HTMLElement).style.paddingBottom = "400px"; });
  await expect(track).toHaveAttribute("data-pinned", "false");
  await page.locator("[data-company-scene]").evaluate(element => { (element as HTMLElement).style.removeProperty("padding-bottom"); });
  await expect(track).toHaveAttribute("data-pinned", "true");
});

test("Company fallback layouts have no added scroll track", async ({ page }) => {
  await page.goto("/company");
  const track = page.locator("#company-about");
  for (const viewport of [{ width: 390, height: 370 }, { width: 768, height: 370 }, { width: 1280, height: 370 }]) {
    await page.setViewportSize(viewport);
    await expect(track).toHaveAttribute("data-mode", "normal-flow");
    await expect(page.locator("[data-company-artwork-track]")).toHaveAttribute("data-pinned", "false");
    expect(await track.evaluate(element => element.getBoundingClientRect().height - element.firstElementChild!.getBoundingClientRect().height)).toBeCloseTo(0);
    await noOverflow(page);
  }
  await page.setViewportSize({ width: 1366, height: 768 });
  await expect(track).toHaveAttribute("data-pinned", await page.evaluate(() => matchMedia("(pointer: fine)").matches) ? "true" : "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(track).toHaveAttribute("data-mode", "normal-flow");
  await expect(page.locator("[data-company-artwork-track]")).toHaveAttribute("data-pinned", "false");
  expect(await track.evaluate(element => element.getBoundingClientRect().height - element.firstElementChild!.getBoundingClientRect().height)).toBeCloseTo(0);
});

test("Company canvas context loss releases the scene and preserves static content", async ({ page }) => {
  await page.goto("/company");
  await scrollToProgress(page, .5);
  const artwork = page.getByTestId("company-particles");
  await artwork.locator("canvas").dispatchEvent("contextlost");
  await expect(page.locator("#company-about")).toHaveAttribute("data-pinned", "false");
  await expect(artwork.locator("img")).toBeVisible();
  await expect(page.locator("[data-company-artwork-track]")).toHaveAttribute("data-pinned", "false");
  expect(await page.locator("#company-about").evaluate(element => element.getBoundingClientRect().height - element.firstElementChild!.getBoundingClientRect().height)).toBeCloseTo(0);
});

test("Company artwork swap preserves decoration, preload and hero CTA visibility", async ({ page }) => {
  await page.goto("/company");
  const hero = page.locator('[aria-labelledby="company-heading"]');
  const closing = page.locator('[aria-labelledby="company-closing"]');
  await expect(hero.getByTestId("company-radar")).toHaveCount(1);
  await expect(hero.locator("img")).toHaveAttribute("alt", "");
  await expect(closing.locator("img")).toHaveAttribute("src", /company-hero/);
  await expect(closing.locator("img")).toHaveAttribute("loading", "lazy");
  await expect(page.locator('link[rel="preload"][as="image"][imagesrcset*="company-radar"]')).toHaveCount(1);
  await expect(page.locator('link[rel="preload"][as="image"][imagesrcset*="company-hero"]')).toHaveCount(0);
  await expect(hero.getByRole("link", { name: "Discover CrimsonTide" })).toBeInViewport();
  await expect.poll(() => hero.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
});

test("Company direct Jamaica fragment stays aligned after hydration", async ({ page }) => {
  await page.goto("/company#company-jamaica");
  await expect(page.getByTestId("company-particles")).toHaveAttribute("data-progress", /\d/);
  await page.evaluate(() => document.fonts.ready);
  const gap = () => page.locator("#company-jamaica").evaluate(element => element.getBoundingClientRect().top - document.querySelector("header")!.getBoundingClientRect().height);
  await expect.poll(gap).toBeGreaterThanOrEqual(0);
  await expect.poll(gap).toBeLessThanOrEqual(32);
  await expect(page.locator("#company-jamaica h2")).toBeInViewport();
});

test("Company tall desktop reveals every principle throughout the hold", async ({ page }, testInfo) => {
  test.skip(page.viewportSize()!.width <= 1024, "Fine-pointer desktop coverage.");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/company");
  for (const progress of [.01, .5, .99, .5]) {
    await scrollToProgress(page, progress);
    await expect(page.locator("#company-about")).toHaveAttribute("data-pinned", "true");
    for (const card of await page.locator("#company-about h3").all()) {
      await expect(card.locator("..")).toHaveCSS("opacity", "1");
      await expect(card.locator("..")).toHaveCSS("transform", "none");
      await expect(card).toBeInViewport();
    }
  }
  await page.screenshot({ path: testInfo.outputPath("tall-desktop-hold.png") });
});


test("Company responsive artwork stays centered through holds and releases clear of copy", async ({ page }) => {
  await page.goto("/company");
  const artwork = page.getByTestId("company-particles");
  const track = page.locator("[data-company-artwork-track]");
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 820, height: 1180 }, { width: 1024, height: 1366 }, { width: 1023, height: 768 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    await expect(page.locator("#company-about")).toHaveAttribute("data-mode", "artwork-only");
    await scrollToProgress(page, -.1);
    await expect(artwork).toHaveAttribute("data-shape", "brain");
    const geometry = await track.evaluate(element => {
      const art = element.firstElementChild!.getBoundingClientRect();
      const header = document.querySelector("header")!.getBoundingClientRect().height;
      return { height: art.height, usable: innerHeight - header, center: header + (innerHeight - header) / 2, distance: element.getBoundingClientRect().height - art.height };
    });
    expect(geometry.distance).toBeCloseTo(geometry.usable * 2.5, 1);
    expect(geometry.height).toBeLessThanOrEqual(geometry.usable - 48);
    for (const [progress, shape] of [[.01, "brain"], [.10, "brain"], [.27, "transition"], [.50, "gear"], [.73, "transition"], [.90, "bulb"], [.99, "bulb"], [.5, "gear"], [.01, "brain"], [.99, "bulb"]] as const) {
      await scrollToProgress(page, progress);
      await expect(artwork).toHaveAttribute("data-shape", shape);
      const box = await artwork.boundingBox();
      expect(box!.y + box!.height / 2).toBeCloseTo(geometry.center, 0);
      const copy = await page.locator("#company-about").evaluate(element => ({
        introBottom: element.querySelector("[data-reveal]")!.getBoundingClientRect().bottom,
        principlesTop: element.querySelector("h3")!.parentElement!.getBoundingClientRect().top,
      }));
      expect(copy.introBottom).toBeLessThan(box!.y);
      expect(copy.principlesTop).toBeGreaterThan(box!.y + box!.height);
    }
    await scrollToProgress(page, 1.1);
    const released = await artwork.boundingBox();
    expect(released!.y + released!.height / 2).toBeCloseTo(geometry.center - geometry.distance * .1, 0);
    await noOverflow(page);
  }
  if (await page.evaluate(() => matchMedia("(pointer: coarse)").matches)) {
    for (const viewport of [{ width: 1180, height: 820 }, { width: 1366, height: 1024 }]) {
      await page.setViewportSize(viewport);
      await expect(page.locator("#company-about")).toHaveAttribute("data-mode", "artwork-only");
      await scrollToProgress(page, .5);
      const box = await artwork.boundingBox();
      const center = await page.locator("header").evaluate(element => (innerHeight + element.getBoundingClientRect().height) / 2);
      expect(box!.y + box!.height / 2).toBeCloseTo(center, 0);
    }
  }
  // Rotating to a short landscape caps the complete square artwork.
  await page.setViewportSize({ width: 844, height: 390 });
  await scrollToProgress(page, .5);
  expect((await artwork.boundingBox())!.height).toBeLessThanOrEqual(254);
  await page.locator("header").evaluate(element => { element.style.height = "103px"; });
  await expect(page.locator("#company-about")).toHaveAttribute("data-mode", "normal-flow");
  await expect(track).toHaveAttribute("data-pinned", "false");
  await page.locator("header").evaluate(element => { element.style.height = "102px"; });
  await expect(page.locator("#company-about")).toHaveAttribute("data-mode", "artwork-only");
  await page.locator("header").evaluate(element => { element.style.removeProperty("height"); });
  await page.setViewportSize({ width: 1025, height: 768 });
  await expect(page.locator("#company-about")).toHaveAttribute("data-mode", "artwork-only");
  await page.setViewportSize({ width: 1366, height: 768 });
  await expect(page.locator("#company-about")).toHaveAttribute("data-mode", await page.evaluate(() => matchMedia("(pointer: coarse)").matches) ? "artwork-only" : "full-scene");
});

test("Company responsive hero covers its full surface with the radar aligned", async ({ page }) => {
  await page.goto("/company");
  for (const [width, height] of [[390, 844], [768, 1024], [820, 1180], [1023, 768], [1024, 1366], [1180, 820], [1366, 1024]]) {
    await page.setViewportSize({ width, height });
    const responsive = await page.evaluate(() => matchMedia("(max-width: 1024px), (pointer: coarse)").matches);
    if (!responsive) continue;
    const geometry = await page.getByTestId("company-radar").evaluate(element => {
      const box = element.getBoundingClientRect(), img = element.querySelector("img")!.getBoundingClientRect(), svg = element.querySelector("svg")!.getBoundingClientRect();
      return { box: box.toJSON(), img: img.toJSON(), svg: svg.toJSON(), jamaica: { x: img.x + img.width * 835 / 1672, y: img.y + img.height * 410 / 941 } };
    });
    expect(geometry.img.left).toBeLessThanOrEqual(geometry.box.left + 1);
    expect(geometry.img.top).toBeLessThanOrEqual(geometry.box.top + 1);
    expect(geometry.img.right).toBeGreaterThanOrEqual(geometry.box.right - 1);
    expect(geometry.img.bottom).toBeGreaterThanOrEqual(geometry.box.bottom - 1);
    expect(geometry.img.width / geometry.img.height).toBeCloseTo(1672 / 941, 3);
    expect(geometry.svg).toEqual(geometry.img);
    expect(geometry.jamaica.x).toBeGreaterThan(geometry.box.left);
    expect(geometry.jamaica.x).toBeLessThan(geometry.box.right);
    expect(geometry.jamaica.y).toBeGreaterThan(geometry.box.top);
    expect(geometry.jamaica.y).toBeLessThan(geometry.box.bottom);
  }
});

for (const [width, height] of [[1024, 768], [1025, 768], [1100, 700], [1280, 720], [1366, 768], [1440, 650]]) {
  test(`Company responsive pinning at ${width}x${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.goto("/company");
    const section = page.locator("#company-about");
    const artwork = page.getByTestId("company-particles");
    await expect(section).toHaveAttribute("data-mode", /^(full-scene|artwork-only)$/);
    const samples = new Map<number, { progress: string | null; box: Awaited<ReturnType<typeof artwork.boundingBox>> }>();
    for (const [progress, shape] of [[.01, "brain"], [.27, "transition"], [.5, "gear"], [.73, "transition"], [.99, "bulb"], [.73, "transition"], [.5, "gear"], [.27, "transition"], [.01, "brain"]] as const) {
      await scrollToProgress(page, progress);
      await expect(artwork).toHaveAttribute("data-shape", shape);
      await expect(artwork).toHaveAttribute("data-ready", "true");
      await expect(artwork.locator("canvas")).toBeVisible();
      const sample = { progress: await artwork.getAttribute("data-progress"), box: await artwork.boundingBox() };
      if (samples.has(progress)) expect(sample).toEqual(samples.get(progress));
      else samples.set(progress, sample);
      expect(sample.box).toEqual(samples.get(.01)!.box);
      const header = await page.locator("header").evaluate(el => el.getBoundingClientRect().height);
      expect(sample.box!.y).toBeGreaterThanOrEqual(header);
      expect(sample.box!.y + sample.box!.height).toBeLessThanOrEqual(height);
      if (await section.getAttribute("data-mode") === "artwork-only") {
        expect(sample.box!.height).toBeGreaterThanOrEqual(240);
        expect(sample.box!.y + sample.box!.height / 2).toBeCloseTo((height + header) / 2, 0);
        const intro = await section.locator("[data-reveal]").first().boundingBox();
        const principle = await section.locator("h3").first().boundingBox();
        expect(intro!.y + intro!.height).toBeLessThan(sample.box!.y);
        expect(principle!.y).toBeGreaterThan(sample.box!.y + sample.box!.height);
      }
      if (shape !== "transition") await page.screenshot({ path: testInfo.outputPath(`company-${shape}.png`) });
    }
    await scrollToProgress(page, 1.2);
    expect((await artwork.boundingBox())!.y).toBeLessThan(samples.get(.01)!.box!.y - 30);
    const following = await section.getAttribute("data-mode") === "artwork-only" ? section.locator("h3").first() : page.locator("#company-jamaica");
    await expect(following).toBeInViewport();
    await noOverflow(page);
  });
}

test("Company midpoint resize restores natural fit without stale geometry", async ({ page }) => {
  await page.goto("/company");
  for (const [width, height] of [[1366, 768], [1025, 768], [1100, 700], [1440, 650], [390, 844], [1280, 370], [1024, 768], [1280, 720], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    if (height === 370) {
      await expect(page.locator("#company-about")).toHaveAttribute("data-mode", "normal-flow");
      await expect(page.locator("[data-company-artwork-track]")).toHaveAttribute("data-pinned", "false");
      continue;
    }
    await scrollToProgress(page, .5);
    const artwork = page.getByTestId("company-particles");
    await expect(artwork).toHaveAttribute("data-shape", "gear");
    const before = await artwork.boundingBox();
    await scrollToProgress(page, .73);
    expect(await artwork.boundingBox()).toEqual(before);
    const geometry = await page.locator("#company-about").evaluate(section => {
      const art = section.querySelector("[data-company-artwork-track]")!;
      const full = (section as HTMLElement).dataset.mode === "full-scene";
      return {
        extra: full ? section.getBoundingClientRect().height - section.firstElementChild!.getBoundingClientRect().height : art.getBoundingClientRect().height - art.firstElementChild!.getBoundingClientRect().height,
        expected: (innerHeight - document.querySelector("header")!.getBoundingClientRect().height) * 2.5,
        inactiveHeight: (full ? art as HTMLElement : section as HTMLElement).style.getPropertyValue("--track-height"),
      };
    });
    expect(geometry.extra).toBeCloseTo(geometry.expected, 1);
    expect(geometry.inactiveHeight).toBe("");
    await noOverflow(page);
  }
});
