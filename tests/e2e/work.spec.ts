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
  await expect(hero.locator("img")).toHaveAttribute("src", /experience-work/);
  await expect(hero.getByTestId("work-orbit")).toHaveCount(1);
  const closing = page.getByTestId("work-closing");
  await expect(closing.locator("img")).toHaveAttribute("src", /images%2Fhero/);
  await expect(closing.locator("img")).toHaveAttribute("loading", "lazy");
  await expect(closing.getByTestId("work-orbit")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Pause animation|Resume animation|Motion reduced/ })).toHaveCount(0);
  const orbitBox = await hero.getByTestId("work-orbit").boundingBox();
  const copyBox = await hero.locator("h1").locator("..").boundingBox();
  expect(orbitBox).not.toBeNull();
  expect(copyBox).not.toBeNull();
  if (testInfo.project.name === "desktop-chromium") {
    expect(orbitBox!.x).toBeGreaterThanOrEqual(copyBox!.x + copyBox!.width);
  } else {
    expect(orbitBox!.y).toBeGreaterThanOrEqual(copyBox!.y + copyBox!.height);
  }
  await expect(page.locator('head link[rel="preload"][as="image"]')).toHaveCount(6);
  await expect(page.locator('head link[rel="preload"][as="image"][fetchpriority="high"]')).toHaveCount(1);
  const actionBox = await heroAction.boundingBox();
  expect(actionBox).not.toBeNull();
  expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.evaluate(() => document.fonts.ready);
  await hero.screenshot({ path: testInfo.outputPath("hero.png") });

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
  await expect.poll(() => sectorImages.evaluateAll((images) => images.every((image) => {
    const element = image as HTMLImageElement;
    return element.currentSrc.length > 0 && element.complete && element.naturalWidth > 0;
  })), { timeout: 15_000, message: "Sector images did not load after entering the section" }).toBe(true);
  expect(await sectorImages.evaluateAll((images) => images.map((image) => image.getAttribute("loading")))).toEqual(Array(5).fill("eager"));
  expect(await sectorImages.evaluateAll((images) => images.map((image) => image.getAttribute("fetchpriority")))).toEqual(Array(5).fill(null));
  const otherBelowFoldImages = page.locator("#work-cases img, #work-clients img, [data-testid='work-closing'] img");
  await expect(otherBelowFoldImages).toHaveCount(20);
  expect(await otherBelowFoldImages.evaluateAll((images) => images.map((image) => image.getAttribute("loading")))).toEqual(Array(20).fill("lazy"));
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
  await expect(clients.locator("a")).toHaveCount(0);
  await expect(clients.getByRole("button")).toHaveCount(15);

  const images = page.locator("main img");
  for (const image of await images.all()) {
    const alt = await image.getAttribute("alt");
    await image.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0), { timeout: 15_000, message: `Image did not decode: ${alt || "decorative image"}` }).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await closing.scrollIntoViewIfNeeded();
  await closing.locator("h2").locator("..").evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
  await closing.screenshot({ path: testInfo.outputPath("closing.png") });
});

test("Every partner shares hover feedback and activation keeps the URL and viewport unchanged", async ({ page }, testInfo) => {
  await page.goto("/work");
  await expect(page.locator("[data-partner-grid]")).toHaveAttribute("data-enhanced", "true");
  const tiles = page.locator("#work-clients img").locator("..");
  await expect(tiles).toHaveCount(15);
  for (const [index, tile] of (await tiles.all()).entries()) {
    await tile.scrollIntoViewIfNeeded();
    const reveal = page.locator("[data-partner-grid]").locator("..");
    await expect(reveal).toHaveAttribute("data-reveal", "revealed");
    await reveal.evaluate(async (element) => {
      await Promise.all(element.getAnimations().map((animation) => animation.finished));
    });
    const style = () => tile.evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      shadow: getComputedStyle(element).boxShadow,
    }));
    const rest = await style();
    if (testInfo.project.name === "desktop-chromium") {
      await tile.hover();
      await expect.poll(async () => (await style()).background).toBe("rgba(255, 255, 255, 0.05)");
      expect((await style()).shadow).toContain("inset");
      await tile.screenshot({ path: testInfo.outputPath(`partner-${index}-hover.png`) });
      await page.mouse.move(4, 4);
      await expect.poll(style).toEqual(rest);
    } else {
      // Chromium serializes the 1.5% alpha through its 8-bit color representation.
      expect(Number(rest.background.match(/, ([\d.]+)\)$/)?.[1])).toBeCloseTo(.015, 2);
      expect(rest.shadow).toBe("none");
    }
    expect(await tile.evaluate((element) => (element as HTMLElement).tabIndex)).toBe(0);
  }
  const generalFood = page.getByRole("button", { name: "General Food Supermarket, position 7 of 15" });
  await generalFood.scrollIntoViewIfNeeded();
  await generalFood.focus();
  await expect(generalFood).toBeFocused();
  expect(await generalFood.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  const url = page.url();
  const scroll = await page.evaluate(() => scrollY);
  await generalFood.click();
  await expect(generalFood).toHaveAttribute("aria-pressed", "true");
  expect(page.url()).toBe(url);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
});

test("Every sector clips its zoom and keeps badges and copy stable through hover", async ({ page }, testInfo) => {
  await page.goto("/work");
  for (const [index, card] of (await page.locator("[data-sector]").all()).entries()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator("..")).toHaveAttribute("data-reveal", "revealed");
    await card.locator("..").evaluate(async (element) => {
      await Promise.all(element.getAnimations().map((animation) => animation.finished));
    });
    await expect.poll(() => card.locator("img").evaluate((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
    const headingPosition = () => card.evaluate((element) => {
      const cardRect = element.getBoundingClientRect();
      const headingRect = element.querySelector("h3")!.getBoundingClientRect();
      return { x: headingRect.x - cardRect.x, y: headingRect.y - cardRect.y, width: headingRect.width, height: headingRect.height };
    });
    const headingBefore = await headingPosition();
    const checkSeam = async () => {
      const geometry = await card.evaluate((element) => {
        const image = element.querySelector("img")!;
        const clip = image.parentElement!;
        const media = clip.parentElement!;
        const badge = media.querySelector("[data-icon]")!;
        const copy = element.querySelector("h3")!.parentElement!;
        const seam = clip.getBoundingClientRect().bottom;
        return {
          overflow: getComputedStyle(clip).overflow,
          mask: getComputedStyle(clip).maskImage,
          seamGap: copy.getBoundingClientRect().top - seam,
          badgeAbove: seam - badge.getBoundingClientRect().top,
          badgeBelow: badge.getBoundingClientRect().bottom - seam,
          badgeInClip: clip.contains(badge),
          copyTransform: getComputedStyle(copy).transform,
          imageScale: new DOMMatrixReadOnly(getComputedStyle(image).transform).a,
        };
      });
      expect(geometry.overflow).toBe("hidden");
      expect(geometry.mask).toContain("rgba(0, 0, 0, 0) 100%");
      expect(Math.abs(geometry.seamGap)).toBeLessThanOrEqual(1);
      expect(geometry.badgeAbove).toBeGreaterThan(20);
      expect(geometry.badgeBelow).toBeGreaterThan(20);
      expect(geometry.badgeInClip).toBe(false);
      expect(geometry.copyTransform).toBe("none");
      const headingAfter = await headingPosition();
      for (const key of ["x", "y", "width", "height"] as const) {
        expect(headingAfter[key]).toBeCloseTo(headingBefore[key], 3);
      }
      return geometry;
    };
    await checkSeam();
    await card.screenshot({ path: testInfo.outputPath(`sector-${index}-rest.png`) });
    if (testInfo.project.name === "desktop-chromium") {
      await card.hover();
      await card.locator("img").evaluate((image) => {
        for (const animation of image.getAnimations()) {
          animation.pause();
          animation.currentTime = 120;
        }
      });
      const transition = await checkSeam();
      expect(transition.imageScale).toBeGreaterThan(1);
      expect(transition.imageScale).toBeLessThan(1.035);
      await card.screenshot({ path: testInfo.outputPath(`sector-${index}-transition.png`) });
      await card.locator("img").evaluate((image) => image.getAnimations().forEach((animation) => animation.finish()));
      expect((await checkSeam()).imageScale).toBeCloseTo(1.035, 3);
      await card.screenshot({ path: testInfo.outputPath(`sector-${index}-hover.png`) });
      await page.mouse.move(4, 4);
      await card.locator("img").evaluate(async (image) => {
        await Promise.all(image.getAnimations().map((animation) => animation.finished));
      });
      expect((await checkSeam()).imageScale).toBe(1);
      await card.screenshot({ path: testInfo.outputPath(`sector-${index}-exit.png`) });
    }
  }
});

test("Work anchors, keyboard focus, and route actions keep their destinations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Anchor and focus behavior is device-independent.");
  await page.goto("/work");

  await page.getByRole("link", { name: "View case studies" }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.locator("#work-cases h2").first()).toBeFocused();
  await expect.poll(() => page.locator("#work-cases").evaluate(el => Math.abs(el.getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)))).toBeLessThan(2);
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
  await expect(orbit.getByRole("link", { name: "Built for what’s next" })).toHaveAttribute("href", "/company");

  await expect(page.getByRole("link", { name: "View retail case" })).toHaveCount(0);
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

test("Work hero orbit runs on entry and pauses only outside its allowed lifecycle", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fine-pointer orbit lifecycle is covered once.");
  await page.goto("/work");
  const orbit = page.getByTestId("work-orbit");
  await orbit.scrollIntoViewIfNeeded();
  await expect(orbit).toHaveAttribute("data-orbit-active", "true");

  const running = await orbitAnimations(page);
  expect(running.length).toBeGreaterThanOrEqual(6);
  expect(running.every((animation) => animation.playState === "running")).toBe(true);
  await expect.poll(async () => Math.max(...(await orbitAnimations(page)).map((animation) => animation.currentTime))).toBeGreaterThan(Math.max(...running.map((animation) => animation.currentTime)));

  await page.getByTestId("work-closing").scrollIntoViewIfNeeded();
  await expect(orbit).toHaveAttribute("data-orbit-visible", "false");
  await expect(orbit).toHaveAttribute("data-orbit-active", "false");
  await expect.poll(async () => (await orbitAnimations(page)).every((animation) => animation.playState === "paused")).toBe(true);
  await page.waitForTimeout(50);
  const frozen = await orbitAnimations(page);
  await page.waitForTimeout(180);
  expect((await orbitAnimations(page)).map((animation) => animation.currentTime)).toEqual(frozen.map((animation) => animation.currentTime));

  await jump(page, 0);
  await expect(orbit).toHaveAttribute("data-orbit-visible", "true");
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
  await expect(orbit.getByRole("button")).toHaveCount(0);
  expect(await orbitAnimations(page)).toHaveLength(0);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(orbit).toHaveAttribute("data-orbit-motion", "allowed");
  await expect(orbit).toHaveAttribute("data-orbit-active", "true");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Company" }).click();
  await expect(page.getByTestId("work-orbit")).toHaveCount(0);
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Work & Credibility" }).click();
  await expect(page.getByTestId("work-orbit")).toHaveCount(1);
  await expect(page.getByTestId("work-orbit")).toHaveAttribute("data-orbit-enhanced", "true");
  await expect(orbit).toHaveAttribute("data-orbit-active", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(orbit).toHaveAttribute("data-orbit-active", "false");
  expect(await orbitAnimations(page)).toHaveLength(0);
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
  await expect(panel.locator("..")).toHaveAttribute("data-reveal", "revealed");
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

for (const pointerInside of [false, true]) {
  test(`General Food entrance stays in its frame with pointer ${pointerInside ? "inside" : "outside"}`, async ({ page }, testInfo) => {
    let releaseImage: () => void = () => {};
    const imageGate = new Promise<void>((resolve) => { releaseImage = resolve; });
    await page.route(/general-food\.png/, async (route) => {
      if (pointerInside) await imageGate;
      await route.continue();
    });
    await page.goto("/work", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    const article = page.locator('article[aria-labelledby="general-food-heading"]');
    const reveal = article.locator(":scope > div").first();
    const banner = reveal.locator(":scope > div");
    const image = banner.locator("img");
    await expect(reveal).toHaveAttribute("data-reveal", "hidden");
    // Use the stationary article to locate the banner even if its reveal is translated.
    const bounds = {
      top: await article.evaluate((element) => scrollY + element.getBoundingClientRect().top + element.clientTop),
      height: await reveal.evaluate((element) => element.getBoundingClientRect().height),
    };
    const viewport = page.viewportSize()!;
    await page.mouse.move(pointerInside ? viewport.width * .7 : 1, viewport.height * .9);

    const sampleEntrance = async () => {
      await expect(reveal).toHaveAttribute("data-reveal", "revealed");
      const frames = await banner.evaluate(async (element) => {
        const samples = [];
        for (let frame = 0; frame < 45; frame++) {
          const rect = element.getBoundingClientRect();
          const article = element.closest("article")!;
          const img = element.querySelector("img")!.getBoundingClientRect();
          samples.push({
            gap: rect.top - article.getBoundingClientRect().top - article.clientTop,
            covers: img.left <= rect.left + .5 && img.right >= rect.right - .5 && img.top <= rect.top + .5 && img.bottom >= rect.bottom - .5,
            opacity: Number(getComputedStyle(element.parentElement!).opacity),
          });
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        }
        return samples;
      });
      expect(Math.max(...frames.map((frame) => Math.abs(frame.gap)))).toBeLessThan(.5);
      expect(frames.every((frame) => frame.covers)).toBe(true);
      expect(frames.some((frame) => frame.opacity > 0 && frame.opacity < 1)).toBe(true);
      await expect(reveal).toHaveCSS("opacity", "1");
    };

    try {
      await jump(page, bounds.top - viewport.height * .78 + 4);
      releaseImage();
      await sampleEntrance();
      await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
      await jump(page, bounds.top + bounds.height + 4);
      await expect(reveal).toHaveAttribute("data-reveal", "hidden");
      await jump(page, bounds.top + bounds.height - viewport.height * .22 - 4);
      await sampleEntrance();
      await jump(page, 0);
      await expect(reveal).toHaveAttribute("data-reveal", "hidden");
      await jump(page, bounds.top - viewport.height * .78 + 4);
      await sampleEntrance();

      await jump(page, bounds.top - 100);
      await banner.screenshot({ path: testInfo.outputPath(`general-food-${pointerInside ? "hover" : "neutral"}.png`) });
      if (testInfo.project.name === "desktop-chromium") {
        await banner.hover();
        await expect(image).toHaveCSS("transform", "matrix(1.018, 0, 0, 1.018, 0, 0)");
        await page.mouse.move(1, 1);
        await expect(image).toHaveCSS("transform", "none");
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(reveal).toHaveCSS("opacity", "1");
      await expect(reveal).toHaveCSS("transform", "none");
      await expect(image).toHaveCSS("transform", "none");
    } finally {
      releaseImage();
    }
  });
}

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
  await expect(page.locator("#work-clients button, #work-clients a, #work-clients [data-drag-handle]")).toHaveCount(0);
  await expect(page.locator("#partner-instructions")).toHaveCount(0);
  const orbit = page.getByTestId("work-orbit");
  await orbit.scrollIntoViewIfNeeded();
  await expect(orbit).not.toHaveAttribute("data-orbit-enhanced", "true");
  await expect(orbit).toHaveAttribute("data-orbit-active", "false");
  await expect(orbit.getByRole("button")).toHaveCount(0);
  expect((await orbitAnimations(page)).every((animation) => animation.playState === "paused")).toBe(true);
  await expect(orbit.getByRole("link")).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Contact CrimsonTide" }).last()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await context.close();
});
