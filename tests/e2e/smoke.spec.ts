import { expect, test } from "@playwright/test";

test("home route responds and renders its document body", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toBeVisible();
});

for (const [path, heading] of [["/", "We build software products and solutions for real-world problems."], ["/products", "Different products for different problems."], ["/solutions", "Artificial intelligence designed around your objectives."], ["/work", "Experience is proven in practice."], ["/company", "We turn possibilities into technology that can move forward."], ["/contact", "Let's talk about what you want to build."]] as const) {
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

test("contact demo validates required fields and does not send an enquiry", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Start the conversation" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await expect(page.locator("#name")).toBeFocused();
  await page.locator("#name").fill("Avery Brown");
  await page.locator("#work-email").fill("avery@example.com");
  await page.locator("#tell-us-a-little-more").fill("I would like to discuss an AI solution.");
  await page.getByRole("button", { name: "Start the conversation" }).click();
  await expect(page.getByRole("button", { name: "Preparing demo confirmation…" })).toBeDisabled();
  await expect(page.getByRole("heading", { name: "Your message was not sent." })).toBeVisible();
  await expect(page.getByText("This demonstration does not deliver enquiries.")).toBeVisible();
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
  await expect(page.getByRole("button", { name: "Start the conversation" })).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
});

test("products hero uses ambient video and keeps its CTA working", async ({ page }) => {
  await page.goto("/products");
  const video = page.getByTestId("products-hero-video");

  await expect(video.locator("source")).toHaveAttribute("src", "/pages/products/city-night.mp4");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(.1);
  expect(await video.evaluate((element: HTMLVideoElement) => ({
    muted: element.muted,
    loop: element.loop,
    playsInline: element.playsInline,
    controls: element.controls,
  }))).toEqual({ muted: true, loop: true, playsInline: true, controls: false });
  await page.getByRole("link", { name: "Explore our products" }).click();
  await expect(page).toHaveURL(/\/products#products-openjm$/);
});

test("products hero displays only its poster with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products");
  const video = page.getByTestId("products-hero-video");

  await expect(video.locator("source")).toHaveAttribute("src", "/pages/products/city-night.mp4");
  await expect(video).toHaveAttribute("poster", "/pages/products/image/hero.png");
  await expect(video).toHaveAttribute("preload", "none");
  await expect(video).toHaveAttribute("data-motion", "reduced");
  await expect(video).toHaveJSProperty("paused", true);
  await expect(video).toHaveJSProperty("currentTime", 0);
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

test("clicking the active header route keeps the current scroll position", async ({ page }) => {
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
  await expect.poll(() => page.evaluate((expected) => Math.abs(window.scrollY - expected), initialScroll)).toBeLessThanOrEqual(1);
});
