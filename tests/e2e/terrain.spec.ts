import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    terrainProbe: { draws: number; oldDraws: number; bounds: number; listeners: Set<EventListenerOrEventListenerObject>; canvas?: HTMLCanvasElement };
  }
}
async function instrument(page: Page) {
  await page.addInitScript(() => {
    window.terrainProbe = { draws: 0, oldDraws: 0, bounds: 0, listeners: new Set() };
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.dataset.testid === "footer-terrain-mesh") window.terrainProbe.draws++;
      if (this.canvas === window.terrainProbe.canvas) window.terrainProbe.oldDraws++;
      return clear.apply(this, args);
    };
    const rect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      if (this instanceof HTMLCanvasElement && this.dataset.testid === "footer-terrain-mesh") window.terrainProbe.bounds++;
      return rect.call(this);
    };
    const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (this instanceof HTMLElement && this.matches("[data-terrain-host]") && /^(pointermove|pointerleave|pointercancel|click)$/.test(type) && listener) window.terrainProbe.listeners.add(listener);
      return add.call(this, type, listener, options);
    };
    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      if (listener) window.terrainProbe.listeners.delete(listener);
      return remove.call(this, type, listener, options);
    };
  });
}
async function open(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.getByTestId("hero-mesh").waitFor();
  await page.waitForTimeout(500);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  const canvas = page.getByTestId("footer-terrain-mesh");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await expect(canvas).toHaveAttribute("data-running", "true");
  return canvas;
}
const draws = (page: Page) => page.evaluate(() => window.terrainProbe.draws);
const bounds = (page: Page) => page.evaluate(() => window.terrainProbe.bounds);
const hide = (page: Page, hidden: boolean) => page.evaluate(hidden => {
  Object.defineProperty(document, "hidden", { configurable: true, value: hidden }); document.dispatchEvent(new Event("visibilitychange"));
}, hidden);

test("footer preserves composition, excludes controls and keyboard clicks, and recovers from taps", async ({ page }) => {
  await instrument(page); const canvas = await open(page);
  await expect(page.locator("footer iframe")).toHaveCount(0);
  await expect(canvas.locator("..")).toHaveCSS("height", "300px");
  await expect(canvas.locator("..")).toHaveCSS("opacity", "0.35");
  await expect(canvas).toHaveCSS("pointer-events", "none");
  expect(await canvas.evaluate(canvas => (canvas as HTMLCanvasElement).getContext("2d")?.getContextAttributes().desynchronized)).toBe(true);
  await page.waitForTimeout(100);
  const initial = await bounds(page), count = await draws(page);
  await expect.poll(() => draws(page)).toBeGreaterThan(count + 2);
  expect(await bounds(page)).toBe(initial);
  const writes = await canvas.evaluate(canvas => new Promise<number>(resolve => {
    let writes = 0;
    const observer = new MutationObserver(entries => { writes += entries.length; });
    observer.observe(canvas, { attributes: true, attributeFilter: ["data-ready", "style"] });
    setTimeout(() => { observer.disconnect(); resolve(writes); }, 250);
  }));
  expect(writes, "idle rendering must not invalidate fallback visibility each frame").toBe(0);
  await page.locator("footer").evaluate(footer => {
    for (const tag of ["a", "button", "input", "textarea", "select", "summary", "label"]) {
      const e = document.createElement(tag); footer.append(e);
      e.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1, clientX: 300, clientY: innerHeight - 25 })); e.remove();
    }
    for (const attribute of ["role", "contenteditable", "tabindex"]) {
      const e = document.createElement("div"); e.setAttribute(attribute, attribute === "role" ? "button" : attribute === "tabindex" ? "0" : "true");
      const child = document.createElement("span"); e.append(child); footer.append(e);
      child.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1, clientX: 300, clientY: innerHeight - 25 })); e.remove();
    }
    footer.dispatchEvent(new MouseEvent("click", { detail: 0, clientX: 300, clientY: innerHeight - 25 }));
  });
  await page.waitForTimeout(120); expect(await bounds(page)).toBe(initial);
  await page.locator("footer").dispatchEvent("click", { detail: 1, clientX: 300, clientY: page.viewportSize()!.height - 25 });
  await expect.poll(() => bounds(page)).toBeGreaterThan(initial);
  await page.waitForTimeout(1450); const recovered = await bounds(page), recoveredDraws = await draws(page);
  await expect.poll(() => draws(page)).toBeGreaterThan(recoveredDraws + 2);
  expect(await bounds(page)).toBe(recovered);
});

test("suspension stops draws; hidden resize resumes; reduced motion displays SVG and ignores input", async ({ page }) => {
  await instrument(page); const canvas = await open(page);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(canvas).toHaveAttribute("data-running", "false");
  const offscreen = await draws(page); await page.waitForTimeout(200); expect(await draws(page)).toBe(offscreen);
  await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await expect(canvas).toHaveAttribute("data-running", "true");
  await hide(page, true); await expect(canvas).toHaveAttribute("data-running", "false");
  const hidden = await draws(page), size = page.viewportSize()!;
  await page.setViewportSize({ width: size.width + 10, height: size.height });
  await page.waitForTimeout(200); expect(await draws(page)).toBe(hidden);
  await hide(page, false); await expect.poll(() => draws(page)).toBeGreaterThan(hidden + 2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas).toHaveAttribute("data-running", "false");
  await expect(page.locator("[data-terrain-fallback]:visible")).toBeVisible();
  const reduced = await draws(page);
  await page.locator("footer").dispatchEvent("click", { detail: 1, clientX: 300, clientY: size.height - 25 });
  await page.waitForTimeout(200); expect(await draws(page)).toBe(reduced);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(canvas).toHaveAttribute("data-running", "true");
  await expect(canvas).toHaveAttribute("data-ready", "true");
});

test("fine hover leaves and cancels without continuing bounds reads", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "Fine mouse input.");
  await instrument(page); await open(page);
  await page.mouse.move(1000, page.viewportSize()!.height - 25);
  await expect.poll(() => bounds(page)).toBeGreaterThan(2);
  await page.locator("footer").dispatchEvent("pointercancel");
  await page.waitForTimeout(100);
  const stopped = await bounds(page); await page.waitForTimeout(200); expect(await bounds(page)).toBe(stopped);
});

test("touch starts medium, supports taps and keeps native scrolling", async ({ page, context }, info) => {
  test.skip(info.project.name !== "mobile-chromium", "Mobile touch input.");
  await instrument(page); const canvas = await open(page);
  await expect(canvas).toHaveAttribute("data-quality", "medium");
  const height = page.viewportSize()!.height;
  await page.touchscreen.tap(300, height - 25); await expect.poll(() => bounds(page)).toBeGreaterThan(0);
  await page.waitForTimeout(1400);
  const before = await page.evaluate(() => scrollY), cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 200, y: height - 240 }] });
  for (const offset of [200, 160, 120, 80, 40]) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 200, y: height - offset }] });
    await page.waitForTimeout(20);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(before - 80);
});

test("canvas failures retain SVG and restoration rebuilds caches", async ({ page }) => {
  const canvas = await open(page);
  await canvas.dispatchEvent("contextlost", { cancelable: true });
  await expect(canvas).toHaveAttribute("data-running", "false");
  await expect(page.locator("[data-terrain-fallback]:visible")).toBeVisible();
  await canvas.dispatchEvent("contextrestored");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await expect(page.locator("[data-terrain-fallback]:visible")).toHaveCount(0);
});

test("no JS, reduced motion and unavailable contexts retain server terrain", async ({ browser }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "Fallback environments run once.");
  for (const mode of ["no-js", "reduced", "null", "throw"] as const) {
    const context = await browser.newContext({ javaScriptEnabled: mode !== "no-js", reducedMotion: mode === "reduced" ? "reduce" : "no-preference" });
    const page = await context.newPage();
    if (mode === "null" || mode === "throw") await page.addInitScript(mode => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
        if (this.dataset.testid === "footer-terrain-mesh") { if (mode === "throw") throw new Error("Test context failure"); return null; }
        return original.apply(this, args);
      } as typeof original;
    }, mode);
    await page.goto("/"); await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await expect(page.locator("[data-terrain-fallback]:visible")).toBeVisible();
    await expect(page.getByTestId("footer-terrain-mesh")).not.toHaveAttribute("data-ready", "true");
    await context.close();
  }
});

test("client navigation cleans up the detached footer and leaves one subscription", async ({ page }) => {
  await instrument(page); const canvas = await open(page);
  await canvas.evaluate(e => { window.terrainProbe.canvas = e as HTMLCanvasElement; });
  expect(await page.evaluate(() => window.terrainProbe.listeners.size)).toBe(3);
  await page.getByRole("navigation", { name: "Footer", exact: true }).getByRole("link", { name: "About CrimsonTide" }).click();
  await expect(page).toHaveURL(/\/company#company-about$/);
  await expect.poll(() => page.evaluate(() => window.terrainProbe.canvas?.isConnected)).toBe(false);
  expect(await page.evaluate(() => window.terrainProbe.canvas?.dataset.running)).toBe("false");
  expect(await page.evaluate(() => window.terrainProbe.listeners.size)).toBe(3);
  await expect(canvas).toHaveAttribute("data-running", "false");
  const count = await page.evaluate(() => window.terrainProbe.oldDraws);
  await page.waitForTimeout(200); expect(await page.evaluate(() => window.terrainProbe.oldDraws)).toBe(count);
});
