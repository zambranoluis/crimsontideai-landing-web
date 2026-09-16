import { test, expect } from "./fixtures";

const route = "/error-preview";
const artwork = (page: import("@playwright/test").Page) => page.locator("[data-error-artwork]");
const lightControls = (page: import("@playwright/test").Page) => page.getByRole("button", { name: "Aim searchlight and release a dust disturbance" });
const pauseControl = (page: import("@playwright/test").Page) => page.getByRole("button", { name: /animation/ });

async function ready(page: import("@playwright/test").Page) {
  await expect.poll(() => artwork(page).getAttribute("data-light-ready")).toBe("true");
  await expect.poll(() => artwork(page).getAttribute("data-masks-ready")).toBe("true");
}

test("development preview preserves the layered scene, recovery actions, and bounded effects", async ({ page }) => {
  const response = await page.goto(route);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Error-page preview — CrimsonTide");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { name: "An error occurred" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to home" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Contact us", exact: true })).toHaveAttribute("href", "/contact");
  await ready(page);
  await expect(lightControls(page)).toBeEnabled();
  await expect(pauseControl(page)).toBeVisible();
  await expect(page.locator('img[src^="/error_page/"]')).toHaveCount(5);
  await expect.poll(() => page.locator('img[src^="/error_page/"]').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  expect(Number(await artwork(page).getAttribute("data-particles"))).toBeLessThanOrEqual(100);
  expect(Number(await artwork(page).getAttribute("data-wisps"))).toBeLessThanOrEqual(12);
  expect(Number(await artwork(page).getAttribute("data-pixel-ratio"))).toBeLessThanOrEqual(1.5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("mouse parallax, silhouette hover, bursts, and pointer exit remain localized to artwork", async ({ page }, info) => {
  test.skip(!info.project.name.startsWith("desktop"), "Fine-pointer parallax is desktop-only; touch has its own path.");
  await page.goto(route); await ready(page);
  const scene = artwork(page); const box = (await scene.boundingBox())!;
  await page.mouse.move(box.x + box.width * .82, box.y + box.height * .42);
  await expect.poll(() => scene.evaluate(element => element.style.getPropertyValue("--terrain-x"))).not.toBe("0.00px");

  const planet = page.locator("[data-scene-layer='planet']");
  const planetBox = (await planet.boundingBox())!;
  await page.mouse.move(planetBox.x + planetBox.width * .56, planetBox.y + planetBox.height * .53);
  await expect(scene).toHaveAttribute("data-hover", "planet");
  await expect(page.locator("[data-planet-aura]")).toHaveCSS("opacity", "1");

  const terrain = page.locator("[data-scene-layer='terrain']");
  const terrainBox = (await terrain.boundingBox())!;
  await page.mouse.move(terrainBox.x + terrainBox.width * .5, terrainBox.y + terrainBox.height * .86);
  await expect(scene).toHaveAttribute("data-hover", "terrain");
  const beforeBurst = Number(await scene.getAttribute("data-bursts") || 0);
  await page.mouse.click(terrainBox.x + terrainBox.width * .5, terrainBox.y + terrainBox.height * .86);
  await expect.poll(async () => Number(await scene.getAttribute("data-bursts"))).toBe(beforeBurst + 1);
  expect(Number(await scene.getAttribute("data-particles"))).toBeLessThanOrEqual(100);

  await page.mouse.move(box.x - 12, box.y - 12);
  await expect(scene).toHaveAttribute("data-hover", "none");
  await expect.poll(() => scene.evaluate(element => Math.abs(Number.parseFloat(element.style.getPropertyValue("--terrain-x"))) < .2)).toBe(true);
});

test("keyboard aiming, repeated astronaut activation, and pause/resume are accessible", async ({ page }) => {
  await page.goto(route); await ready(page);
  const scene = artwork(page), controls = lightControls(page);
  await controls.focus();
  await page.keyboard.press("ArrowRight"); await expect(scene).toHaveAttribute("data-light-direction", "aimed");
  await page.keyboard.press("Home"); await expect(scene).toHaveAttribute("data-light-direction", "home");
  const beforeBursts = Number(await scene.getAttribute("data-bursts") || 0);
  await page.keyboard.press("Enter"); await page.keyboard.press("Space");
  await expect.poll(async () => Number(await scene.getAttribute("data-bursts"))).toBe(beforeBursts + 2);
  await expect(scene).toHaveAttribute("data-feedback", "true");
  await pauseControl(page).click();
  await expect(scene).toHaveAttribute("data-motion", "paused");
  await expect(pauseControl(page)).toHaveAccessibleName("Resume animation");
  await pauseControl(page).click();
  await expect.poll(() => scene.getAttribute("data-motion")).toBe("running");
});

test("touch taps aim and disturb without blocking scrolling", async ({ page }, info) => {
  test.skip(!info.project.use.hasTouch, "Touch path is covered by tablet and mobile Chromium.");
  await page.goto(route); await ready(page);
  const scene = artwork(page); await scene.scrollIntoViewIfNeeded();
  const box = (await scene.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width * .5, box.y + box.height * .8);
  await expect(scene).toHaveAttribute("data-light-direction", "aimed");
  await expect.poll(async () => Number(await scene.getAttribute("data-bursts"))).toBeGreaterThan(0);
  const before = await page.evaluate(() => scrollY);
  await page.evaluate(() => scrollBy(0, 180));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThanOrEqual(before);
});

test("live reduced motion and offscreen lifecycle suspend ambient work while retaining feedback", async ({ page }) => {
  await page.goto(route); await ready(page);
  const scene = artwork(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene).toHaveAttribute("data-reduced-motion", "true");
  await expect(scene).toHaveAttribute("data-motion", "paused");
  const before = Number(await scene.getAttribute("data-bursts") || 0);
  await lightControls(page).focus(); await page.keyboard.press("Enter");
  await expect(scene).toHaveAttribute("data-feedback", "true");
  expect(Number(await scene.getAttribute("data-bursts") || 0)).toBe(before);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(() => scene.getAttribute("data-motion")).toBe("running");
  await scene.evaluate(element => { (element as HTMLElement).style.transform = "translateY(3000px)"; });
  await expect.poll(() => scene.getAttribute("data-motion")).toBe("paused");
  await scene.evaluate(element => { (element as HTMLElement).style.transform = ""; });
  await expect.poll(() => scene.getAttribute("data-motion")).toBe("running");
});

test("recovery navigation cleans up the scene", async ({ page }) => {
  await page.goto(route); await ready(page);
  await artwork(page).evaluate(element => { (window as unknown as { previousErrorPreview: Element }).previousErrorPreview = element; });
  await page.getByRole("link", { name: "Go to home" }).click();
  await expect(page).toHaveURL(/\/$/); await expect(page.locator("h1")).toBeFocused();
  await expect.poll(() => page.evaluate(() => { const scene = (window as unknown as { previousErrorPreview: Element }).previousErrorPreview as HTMLElement; return `${scene.dataset.motion}:${scene.dataset.lightReady}`; })).toBe("paused:false");
});

test("static composition survives canvas failure and no JavaScript", async ({ browser, page }, info) => {
  await page.goto(route); await ready(page);
  test.skip(!info.project.name.startsWith("desktop"), "One static fallback pass is enough.");
  const fallback = await browser.newContext({ javaScriptEnabled: true }); const fallbackPage = await fallback.newPage();
  await fallbackPage.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await fallbackPage.goto(route);
  await expect(artwork(fallbackPage)).toHaveAttribute("data-light-ready", "false");
  await expect(lightControls(fallbackPage)).toBeDisabled(); await expect(fallbackPage.getByRole("heading", { name: "An error occurred" })).toBeVisible(); await fallback.close();
  const noJavaScript = await browser.newContext({ javaScriptEnabled: false }); const noJavaScriptPage = await noJavaScript.newPage();
  const response = await noJavaScriptPage.goto(route); expect(response?.status()).toBe(200);
  await expect(noJavaScriptPage.getByRole("heading", { name: "An error occurred" })).toBeVisible(); await expect(noJavaScriptPage.getByRole("link", { name: "Go to home" })).toBeVisible(); await expect(noJavaScriptPage.locator('img[src^="/error_page/"]')).toHaveCount(5); expect(await noJavaScriptPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await noJavaScript.close();
});

test("320 by 568 retains a scrollable reading order with reachable actions and footer", async ({ page }, info) => {
  test.skip(!info.project.name.startsWith("desktop"), "One compact-viewport pass is enough.");
  await page.setViewportSize({ width: 320, height: 568 }); await page.goto(route);
  await expect(page.getByRole("heading", { name: "An error occurred" })).toBeVisible(); await expect(page.getByRole("link", { name: "Go to home" })).toBeVisible(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded(); await expect(page.getByRole("contentinfo").getByRole("link", { name: "Company", exact: true })).toBeVisible();
});
