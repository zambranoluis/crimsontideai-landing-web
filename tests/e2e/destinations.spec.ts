import { test, expect } from "./fixtures";

test("both product exits activate their configured destinations safely", async ({ page, context }) => {
  await page.goto("/products");
  for (const href of ["https://openjm.ai", "https://crimsontide.app"]) {
    const exit = page.locator(`main a[href="${href}"]`).last();
    await expect(exit).toHaveAttribute("target", "_blank");
    await expect(exit).toHaveAttribute("rel", "noopener noreferrer");
    await context.route(`${href}/**`, route => route.fulfill({ body: "Configured product destination", contentType: "text/html" }));
    await exit.focus();
    const opened = context.waitForEvent("page");
    await page.keyboard.press("Enter");
    const tab = await opened;
    await expect(tab).toHaveURL(`${href}/`);
    expect(await tab.evaluate(() => window.opener)).toBeNull();
    await tab.close();
  }
});

test("published contact links and unresolved footer labels retain their destinations", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.locator('main a[href="mailto:info@crimsontide.ai"]').first()).toBeVisible();
  const phone = page.locator('main a[href^="tel:"]');
  await expect(phone).toHaveCount(1);
  expect(await phone.getAttribute("href")).toBe("tel:+18764584187");
  for (const label of ["Privacy", "Terms", "Support"]) await expect(page.locator("footer").getByText(label, { exact: true })).not.toHaveAttribute("href");
});
