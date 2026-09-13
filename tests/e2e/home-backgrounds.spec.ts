import { expect, test, type Locator } from "@playwright/test";

async function decoded(image: Locator) {
  await expect.poll(() => image.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`hero map has a clean first paint with delayed hydration (${reducedMotion})`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion });
    let releaseScripts!: () => void;
    const scriptsHeld = new Promise<void>(resolve => { releaseScripts = resolve; });
    await page.route("**/*", async route => {
      if (route.request().resourceType() === "script") await scriptsHeld;
      await route.continue();
    });
    try {
      await page.goto("/", { waitUntil: "commit" });
      const network = page.getByTestId("jamaica-network");
      const scene = network.locator("[data-network-scene]");
      await decoded(page.getByTestId("hero-map-image"));
      await expect(page.getByTestId("hero-map-image")).toBeVisible();
      await expect(page.locator("#home-heading")).toBeVisible();
      await expect(page.getByRole("link", { name: "Explore what we build" })).toBeVisible();
      await expect(network).not.toHaveAttribute("data-network-ready");
      await expect(scene).toHaveCSS("visibility", reducedMotion === "reduce" ? "visible" : "hidden");
      await testInfo.attach("before-hydration", { body: await page.screenshot(), contentType: "image/png" });

      // Capture the first initialized pose before the animation can advance.
      await network.evaluate(element => {
        const observer = new MutationObserver(() => {
          if (!(element instanceof HTMLElement) || !element.dataset.networkReady) return;
          const paths = [...element.querySelectorAll<SVGPathElement>("[data-network-route]")];
          element.dataset.initialPose = JSON.stringify({
            hub: getComputedStyle(element.querySelector("[data-network-hub]")!).opacity,
            routes: paths.map(path => Number(path.style.strokeDashoffset) / path.getTotalLength()),
            nodes: [...element.querySelectorAll("[data-network-node]")].map(node => getComputedStyle(node).opacity),
          });
          observer.disconnect();
        });
        observer.observe(element, { attributes: true, attributeFilter: ["data-network-ready"] });
      });
      releaseScripts();
      await expect(network).toHaveAttribute("data-network-ready", "true");
      await expect(scene).toHaveCSS("visibility", "visible");
      const pose = JSON.parse((await network.getAttribute("data-initial-pose"))!);
      expect(pose.hub).toBe(reducedMotion === "reduce" ? "1" : "0");
      for (const offset of pose.routes) expect(offset).toBeCloseTo(reducedMotion === "reduce" ? 0 : 1, 4);
      expect(pose.nodes).toEqual(Array(6).fill(reducedMotion === "reduce" ? "1" : "0"));
    } finally {
      releaseScripts();
      await page.unrouteAll({ behavior: "wait" });
    }
  });
}

test("hero map completes its loop and restarts cleanly", async ({ page }, testInfo) => {
  await page.goto("/");
  const network = page.getByTestId("jamaica-network");
  const hub = network.locator("[data-network-hub]");
  const lastRoute = network.locator("[data-network-route]").last();
  await expect(network).toHaveAttribute("data-motion", "running");
  await expect(lastRoute).toHaveCSS("stroke-dashoffset", "0px", { timeout: 10_000 });
  await expect(hub).toHaveCSS("opacity", "1");
  await testInfo.attach("complete-network", { body: await page.screenshot(), contentType: "image/png" });
  // The blank interval is shorter than the assertion library's retry interval.
  await page.waitForFunction(() => getComputedStyle(document.querySelector("[data-network-scene]")!).opacity === "0", { }, { timeout: 8_000 });
  await page.waitForFunction(() => getComputedStyle(document.querySelector("[data-network-hub]")!).opacity === "0", { }, { timeout: 3_000 });
  for (const path of await network.locator("[data-network-route]").all()) {
    expect(await path.evaluate((path: SVGPathElement) => Number(path.style.strokeDashoffset) / path.getTotalLength())).toBeCloseTo(1, 4);
  }
  await expect(hub).toHaveCSS("opacity", "1", { timeout: 3_000 });
  await expect(network).toHaveAttribute("data-network-ready", "true");

  await page.reload();
  await expect(network).toHaveAttribute("data-network-ready", "true");
  await page.getByRole("link", { name: "Explore what we build" }).click();
  await page.getByRole("link", { name: "Explore Solutions", exact: true }).click();
  await expect(page).toHaveURL(/\/solutions$/);
  await page.goBack();
  await expect(network).toHaveAttribute("data-network-ready", "true");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(network).toHaveAttribute("data-motion", "running");
});

test("Home backgrounds preserve foreground content, map alignment and actions", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator('section[aria-labelledby="home-heading"]');
  const company = page.locator('section[aria-labelledby="company-heading"]');
  await expect(hero.getByTestId("jamaica-network")).toHaveCount(1);
  await expect(hero.locator("canvas")).toHaveCount(0);
  await expect(company.getByTestId("company-mesh")).toHaveCount(1);
  await expect(company.getByTestId("jamaica-network")).toHaveCount(0);
  await expect(page.getByTestId("hero-artwork")).toHaveCSS("pointer-events", "none");
  await expect(page.getByTestId("company-artwork")).toHaveCSS("pointer-events", "none");
  const map = page.getByTestId("hero-map-image");
  await decoded(map);
  await expect(map).toHaveAttribute("loading", "eager");
  expect(await map.boundingBox()).toEqual(await hero.getByTestId("jamaica-network").locator("svg").boundingBox());
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText("We build software products and solutions for real-world problems.");
  await hero.getByRole("link", { name: "Explore what we build" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#home-build")).toBeInViewport();

  const image = company.getByTestId("company-image");
  await company.scrollIntoViewIfNeeded();
  await decoded(image);
  await expect(image).toHaveAttribute("loading", "lazy");
  for (const heading of ["Built in Jamaica", "Proprietary technology", "Regional perspective. Global potential."]) {
    const principle = company.getByRole("heading", { name: heading, exact: true });
    await principle.scrollIntoViewIfNeeded();
    await expect(principle).toBeVisible();
    await expect(principle.locator("xpath=ancestor::*[@data-reveal][1]")).toHaveCSS("opacity", "1");
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  const action = company.getByRole("link", { name: "About CrimsonTide" });
  await action.focus();
  await expect(action).toBeFocused();
  await action.press("Enter");
  await expect(page).toHaveURL(/\/company$/);
});

test("hero map freezes while hidden and switches to a complete reduced-motion composition", async ({ page }) => {
  await page.goto("/");
  const network = page.getByTestId("jamaica-network");
  await expect(network).toHaveAttribute("data-motion", "running");
  const route = network.locator("[data-network-route]").first();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(network).toHaveAttribute("data-motion", "offscreen");
  const offset = await route.evaluate(e => e.style.strokeDashoffset);
  await page.waitForTimeout(150);
  expect(await route.evaluate(e => e.style.strokeDashoffset)).toBe(offset);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(network).toHaveAttribute("data-motion", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(network).toHaveAttribute("data-motion", "reduced");
  for (const path of await network.locator("[data-network-route]").all()) await expect(path).toHaveCSS("stroke-dashoffset", "0px");
  await expect(network.locator("[data-network-hub]")).toHaveCSS("opacity", "1");
});

test("both background compositions and all Company content survive without JavaScript", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  const page = await context.newPage();
  await page.goto("/");
  await decoded(page.getByTestId("hero-map-image"));
  await expect(page.locator("[data-network-hub]")).toBeVisible();
  const company = page.locator('section[aria-labelledby="company-heading"]');
  await company.scrollIntoViewIfNeeded();
  await decoded(page.getByTestId("company-image"));
  await expect(company.locator('[data-mesh-fallback="company-mountains"]')).toBeVisible();
  for (const content of await company.locator("[data-reveal]").all()) {
    await expect(content).toBeVisible();
    await expect(content).toHaveCSS("opacity", "1");
  }
  await expect(company.getByRole("link", { name: "About CrimsonTide" })).toHaveAttribute("href", "/company#company-about");
  await context.close();
});
