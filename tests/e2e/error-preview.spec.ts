import { test, expect } from "./fixtures";

const route = "/error-preview";
const artwork = (page: import("@playwright/test").Page) => page.locator("[data-error-artwork]");
const lightControls = (page: import("@playwright/test").Page) => page.getByRole("group", { name: "Searchlight controls" });

test("development preview preserves the layered scene and recovery actions", async ({ page }) => {
  const response = await page.goto(route);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Error-page preview — CrimsonTide");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { name: "An error occurred" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to home" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact us", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to home" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Contact us", exact: true })).toHaveAttribute("href", "/contact");
  await expect.poll(() => artwork(page).getAttribute("data-light-ready")).toBe("true");
  await expect(lightControls(page)).toHaveAttribute("aria-disabled", "false");
  await expect(lightControls(page)).toHaveAttribute("tabindex", "0");
  await expect(page.locator('img[src^="/error_page/"]')).toHaveCount(5);
  await expect.poll(() => page.locator('img[src^="/error_page/"]').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("recovery navigation cleans up the scene", async ({ page }) => {
  await page.goto(route);
  await expect.poll(() => artwork(page).getAttribute("data-light-ready")).toBe("true");
  await artwork(page).evaluate(element => { (window as unknown as { previousErrorPreview: Element }).previousErrorPreview = element; });
  await page.getByRole("link", { name: "Go to home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("h1")).toBeFocused();
  await expect.poll(() => page.evaluate(() => {
    const scene = (window as unknown as { previousErrorPreview: Element }).previousErrorPreview as HTMLElement;
    return `${scene.dataset.motion}:${scene.dataset.lightReady}`;
  })).toBe("paused:false");
});

test("the light accepts mouse, touch, and keyboard aiming while astronaut activation stays inert", async ({ page }, info) => {
  await page.goto(route);
  await expect.poll(() => artwork(page).getAttribute("data-light-ready")).toBe("true");
  const scene = artwork(page);
  await scene.scrollIntoViewIfNeeded();
  const box = (await scene.boundingBox())!;
  if (info.project.use.hasTouch) {
    await page.touchscreen.tap(box.x + box.width * .18, box.y + box.height * .52);
  } else {
    await page.mouse.move(box.x + box.width * .82, box.y + box.height * .44);
  }
  await expect(scene).toHaveAttribute("data-light-direction", "aimed");
  const controls = lightControls(page);
  await controls.focus();
  await page.keyboard.press("ArrowRight");
  await expect(scene).toHaveAttribute("data-light-direction", "aimed");
  await page.keyboard.press("Home");
  await expect(scene).toHaveAttribute("data-light-direction", "home");
  const beforeInertInput = await scene.evaluate(element => ({
    direction: element.getAttribute("data-light-direction"),
    x: element.getAttribute("data-light-x"),
    y: element.getAttribute("data-light-y"),
  }));
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await controls.click();
  await expect.poll(() => scene.evaluate(element => ({
    direction: element.getAttribute("data-light-direction"),
    x: element.getAttribute("data-light-x"),
    y: element.getAttribute("data-light-y"),
  }))).toEqual(beforeInertInput);
  await expect(scene).not.toHaveAttribute("data-beacon");
});

test("focus remains in document flow and clipped scene layers stay aligned", async ({ page }) => {
  await page.goto(route);
  await expect.poll(() => artwork(page).getAttribute("data-light-ready")).toBe("true");
  const scene = artwork(page);
  const measure = () => scene.evaluate(element => {
    const root = element.getBoundingClientRect();
    const layers = [element.querySelector("canvas"), ...Array.from(element.querySelectorAll("img")).slice(0, 4).filter((_, index) => index !== 1)];
    return {
      artworkScrollTop: element.scrollTop,
      sceneScrollTop: element.closest("section")?.scrollTop,
      layersAligned: layers.every(layer => {
        if (!layer) return false;
        const bounds = layer.getBoundingClientRect();
        return Math.abs(bounds.left - root.left) < .5 && Math.abs(bounds.top - root.top) < .5
          && Math.abs(bounds.width - root.width) < .5 && Math.abs(bounds.height - root.height) < .5;
      }),
    };
  });

  const contact = page.getByRole("link", { name: "Contact us", exact: true });
  await contact.focus();
  await page.keyboard.press("Tab");
  await expect(lightControls(page)).toBeFocused();
  await expect(lightControls(page)).toHaveCSS("outline-style", "solid");
  await expect(lightControls(page)).toHaveCSS("outline-offset", "-7px");
  expect(await measure()).toEqual({ artworkScrollTop: 0, sceneScrollTop: 0, layersAligned: true });
  await page.keyboard.press("Shift+Tab");
  await expect(contact).toBeFocused();
  expect(await measure()).toEqual({ artworkScrollTop: 0, sceneScrollTop: 0, layersAligned: true });
});

test("reduced motion keeps the light steady and the static composition survives canvas failure", async ({ browser, page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  await expect.poll(() => artwork(page).getAttribute("data-light-ready")).toBe("true");
  expect(await page.locator("[data-error-light]").evaluate(element => Number.parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThan(.001);

  test.skip(!info.project.name.startsWith("desktop"), "One static fallback pass is enough.");
  const fallback = await browser.newContext({ javaScriptEnabled: true });
  const fallbackPage = await fallback.newPage();
  await fallbackPage.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await fallbackPage.goto(route);
  await expect(artwork(fallbackPage)).toHaveAttribute("data-light-ready", "false");
  await expect(lightControls(fallbackPage)).toHaveAttribute("aria-disabled", "true");
  await expect(lightControls(fallbackPage)).toHaveAttribute("tabindex", "-1");
  await expect(fallbackPage.getByRole("heading", { name: "An error occurred" })).toBeVisible();
  await expect(fallbackPage.getByRole("link", { name: "Go to home" })).toBeVisible();
  await fallback.close();
});

test("no-JavaScript copy, artwork, and recovery links remain usable", async ({ browser }, info) => {
  test.skip(!info.project.name.startsWith("desktop"), "One no-JavaScript pass is enough.");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto(route);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "An error occurred" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to home" })).toBeVisible();
  await expect(page.locator('img[src^="/error_page/"]')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test("320 by 568 retains a scrollable reading order with reachable actions and footer", async ({ page }, info) => {
  test.skip(!info.project.name.startsWith("desktop"), "One compact-viewport pass is enough.");
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto(route);
  await expect(page.getByRole("heading", { name: "An error occurred" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to home" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Company", exact: true })).toBeVisible();
});
