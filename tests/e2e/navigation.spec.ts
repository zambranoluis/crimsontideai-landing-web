import { expect, test, type Page } from "@playwright/test";

async function landed(page: Page, path: string, section?: string, focused = true) {
  await expect(page).toHaveURL(new URL(path, "http://localhost:3001").href);
  const main = page.locator(`main[data-navigation-route="${new URL(path, "http://localhost:3001").pathname}"]:visible`);
  const heading = main.locator(section ? `#${section} :is(h1,h2,h3)` : "h1").first();
  await expect(heading).toBeVisible();
  await expect(heading).toBeInViewport();
  if (focused) await expect(heading).toBeFocused();
  await expect.poll(() => page.evaluate((id) => {
    if (!id) return scrollY;
    const target = document.getElementById(id)!;
    return Math.abs(target.getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop));
  }, section)).toBeLessThan(2);
}

const destinations = [
  ["/", "main", "Explore Solutions", "/solutions"],
  ["/", "main", "Explore our work", "/work", "work-industries"],
  ["/", "main", "About CrimsonTide", "/company"],
  ["/", "main", "Contact CrimsonTide", "/contact"],
  ["/solutions", "main > section:first-child", "Discuss an AI solution", "/contact"],
  ["/solutions", "main > section:last-child", "Discuss an AI solution", "/contact"],
  ["/work", "main", "Built for what’s next", "/company"],
  ["/work", "main", "Explore solutions for your sector", "/solutions"],
  ["/work", "main", "Contact CrimsonTide", "/contact"],
  ["/company", "main", "Contact CrimsonTide", "/contact"],
  ["/", "footer", "CrimsonTide home", "/"],
  ["/work", "footer", "AI Solutions", "/solutions"],
  ["/work", "footer", "Custom Software Development", "/solutions", "solutions-opportunities"],
  ["/work", "footer", "Product Customisation", "/solutions", "solutions-context"],
  ["/work", "footer", "Contact Us", "/contact"],
] as const;

for (const [source, scope, label, path, section] of destinations) {
  test(`${source} ${scope} ${label} reaches ${path}${section ? ` / ${section}` : " top"}`, async ({ page }) => {
    // Prime a destination at a different reading position before returning.
    await page.goto(path);
    await expect(page.locator("[data-reveal]").first()).toBeAttached();
    await page.evaluate(() => scrollTo({ top: 500, behavior: "instant" }));
    await page.locator(`header a[href="${source}"]`).first().evaluate((link: HTMLAnchorElement) => link.click());
    await landed(page, source);
    const link = page.locator(scope).getByRole("link", { name: label, exact: true });
    await expect(link).toHaveAttribute("href", path + (section ? `#${section}` : ""));
    await link.click();
    await landed(page, path, section);
  });
}

test("section links work on every click and respect reduced motion", async ({ page }) => {
  await page.goto("/solutions");
  for (const label of ["Custom Software Development", "Product Customisation", "Custom Software Development"]) {
    const section = label === "Product Customisation" ? "solutions-context" : "solutions-opportunities";
    await page.locator("footer").getByRole("link", { name: label }).click();
    await landed(page, "/solutions", section);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  }
  // Frame-by-frame motion assertions live in navigation-transitions.spec.ts.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("footer").getByRole("link", { name: "Product Customisation" }).click();
  await landed(page, "/solutions", "solutions-context");
  await page.locator("footer").getByRole("link", { name: "Industries", exact: true }).click();
  await landed(page, "/work", "work-industries");
});

test("keyboard activation, active header routes, mobile disclosure and skip link", async ({ page }) => {
  await page.goto("/");
  const action = page.getByRole("link", { name: "Explore what we build" });
  await action.focus();
  await page.keyboard.press("Enter");
  await landed(page, "/", "home-build");
  const menu = page.getByRole("button", { name: "Menu" });
  const mobile = await menu.isVisible();
  if (mobile) {
    await menu.focus();
    await page.keyboard.press("Enter");
  }
  const nav = page.getByRole("navigation", { name: mobile ? "Primary mobile" : "Primary", exact: true });
  await nav.getByRole("link", { name: "Home", exact: true }).focus();
  await page.keyboard.press("Enter");
  await landed(page, "/");
  if (mobile) await expect(page.locator("header details")).not.toHaveAttribute("open");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toHaveAttribute("href", "#main-content");
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("main")).toBeFocused();
});

test("latest rapid click wins, including a return to the current route", async ({ page }) => {
  await page.goto("/");
  await page.route("**/solutions?*", async route => {
    await new Promise(resolve => setTimeout(resolve, 350));
    await route.continue();
  });
  for (const [href, destination, section] of [["/company", "/company", undefined], ["/", "/", undefined], ["/solutions#solutions-context", "/solutions", "solutions-context"]] as const) {
    await page.evaluate(() => {
      document.querySelector<HTMLAnchorElement>('header a[href="/solutions"]')!.click();
    });
    await page.locator(`a[href="${href}"]`).first().evaluate((link: HTMLAnchorElement) => link.click());
    await landed(page, destination, section);
    await page.waitForTimeout(600);
    await landed(page, destination, section);
    if (destination !== "/") {
      await page.locator('footer a[href="/"]').click();
      await landed(page, "/");
    }
  }
});

test("Back cancels a section request while its route is still loading", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-reveal]").first()).toBeAttached();
  await page.evaluate(() => scrollTo({ top: 600, behavior: "instant" }));
  await page.locator('header a[href="/work"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await landed(page, "/work");
  await page.route("**/solutions?*", async route => {
    await new Promise(resolve => setTimeout(resolve, 700));
    await route.continue();
  });
  const loading = page.waitForRequest(request => new URL(request.url()).pathname === "/solutions");
  await page.locator('footer a[href="/solutions#solutions-context"]').evaluate((link: HTMLAnchorElement) => link.click());
  await loading;
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(600, 0);
  await page.waitForTimeout(900);
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(600, 0);
});

test("Back and Forward restore reading positions without replaying a link request", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore our work", exact: true }).click();
  await landed(page, "/work", "work-industries");
  await page.evaluate(() => scrollTo({ top: 700, behavior: "instant" }));
  // DOM activation avoids Playwright moving an offscreen control before saving history.
  await page.locator('header a[href="/solutions"]').first().evaluate((link: HTMLAnchorElement) => link.click());
  await landed(page, "/solutions");
  await page.evaluate(() => scrollTo({ top: 450, behavior: "instant" }));
  await page.goBack();
  await expect(page).toHaveURL(/\/work$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(700, 0);
  await page.goForward();
  await expect(page).toHaveURL(/\/solutions$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(450, 0);
});

test("direct anchors and modified new-tab clicks retain fallback hashes", async ({ page, context }) => {
  await page.goto("/solutions#solutions-context");
  await landed(page, "/solutions#solutions-context", "solutions-context", false);
  await page.locator("footer").getByRole("link", { name: "Product Customisation" }).click();
  await landed(page, "/solutions", "solutions-context");
  const link = page.locator("footer").getByRole("link", { name: "Custom Software Development" });
  const opened = context.waitForEvent("page");
  await link.click({ modifiers: ["ControlOrMeta"] });
  const tab = await opened;
  await tab.waitForLoadState();
  await landed(tab, "/solutions#solutions-opportunities", "solutions-opportunities", false);
  await expect(page).toHaveURL(/\/solutions$/);
  await tab.close();
});

test("no-JavaScript route and section fallbacks work and removed elements are absent", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("http://localhost:3001/");
  await expect(page.locator('[class*="principleNumber"]')).toHaveCount(0);
  for (const label of ["Book a Consultation", "Product Enquiry"]) await expect(page.locator("footer").getByText(label, { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Explore our work", exact: true }).click();
  await landed(page, "/work#work-industries", "work-industries", false);
  await expect(page.getByRole("link", { name: "View retail case" })).toHaveCount(0);
  for (const [label, section] of [["Custom Software Development", "solutions-opportunities"], ["Product Customisation", "solutions-context"]]) {
    await page.locator("footer").getByRole("link", { name: label }).click();
    await landed(page, `/solutions#${section}`, section, false);
  }
  await page.locator("footer").getByRole("link", { name: "Contact Us" }).click();
  await landed(page, "/contact", undefined, false);
  await context.close();
});

test("removed items leave readable layouts without horizontal overflow", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const company = page.locator('section[aria-labelledby="company-heading"]');
  await company.scrollIntoViewIfNeeded();
  await expect(company.locator("h3")).toHaveCount(3);
  await expect(company.locator('[class*="principleNumber"]')).toHaveCount(0);
  // These standalone section captures omit the fixed header overlay; actual
  // header clearance is asserted by the navigation tests above.
  const style = "header { visibility: hidden !important; }";
  await company.screenshot({ path: testInfo.outputPath("home-principles.png"), style });
  await page.locator("footer").screenshot({ path: testInfo.outputPath("footer.png"), style });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.goto("/work");
  await expect(page.getByRole("link", { name: "View retail case" })).toHaveCount(0);
  await page.locator("#work-industries").screenshot({ path: testInfo.outputPath("industries.png"), style });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});
