import { expect, test, type Page } from "@playwright/test";

async function jump(page: Page, top: number) {
  await page.evaluate((target) => scrollTo({ top: target, behavior: "instant" }), top);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function orbitAnimations(page: Page) {
  return page.getByTestId("work-orbit").locator("svg").evaluate((svg) => svg.getAnimations({ subtree: true })
    .filter((animation) => animation.effect?.getTiming().iterations === Infinity)
    .map((animation) => ({ currentTime: Number(animation.currentTime), playState: animation.playState })));
}

test("Work route keeps its evidence, imagery, and responsive layout complete", async ({ page }, testInfo) => {
  const response = await page.goto("/work");
  expect(response?.status()).toBe(200);

  const hero = page.getByTestId("work-hero");
  const heroAction = hero.getByRole("link", { name: "View case studies" });
  await expect(hero).toBeVisible();
  await expect(hero.locator("img")).toHaveAttribute("fetchpriority", "high");
  await expect(page.locator('head link[rel="preload"][as="image"]')).toHaveCount(1);
  const actionBox = await heroAction.boundingBox();
  expect(actionBox).not.toBeNull();
  expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(page.viewportSize()!.height);

  const caseSection = page.locator("#work-cases");
  await caseSection.scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "General Food Supermarket - Liguanea" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Context", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Applied technology", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operational objectives", exact: true })).toBeVisible();
  await expect(caseSection.locator("li")).toHaveCount(3);

  const sectorSection = page.locator("#work-industries");
  await sectorSection.scrollIntoViewIfNeeded();
  const sectorImages = sectorSection.locator("img");
  await expect(sectorImages).toHaveCount(5);
  const sectorGrid = sectorImages.first().locator("xpath=../../..");
  const columnCount = await sectorGrid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
  expect(columnCount).toBe(testInfo.project.name === "desktop-chromium" ? 5 : testInfo.project.name === "tablet-chromium" ? 3 : 1);

  const clients = page.locator("#work-clients");
  await clients.scrollIntoViewIfNeeded();
  await expect(clients.locator("img")).toHaveCount(15);
  await expect(clients.locator("a")).toHaveCount(1);
  await expect(clients.getByRole("link", { name: "General Food Supermarket, view case study" })).toHaveAttribute("href", "#work-cases");

  const images = page.locator("main img");
  for (const image of await images.all()) {
    const alt = await image.getAttribute("alt");
    await image.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0), { timeout: 15_000, message: `Image did not decode: ${alt || "decorative image"}` }).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test("Work anchors, keyboard focus, and route actions keep their destinations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Anchor and focus behavior is device-independent.");
  await page.goto("/work");

  await page.getByRole("link", { name: "View case studies" }).click();
  await expect(page).toHaveURL(/\/work#work-cases$/);
  const caseTop = await page.locator("#work-cases").evaluate((element) => element.getBoundingClientRect().top);
  const headerHeight = await page.locator("header").evaluate((element) => element.getBoundingClientRect().height);
  expect(caseTop).toBeGreaterThanOrEqual(headerHeight - 1);

  const orbit = page.getByTestId("work-orbit");
  await orbit.scrollIntoViewIfNeeded();
  const relationshipLink = orbit.getByRole("link", { name: "Real experience" });
  await relationshipLink.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(relationshipLink).toBeFocused();
  await expect(orbit).toHaveAttribute("data-highlight", "relationships");
  expect(await relationshipLink.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  await expect(orbit.getByRole("link", { name: "Proven in practice" })).toHaveAttribute("href", "#work-cases");
  await expect(orbit.getByRole("link", { name: "Built for what’s next" })).toHaveAttribute("href", "/solutions");

  await page.goto("/company");
  await page.goto("/work#work-cases");
  await expect(page.getByRole("heading", { name: "General Food Supermarket - Liguanea" })).toBeVisible();
  const directTop = await page.locator("#work-cases").evaluate((element) => element.getBoundingClientRect().top);
  expect(directTop).toBeGreaterThanOrEqual(headerHeight - 1);
});

test("Work orbit runs only in its allowed lifecycle and preserves manual pause", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fine-pointer orbit lifecycle is covered once.");
  await page.goto("/work");
  const orbit = page.getByTestId("work-orbit");
  await orbit.scrollIntoViewIfNeeded();
  await expect(orbit).toHaveAttribute("data-orbit-active", "true");

  const running = await orbitAnimations(page);
  expect(running.length).toBeGreaterThanOrEqual(6);
  expect(running.every((animation) => animation.playState === "running")).toBe(true);
  await expect.poll(async () => Math.max(...(await orbitAnimations(page)).map((animation) => animation.currentTime))).toBeGreaterThan(Math.max(...running.map((animation) => animation.currentTime)));

  await orbit.getByRole("button", { name: "Pause animation" }).click();
  await expect(orbit).toHaveAttribute("data-orbit-paused", "true");
  await expect(orbit).toHaveAttribute("data-orbit-active", "false");
  await expect.poll(async () => (await orbitAnimations(page)).every((animation) => animation.playState === "paused")).toBe(true);
  const frozen = await orbitAnimations(page);
  await page.waitForTimeout(180);
  expect((await orbitAnimations(page)).map((animation) => animation.currentTime)).toEqual(frozen.map((animation) => animation.currentTime));

  await jump(page, 0);
  await expect(orbit).toHaveAttribute("data-orbit-visible", "false");
  await orbit.scrollIntoViewIfNeeded();
  await expect(orbit).toHaveAttribute("data-orbit-paused", "true");
  await expect(orbit).toHaveAttribute("data-orbit-active", "false");

  await orbit.getByRole("button", { name: "Resume animation" }).click();
  await expect(orbit).toHaveAttribute("data-orbit-active", "true");
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(orbit).toHaveAttribute("data-orbit-document", "hidden");
  await expect(orbit).toHaveAttribute("data-orbit-active", "false");
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "visibilityState");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(orbit).toHaveAttribute("data-orbit-document", "active");
  await expect(orbit).toHaveAttribute("data-orbit-active", "true");
});

test("Work orbit pointer movement is bounded and resets on exit", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Pointer movement is limited to fine-pointer devices.");
  await page.goto("/work");
  const orbit = page.getByTestId("work-orbit");
  await orbit.scrollIntoViewIfNeeded();
  await expect(orbit).toHaveAttribute("data-orbit-enhanced", "true");
  await expect(orbit).toHaveAttribute("data-orbit-visible", "true");
  const box = await orbit.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * .75, box!.y + box!.height / 2);
  await expect(orbit).toHaveAttribute("data-pointer-state", "moved");
  const moved = await orbit.locator(":scope > div").evaluate((element) => getComputedStyle(element).transform);
  expect(moved).not.toBe("none");
  await page.mouse.move(4, 4);
  await expect(orbit).toHaveAttribute("data-pointer-state", "neutral");
  await expect.poll(() => orbit.locator(":scope > div").evaluate((element) => getComputedStyle(element).transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
});

test("Work orbit responds to reduced motion and remounts cleanly", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Reduced-motion lifecycle is device-independent.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work");
  const orbit = page.getByTestId("work-orbit");
  await orbit.scrollIntoViewIfNeeded();
  await expect(orbit).toHaveAttribute("data-orbit-motion", "reduced");
  await expect(orbit).toHaveAttribute("data-orbit-active", "false");
  await expect(orbit.getByRole("button", { name: "Motion reduced" })).toBeDisabled();
  expect(await orbitAnimations(page)).toHaveLength(0);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(orbit).toHaveAttribute("data-orbit-motion", "allowed");
  await expect(orbit).toHaveAttribute("data-orbit-active", "true");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Company" }).click();
  await expect(page.getByTestId("work-orbit")).toHaveCount(0);
  await page.goto("/work");
  await expect(page.getByTestId("work-orbit")).toHaveCount(1);
  await expect(page.getByTestId("work-orbit")).toHaveAttribute("data-orbit-enhanced", "true");
});

test("Work reveal groups replay downward and upward", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Shared reveal thresholds are covered once on Work.");
  await page.goto("/work");
  const reveal = page.getByRole("heading", { name: "Different environments. Different challenges." }).locator("..");
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
  const bounds = await reveal.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const transform = getComputedStyle(element).transform;
    const displacement = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
    return { top: scrollY + rect.top - displacement, bottom: scrollY + rect.bottom - displacement };
  });
  const height = page.viewportSize()!.height;

  await jump(page, bounds.top - height * .78 - 4);
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
  await jump(page, bounds.top - height * .78 + 4);
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");

  await jump(page, bounds.bottom + 4);
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
  await jump(page, bounds.bottom - height * .22 + 4);
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
  await jump(page, bounds.bottom - height * .22 - 4);
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");
});

test("Work remains complete and readable without JavaScript", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "No-JavaScript behavior is device-independent.");
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto("/work");

  await expect(page.getByRole("heading", { name: "General Food Supermarket - Liguanea" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operational objectives" })).toBeVisible();
  await expect(page.locator("#work-industries img")).toHaveCount(5);
  await expect(page.locator("#work-clients img")).toHaveCount(15);
  const orbit = page.getByTestId("work-orbit");
  await orbit.scrollIntoViewIfNeeded();
  await expect(orbit).not.toHaveAttribute("data-orbit-enhanced", "true");
  await expect(orbit.getByRole("link")).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Contact CrimsonTide" }).last()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await context.close();
});
