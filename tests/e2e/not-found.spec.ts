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

test("pause freezes frames, keyboard signals work, and navigation disposes the scene", async ({ page }) => {
  await ready(page);
  const signal = page.getByRole("button", { name: "Send a signal around the globe" });
  await signal.focus(); await page.keyboard.press("Enter");
  await expect(scene(page)).toHaveAttribute("data-signals", "1");
  await signal.click();
  await expect(scene(page)).toHaveAttribute("data-signals", "2");
  await page.getByRole("button", { name: "Pause animation" }).click();
  await expect(scene(page)).toHaveAttribute("data-motion", "paused");
  await page.waitForTimeout(100);
  const before = await scene(page).getAttribute("data-frames");
  await page.waitForTimeout(250);
  expect(await scene(page).getAttribute("data-frames")).toBe(before);
  await expect(signal).toBeDisabled();
  await page.getByRole("button", { name: "Resume animation" }).click();
  await expect.poll(() => scene(page).getAttribute("data-frames")).not.toBe(before);
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
  const x = Math.max(40, field!.x + field!.width * .28), y = Math.min(740, field!.y + field!.height * .65);
  await page.mouse.move(x, y);
  await expect.poll(() => scene(page).evaluate(root => Math.abs(parseFloat(root.style.getPropertyValue("--globe-x")) || 0))).toBeGreaterThan(1);
  expect(await page.locator("h1").boundingBox()).toEqual(heading);
  await page.mouse.click(x, y, { clickCount: 5 });
  await expect.poll(() => scene(page).getAttribute("data-ripples")).toBe("3");
  await expect.poll(() => scene(page).getAttribute("data-ripples"), { timeout: 4000 }).toBe("0");
  await page.mouse.move(5, 5);
  await expect.poll(() => scene(page).evaluate(root => Math.abs(parseFloat(root.style.getPropertyValue("--globe-x")) || 0)), { timeout: 3000 }).toBeLessThan(.1);
});

test("touch can send a globe signal without pointer parallax", async ({ page }, info) => {
  test.skip(info.project.name.startsWith("desktop"), "Touch contexts only.");
  await ready(page);
  await page.getByRole("button", { name: "Send a signal around the globe" }).tap();
  await expect(scene(page)).toHaveAttribute("data-signals", "1");
  expect(await scene(page).evaluate(root => parseFloat(root.style.getPropertyValue("--globe-x")) || 0)).toBe(0);
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
