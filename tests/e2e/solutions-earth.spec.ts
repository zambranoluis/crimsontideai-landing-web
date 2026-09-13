import { expect, test, type Page } from "@playwright/test";

const earth = (page: Page) => page.getByTestId("solutions-earth");
const glow = (page: Page) => earth(page).locator("[data-earth-glow]");

async function settle(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function scrollEarth(page: Page, travel: number) {
  await earth(page).evaluate((section, fraction) => {
    const header = document.querySelector("header")!.getBoundingClientRect().height;
    const track = (section as HTMLElement).dataset.earthMode === "artwork-only" ? section.querySelector("[data-earth-artwork-track]")! : section;
    scrollTo({ top: scrollY + track.getBoundingClientRect().top - header + (innerHeight - header) * fraction, behavior: "instant" });
  }, travel);
  await settle(page);
}

async function metrics(page: Page) {
  return earth(page).evaluate(section => {
    const scene = section.querySelector<HTMLElement>("[data-earth-scene]")!;
    const copy = section.querySelector<HTMLElement>("[data-earth-copy]")!;
    const art = section.querySelector<HTMLElement>("[data-earth-art]")!;
    const planet = section.querySelector<HTMLImageElement>("img")!;
    const header = document.querySelector("header")!.getBoundingClientRect();
    return {
      scene: scene.getBoundingClientRect().toJSON(), copy: copy.getBoundingClientRect().toJSON(),
      art: art.getBoundingClientRect().toJSON(), planet: planet.getBoundingClientRect().toJSON(),
      light: section.querySelector("[data-earth-glow]")!.getBoundingClientRect().toJSON(),
      header: header.height, height: innerHeight, sectionHeight: section.getBoundingClientRect().height,
      opacity: Number(getComputedStyle(section.querySelector("[data-earth-glow]")!).opacity),
      atmosphere: Number(getComputedStyle(section.querySelector("[data-earth-atmosphere]")!).opacity),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

test("Earth brightness reverses exactly while the scene stays pinned and releases to Opportunities", async ({ page }) => {
  await page.goto("/solutions");
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "pinned");
  await page.evaluate(() => document.fonts.ready);
  const samples = new Map<number, Awaited<ReturnType<typeof metrics>>>();
  for (const travel of [0, .2125, .425, .6375, .86, .95, .6375, .425, .2125, 0]) {
    await scrollEarth(page, travel);
    const current = await metrics(page);
    expect(current.opacity).toBeCloseTo(Math.min(1, travel / .85), 2);
    expect(current.atmosphere).toBeCloseTo(current.opacity * .55, 4);
    expect(current.scene.top).toBeCloseTo(current.header, 0);
    expect(current.scene.bottom).toBeCloseTo(current.height, 0);
    expect(current.copy.top).toBeGreaterThan(current.header);
    expect(current.copy.bottom).toBeLessThan(current.art.top);
    expect(current.art.height).toBeGreaterThanOrEqual(160);
    expect(current.planet.bottom).toBeGreaterThanOrEqual(current.scene.bottom - 1);
    expect(current.overflow).toBeLessThanOrEqual(1);
    if (samples.has(travel)) expect(current).toEqual(samples.get(travel));
    else samples.set(travel, current);
    expect(current.copy).toEqual(samples.get(0)!.copy);
    expect(current.planet).toEqual(samples.get(0)!.planet);
    expect(current.light).toEqual(samples.get(0)!.light);
  }
  await scrollEarth(page, 1.2);
  const released = await metrics(page);
  expect(released.scene.top).toBeLessThan(released.header - 50);
  expect(released.opacity).toBe(1);
  const opportunities = page.locator("main > section").nth(1);
  await expect(opportunities).toHaveAttribute("aria-labelledby", "opportunities-heading");
  expect((await opportunities.boundingBox())!.y).toBeLessThan(released.height);
  await scrollEarth(page, .425);
  expect(await metrics(page)).toEqual(samples.get(.425));
});

test("Earth insufficient artwork space stays illuminated and resumes pinning when space permits", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 280 });
  await page.goto("/solutions");
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "static");
  for (const travel of [0, .25, .5, .25, 0]) {
    await scrollEarth(page, travel);
    const current = await metrics(page);
    expect(current.opacity).toBe(1);
    expect(Math.abs(current.scene.top - (current.header - (current.height - current.header) * travel))).toBeLessThanOrEqual(1);
    expect(current.overflow).toBeLessThanOrEqual(1);
  }
  const sizes = await metrics(page);
  expect(sizes.sectionHeight).toEqual(sizes.scene.height);
  await expect(earth(page).getByRole("heading", { level: 1 })).toBeInViewport();
  await earth(page).getByRole("link").scrollIntoViewIfNeeded();
  await expect(earth(page).getByRole("link")).toBeInViewport();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "pinned");
  await scrollEarth(page, .425);
  expect((await metrics(page)).opacity).toBeCloseTo(.5, 2);
});

test("Earth reduced motion is illuminated normal flow, including preference changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/solutions");
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "static");
  await scrollEarth(page, 0);
  const initial = await metrics(page);
  expect(initial.opacity).toBe(1);
  expect(initial.atmosphere).toBe(.55);
  expect(initial.sectionHeight).toEqual(initial.scene.height);
  await expect(earth(page).getByRole("heading")).toBeInViewport();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "pinned");
  await scrollEarth(page, .425);
  expect((await metrics(page)).opacity).toBeCloseTo(.5, 2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "static");
  await expect.poll(async () => (await metrics(page)).opacity).toBe(1);
});

test("Earth CTA supports keyboard navigation and synchronizes to the history-restored viewport", async ({ page }) => {
  await page.goto("/solutions");
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "pinned");
  await scrollEarth(page, .425);
  const link = earth(page).getByRole("link", { name: "Discuss an AI solution" });
  await link.focus();
  await expect(link).toBeFocused();
  expect(await link.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe("none");
  const savedPosition = await page.evaluate(() => scrollY);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contact$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/solutions$/);
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "pinned");
  // Wait for native Back restoration to finish before issuing another scroll.
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(savedPosition, 0);
  // The router owns restoration. Verify light against the actual restored track,
  // rather than assigning a second scroll position that competes with navigation.
  await expect.poll(() => earth(page).evaluate(section => {
    const header = document.querySelector("header")!.getBoundingClientRect().height;
    const expected = Math.max(0, Math.min(1, (header - section.getBoundingClientRect().top) / ((innerHeight - header) * .85)));
    return Math.abs(Number(getComputedStyle(section.querySelector("[data-earth-glow]")!).opacity) - expected);
  })).toBeLessThan(.01);
  await scrollEarth(page, .425);
  expect((await metrics(page)).opacity).toBeCloseTo(.5, 2);
  await scrollEarth(page, .2125);
  expect((await metrics(page)).opacity).toBeCloseTo(.25, 2);
});

test("Earth image failures keep readable content and a working CTA", async ({ page }) => {
  await page.route("**/pages/ai-solutions/*.png", route => route.abort());
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/solutions");
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "pinned");
  await scrollEarth(page, .86);
  await expect(earth(page).getByRole("heading")).toBeInViewport();
  await expect(earth(page).locator("p")).toBeInViewport();
  await expect(earth(page).locator("img").first()).toHaveJSProperty("naturalWidth", 0);
  await earth(page).getByRole("link").click();
  await expect(page).toHaveURL(/\/contact$/);
  expect(errors).toEqual([]);
});

test("Earth without JavaScript stays illuminated with no sticky travel", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  const page = await context.newPage();
  await page.goto("/solutions");
  await earth(page).scrollIntoViewIfNeeded();
  await expect(earth(page).getByRole("heading")).toBeVisible();
  await expect(earth(page).locator("p")).toBeVisible();
  await expect(earth(page)).not.toHaveAttribute("data-earth-mode");
  await expect(glow(page)).toHaveCSS("opacity", "1");
  const sizes = await metrics(page);
  expect(sizes.sectionHeight).toBe(sizes.scene.height);
  await earth(page).getByRole("link").click();
  await expect(page).toHaveURL(/\/contact$/);
  await context.close();
});

test("Earth recalculates after copy, header, font and history events without idle writes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Shared controller lifecycle coverage.");
  await page.goto("/solutions");
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "pinned");
  await scrollEarth(page, .425);
  await earth(page).locator("[data-earth-copy]").evaluate(el => { (el as HTMLElement).style.paddingBottom = "300px"; });
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "artwork-only");
  await earth(page).locator("[data-earth-copy]").evaluate(el => { (el as HTMLElement).style.paddingBottom = ""; });
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "pinned");
  await page.locator("header").evaluate(el => { el.style.paddingBottom = "12px"; });
  await scrollEarth(page, .425);
  await expect.poll(async () => (await metrics(page)).scene.top).toBeCloseTo(101, 0);
  await page.evaluate(() => { dispatchEvent(new PageTransitionEvent("pageshow")); document.fonts.dispatchEvent(new Event("loadingdone")); });
  await settle(page);
  const writes = await earth(page).evaluate(async el => {
    let writes = 0;
    const observer = new MutationObserver(() => writes++);
    observer.observe(el, { attributes: true });
    await new Promise(resolve => setTimeout(resolve, 250));
    observer.disconnect();
    return writes;
  });
  expect(writes).toBe(0);
});

test("Earth reference screenshots at dim, intermediate and full light", async ({ page }, testInfo) => {
  const sizes = testInfo.project.name === "mobile-chromium"
    ? [{ width: 360, height: 800 }, { width: 390, height: 844 }]
    : [testInfo.project.use.viewport!];
  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.goto("/solutions");
    await page.evaluate(() => document.fonts.ready);
    await expect(earth(page)).toHaveAttribute("data-earth-mode", "pinned");
    for (const [label, travel] of [["dim", 0], ["mid", .425], ["full", .86]] as const) {
      await scrollEarth(page, travel);
      await earth(page).locator("img").evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
      const path = testInfo.outputPath(`earth-${size.width}-${label}.png`);
      await page.screenshot({ path });
      await testInfo.attach(`earth-${size.width}-${label}`, { path, contentType: "image/png" });
    }
  }
});

for (const [width, height] of [[1024, 768], [1025, 768], [1100, 700], [1280, 720], [1366, 768], [1440, 650], [390, 500]]) {
  test(`Earth responsive hold at ${width}x${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.goto("/solutions");
    await page.evaluate(() => document.fonts.ready);
    await expect(earth(page)).toHaveAttribute("data-earth-mode", /^(pinned|compact-pinned|artwork-only)$/);
    const mode = await earth(page).getAttribute("data-earth-mode");
    if (mode === "artwork-only") {
      await earth(page).getByRole("link").focus();
      await expect(earth(page).getByRole("link")).toBeInViewport();
      await expect(glow(page)).toHaveCSS("opacity", "0");
    }
    // A fractional normal-flow origin may round just before the sticky
    // boundary at zero. Sample stationary coordinates inside the hold.
    await scrollEarth(page, 0);
    expect((await metrics(page)).opacity).toBeCloseTo(0, 2);
    const samples = new Map<number, Awaited<ReturnType<typeof metrics>>>();
    for (const travel of [.01, .2125, .425, .6375, .86, .95, .6375, .425, .2125, .01]) {
      await scrollEarth(page, travel);
      const current = await metrics(page);
      expect(current.opacity).toBeCloseTo(Math.min(1, travel / .85), 2);
      expect(current.atmosphere).toBeCloseTo(current.opacity * .55, 4);
      expect(current.overflow).toBeLessThanOrEqual(1);
      expect(current.art.height).toBeGreaterThanOrEqual(160);
      expect(current.art.top).toBeGreaterThanOrEqual(current.header - 1);
      expect(current.art.bottom).toBeLessThanOrEqual(height + 1);
      if (mode !== "artwork-only") {
        expect(current.copy.top).toBeGreaterThan(current.header);
      }
      expect(current.copy.bottom).toBeLessThan(current.art.top);
      if (samples.has(travel)) expect(current).toEqual(samples.get(travel));
      else samples.set(travel, current);
      expect(current.planet).toEqual(samples.get(.01)!.planet);
      expect(current.light).toEqual(samples.get(.01)!.light);
      if (travel === .425 || travel === .86) {
        await earth(page).locator("img").evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
        await page.screenshot({ path: testInfo.outputPath(`earth-${travel}.png`) });
      }
    }
    await scrollEarth(page, 1.2);
    const released = await metrics(page);
    expect(released.art.top).toBeLessThan(samples.get(.01)!.art.top - 30);
    await expect(page.locator("#solutions-opportunities")).toBeInViewport();
  });
}

test("Earth resizes midway across all layout modes without stale tracks", async ({ page }) => {
  await page.goto("/solutions");
  await expect(earth(page)).toHaveAttribute("data-earth-mode", /^(pinned|compact-pinned|artwork-only)$/);
  await page.evaluate(() => document.fonts.ready);
  for (const [width, height] of [[1280, 800], [1280, 720], [1440, 650], [390, 500], [390, 280], [1440, 650], [1280, 720], [1280, 800]]) {
    await page.setViewportSize({ width, height });
    await expect.poll(() => earth(page).evaluate(el => {
      const header = document.querySelector("header")!.getBoundingClientRect().height;
      return parseFloat((el as HTMLElement).style.getPropertyValue("--earth-available")) - (innerHeight - header);
    })).toBe(0);
    await settle(page);
    await scrollEarth(page, .425);
    const current = await metrics(page);
    const mode = await earth(page).getAttribute("data-earth-mode");
    expect(current.overflow).toBeLessThanOrEqual(1);
    if (mode === "static") {
      expect(current.sectionHeight).toBe(current.scene.height);
      expect(current.opacity).toBe(1);
    } else {
      expect(current.opacity).toBeCloseTo(.5, 2);
      if (mode !== "artwork-only") expect(current.sectionHeight).toBeCloseTo((height - current.header) * 2, 0);
      const before = current.art;
      await scrollEarth(page, .6375);
      expect((await metrics(page)).art).toEqual(before);
    }
  }
});

test("Earth artwork-only fragments and browser Back synchronize after layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 650 });
  await page.goto("/solutions#solutions-opportunities");
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "artwork-only");
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.locator("#solutions-opportunities").evaluate(el => el.getBoundingClientRect().top - document.querySelector("header")!.getBoundingClientRect().height)).toBeGreaterThanOrEqual(0);
  await expect(page.locator("#opportunities-heading")).toBeInViewport();
  await scrollEarth(page, .425);
  const position = await page.evaluate(() => scrollY);
  await page.goto("/contact");
  await page.goBack();
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "artwork-only");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, 0);
  await expect.poll(async () => (await metrics(page)).opacity).toBeCloseTo(.5, 2);
});

test("Earth artwork-only hold responds to reduced motion and measured header clearance", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 650 });
  await page.goto("/solutions");
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "artwork-only");
  await scrollEarth(page, .425);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "static");
  await expect(glow(page)).toHaveCSS("opacity", "1");
  let current = await metrics(page);
  expect(current.opacity).toBe(1);
  expect(current.sectionHeight).toBe(current.scene.height);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "artwork-only");
  await scrollEarth(page, .425);
  expect((await metrics(page)).opacity).toBeCloseTo(.5, 2);
  await page.locator("header").evaluate(el => { el.style.height = "443px"; });
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "static");
  await expect(glow(page)).toHaveCSS("opacity", "1");
  current = await metrics(page);
  expect(current.opacity).toBe(1);
  expect(current.sectionHeight).toBe(current.scene.height);
  await page.locator("header").evaluate(el => { el.style.height = "442px"; });
  await expect(earth(page)).toHaveAttribute("data-earth-mode", "artwork-only");
  await scrollEarth(page, .425);
  current = await metrics(page);
  expect(current.art.height).toBe(208);
  expect(current.art.top).toBe(442);
  expect(current.opacity).toBeCloseTo(.5, 2);
});
