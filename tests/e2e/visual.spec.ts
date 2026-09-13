import { test, expect, type Page, type Locator } from "./fixtures";
import { readRoute, routes, settle } from "./route-contracts";

async function region(page: Page, locator: Locator, name: string, padding = 0) {
  await page.evaluate(() => scrollTo({ top: 0, left: 0, behavior: "instant" }));
  await locator.evaluate(element => Promise.all(element.getAnimations({ subtree: true })
    .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
    .map(animation => animation.finished)).then(() => undefined));
  const clip = await locator.boundingBox();
  expect(clip).not.toBeNull();
  if (clip && padding) { clip.x -= padding; clip.y -= padding; clip.width += padding * 2; clip.height += padding * 2; }
  await expect(page).toHaveScreenshot(name, { fullPage: true, clip: clip!, animations: "disabled" });
}

test.beforeEach(async ({ page }) => {
  // Random decorative seeds are repeatable; no text, controls or layout is masked.
  await page.addInitScript(() => {
    let seed = 17;
    Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const route of routes) {
  test(`${route.path} section compositions`, async ({ page }) => {
    expect(process.platform, "Visual goldens must be generated and compared in the pinned Linux runner").toBe("linux");
    await page.goto(route.path);
    await readRoute(page);
    // Capture document-space regions from the top. Scrolling an element screenshot
    // into view can place the sticky header over its heading or scroll a clipped
    // decorative image's overflow container. Keep the real header at document top.
    await page.evaluate(() => scrollTo({ top: 0, left: 0, behavior: "instant" }));
    await settle(page);
    for (const [index, section] of (await page.locator("main > section").all()).entries()) {
      const clip = await section.boundingBox();
      expect(clip).not.toBeNull();
      await expect(page).toHaveScreenshot(`${route.path.slice(1) || "home"}-section-${index + 1}.png`, { fullPage: true, clip: clip!, animations: "disabled" });
    }
    const footerClip = await page.locator("footer").boundingBox();
    await expect(page).toHaveScreenshot(`${route.path.slice(1) || "home"}-footer.png`, { fullPage: true, clip: footerClip!, animations: "disabled" });
  });
}

test("menu, form outcomes, partner selection and primary action states", async ({ page }, info) => {
  expect(process.platform).toBe("linux");
  await page.goto("/contact");
  await readRoute(page);
  const form = page.locator("form");
  await page.getByRole("button", { name: "Start Conversation" }).click();
  await expect(page.getByLabel("Name", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await region(page, form, "contact-validation.png");
  await page.route("**/api/contact", route => route.fulfill({ json: { outcome: "success" } }));
  await page.getByLabel("Name", { exact: true }).fill("Test Visitor");
  await page.getByLabel("Work email").fill("visitor@example.com");
  await page.getByLabel("Tell us a little more").fill("Please discuss an integration.");
  await page.clock.install();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 10_000));
  await page.getByRole("button", { name: "Start Conversation" }).click();
  await expect(page.getByRole("status")).toContainText("Your enquiry was sent.");
  await region(page, form, "contact-success.png");
  await page.clock.resume();
  await page.goto("/work");
  await readRoute(page);
  const grid = page.locator("[data-partner-grid]");
  await grid.locator("button[data-logo]").first().click();
  await region(page, grid, "partners-selected.png");
  await page.goto("/");
  const action = page.getByRole("link", { name: "Explore what we build" });
  await action.focus();
  await region(page, action, "primary-focus.png", 8);
  if (!info.project.use.hasTouch) {
    await action.hover();
    await region(page, action, "primary-hover.png", 8);
  }
  const menu = page.getByRole("button", { name: "Menu" });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(page.getByRole("navigation", { name: "Primary mobile" })).toBeVisible();
    await expect(page).toHaveScreenshot("mobile-menu.png", { animations: "disabled" });
  }
});

for (const [path, selector] of [["/solutions", '[data-testid="solutions-earth"]'], ["/company", "#company-about"], ["/products", "#products-openjm"], ["/products", "#products-sentinel"]]) {
  test(`${path} ${selector} controlled motion milestones`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop-chromium", "Pinned normal-motion scenes require fine-pointer desktop.");
    expect(process.platform).toBe("linux");
    // Freeze decorative elapsed time before app initialization, while retaining
    // native animation-frame delivery for scroll geometry and renderer readiness.
    await page.addInitScript(() => {
      const request = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => request(() => callback(1000));
      Object.defineProperty(performance, "now", { configurable: true, value: () => 1000 });
    });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(path);
    await readRoute(page);
    const section = page.locator(selector);
    if (path === "/solutions") await expect(section).toHaveAttribute("data-earth-mode", "pinned");
    if (path === "/company") await expect(section).toHaveAttribute("data-pinned", "true");
    if (path === "/products") await expect(section.locator("[data-scene-enabled]").first()).toHaveAttribute("data-scene-enabled", "true");
    for (const progress of [0, .5, 1]) {
      await section.evaluate((element, { fraction, path }) => {
        const top = scrollY + element.getBoundingClientRect().top;
        const header = document.querySelector("header")!.getBoundingClientRect().height;
        const offset = path === "/solutions" ? -header + (innerHeight - header) * .85 * fraction
          : path === "/company" ? -innerHeight + element.querySelector("[data-company-scene]")!.getBoundingClientRect().height + fraction * (innerHeight - header) * 2.5
          : Math.max(0, element.clientHeight - innerHeight) * fraction;
        scrollTo({ top: top + offset, behavior: "instant" });
      }, { fraction: progress, path });
      await settle(page);
      if (path === "/solutions") await expect.poll(() => section.evaluate(element => Number((element as HTMLElement).style.getPropertyValue("--earth-glow")))).toBeCloseTo(progress, 2);
      if (path === "/company") {
        await expect(page.getByTestId("company-particles")).toHaveAttribute("data-ready", "true");
        await expect.poll(async () => Number(await page.getByTestId("company-particles").getAttribute("data-progress"))).toBeCloseTo(progress, 2);
      }
      await expect(page).toHaveScreenshot(`${path.slice(1)}-${selector.replace(/[^a-z-]/g, "")}-${progress}.png`, { animations: "disabled" });
    }
  });
}
