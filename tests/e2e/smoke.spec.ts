import { expect, test } from "@playwright/test";

test("home route responds and renders its document body", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toBeVisible();
});

for (const [path, heading] of [["/", "We build software products and solutions for real-world problems."], ["/products", "Different products for different problems."], ["/solutions", "Tell us what you want to achieve. Let's build the path to make it possible."], ["/work", "Experience is proven in practice."], ["/company", "We turn possibilities into technology that can move forward."], ["/contact", "Let's talk about what you want to build."]] as const) {
  test(`${path} renders its primary heading`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
  });
}

test("product exits are safe external links and unresolved footer entries are not links", async ({ page }) => {
  await page.goto("/products");
  const productExit = page.getByRole("link", { name: "Explore OpenJM" }).last();
  await expect(productExit).toHaveAttribute("target", "_blank");
  await expect(productExit).toHaveAttribute("rel", "noopener noreferrer");
  await page.goto("/");
  await expect(page.getByText("Team", { exact: true }).last()).not.toHaveAttribute("href");
  await expect(page.getByText("Insights", { exact: true }).last()).not.toHaveAttribute("href");
});

test("mobile navigation works from the keyboard and closes with Escape", async ({ page }) => {
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  test.skip(!(await menu.isVisible()), "Desktop navigation does not use the mobile menu.");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name: "AI Solutions", exact: true }).last()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("reduced motion keeps Contact interaction available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  await expect(page.getByRole("button", { name: "Continue in email" })).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
});

test("products hero uses the supplied image and keeps its CTA working", async ({ page }) => {
  await page.goto("/products");
  const image = page.getByTestId("products-hero-image");

  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("src", /pages%2Fproducts%2Fimage%2Fhero\.png/);
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  await expect(page.locator("video")).toHaveCount(0);
  await page.getByRole("link", { name: "Explore our products" }).click();
  await expect(page).toHaveURL(/\/products$/);
});

test("products hero image loads with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products");
  const image = page.getByTestId("products-hero-image");

  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  await expect(page.locator("video")).toHaveCount(0);
});

test("every primary navigation destination opens its bare route at the top", async ({ page }) => {
  await page.goto("/");

  for (const [label, path] of [["Products", "/products"], ["AI Solutions", "/solutions"], ["Work & Credibility", "/work"], ["Company", "/company"], ["Home", "/"]] as const) {
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    const menu = page.getByRole("button", { name: "Menu" });
    const mobile = await menu.isVisible();
    if (mobile) await menu.click();
    const navigation = page.getByRole("navigation", { name: mobile ? "Primary mobile" : "Primary", exact: true });
    await navigation.getByRole("link", { name: label, exact: true }).click();

    await expect.poll(() => {
      const url = new URL(page.url());
      return `${url.pathname}${url.search}${url.hash}`;
    }).toBe(path);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  }
});

test("wordmark and Contact CTA open their bare routes at the top", async ({ page }) => {
  await page.goto("/company");
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.locator('header a[aria-label="CrimsonTide home"]').evaluate((element: HTMLAnchorElement) => element.click());
  await expect.poll(() => page.evaluate(() => ({
    route: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    scrollY: window.scrollY,
  }))).toEqual({ route: "/", scrollY: 0 });

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  const menu = page.getByRole("button", { name: "Menu" });
  const mobile = await menu.isVisible();
  if (mobile) await menu.click();
  const contact = mobile
    ? page.getByRole("navigation", { name: "Primary mobile" }).getByRole("link", { name: "Contact CrimsonTide", exact: true })
    : page.getByRole("link", { name: "Contact CrimsonTide", exact: true }).first();
  await contact.click();

  await expect.poll(() => page.evaluate(() => ({
    route: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    scrollY: window.scrollY,
  }))).toEqual({ route: "/contact", scrollY: 0 });
  if (mobile) await expect(page.locator("header details")).toHaveJSProperty("open", false);
});

test("header exposes only the Contact CrimsonTide CTA", async ({ page }) => {
  await page.goto("/");
  const desktopNavigation = page.getByRole("navigation", { name: "Primary", exact: true });
  await expect(desktopNavigation.getByRole("link", { name: "Contact", exact: true })).toHaveCount(0);

  const menu = page.getByRole("button", { name: "Menu" });
  if (await menu.isVisible()) {
    await menu.click();
    const mobileNavigation = page.getByRole("navigation", { name: "Primary mobile" });
    await expect(mobileNavigation.getByRole("link", { name: "Contact", exact: true })).toHaveCount(0);
    await expect(mobileNavigation.getByRole("link", { name: "Contact CrimsonTide", exact: true })).toHaveCount(1);
    await expect(mobileNavigation.getByRole("link", { name: "Contact CrimsonTide", exact: true })).toBeVisible();
  } else {
    await expect(page.getByRole("link", { name: "Contact CrimsonTide", exact: true }).first()).toBeVisible();
  }
});

test("clicking the active header route returns to the top", async ({ page }) => {
  await page.goto("/products");
  await page.evaluate(() => window.scrollTo({ top: Math.min(600, document.body.scrollHeight - window.innerHeight), behavior: "instant" }));

  const menu = page.getByRole("button", { name: "Menu" });
  const mobile = await menu.isVisible();
  if (mobile) await menu.click();
  const navigation = page.getByRole("navigation", { name: mobile ? "Primary mobile" : "Primary", exact: true });
  if (mobile) {
    await expect(navigation.getByRole("link", { name: "Home", exact: true })).toBeFocused();
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  }
  const activeRoute = navigation.getByRole("link", { name: "Products", exact: true });
  await expect(activeRoute).toBeVisible();
  const initialScroll = await page.evaluate(() => window.scrollY);
  expect(initialScroll).toBeGreaterThan(0);
  await activeRoute.evaluate((element: HTMLAnchorElement) => element.click());

  await expect(page).toHaveURL(/\/products$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
