import { expect, test, type Page } from "@playwright/test";

type Probe = { draws: number; bounds: number };
declare global {
  interface Window {
    meshProbe: Record<string, Probe>;
    meshOldCanvas?: HTMLCanvasElement;
    meshOldSection?: HTMLElement;
    meshListeners: Map<EventTarget, Set<EventListenerOrEventListenerObject>>;
  }
}

async function instrument(page: Page) {
  await page.addInitScript(() => {
    window.meshProbe = {};
    window.meshListeners = new Map();
    const probe = (canvas: HTMLCanvasElement) => {
      const id = canvas.dataset.testid;
      if (!id?.includes("mesh")) return;
      return window.meshProbe[id] ??= { draws: 0, bounds: 0 };
    };
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      const stats = probe(this.canvas); if (stats) stats.draws++;
      return clear.apply(this, args);
    };
    const bounds = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      if (this instanceof HTMLCanvasElement) { const stats = probe(this); if (stats) stats.bounds++; }
      return bounds.call(this);
    };
    const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (this instanceof HTMLElement && this.tagName === "SECTION" && /^(pointermove|pointerleave|pointercancel|click)$/.test(type) && listener) {
        const listeners = window.meshListeners.get(this) ?? new Set(); listeners.add(listener); window.meshListeners.set(this, listeners);
      }
      return add.call(this, type, listener, options);
    };
    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      if (listener) window.meshListeners.get(this)?.delete(listener);
      return remove.call(this, type, listener, options);
    };
  });
}

async function open(page: Page, variant: "home" | "openjm" | "sentinel") {
  const id = variant === "home" ? "company-mesh" : `products-mesh-${variant}`;
  await page.goto(variant === "home" ? "/" : `/products#products-${variant}`);
  await page.evaluate(() => document.fonts.ready);
  const canvas = page.getByTestId(id);
  if (variant === "home") await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await expect(canvas).toHaveAttribute("data-running", "true");
  // Cancel any native hash-scroll animation before measuring idle behavior.
  if (variant !== "home") await canvas.locator("xpath=ancestor::section[1]").evaluate(e => scrollTo({ top: scrollY + e.getBoundingClientRect().top - 100, behavior: "instant" }));
  return { canvas, id, section: canvas.locator("xpath=ancestor::section[1]") };
}

for (const variant of ["home", "openjm", "sentinel"] as const) {
  test(`${variant}: idle avoids bounds reads, controls and keyboard clicks are excluded, taps recover`, async ({ page }) => {
    await instrument(page);
    const { canvas, id, section } = await open(page, variant);
    await page.waitForTimeout(300);
    const stats = () => page.evaluate(id => window.meshProbe[id], id);
    const initial = await stats();
    await expect.poll(async () => (await stats()).draws).toBeGreaterThan(initial.draws + 2);
    expect((await stats()).bounds).toBe(initial.bounds);
    // These controls live inside the listening section, including nested targets.
    await section.evaluate(section => {
      for (const tag of ["button", "a", "input", "textarea", "select", "summary"]) {
        const control = document.createElement(tag); section.append(control);
        control.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1, clientX: 300, clientY: 400 })); control.remove();
      }
      for (const attribute of ["role", "contenteditable", "tabindex"]) {
        const control = document.createElement("div"); control.setAttribute(attribute, attribute === "role" ? "button" : attribute === "tabindex" ? "0" : "true");
        const child = document.createElement("span"); control.append(child); section.append(control);
        child.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 })); control.remove();
      }
      section.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
    });
    await expect.poll(async () => (await stats()).draws).toBeGreaterThan(initial.draws + 4);
    expect((await stats()).bounds).toBe(initial.bounds);
    await section.dispatchEvent("click", { detail: 1, button: 0, clientX: 300, clientY: 400 });
    await expect.poll(async () => (await stats()).bounds).toBeGreaterThan(0);
    await page.waitForTimeout(1500);
    const recovered = await stats();
    await expect.poll(async () => (await stats()).draws).toBeGreaterThan(recovered.draws + 3);
    expect((await stats()).bounds).toBe(recovered.bounds);
    expect(recovered.bounds).toBeLessThanOrEqual(recovered.draws);
    await expect(canvas.locator("..").locator("svg")).toHaveCSS("visibility", "hidden");
  });
}

test("fine hover measures only at draw time and follows the static home canvas", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "Fine pointer only.");
  await instrument(page);
  const { canvas, id, section } = await open(page, "home");
  await section.evaluate(e => scrollTo({ top: scrollY + e.getBoundingClientRect().top + 80, behavior: "instant" }));
  // clientWidth rounds percentage widths to an integer; compare against the
  // computed fractional CSS width to catch transforms without rounding noise.
  await expect.poll(() => canvas.evaluate(e => e.getBoundingClientRect().width / parseFloat(getComputedStyle(e).width))).toBeCloseTo(1, 5);
  const before = await page.evaluate(id => window.meshProbe[id], id);
  await section.evaluate(section => {
    for (let i = 0; i < 100; i++) section.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerType: "mouse", clientX: 1000 + i, clientY: 430 }));
  });
  const immediately = await page.evaluate(id => window.meshProbe[id], id);
  expect(immediately.bounds - before.bounds).toBeLessThanOrEqual(immediately.draws - before.draws);
  await expect.poll(() => page.evaluate(id => window.meshProbe[id].bounds, id)).toBeGreaterThan(before.bounds);
  await section.dispatchEvent("pointerleave");
  await page.waitForTimeout(1300);
  const recovered = await page.evaluate(id => window.meshProbe[id], id);
  await expect.poll(() => page.evaluate(id => window.meshProbe[id].draws, id)).toBeGreaterThan(recovered.draws + 3);
  expect(await page.evaluate(id => window.meshProbe[id].bounds, id)).toBe(recovered.bounds);
});

for (const variant of ["home", "openjm", "sentinel"] as const) {
  test(`${variant}: offscreen and hidden meshes stop drawing, reduced-motion changes keep a still composition`, async ({ page }) => {
    await instrument(page);
    const { canvas, id } = await open(page, variant);
    await page.evaluate(variant => scrollTo({ top: variant === "home" ? document.body.scrollHeight : 0, behavior: "instant" }), variant);
    await expect(canvas).toHaveAttribute("data-running", "false");
    const count = await page.evaluate(id => window.meshProbe[id].draws, id);
    await page.waitForTimeout(180); expect(await page.evaluate(id => window.meshProbe[id].draws, id)).toBe(count);
    await canvas.scrollIntoViewIfNeeded();
    await expect(canvas).toHaveAttribute("data-running", "true");
    // Controlled visibility input; real browser background throttling is not a CI timer.
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
    await expect(canvas).toHaveAttribute("data-running", "false");
    const hidden = await page.evaluate(id => window.meshProbe[id].draws, id);
    const viewport = page.viewportSize()!;
    await page.setViewportSize({ width: viewport.width - 10, height: viewport.height });
    await page.waitForTimeout(180); expect(await page.evaluate(id => window.meshProbe[id].draws, id)).toBe(hidden);
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: false }); document.dispatchEvent(new Event("visibilitychange")); });
    await expect(canvas).toHaveAttribute("data-running", "true");
    await expect.poll(() => page.evaluate(id => window.meshProbe[id].draws, id)).toBeGreaterThan(hidden + 2);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(canvas).toHaveAttribute("data-running", "false");
    // Products also change scene height here. Let ResizeObserver and the static
    // redraw settle before checking that a click cannot animate the composition.
    await page.waitForTimeout(250);
    const still = await canvas.evaluate((e: HTMLCanvasElement) => e.toDataURL());
    await canvas.locator("xpath=ancestor::section[1]").dispatchEvent("click", { detail: 1, clientX: 300, clientY: 400 });
    await page.waitForTimeout(180); expect(await canvas.evaluate((e: HTMLCanvasElement, still) => e.toDataURL() === still, still)).toBe(true);
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
    await page.setViewportSize({ width: 360, height: 740 });
    await page.waitForTimeout(100);
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: false }); document.dispatchEvent(new Event("visibilitychange")); });
    await canvas.scrollIntoViewIfNeeded();
    await expect(canvas).toHaveAttribute("data-ready", "true");
    await expect.poll(() => canvas.evaluate((e: HTMLCanvasElement) => e.width)).toBeLessThanOrEqual(540);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(canvas).toHaveAttribute("data-running", "true");
  });

}

test("mobile uses medium sampling, keeps ambient animation and tap ripples, and permits touch scrolling", async ({ page, context }, info) => {
  test.skip(info.project.name !== "mobile-chromium", "Requires mobile touch emulation.");
  await instrument(page);
  const { canvas, id } = await open(page, "home");
  await expect(canvas).toHaveAttribute("data-quality", "medium");
  await page.touchscreen.tap(320, 570);
  await expect.poll(() => page.evaluate(id => window.meshProbe[id].bounds, id)).toBeGreaterThan(0);
  await page.waitForTimeout(1500);
  const before = await page.evaluate(id => window.meshProbe[id], id);
  const scrollBefore = await page.evaluate(() => scrollY);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 200, y: 600 }] });
  for (const y of [560, 500, 440, 380, 320]) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 200, y }] });
    await page.waitForTimeout(20);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore + 100);
  const after = await page.evaluate(id => window.meshProbe[id], id);
  expect(after.bounds - before.bounds).toBeLessThanOrEqual(after.draws - before.draws);
});

test("canvas failure and JavaScript absence expose each shape's SVG; context restoration resumes", async ({ browser, page }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "Failure modes run once.");
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  const fallbackPage = await noJS.newPage();
  for (const variant of ["home", "openjm", "sentinel"]) {
    await fallbackPage.goto(variant === "home" ? "/" : `/products#products-${variant}`);
    await expect(fallbackPage.locator(`[data-mesh-fallback="${variant === "home" ? "company-mountains" : variant}"]`)).toBeVisible();
  }
  await noJS.close();
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (this.dataset.testid?.includes("mesh")) throw new Error("Test canvas unavailable");
      return original.apply(this, args);
    } as typeof original;
  });
  for (const variant of ["home", "openjm", "sentinel"]) {
    await page.goto(variant === "home" ? "/" : `/products#products-${variant}`);
    await expect(page.locator(`[data-mesh-fallback="${variant === "home" ? "company-mountains" : variant}"]`)).toBeVisible();
  }
  for (const variant of ["home", "openjm", "sentinel"] as const) {
    const restoredPage = await browser.newPage();
    const { canvas } = await open(restoredPage, variant);
    const fallback = restoredPage.locator(`[data-mesh-fallback="${variant === "home" ? "company-mountains" : variant}"]`);
    await canvas.dispatchEvent("contextlost");
    await expect(fallback).toBeVisible();
    await expect(canvas).not.toHaveAttribute("data-ready", "true");
    await canvas.dispatchEvent("contextrestored");
    await expect(canvas).toHaveAttribute("data-ready", "true");
    await expect(fallback).toHaveCSS("visibility", "hidden");
    await restoredPage.close();
  }
});

test("client navigation removes mesh listeners and stops detached canvases", async ({ page }) => {
  await instrument(page);
  const { canvas } = await open(page, "home");
  await canvas.evaluate((e: HTMLCanvasElement) => { window.meshOldCanvas = e; window.meshOldSection = e.closest("section")!; });
  expect(await page.evaluate(() => window.meshListeners.get(window.meshOldSection!)?.size)).toBe(3);
  const menu = page.getByRole("button", { name: "Menu" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("link", { name: "Company", exact: true }).first().click();
  await expect(page).toHaveURL(/\/company$/);
  await expect.poll(() => page.evaluate(() => window.meshOldCanvas?.isConnected)).toBe(false);
  expect(await page.evaluate(() => window.meshListeners.get(window.meshOldSection!)?.size)).toBe(0);
  expect(await page.evaluate(() => window.meshOldCanvas?.dataset.running)).toBe("false");
  const count = await page.evaluate(() => window.meshProbe["company-mesh"].draws);
  await page.waitForTimeout(180); expect(await page.evaluate(() => window.meshProbe["company-mesh"].draws)).toBe(count);
});

