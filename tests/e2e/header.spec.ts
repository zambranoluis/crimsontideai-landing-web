import { test, expect, type Page } from "./fixtures";

async function resizeAtBreakpoint(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  // Linux desktop WebKit excludes its classic scrollbar from media-query width.
  // Exercise the authored CSS breakpoint, then verify the exact width directly.
  const gutter = await page.evaluate(wanted => {
    if (matchMedia(`(width: ${wanted}px)`).matches) return 0;
    const client = document.documentElement.clientWidth;
    return matchMedia(`(width: ${client}px)`).matches ? innerWidth - client : 0;
  }, width);
  if (gutter) await page.setViewportSize({ width: width + gutter, height: 900 });
  await expect.poll(() => page.evaluate(wanted => matchMedia(`(width: ${wanted}px)`).matches, width)).toBe(true);
}

test("header outside click and Escape dismiss with appropriate focus", async ({ page }) => {
  await page.setViewportSize({ width: 1023, height: 900 });
  await page.goto("/products");
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  // The open disclosure covers the heading; click a real exposed point outside it.
  await page.mouse.click(5, 890);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("navigation", { name: "Primary mobile" }).getByRole("link", { name: "Home", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

for (const [path, name] of [["/products", "Products"], ["/contact", "Contact CrimsonTide"]]) test(`header transfers ${path} focus across 1023 and 1024px`, async ({ page }) => {
  await page.setViewportSize({ width: 1023, height: 900 });
  await page.goto(path);
  await resizeAtBreakpoint(page, 1023);
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.click();
  await page.getByRole("navigation", { name: "Primary mobile" }).getByRole("link", { name, exact: true }).focus();
  await resizeAtBreakpoint(page, 1024);
  const desktopLink = path === "/contact" ? page.locator('header a[href="/contact"]').first() : page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name, exact: true });
  await expect(desktopLink).toBeFocused();
  await expect(page.locator("header details")).not.toHaveAttribute("open");
  await resizeAtBreakpoint(page, 1023);
  await expect(menu).toBeFocused();
});
