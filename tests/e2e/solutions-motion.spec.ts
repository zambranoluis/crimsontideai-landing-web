import { expect, test, type Page } from "@playwright/test";
import { CONTEXT_MESH, contextRippleDisplacement, createContextMeshSnapshot } from "../../src/app/solutions/_sections/Context/contextTerrain";

async function scrollJourneyTo(page: Page, progress: number) {
  await page.locator('[data-testid="solutions-journey"]').evaluate((section, targetProgress) => {
    const header = document.querySelector("header")?.getBoundingClientRect().height ?? 88;
    const rect = section.getBoundingClientRect();
    const documentTop = window.scrollY + rect.top;
    const availableDistance = Math.max(1, rect.height - innerHeight + header - 120);
    const travelDistance = availableDistance * .78;
    window.scrollTo({ top: documentTop - header + travelDistance * Number(targetProgress), behavior: "instant" });
  }, progress);
}

async function stageProgress(page: Page) {
  return page.locator("[data-journey-stage]").evaluateAll(stages => stages.map(stage => Number((stage as HTMLElement).dataset.stageProgress)));
}

test("desktop journey advances, completes, and reverses with native scroll", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Sticky journey uses the desktop fine-pointer project.");
  await page.goto("/solutions");

  const journey = page.getByTestId("solutions-journey");
  await expect(journey).toHaveAttribute("data-journey-mode", "sticky");

  await scrollJourneyTo(page, .20);
  await expect.poll(async () => stageProgress(page)).toEqual(expect.arrayContaining([expect.any(Number), 0, 0]));
  let progress = await stageProgress(page);
  expect(progress[0]).toBeGreaterThan(.5);
  expect(progress[1]).toBe(0);
  expect(progress[2]).toBe(0);

  await scrollJourneyTo(page, .76);
  await expect.poll(async () => (await stageProgress(page))[2]).toBeGreaterThan(.45);
  progress = await stageProgress(page);
  expect(progress[0]).toBe(1);
  expect(progress[1]).toBe(1);

  await scrollJourneyTo(page, 1);
  await expect.poll(async () => stageProgress(page)).toEqual([1, 1, 1]);
  await expect.poll(() => page.locator("[data-journey-map]").evaluate(element => Number(getComputedStyle(element).getPropertyValue("--arrow-progress")))).toBeGreaterThan(.98);

  await scrollJourneyTo(page, .20);
  await expect.poll(async () => (await stageProgress(page))[1]).toBe(0);
  progress = await stageProgress(page);
  expect(progress[0]).toBeGreaterThan(.5);
  expect(progress[2]).toBe(0);
});

test("journey switches between sticky and normal-flow layouts on resize", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Viewport transitions are covered once in desktop Chromium.");
  await page.goto("/solutions");
  const journey = page.getByTestId("solutions-journey");

  await expect(journey).toHaveAttribute("data-journey-mode", "sticky");
  await page.setViewportSize({ width: 900, height: 800 });
  await expect(journey).toHaveAttribute("data-journey-mode", "flow");
  await page.setViewportSize({ width: 1280, height: 680 });
  await expect(journey).toHaveAttribute("data-journey-mode", "flow");
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(journey).toHaveAttribute("data-journey-mode", "sticky");
});

test("reduced motion presents the complete journey in normal flow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Reduced-motion layout is independent of device project.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/solutions");

  const journey = page.getByTestId("solutions-journey");
  await expect(journey).toHaveAttribute("data-journey-mode", "static");
  await expect.poll(async () => stageProgress(page)).toEqual([1, 1, 1]);
  await expect(page.getByRole("heading", { name: "Put into Use" })).toBeVisible();
  await expect(page.locator("[data-journey-map]")).toHaveAttribute("data-ambient-active", "false");
});

test("journey is complete and readable without JavaScript", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "No-JavaScript fallback is device-independent.");
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto("/solutions");

  const journey = page.getByTestId("solutions-journey");
  await expect(journey).not.toHaveAttribute("data-journey-enhanced", "true");
  await journey.scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "Build", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Connect", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Put into Use", exact: true })).toBeVisible();
  await context.close();
});

test("Solutions media uses the intended eager and lazy loading modes", async ({ page }) => {
  await page.goto("/solutions");

  const heroImage = page.getByTestId("solutions-hero").locator("img");
  await expect(heroImage).toHaveAttribute("loading", "eager");
  await expect(heroImage).toHaveAttribute("fetchpriority", "high");
  await expect(heroImage).toHaveJSProperty("complete", true);

  const journeyImages = page.locator("[data-journey-stage] img");
  await expect(journeyImages).toHaveCount(3);
  for (const image of await journeyImages.all()) await expect(image).toHaveAttribute("loading", "lazy");
  await expect(page.getByAltText("AI-enabled supermarket operations environment")).toHaveAttribute("loading", "lazy");
});

test("journey reinitializes after route re-entry", async ({ page }) => {
  await page.goto("/solutions");
  await expect(page.getByTestId("solutions-journey")).toHaveAttribute("data-journey-enhanced", "true");
  await page.goto("/company");
  await page.goto("/solutions");
  await expect(page.getByTestId("solutions-journey")).toHaveAttribute("data-journey-enhanced", "true");
  await expect(page.locator("[data-journey-stage]")).toHaveCount(3);
});

test("Solutions layout stays within the viewport and uses its responsive journey mode", async ({ page }, testInfo) => {
  await page.goto("/solutions");
  const expectedMode = testInfo.project.name === "desktop-chromium" ? "sticky" : "flow";
  await expect(page.getByTestId("solutions-journey")).toHaveAttribute("data-journey-mode", expectedMode);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

  await page.getByTestId("solutions-journey").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "A solution creates value when it can be put into practice." })).toBeVisible();
});

test("case-study CTA opens the documented work anchor", async ({ page }) => {
  await page.goto("/solutions");
  const link = page.getByRole("link", { name: "View case study" });
  await link.scrollIntoViewIfNeeded();
  await link.click();

  await expect(page).toHaveURL(/\/work#work-cases$/);
  await expect(page.locator("#work-cases")).toBeVisible();
});

test("Solutions follows the seven-section reference sequence", async ({ page }) => {
  await page.goto("/solutions");

  const headings = await page.locator("main > section").evaluateAll(sections => sections.map(section => {
    return section.querySelector("h1, h2")?.textContent?.replace(/\s+/g, " ").trim();
  }));

  expect(headings).toEqual([
    "Artificial intelligence designed around your objectives.",
    "We start with what you want to achieve, not the technology.",
    "From a clear objective to a solution that can be put into practice.",
    "The solution should adapt to your organisation, not the other way around.",
    "A solution creates value when it can be put into practice.",
    "Solutions built to work in real-world environments.",
    "Tell us what you want to achieve. Let's build the path to make it possible.",
  ]);
});

test("process and context narratives are complete", async ({ page }) => {
  await page.goto("/solutions");

  for (const step of ["Discover", "Design", "Prototype & Validate", "Implement & Integrate", "Evolve"]) {
    await expect(page.getByRole("heading", { name: step, exact: true })).toBeAttached();
  }
  for (const panel of ["Your Objective", "Your Environment", "Your Solution"]) {
    await expect(page.getByRole("heading", { name: panel, exact: true })).toBeAttached();
  }
  await expect(page.getByText("We consider the relevant processes, systems, and conditions that shape the environment in which the solution will operate.")).toBeAttached();
  await expect(page.getByText("From that context, we define a solution that brings together the right technology and capabilities for the scope of the project.")).toBeAttached();
});

test("context hologram runs only near the viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Lifecycle behavior is device-independent.");
  await page.goto("/solutions");

  const hologram = page.getByTestId("context-hologram");
  const orbitParticle = hologram.locator("svg g").first();
  const contextCard = page.locator('[data-context-card="1"]');
  await expect(hologram).toHaveAttribute("data-hologram-motion", "paused");
  await expect(orbitParticle).toHaveCSS("animation-play-state", "paused");
  await expect(contextCard).toHaveCSS("animation-play-state", "paused");
  await hologram.scrollIntoViewIfNeeded();
  await expect(hologram).toHaveAttribute("data-hologram-motion", "running");
  await expect(orbitParticle).toHaveCSS("animation-play-state", "running");
  await expect(contextCard).toHaveCSS("animation-play-state", "running");
  const firstFrame = Number(await hologram.getAttribute("data-hologram-frame"));
  await expect.poll(async () => Number(await hologram.getAttribute("data-hologram-frame"))).toBeGreaterThan(firstFrame);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(hologram).toHaveAttribute("data-hologram-motion", "paused");
  await expect(orbitParticle).toHaveCSS("animation-play-state", "paused");
  await expect(contextCard).toHaveCSS("animation-play-state", "paused");

  await hologram.scrollIntoViewIfNeeded();
  await expect(hologram).toHaveAttribute("data-hologram-motion", "running");
  await expect(orbitParticle).toHaveCSS("animation-play-state", "running");
  await expect(contextCard).toHaveCSS("animation-play-state", "running");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(hologram).toHaveAttribute("data-hologram-motion", "paused");
  const hiddenFrame = Number(await hologram.getAttribute("data-hologram-frame"));
  await page.waitForTimeout(180);
  expect(Number(await hologram.getAttribute("data-hologram-frame"))).toBe(hiddenFrame);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(hologram).toHaveAttribute("data-hologram-motion", "running");
  await expect.poll(async () => Number(await hologram.getAttribute("data-hologram-frame"))).toBeGreaterThan(hiddenFrame);
});

test("reduced motion keeps the context hologram still", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Reduced-motion state is device-independent.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/solutions");

  const hologram = page.getByTestId("context-hologram");
  await hologram.scrollIntoViewIfNeeded();
  await expect(hologram).toHaveAttribute("data-hologram-motion", "static");
  await expect(hologram).toHaveAttribute("data-hologram-frame", "0");
});

test("context terrain is an accessible circular control with contained canvas artwork", async ({ page }, testInfo) => {
  await page.goto("/solutions");
  const core = page.getByRole("button", { name: "Interact with the solution terrain" });
  await core.scrollIntoViewIfNeeded();

  const metrics = await core.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    const canvasBounds = element.querySelector("canvas")?.getBoundingClientRect();
    const style = getComputedStyle(element);
    const canvas = element.querySelector("canvas");
    return {
      width: bounds.width,
      height: bounds.height,
      overflow: style.overflow,
      borderRadius: style.borderRadius,
      canvasContained: !!canvasBounds
        && canvasBounds.left >= bounds.left
        && canvasBounds.top >= bounds.top
        && canvasBounds.right <= bounds.right
        && canvasBounds.bottom <= bounds.bottom,
      canvasDpr: canvas && canvasBounds ? canvas.width / canvasBounds.width : 0,
    };
  });

  expect(Math.abs(metrics.width - metrics.height)).toBeLessThanOrEqual(1);
  if (testInfo.project.name === "desktop-chromium") expect(metrics.width).toBeCloseTo(150, 0);
  else expect(metrics.width).toBeGreaterThanOrEqual(82);
  expect(metrics.overflow).toBe("hidden");
  expect(metrics.borderRadius).not.toBe("0px");
  expect(metrics.canvasContained).toBe(true);
  expect(metrics.canvasDpr).toBeLessThanOrEqual(1.76);

  await core.focus();
  await expect(core).toBeFocused();
  expect(await core.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
});

test("context terrain follows the pointer locally and smoothly restores", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Fine-pointer response is covered once in desktop Chromium.");
  await page.goto("/solutions");
  const hologram = page.getByTestId("context-hologram");
  const core = page.getByTestId("context-core");
  await hologram.scrollIntoViewIfNeeded();
  await expect(hologram).toHaveAttribute("data-hologram-motion", "running");
  const bounds = await core.boundingBox();
  expect(bounds).not.toBeNull();

  const restingBorder = await core.evaluate(element => getComputedStyle(element).borderColor);

  await page.mouse.move(bounds!.x + bounds!.width * .72, bounds!.y + bounds!.height * .42);
  await expect.poll(async () => Number(await hologram.getAttribute("data-hologram-pointer-strength"))).toBeGreaterThan(.35);
  await expect.poll(() => core.evaluate(element => getComputedStyle(element).borderColor)).not.toBe(restingBorder);
  await page.mouse.move(4, 4);
  await expect.poll(async () => Number(await hologram.getAttribute("data-hologram-pointer-strength"))).toBeLessThan(.08);
  await expect.poll(() => core.evaluate(element => getComputedStyle(element).borderColor)).toBe(restingBorder);
});

test("context terrain limits overlapping click pulses and supports keyboard activation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Pulse timing is device-independent.");
  await page.goto("/solutions");
  const hologram = page.getByTestId("context-hologram");
  const core = page.getByTestId("context-core");
  await hologram.scrollIntoViewIfNeeded();
  await expect(hologram).toHaveAttribute("data-hologram-motion", "running");

  await core.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    for (let index = 0; index < 5; index += 1) {
      element.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        clientX: bounds.left + bounds.width * (.3 + index * .08),
        clientY: bounds.top + bounds.height * .55,
        detail: 1,
      }));
    }
  });
  await expect(hologram).toHaveAttribute("data-hologram-pulse-count", "3");
  await expect.poll(async () => Number(await hologram.getAttribute("data-hologram-pulse-count")), { timeout: 3_000 }).toBe(0);

  await core.focus();
  await page.keyboard.press("Enter");
  await expect(hologram).toHaveAttribute("data-hologram-pulse-count", "1");
});

test("context terrain accepts a coarse-pointer tap", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Tap behavior uses the configured touch project.");
  await page.goto("/solutions");
  const hologram = page.getByTestId("context-hologram");
  const core = page.getByTestId("context-core");
  await hologram.scrollIntoViewIfNeeded();
  await expect(hologram).toHaveAttribute("data-hologram-motion", "running");

  await hologram.evaluate(element => {
    const observedWindow = window as Window & { contextPulsePeak?: number };
    observedWindow.contextPulsePeak = 0;
    new MutationObserver(() => {
      observedWindow.contextPulsePeak = Math.max(
        observedWindow.contextPulsePeak ?? 0,
        Number((element as HTMLElement).dataset.hologramPulseCount),
      );
    }).observe(element, { attributes: true, attributeFilter: ["data-hologram-pulse-count"] });
  });
  await core.tap({ position: { x: 38, y: 54 } });
  await expect.poll(() => page.evaluate(() => {
    return (window as Window & { contextPulsePeak?: number }).contextPulsePeak ?? 0;
  })).toBe(1);
});

test("context cards pause, lift, and reset on hover", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Hover styling uses the fine-pointer project.");
  await page.goto("/solutions");
  const hologram = page.getByTestId("context-hologram");
  await hologram.scrollIntoViewIfNeeded();
  await expect(hologram).toHaveAttribute("data-hologram-motion", "running");

  for (let index = 1; index <= 3; index += 1) {
    const card = page.locator(`[data-context-card="${index}"]`);
    const restingBorder = await card.evaluate(element => getComputedStyle(element).borderColor);
    await card.hover({ force: true });
    await expect.poll(() => card.evaluate(element => getComputedStyle(element).animationPlayState)).toBe("paused");
    await expect.poll(() => card.evaluate(element => getComputedStyle(element).transform)).not.toBe("none");
    await expect.poll(() => card.evaluate(element => getComputedStyle(element).borderColor)).not.toBe(restingBorder);
    await expect.poll(() => card.locator("span").nth(1).evaluate(element => parseFloat(getComputedStyle(element).width))).toBeGreaterThan(14);

    await page.mouse.move(4, 4);
    await expect.poll(() => card.evaluate(element => getComputedStyle(element).transform)).toBe("none");
    await expect.poll(() => card.evaluate(element => getComputedStyle(element).animationPlayState)).toBe("running");
  }
});

test("reduced motion uses immediate core highlighting without pulses or card movement", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Reduced-motion interaction is device-independent.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/solutions");
  const hologram = page.getByTestId("context-hologram");
  const core = page.getByTestId("context-core");
  const card = page.locator('[data-context-card="1"]');
  await hologram.scrollIntoViewIfNeeded();

  await core.dispatchEvent("click");
  await expect(hologram).toHaveAttribute("data-hologram-interaction", "highlight");
  await expect(hologram).toHaveAttribute("data-hologram-pulse-count", "0");
  await card.hover();
  expect(await card.evaluate(element => getComputedStyle(element).transform)).toBe("none");
  await expect(hologram).not.toHaveAttribute("data-hologram-interaction", "highlight", { timeout: 1_100 });
});

test("context interaction listeners reinitialize once after route re-entry", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Lifecycle cleanup is device-independent.");
  await page.goto("/solutions");
  await page.getByTestId("context-hologram").scrollIntoViewIfNeeded();
  await page.goto("/company");
  await page.goto("/solutions");

  const hologram = page.getByTestId("context-hologram");
  const core = page.getByTestId("context-core");
  await hologram.scrollIntoViewIfNeeded();
  await expect(hologram).toHaveAttribute("data-hologram-enhanced", "true");
  await core.focus();
  await page.keyboard.press("Space");
  await expect(hologram).toHaveAttribute("data-hologram-pulse-count", "1");
});

test("process and context copy remain available without JavaScript", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "No-JavaScript fallback is device-independent.");
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto("/solutions");

  await expect(page.getByRole("heading", { name: "Prototype & Validate", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your Environment", exact: true })).toBeVisible();
  await expect(page.getByTestId("context-hologram")).toHaveAttribute("data-hologram-motion", "static");
  await expect(page.getByTestId("context-core-fallback")).toBeVisible();
  await context.close();
});

test("context canvas failure leaves the representative mesh fallback visible", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Canvas fallback is device-independent.");
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args) {
      if (this.dataset.testid === "context-terrain-canvas") return null;
      return original.apply(this, args as Parameters<typeof original>);
    } as typeof original;
  });
  await page.goto("/solutions");
  const hologram = page.getByTestId("context-hologram");
  await hologram.scrollIntoViewIfNeeded();
  await expect(hologram).toHaveAttribute("data-hologram-renderer", "fallback");
  await expect(page.getByTestId("context-core-fallback")).toBeVisible();
  await expect(page.getByTestId("context-terrain-canvas")).not.toHaveAttribute("data-ready", "true");
});

test("case-study destination is keyboard focusable", async ({ page }) => {
  await page.goto("/solutions");
  const link = page.getByRole("link", { name: "View case study" });
  await link.scrollIntoViewIfNeeded();
  await link.focus();
  await expect(link).toBeFocused();
  expect(await link.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
});

test("context composition shares one centered coordinate system and responds by breakpoint", async ({ page }, testInfo) => {
  await page.goto("/solutions");
  const hologram = page.getByTestId("context-hologram");
  await hologram.scrollIntoViewIfNeeded();
  const metrics = await hologram.evaluate(element => {
    const box = (selector: string) => {
      const bounds = element.querySelector(selector)!.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, width: bounds.width, height: bounds.height, x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    };
    return {
      diagram: box('[data-testid="context-diagram"]'),
      core: box('[data-testid="context-core"]'),
      nodes: [1, 2, 3].map(index => box(`[data-context-node="${index}"]`)),
      cards: [1, 2, 3].map(index => box(`[data-context-card="${index}"]`)),
      clips: [1, 2, 3].map(index => getComputedStyle(element.querySelector(`[data-context-card="${index}"]`)!).clipPath),
    };
  });

  expect(Math.abs(metrics.core.x - metrics.diagram.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(metrics.core.y - metrics.diagram.y)).toBeLessThanOrEqual(1);
  const vertices = [[.5, 96 / 540], [324 / 1000, 392 / 540], [676 / 1000, 392 / 540]];
  metrics.nodes.forEach((node, index) => {
    expect(Math.abs(node.x - (metrics.diagram.left + metrics.diagram.width * vertices[index][0]))).toBeLessThanOrEqual(1.5);
    expect(Math.abs(node.y - (metrics.diagram.top + metrics.diagram.height * vertices[index][1]))).toBeLessThanOrEqual(1.5);
  });
  expect(Math.abs(metrics.nodes[0].x - (metrics.nodes[1].x + metrics.nodes[2].x) / 2)).toBeLessThanOrEqual(1);
  expect(metrics.clips.every(value => value.startsWith("polygon("))).toBe(true);

  if (testInfo.project.name === "desktop-chromium") {
    expect(metrics.diagram.width).toBeCloseTo(920, 0);
    expect(metrics.cards.every(card => Math.abs(card.width - 270) <= 1)).toBe(true);
    expect(metrics.cards[0].left).toBeGreaterThan(metrics.core.right);
    expect(metrics.cards[1].right).toBeLessThan(metrics.core.left);
    expect(metrics.cards[2].left).toBeGreaterThan(metrics.core.right);
    expect(metrics.cards[1].top).toBeGreaterThan(metrics.core.bottom);
    expect(Math.abs(metrics.cards[1].top - metrics.cards[2].top)).toBeLessThanOrEqual(1);
  } else if (testInfo.project.name === "tablet-chromium") {
    expect(metrics.cards.every(card => card.top >= metrics.diagram.bottom)).toBe(true);
    expect(Math.max(...metrics.cards.map(card => card.width)) - Math.min(...metrics.cards.map(card => card.width))).toBeLessThanOrEqual(1);
    expect(Math.max(...metrics.cards.map(card => card.top)) - Math.min(...metrics.cards.map(card => card.top))).toBeLessThanOrEqual(6);
  } else {
    expect(metrics.cards[0].top).toBeGreaterThanOrEqual(metrics.diagram.bottom);
    expect(metrics.cards[1].top).toBeGreaterThan(metrics.cards[0].bottom);
    expect(metrics.cards[2].top).toBeGreaterThan(metrics.cards[1].bottom);
  }
});

test("context mesh projection exposes the v9.1.27 source grid", () => {
  const idle = createContextMeshSnapshot({ width: 150, height: 150, seconds: 0 });
  const interactive = createContextMeshSnapshot({
    width: 150,
    height: 150,
    seconds: 1.75,
    pointer: { x: .72, y: .42, sx: .44, sy: -.16, inside: true },
  });
  expect(idle).toHaveLength(CONTEXT_MESH.columns * CONTEXT_MESH.rows * 2);
  const assertCoordinates = (actual: Float64Array, offset: number, expected: number[]) => {
    expected.forEach((value, index) => expect(actual[offset + index]).toBeCloseTo(value, 6));
  };
  assertCoordinates(idle, 0, [29.643078702, 59.809136525, 31.93606566, 59.442572321, 34.214668526, 58.664101618]);
  assertCoordinates(idle, 646, [154.507195017, 99.42084884, -18.567785483, 120.449559137, -13.502415544, 117.118288158]);
  assertCoordinates(interactive, 646, [155.037189354, 119.754281352, -29.878208035, 118.446355397, -24.689885708, 108.82908294]);
});

test("context click ripple expands to the farthest circle edge and fades", () => {
  const pulse = { x: 112, y: 75, startedAt: 100 };
  const halfway = contextRippleDisplacement({ x: 25, y: 75 }, pulse, 550, 150, 150);
  const complete = contextRippleDisplacement({ x: 25, y: 75 }, pulse, 1000, 150, 150);
  expect(halfway.progress).toBeCloseTo(.5, 5);
  expect(halfway.radius).toBeCloseTo(56, 0);
  expect(complete.progress).toBe(1);
  expect(complete.x).toBeCloseTo(0, 8);
  expect(complete.y).toBeCloseTo(0, 8);
});
