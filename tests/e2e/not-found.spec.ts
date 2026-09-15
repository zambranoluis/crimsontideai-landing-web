import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "./fixtures";

const missing = "/this-route-does-not-exist";
const scene = (page: Page) => page.getByTestId("not-found-scene");
async function ready(page: Page) {
  await page.goto(missing);
  await expect(scene(page)).toHaveAttribute("data-globe-ready", "true", { timeout: 30000 });
}

async function placeSkyStar(page: Page, x = .3, y = .08) {
  const box = (await scene(page).boundingBox())!;
  const point = { x: box.x + box.width * x, y: box.y + box.height * y };
  await page.mouse.click(point.x, point.y);
  return point;
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

test("empty sky clicks place six bounded SVG stars and let them expire", async ({ page }, info) => {
  test.skip(!info.project.name.startsWith("desktop"), "Mouse placement is covered on desktop.");
  await ready(page);
  const point = await placeSkyStar(page);
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "1");
  const pageBounds = (await page.locator("[data-not-found-page]").boundingBox())!;
  const firstStar = page.locator("[data-sky-star]").first();
  expect(await firstStar.evaluate((star, expected) => {
    const circle = star as SVGCircleElement;
    return circle instanceof SVGCircleElement
      && Math.abs(Number(circle.getAttribute("cx")) - expected.x) < .5
      && Math.abs(Number(circle.getAttribute("cy")) - expected.y) < .5
      && circle.getAttribute("r") === "1.2"
      && circle.getAttribute("fill") === "#d7ac9c";
  }, { x: point.x - pageBounds.x, y: point.y - pageBounds.y })).toBe(true);
  for (let i = 0; i < 6; i++) await placeSkyStar(page);
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "6");
  await expect(page.locator("[data-sky-star]")).toHaveCount(6);
  await page.waitForTimeout(3100);
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "0");
});

test("empty header sky places a precisely located star and leaves the full logo link intact", async ({ page }) => {
  await ready(page);
  const header = (await page.locator("header").boundingBox())!;
  const point = { x: header.x + header.width * .8, y: header.y + header.height / 2 };
  await page.mouse.click(point.x, point.y);
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "1");
  const star = page.locator("[data-sky-star]");
  await expect(star).toHaveCount(1);
  const starBounds = (await star.boundingBox())!;
  expect(Math.abs(starBounds.x + starBounds.width / 2 - point.x)).toBeLessThan(1);
  expect(Math.abs(starBounds.y + starBounds.height / 2 - point.y)).toBeLessThan(1);
  await page.locator("header").getByRole("link", { name: "CrimsonTide home" }).click();
  await expect(page).toHaveURL(/\/$/);
});

for (const mode of ["animated", "reduced motion", "context loss"] as const) {
  test(`Earth decorations pass through one sky star per gesture with ${mode}`, async ({ page }, info) => {
    if (mode === "reduced motion") {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(missing);
    } else {
      await ready(page);
      if (mode === "context loss") {
        await page.locator("[data-globe-canvas]").evaluate(canvas => {
          (canvas as HTMLCanvasElement).getContext("webgl2")!.getExtension("WEBGL_lose_context")!.loseContext();
        });
      }
    }
    const earth = page.locator("[data-globe-button]");
    await expect(page.locator("[data-sky-control]")).toBeEnabled();
    await page.evaluate(() => document.fonts.ready);
    if (mode !== "animated") {
      await expect(earth).toBeDisabled();
      await expect(page.locator('img[src$="globe-poster.png"]')).toHaveCSS("opacity", "1");
    }
    // Count creations rather than live stars: global reduced-motion CSS shortens their lifetime.
    await page.evaluate(() => {
      const created = { count: 0 };
      Object.assign(window, { created404Stars: created });
      new MutationObserver(records => {
        for (const record of records) {
          created.count += Array.from(record.addedNodes).filter(node => node instanceof Element && node.hasAttribute("data-sky-star")).length;
        }
      }).observe(document.querySelector("[data-sky-star-layer]")!, { childList: true });
    });
    const createdStars = () => page.evaluate(() => (window as unknown as { created404Stars: { count: number } }).created404Stars.count);
    const gesture = async (x: number, y: number) => {
      if (info.project.use.hasTouch) await page.touchscreen.tap(x, y);
      else await page.mouse.click(x, y);
    };
    const host = (await page.locator("[data-globe-host]").boundingBox())!;
    const bounds = (await earth.boundingBox())!;
    const labels = await page.locator("[data-globe-host] > div").all();
    const points = [];
    for (const label of labels.slice(0, 2)) {
      const box = (await label.boundingBox())!;
      // The upper right label partly overlaps the existing keyboard sky control.
      points.push({ x: box.x + box.width / 2, y: box.y + box.height - 2 });
    }
    points.push(
      { x: host.x + host.width * .12, y: host.y + host.height * .3 }, // Outer orbit.
      { x: host.x + host.width * .03, y: host.y + host.height * .03 }, // Empty wrapper.
      { x: bounds.x + bounds.width * .04, y: bounds.y + bounds.height * .04 }, // Outside the ellipse, inside its rectangle.
    );
    for (const [index, point] of points.entries()) {
      await gesture(point.x, point.y);
      await expect.poll(createdStars).toBe(index + 1);
    }
    expect(await scene(page).getAttribute("data-signals")).toBeNull();
    await gesture(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    expect(await createdStars()).toBe(points.length);
    if (mode === "animated") await expect(scene(page)).toHaveAttribute("data-signals", "1");
    else expect(await scene(page).getAttribute("data-signals")).toBeNull();
  });
}

test("the error pulse has one 1.8-second ring and clears the Error label", async ({ page }) => {
  await ready(page);
  const dot = page.getByText("Error", { exact: true }).locator("span");
  const pulse = await dot.evaluate(element => {
    const ring = getComputedStyle(element, "::before");
    const after = getComputedStyle(element, "::after");
    const range = document.createRange();
    range.selectNodeContents(element.parentElement!.lastChild!);
    const text = range.getBoundingClientRect();
    const dot = element.getBoundingClientRect();
    return {
      animation: ring.animationName,
      duration: ring.animationDuration,
      after: after.content,
      clearance: text.left - (dot.left + dot.width / 2 + dot.width),
    };
  });
  expect(pulse.animation).toContain("error-ping");
  expect(pulse).toEqual(expect.objectContaining({ duration: "1.8s", after: "none" }));
  expect(pulse.clearance).toBeGreaterThan(0);
});

test("sky ignores content, globe, terrain, and touch scrolling", async ({ page, context }, info) => {
  await ready(page);
  await page.locator("p").filter({ hasText: "The page you’re looking for doesn’t exist" }).click();
  await page.getByRole("button", { name: "Send a signal around the globe" }).click();
  const terrain = (await page.locator("[data-terrain-canvas]").boundingBox())!;
  await page.mouse.click(terrain.x + terrain.width * .25, terrain.y + terrain.height * .75);
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "0");
  if (info.project.name === "desktop-chromium") return;
  const box = (await scene(page).boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const x = box.x + box.width * .75, y = box.y + box.height * .2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y + 48 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "0");
  await cdp.detach();
});

test("keyboard and touch controls create a single star", async ({ page, context }, info) => {
  await ready(page);
  const skyControl = page.getByRole("button", { name: "Create a star in the clear sky" });
  await skyControl.focus();
  await expect(skyControl).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "1");
  await page.keyboard.press("Space");
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "2");
  if (info.project.name === "desktop-chromium") return;
  const box = (await scene(page).boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const x = box.x + box.width * .75, y = box.y + box.height * .2;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "3");
  await cdp.detach();
});

test("reduced motion uses the poster and responds to a mounted preference change", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(missing);
  await expect(scene(page)).toHaveAttribute("data-motion", "paused");
  await expect(page.getByRole("button", { name: "Send a signal around the globe" })).toBeDisabled();
  const skyControl = page.getByRole("button", { name: "Create a star in the clear sky" });
  await expect(skyControl).toBeEnabled();
  await skyControl.click();
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "1");
  await expect(page.getByText("Error", { exact: true }).locator("span")).toHaveCSS("width", info.project.name === "desktop-chromium" ? "10px" : "8px");
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

for (const texture of ["land-mask.png", "earth-relief.png", "earth-lights.png"]) {
test(`${texture} failure keeps the globe poster and usable navigation`, async ({ page }) => {
  await page.route(`**/pages/not-found/${texture}`, route => route.fulfill({ status: 503, body: "Unavailable" }));
  const failedTexture = page.waitForResponse(response => response.url().endsWith(texture) && response.status() === 503);
  await page.goto(missing);
  await failedTexture;
  await expect(scene(page)).toHaveAttribute("data-terrain-ready", "true");
  await expect(scene(page)).toHaveAttribute("data-globe-ready", "false");
  await expect(page.locator('img[src$="globe-poster.png"]')).toHaveCSS("opacity", "1");
  await expect(page.getByRole("button", { name: "Send a signal around the globe" })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});
}

test("render failure restores the poster and disables the globe control", async ({ page }) => {
  await ready(page);
  await page.locator("[data-globe-canvas]").evaluate(canvas => {
    const gl = (canvas as HTMLCanvasElement).getContext("webgl2")!;
    gl.drawElements = () => { throw new Error("Simulated draw failure"); };
  });
  await expect(scene(page)).toHaveAttribute("data-globe-ready", "false");
  await expect(page.locator('img[src$="globe-poster.png"]')).toHaveCSS("opacity", "1");
  await expect(page.getByRole("button", { name: "Send a signal around the globe" })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});

test("navigation aborts pending maps and closes decoded bitmaps", async ({ page }) => {
  await page.addInitScript(() => {
    const decode = window.createImageBitmap.bind(window);
    const resources = { decoded: 0, open: 0 };
    Object.assign(window, { globeResources404: resources });
    window.createImageBitmap = (async (...args: Parameters<typeof createImageBitmap>) => {
      const bitmap = await decode(...args);
      resources.decoded++; resources.open++;
      const close = bitmap.close.bind(bitmap);
      bitmap.close = () => { resources.open--; close(); };
      return bitmap;
    }) as typeof createImageBitmap;
  });
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/pages/not-found/earth-relief.png", async route => { await held; await route.continue(); });
  try {
    await page.goto(missing);
    const resources = () => page.evaluate(() => (window as unknown as { globeResources404: { decoded: number; open: number } }).globeResources404);
    await expect.poll(async () => (await resources()).decoded).toBe(2);
    await expect(page.locator('img[src$="globe-poster.png"]')).toHaveCSS("opacity", "1");
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(async () => (await resources()).open).toBe(0);
    expect((await resources()).decoded).toBe(2);
  } finally { release(); }
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
  const skyControl = page.getByRole("button", { name: "Create a star in the clear sky" });
  await skyControl.focus(); await page.keyboard.press("Enter");
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "1");
  await page.locator("footer").evaluate(footer => { footer.style.minHeight = "150vh"; });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(scene(page)).toHaveAttribute("data-motion", "paused");
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "0");
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

test("trackball rotates in every direction, resumes its ambient spin, and emits no signal", async ({ page }) => {
  await ready(page);
  const globe = page.locator("[data-globe-button]");
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
    await expect.poll(() => scene(page).getAttribute("data-orientation"), { timeout: 1000 }).not.toBe(released);
    expect(await scene(page).getAttribute("data-signals")).toBeNull();
    await expect(scene(page)).toHaveAttribute("data-sky-stars", "0");
  }
  await globe.focus(); await page.keyboard.press("Home");
  for (const key of ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"]) {
    const before = await scene(page).getAttribute("data-orientation");
    await page.keyboard.press(key);
    expect(await scene(page).getAttribute("data-orientation")).not.toBe(before);
  }
  await expect(page.locator("[data-rotate]")).toHaveCount(0);
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 5, cy); await page.mouse.up();
  await expect(scene(page)).toHaveAttribute("data-signals", "1");
});

test("capture cancellation and document hiding end a drag, then resume the ambient spin", async ({ page }) => {
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
    await expect.poll(() => scene(page).getAttribute("data-orientation"), { timeout: 1000 }).not.toBe(rotated);
    expect(await scene(page).getAttribute("data-signals")).toBeNull();
  }
});

test("single-finger drag captures touch and a tap sends a signal", async ({ page, context }, info) => {
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
  await expect(scene(page)).toHaveAttribute("data-sky-stars", "0");
  await expect(page.locator("[data-rotate]")).toHaveCount(0);
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
  await expect(scene(page)).not.toHaveAttribute("data-orientation", initial!);
  const beforeTime = Number(await scene(page).getAttribute("data-time"));
  const beforeResize = await scene(page).getAttribute("data-orientation");
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect.poll(async () => Number(await scene(page).getAttribute("data-time"))).toBeGreaterThan(beforeTime);
  await expect.poll(() => scene(page).getAttribute("data-orientation")).not.toBe(beforeResize);
});
