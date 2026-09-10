import { expect, test, type Page } from "@playwright/test";

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
  await expect(hologram).toHaveAttribute("data-hologram-motion", "paused");
  await hologram.scrollIntoViewIfNeeded();
  await expect(hologram).toHaveAttribute("data-hologram-motion", "running");
  const firstFrame = Number(await hologram.getAttribute("data-hologram-frame"));
  await expect.poll(async () => Number(await hologram.getAttribute("data-hologram-frame"))).toBeGreaterThan(firstFrame);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(hologram).toHaveAttribute("data-hologram-motion", "paused");
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

test("process and context copy remain available without JavaScript", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "No-JavaScript fallback is device-independent.");
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto("/solutions");

  await expect(page.getByRole("heading", { name: "Prototype & Validate", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your Environment", exact: true })).toBeVisible();
  await expect(page.getByTestId("context-hologram")).toHaveAttribute("data-hologram-motion", "static");
  await context.close();
});

test("case-study destination is keyboard focusable", async ({ page }) => {
  await page.goto("/solutions");
  const link = page.getByRole("link", { name: "View case study" });
  await link.scrollIntoViewIfNeeded();
  await link.focus();
  await expect(link).toBeFocused();
  expect(await link.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
});
