import { expect, test } from "@playwright/test";

test("home route responds and renders its document body", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toBeVisible();
});

test("primary navigation starts the destination route at the top", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  const menu = page.getByRole("button", { name: "Menu" });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("link", { name: "Products", exact: true }).click();

  await expect(page).toHaveURL(/\/products$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});
