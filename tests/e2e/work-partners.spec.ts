import { expect, test, type Page } from "@playwright/test";

const gridSelector = "[data-partner-grid]";
const names = (page: Page) => page.locator(`${gridSelector} [data-partner]`).evaluateAll((tiles) => tiles.map((tile) => tile.getAttribute("data-partner")));
const logo = (page: Page, name: string) => page.locator(`${gridSelector} button[data-logo]`).filter({ has: page.getByAltText(name, { exact: true }) });

async function openGrid(page: Page) {
  await page.goto("/work");
  const grid = page.locator(gridSelector);
  await expect(grid).toHaveAttribute("data-enhanced", "true");
  await grid.evaluate((element) => scrollTo({ top: scrollY + element.getBoundingClientRect().top - 180, behavior: "instant" }));
  await expect(grid.locator("..")).toHaveAttribute("data-reveal", "revealed");
  await grid.locator("..").evaluate(async (element) => {
    await Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished));
  });
  return grid;
}

async function center(page: Page, index: number) {
  const box = await page.locator(`${gridSelector} [data-partner]`).nth(index).boundingBox();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

async function startMouseDrag(page: Page, from = 0, to = 4) {
  const start = await center(page, from);
  const end = await center(page, to);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
  await expect(page.locator(gridSelector)).toHaveAttribute("data-drag-active", "true");
  return { start, end };
}

function inserted(order: (string | null)[], from: number, to: number) {
  const next = [...order];
  const [name] = next.splice(from, 1);
  next.splice(to, 0, name);
  return next;
}

test("Partner selection inserts forward, backward and into the last slot without changing identities", async ({ page }, testInfo) => {
  const grid = await openGrid(page);
  const original = await names(page);
  const assets = await grid.locator("img").evaluateAll((images) => Object.fromEntries(images.map((image) => [image.getAttribute("alt"), image.getAttribute("src")])));
  const height = (await grid.boundingBox())!.height;
  const activate = async (name: string) => {
    if (testInfo.project.name === "desktop-chromium") await logo(page, name).click();
    else await logo(page, name).tap();
  };
  for (const [from, to] of [[0, 6], [6, 1], [1, 14], [14, 0]]) {
    const before = await names(page);
    await activate(before[from]!);
    await expect(logo(page, before[from]!)).toHaveAttribute("aria-pressed", "true");
    await activate(before[to]!);
    await expect.poll(() => names(page)).toEqual(inserted(before, from, to));
    await expect(logo(page, before[from]!)).toBeFocused();
    await expect(page.locator("#work-clients [role=status]")).toHaveText(`${before[from]} moved to position ${to + 1} of 15.`);
    expect((await grid.boundingBox())!.height).toBe(height);
    if (testInfo.project.name === "mobile-chromium") {
      const last = await grid.locator("[data-partner]").last().boundingBox();
      expect(last!.width).toBeCloseTo((await grid.boundingBox())!.width - 1, 0);
    }
  }
  expect(await names(page)).toEqual(original);
  expect(await grid.locator("img").evaluateAll((images) => Object.fromEntries(images.map((image) => [image.getAttribute("alt"), image.getAttribute("src")])))).toEqual(assets);
});

test("Keyboard selection supports Space, Enter, focus retention and Escape", async ({ page }) => {
  await openGrid(page);
  const original = await names(page);
  const first = logo(page, original[0]!);
  await first.focus();
  await page.keyboard.press("Space");
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(first).toHaveAttribute("aria-pressed", "false");
  expect(await names(page)).toEqual(original);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await expect.poll(() => names(page)).toEqual(inserted(original, 0, 2));
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute("aria-label", `${original[0]}, position 3 of 15`);
});

test("Mouse dragging previews insertion across rows, holds grid height, and commits on release", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Real touch input is covered separately.");
  const grid = await openGrid(page);
  const original = await names(page);
  const height = (await grid.boundingBox())!.height;
  await startMouseDrag(page, 0, 7);
  await expect.poll(() => names(page)).toEqual(inserted(original, 0, 7));
  expect((await grid.boundingBox())!.height).toBe(height);
  await page.screenshot({ path: testInfo.outputPath("drag-preview.png") });
  await page.mouse.up();
  await expect(grid).toHaveAttribute("data-drag-active", "false");
  expect(await names(page)).toEqual(inserted(original, 0, 7));
  await expect(logo(page, original[0]!)).toHaveAttribute("aria-pressed", "false");
  await startMouseDrag(page, 7, 1);
  await page.mouse.up();
  await expect.poll(() => names(page)).toEqual(inserted(inserted(original, 0, 7), 7, 1));
});

for (const reason of ["Escape", "pointercancel", "lost capture", "outside", "resize", "hidden"] as const) {
  test(`Partner drag cancels on ${reason} and restores the order before that drag`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Cancellation lifecycle is shared across pointer types.");
    const grid = await openGrid(page);
    // Restore the visitor's previous committed order, not the original prop order.
    const initial = await names(page);
    await logo(page, initial[0]!).click();
    await logo(page, initial[2]!).click();
    const before = await names(page);
    await startMouseDrag(page, 0, 6);
    expect(await names(page)).not.toEqual(before);
    if (reason === "Escape") await page.keyboard.press("Escape");
    if (reason === "pointercancel") await grid.dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse" });
    if (reason === "lost capture") await grid.evaluate((element) => element.releasePointerCapture(1));
    if (reason === "outside") await page.mouse.move(4, 300);
    if (reason === "resize") await page.setViewportSize({ width: 1200, height: 820 });
    if (reason === "hidden") await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, value: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.mouse.up();
    await expect(grid).toHaveAttribute("data-drag-active", "false");
    await expect.poll(() => names(page)).toEqual(before);
    await expect(page.locator("#work-clients [role=status]")).toContainText("Move cancelled");
    if (reason === "hidden") await page.evaluate(() => {
      Reflect.deleteProperty(document, "hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    // A new interaction works after cancellation; no stale capture or click suppression.
    await logo(page, before[0]!).click();
    await expect(logo(page, before[0]!)).toHaveAttribute("aria-pressed", "true");
  });
}

test("Movement threshold keeps a short mouse click as selection", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  const grid = await openGrid(page);
  const point = await center(page, 0);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 3, point.y + 2);
  await expect(grid).toHaveAttribute("data-drag-active", "false");
  await page.mouse.up();
  await expect(grid.locator("button").first()).toHaveAttribute("aria-pressed", "true");
});

test("Touch and hold drags while a swipe on the logo scrolls the page", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop-chromium", "Requires a touch-enabled Chromium context.");
  const grid = await openGrid(page);
  const original = await names(page);
  const session = await page.context().newCDPSession(page);
  const touch = async (type: "touchStart" | "touchMove" | "touchEnd", x = 0, y = 0) => {
    await session.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
  };
  const start = await center(page, 0);
  const end = await center(page, 3);
  const scrollBefore = await page.evaluate(() => scrollY);
  await touch("touchStart", start.x, start.y);
  await expect(grid).toHaveAttribute("data-drag-active", "true");
  for (let step = 1; step <= 8; step++) await touch("touchMove", start.x + (end.x - start.x) * step / 8, start.y + (end.y - start.y) * step / 8);
  await expect(grid).toHaveAttribute("data-drag-active", "true");
  await touch("touchEnd");
  await expect.poll(() => names(page)).toEqual(inserted(original, 0, 3));
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
  const swipe = await center(page, 4);
  await touch("touchStart", swipe.x, swipe.y);
  for (let step = 1; step <= 10; step++) await touch("touchMove", swipe.x, swipe.y - step * 18);
  await touch("touchEnd");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore + 50);
  await expect(grid).toHaveAttribute("data-drag-active", "false");
  expect(await names(page)).toEqual(inserted(original, 0, 3));
  await expect(grid.locator('[aria-pressed="true"]')).toHaveCount(0);
  await session.detach();
});

test("An active drag scrolls near the viewport edge and stops after cancellation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium");
  const grid = await openGrid(page);
  const initial = await names(page);
  const start = await center(page, 0);
  const end = { x: start.x, y: page.viewportSize()!.height - 24 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
  const before = await page.evaluate(() => scrollY);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 40);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  const stopped = await page.evaluate(() => scrollY);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => scrollY)).toBe(stopped);
  await expect(grid).toHaveAttribute("data-drag-active", "false");
  expect(await names(page)).toEqual(initial);
});

test("Reduced motion disables tile movement while reordering still works", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const grid = await openGrid(page);
  const original = await names(page);
  await logo(page, original[0]!).click();
  await logo(page, original[4]!).click();
  expect(await names(page)).toEqual(inserted(original, 0, 4));
  expect(await grid.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await grid.locator("button").first().evaluate((element) => getComputedStyle(element).transitionProperty)).toBe("none");
});

test("Partner order resets after reload and leaving the route", async ({ page }) => {
  await openGrid(page);
  const original = await names(page);
  const reorder = async () => {
    await logo(page, original[0]!).click();
    await logo(page, original[1]!).click();
    expect(await names(page)).not.toEqual(original);
  };
  await reorder();
  await page.reload();
  await expect.poll(() => names(page)).toEqual(original);
  await reorder();
  await page.locator('footer a[href="/company#company-about"]').click();
  await expect(page).toHaveURL(/\/company#company-about$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/work$/);
  await expect.poll(() => names(page)).toEqual(original);
});

test("Partner grid retains its responsive columns and readable visual states", async ({ page }, testInfo) => {
  const grid = await openGrid(page);
  await expect(grid.locator("svg, [data-drag-handle]")).toHaveCount(0);
  expect(await page.locator("#partner-instructions").evaluate((element) => getComputedStyle(element).clipPath)).toBe("inset(50%)");
  const columns = await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
  expect(columns).toBe(testInfo.project.name === "desktop-chromium" ? 5 : testInfo.project.name === "tablet-chromium" ? 3 : 2);
  for (const img of await grid.locator("img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
  }
  await grid.locator("button").first().click();
  await grid.screenshot({ path: testInfo.outputPath("partners-selected.png") });
  expect(await grid.locator("button").first().evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("solid");
  await page.locator("#work-clients").evaluate((element) => scrollTo({ top: scrollY + element.getBoundingClientRect().top - 88, behavior: "instant" }));
  const intro = page.locator("#work-clients h2").locator("..");
  await expect(intro).toHaveAttribute("data-reveal", "revealed");
  await intro.evaluate(async (element) => { await Promise.all(element.getAnimations().map((animation) => animation.finished)); });
  await page.screenshot({ path: testInfo.outputPath("partners-viewport.png") });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
