import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "./fixtures";

const missing = "/this-route-does-not-exist";
const scene = (page: Page) => page.getByTestId("not-found-scene");
async function ready(page: Page) {
  await page.goto(missing);
  await expect(scene(page)).toHaveAttribute("data-globe-ready", "true", { timeout: 30000 });
}

test("unmatched routes have a real 404, readable content, local assets, and working recovery", async ({ page }) => {
  for (const path of [missing, "/not/a/real/route"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle("404 — Page not found — CrimsonTide");
    await expect(page.locator("head title")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("404Page not found");
    await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact us", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect.poll(() => page.locator('img[src^="/pages/not-found/"]').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  }
  await page.getByRole("link", { name: "Contact us", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("h1")).toBeFocused();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Page not found");
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("h1")).toBeFocused();
});

test("keyboard signals work and navigation disposes the scene", async ({ page }) => {
  await ready(page);
  const signal = page.getByRole("button", { name: "Send a signal around the globe" });
  await signal.focus(); await page.keyboard.press("Enter");
  await expect(scene(page)).toHaveAttribute("data-signals", "1");
  await signal.click();
  await expect(scene(page)).toHaveAttribute("data-signals", "2");
  await page.evaluate(() => {
    Object.assign(window, { old404: document.querySelector('[data-testid="not-found-scene"]') });
  });
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
  const readOld = () => page.evaluate(() => {
    const old = (window as unknown as { old404: HTMLElement }).old404;
    return { frames: old.dataset.frames, motion: old.dataset.motion, globe: old.dataset.globeReady };
  });
  const disposed = await readOld();
  expect(disposed.motion).toBe("paused"); expect(disposed.globe).toBe("false");
  await page.waitForTimeout(250); expect(await readOld()).toEqual(disposed);
});

test("fine pointer parallax leaves text fixed and terrain ripples are bounded", async ({ page }, info) => {
  test.skip(!info.project.name.startsWith("desktop"), "Mouse-only interaction; touch has its own case.");
  await ready(page);
  const heading = await page.locator("h1").boundingBox();
  const field = await page.locator("[data-terrain-canvas]").boundingBox();
  expect(field).not.toBeNull();
  const x = Math.max(40, field!.x + field!.width * .28), y = field!.y + field!.height * .8;
  await page.mouse.move(x, y);
  await expect.poll(() => scene(page).evaluate(root => Math.abs(parseFloat(root.style.getPropertyValue("--star-x")) || 0))).toBeGreaterThan(1);
  expect(await page.locator("h1").boundingBox()).toEqual(heading);
  await page.mouse.click(x, y, { clickCount: 5 });
  await expect.poll(() => scene(page).getAttribute("data-ripples")).toBe("3");
  await expect.poll(() => scene(page).getAttribute("data-ripples"), { timeout: 4000 }).toBe("0");
  await page.mouse.move(5, 5);
  await expect.poll(() => scene(page).evaluate(root => Math.abs(parseFloat(root.style.getPropertyValue("--star-x")) || 0)), { timeout: 3000 }).toBeLessThan(.1);
});

test("touch can send a globe signal without pointer parallax", async ({ page }, info) => {
  test.skip(info.project.name.startsWith("desktop"), "Touch contexts only.");
  await ready(page);
  await page.getByRole("button", { name: "Send a signal around the globe" }).tap();
  await expect(scene(page)).toHaveAttribute("data-signals", "1");
  expect(await scene(page).evaluate(root => parseFloat(root.style.getPropertyValue("--star-x")) || 0)).toBe(0);
});

test("reduced motion uses the poster and responds to a mounted preference change", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(missing);
  await expect(scene(page)).toHaveAttribute("data-motion", "paused");
  await expect(page.getByRole("button", { name: "Pause animation" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Send a signal around the globe" })).toBeDisabled();
  await expect(page.locator('img[src$="globe-poster.png"]')).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(scene(page)).toHaveAttribute("data-globe-ready", "true", { timeout: 30000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene(page)).toHaveAttribute("data-globe-ready", "false");
  await expect(scene(page)).toHaveAttribute("data-motion", "paused");
});

test("no JavaScript retains both posters and native recovery links", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    const response = await page.goto(missing); expect(response?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
    await expect.poll(() => page.locator('img[src^="/pages/not-found/"]').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await page.getByRole("link", { name: "Contact us", exact: true }).click();
    await expect(page).toHaveURL(/\/contact$/);
  } finally { await context.close(); }
});

test("texture failure keeps the globe poster and usable navigation", async ({ page }) => {
  await page.route("**/pages/not-found/land-mask.png", route => route.abort());
  await page.goto(missing);
  await expect(scene(page)).toHaveAttribute("data-globe-ready", "false");
  await expect(page.locator('img[src$="globe-poster.png"]')).toHaveCSS("opacity", "1");
  await expect(page.getByRole("button", { name: "Send a signal around the globe" })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});

test("canvas unavailability preserves a complete static composition", async ({ page }) => {
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await page.goto(missing);
  await expect(scene(page)).toHaveAttribute("data-globe-ready", "false");
  await expect(page.locator('img[src$="terrain-poster.png"]')).toHaveCSS("opacity", "1");
  await expect(page.locator('img[src$="globe-poster.png"]')).toHaveCSS("opacity", "1");
});

test("context loss returns to the poster and context restoration resumes", async ({ page }) => {
  await ready(page);
  await page.locator("[data-globe-canvas]").evaluate(canvas => {
    const gl = (canvas as HTMLCanvasElement).getContext("webgl2")!;
    const extension = gl.getExtension("WEBGL_lose_context")!;
    Object.assign(window, { restore404: () => extension.restoreContext() }); extension.loseContext();
  });
  await expect(scene(page)).toHaveAttribute("data-globe-ready", "false");
  await expect(page.locator('img[src$="globe-poster.png"]')).toHaveCSS("opacity", "1");
  await page.evaluate(() => (window as unknown as { restore404: () => void }).restore404());
  await expect(scene(page)).toHaveAttribute("data-globe-ready", "true", { timeout: 15000 });
});

test("offscreen and hidden-document lifecycle pauses without catch-up", async ({ page }) => {
  await ready(page);
  await page.locator("footer").evaluate(footer => { footer.style.minHeight = "150vh"; });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(scene(page)).toHaveAttribute("data-motion", "paused");
  const offscreen = await scene(page).getAttribute("data-frames");
  await page.waitForTimeout(200); expect(await scene(page).getAttribute("data-frames")).toBe(offscreen);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(scene(page)).toHaveAttribute("data-motion", "running");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(scene(page)).toHaveAttribute("data-motion", "paused");
  const hidden = await scene(page).getAttribute("data-frames");
  await page.waitForTimeout(250); expect(await scene(page).getAttribute("data-frames")).toBe(hidden);
  await page.evaluate(() => { Reflect.deleteProperty(document, "hidden"); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(() => scene(page).getAttribute("data-frames")).not.toBe(hidden);
});

test("404 accessibility, forced colors, and narrow layout", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(missing);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await page.emulateMedia({ forcedColors: "active" });
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
  await expect(page.locator("[data-globe-host]")).toBeHidden();
});


test("viewport fit preserves the footer across normal sizes and allows enlarged text to flow", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "One serial viewport matrix.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(missing);
  for (const [width, height] of [[1920, 1080], [1680, 945], [1366, 768], [1280, 720], [1024, 768], [768, 1024], [820, 1180], [390, 844], [375, 667], [320, 568], [844, 390], [667, 375]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.evaluate(() => ({
      width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight,
      footer: document.querySelector("footer")!.getBoundingClientRect().bottom,
    })), { message: `${width}x${height}` }).toEqual({ width, height, footer: height });
    const cta = await page.getByRole("link", { name: "Back to home" }).boundingBox();
    expect(cta!.y + cta!.height).toBeLessThan(height);
  }
  await page.setViewportSize({ width: 640, height: 400 });
  await page.locator("[data-not-found-page]").evaluate(root => { root.style.zoom = "2"; });
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(400);
  await page.getByRole("link", { name: "Contact us", exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("link", { name: "Contact us", exact: true })).toBeInViewport();
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(page.getByRole("navigation", { name: "Footer" })).toBeInViewport();
});

test("trackball rotates in every direction, crosses its boundary, and stops without a signal", async ({ page }) => {
  await ready(page);
  const globe = page.locator("[data-globe-button]");
  const initial = await scene(page).getAttribute("data-orientation");
  const box = (await globe.boundingBox())!;
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  for (const [dx, dy] of [[90, 0], [-90, 0], [0, -90], [0, 90], [box.width, box.height]]) {
    const before = await scene(page).getAttribute("data-orientation");
    await page.mouse.move(cx, cy); await page.mouse.down();
    await page.mouse.move(cx + dx, cy + dy, { steps: 8 });
    await page.mouse.up();
    await expect(scene(page)).toHaveAttribute("data-dragging", "false");
    await expect.poll(() => scene(page).getAttribute("data-orientation")).not.toBe(before);
    const released = await scene(page).getAttribute("data-orientation");
    await page.waitForTimeout(150);
    expect(await scene(page).getAttribute("data-orientation")).toBe(released);
    expect(await scene(page).getAttribute("data-signals")).toBeNull();
  }
  await globe.focus(); await page.keyboard.press("Home");
  await expect(scene(page)).toHaveAttribute("data-orientation", initial!);
  for (const key of ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"]) {
    const before = await scene(page).getAttribute("data-orientation");
    await page.keyboard.press(key);
    expect(await scene(page).getAttribute("data-orientation")).not.toBe(before);
  }
  await page.getByRole("button", { name: "Reset Earth orientation" }).click();
  await expect(scene(page)).toHaveAttribute("data-orientation", initial!);
  await page.getByRole("button", { name: "Rotate Earth left", exact: true }).click();
  expect(await scene(page).getAttribute("data-orientation")).not.toBe(initial);
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 5, cy); await page.mouse.up();
  await expect(scene(page)).toHaveAttribute("data-signals", "1");
});

test("capture cancellation and document hiding end a drag without losing orientation", async ({ page }) => {
  await ready(page);
  const globe = page.locator("[data-globe-button]");
  for (const reason of ["pointercancel", "lostpointercapture", "hidden"]) {
    const box = (await globe.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2, { steps: 3 });
    await expect(scene(page)).toHaveAttribute("data-dragging", "true");
    const rotated = await scene(page).getAttribute("data-orientation");
    if (reason === "hidden") await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange"));
    });
    else await globe.dispatchEvent(reason, { pointerId: 1 });
    await expect(scene(page)).toHaveAttribute("data-dragging", "false");
    await page.mouse.move(box.x, box.y); await page.mouse.up();
    await page.evaluate(() => { Reflect.deleteProperty(document, "hidden"); document.dispatchEvent(new Event("visibilitychange")); });
    expect(await scene(page).getAttribute("data-orientation")).toBe(rotated);
    expect(await scene(page).getAttribute("data-signals")).toBeNull();
  }
});

test("single-finger drag captures touch and discrete tap controls rotate without pulsing", async ({ page, context }, info) => {
  test.skip(info.project.name === "desktop-chromium", "Touch profiles only.");
  await ready(page);
  const box = (await page.locator("[data-globe-button]").boundingBox())!;
  const initial = await scene(page).getAttribute("data-orientation");
  const cdp = await context.newCDPSession(page);
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let i = 1; i <= 6; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + i * 12, y: y - i * 4 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(scene(page)).toHaveAttribute("data-dragging", "false");
  expect(await scene(page).getAttribute("data-orientation")).not.toBe(initial);
  expect(await scene(page).getAttribute("data-signals")).toBeNull();
  await page.getByRole("button", { name: "Reset Earth orientation" }).tap();
  await expect(scene(page)).toHaveAttribute("data-orientation", initial!);
  await page.locator("[data-globe-button]").tap();
  await expect(scene(page)).toHaveAttribute("data-signals", "1");
  await cdp.detach();
});

test("cold load and first pointer keep complete frames and the same buffers and preset", async ({ page }) => {
  await page.addInitScript(() => {
    const writes: string[] = [];
    Object.assign(window, { canvasWrites404: writes });
    for (const key of ["width", "height"]) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, key)!;
      Object.defineProperty(HTMLCanvasElement.prototype, key, { ...descriptor, set(value) {
        if (this.matches("[data-globe-canvas], [data-terrain-canvas]")) writes.push(`${key}:${value}`);
        descriptor.set!.call(this, value);
      } });
    }
  });
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/pages/not-found/land-mask.png", async route => { await held; await route.continue(); });
  await page.goto(missing);
  await expect(page.locator('img[src$="globe-poster.png"]')).toHaveCSS("opacity", "1");
  release();
  await expect(scene(page)).toHaveAttribute("data-globe-ready", "true", { timeout: 30000 });
  await expect(scene(page)).toHaveAttribute("data-terrain-ready", "true");
  const initial = await scene(page).getAttribute("data-orientation");
  const writes = await page.evaluate(() => (window as unknown as { canvasWrites404: string[] }).canvasWrites404.length);
  for (let i = 0; i < 12; i++) {
    await page.mouse.move(100 + i * 17, 250 + i * 9);
    const frame = await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>("[data-globe-canvas]")!;
      const gl = canvas.getContext("webgl2")!;
      const pixel = new Uint8Array(4);
      gl.readPixels(canvas.width / 2, canvas.height / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      return { alpha: pixel[3], quality: document.querySelector<HTMLElement>('[data-testid="not-found-scene"]')!.dataset.quality,
        writes: (window as unknown as { canvasWrites404: string[] }).canvasWrites404.length };
    });
    expect(frame).toEqual({ alpha: 255, quality: "low", writes });
    await page.waitForTimeout(35);
  }
  await page.waitForTimeout(3200);
  await expect(scene(page)).toHaveAttribute("data-quality", "low");
  await expect(scene(page)).toHaveAttribute("data-orientation", initial!);
  const beforeTime = Number(await scene(page).getAttribute("data-time"));
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect.poll(async () => Number(await scene(page).getAttribute("data-time"))).toBeGreaterThan(beforeTime);
  await expect(scene(page)).toHaveAttribute("data-orientation", initial!);
});
