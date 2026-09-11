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
  const caseDetails = caseSection.locator("[data-case-details]");
  const caseColumnCount = await caseDetails.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
  expect(caseColumnCount).toBe(testInfo.project.name === "desktop-chromium" ? 3 : 1);

  const sectorSection = page.locator("#work-industries");
  await sectorSection.scrollIntoViewIfNeeded();
  const sectorImages = sectorSection.locator("img");
  await expect(sectorImages).toHaveCount(5);
  const sectorGrid = sectorSection.locator("[data-sector-grid]");
  const columnCount = await sectorGrid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
  expect(columnCount).toBe(testInfo.project.name === "desktop-chromium" ? 5 : testInfo.project.name === "tablet-chromium" ? 3 : 1);

  const expectedIcons = ["shopping-cart.svg", "dev-solutions.svg", "target.svg", "shopping-cart.svg", "bank.svg", "airport.svg", "government.svg", "truck.svg", "people.svg"];
  const iconBadges = page.locator("#work-cases [data-icon], #work-industries [data-icon]");
  await expect(iconBadges).toHaveCount(expectedIcons.length);
  expect(await iconBadges.evaluateAll((elements) => elements.map((element) => element.getAttribute("data-icon")))).toEqual(expectedIcons);
  for (const badge of await iconBadges.all()) {
    const icon = await badge.getAttribute("data-icon");
    const style = await badge.evaluate((element) => {
      const pseudo = getComputedStyle(element, "::before");
      const rect = element.getBoundingClientRect();
      return { mask: pseudo.maskImage, width: rect.width, height: rect.height };
    });
    expect(style.mask).toContain(`/icons/${icon}`);
    expect(style.width).toBeGreaterThanOrEqual(50);
    expect(style.height).toBeGreaterThanOrEqual(50);
  }

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

  const retailCaseLink = page.getByRole("link", { name: "View retail case" });
  await retailCaseLink.focus();
  await expect(retailCaseLink).toBeFocused();
  await expect(retailCaseLink).toHaveAttribute("href", "#work-cases");
  expect(await retailCaseLink.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  const sectorAction = page.getByRole("link", { name: "Explore solutions for your sector" });
  await sectorAction.focus();
  await expect(sectorAction).toBeFocused();
  await expect(sectorAction).toHaveAttribute("href", "/solutions");
  expect(await sectorAction.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");

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

test("Work panel glow follows the local pointer and resets cleanly", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fine-pointer panel behavior is covered once.");
  await page.goto("/work");
  const panels = page.locator("#work-cases [data-pointer-glow], #work-industries [data-pointer-glow]");
  await expect(panels).toHaveCount(8);
  await expect.poll(() => panels.evaluateAll((elements) => elements.every((element) => element.getAttribute("data-pointer-enhanced") === "true"))).toBe(true);
  await expect.poll(() => panels.evaluateAll((elements) => elements.every((element) => element.getAttribute("data-pointer-motion") === "allowed"))).toBe(true);

  const panel = page.locator('#work-cases [data-detail="context"]');
  await panel.scrollIntoViewIfNeeded();
  await panel.locator("..").evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
  const box = await panel.boundingBox();
  const heading = panel.getByRole("heading", { name: "Context", exact: true });
  const headingTransformBefore = await heading.evaluate((element) => getComputedStyle(element).transform);
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * .28, box!.y + box!.height * .34);
  await expect(panel).toHaveAttribute("data-pointer-state", "moved");
  const local = await panel.evaluate((element) => ({
    x: parseFloat(element.style.getPropertyValue("--pointer-x")),
    y: parseFloat(element.style.getPropertyValue("--pointer-y")),
    glow: getComputedStyle(element, "::before").backgroundImage,
  }));
  expect(local.x).toBeCloseTo(box!.width * .28, 0);
  expect(local.y).toBeCloseTo(box!.height * .34, 0);
  expect(local.glow).toContain("180px");
  expect(headingTransformBefore).toBe("none");
  expect(await heading.evaluate((element) => getComputedStyle(element).transform)).toBe("none");

  await panel.dispatchEvent("pointercancel", { pointerType: "mouse" });
  await expect(panel).toHaveAttribute("data-pointer-state", "neutral");
  await expect.poll(() => panel.evaluate((element) => element.style.getPropertyValue("--pointer-x"))).toBe("50%");

  await page.mouse.move(box!.x + box!.width * .72, box!.y + box!.height * .52);
  await expect(panel).toHaveAttribute("data-pointer-state", "moved");
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(panel).toHaveAttribute("data-pointer-state", "neutral");
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "visibilityState");
    document.dispatchEvent(new Event("visibilitychange"));
  });

  await page.mouse.move(box!.x + box!.width * .5, box!.y + box!.height * .5);
  await expect(panel).toHaveAttribute("data-pointer-state", "moved");
  await page.mouse.move(4, 4);
  await expect(panel).toHaveAttribute("data-pointer-state", "neutral");
});

test("Work panel decoration is static for reduced motion", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Reduced-motion panel behavior is device-independent.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work");
  const panels = page.locator("#work-cases [data-pointer-glow], #work-industries [data-pointer-glow]");
  await expect(panels).toHaveCount(8);
  await expect.poll(() => panels.evaluateAll((elements) => elements.every((element) => element.getAttribute("data-pointer-enhanced") === "false"))).toBe(true);
  await expect.poll(() => panels.evaluateAll((elements) => elements.every((element) => element.getAttribute("data-pointer-motion") === "reduced"))).toBe(true);
  const panel = panels.first();
  await panel.scrollIntoViewIfNeeded();
  const box = await panel.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(panel).toHaveAttribute("data-pointer-state", "neutral");
  expect(await panel.evaluate((element) => getComputedStyle(element, "::before").display)).toBe("none");
  await expect(page.locator("#work-cases [data-icon], #work-industries [data-icon]")).toHaveCount(9);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(() => panels.evaluateAll((elements) => elements.every((element) => element.getAttribute("data-pointer-enhanced") === "true"))).toBe(true);
  await expect.poll(() => panels.evaluateAll((elements) => elements.every((element) => element.getAttribute("data-pointer-motion") === "allowed"))).toBe(true);
});

test("Work panel decoration remains static on touch projects", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop-chromium", "Touch behavior is covered by touch-configured projects.");
  await page.goto("/work");
  const panels = page.locator("#work-cases [data-pointer-glow], #work-industries [data-pointer-glow]");
  await expect(panels).toHaveCount(8);
  await expect.poll(() => panels.evaluateAll((elements) => elements.every((element) => element.getAttribute("data-pointer-enhanced") === "false"))).toBe(true);
  await expect.poll(() => panels.evaluateAll((elements) => elements.every((element) => element.getAttribute("data-pointer-state") === "neutral"))).toBe(true);
  await expect(page.locator("#work-cases [data-icon], #work-industries [data-icon]")).toHaveCount(9);
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
