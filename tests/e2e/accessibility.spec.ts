import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page, type TestInfo } from "./fixtures";
import { readRoute, routes, settle } from "./route-contracts";

async function scan(page: Page, info: TestInfo, name: string) {
  // Start at document top so the sticky header does not partially cover a
  // non-focused target at the current arbitrary scroll cut through the page.
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await settle(page);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  await info.attach(`axe-${name}`, { body: JSON.stringify(results, null, 2), contentType: "application/json" });
  if (results.incomplete.length) info.annotations.push({ type: "manual-review", description: `${name}: ${results.incomplete.map(result => result.id).join(", ")} (see axe attachment)` });
  expect(results.violations, `${name}: automated WCAG violations`).toEqual([]);
}

for (const route of routes) {
  test(`${route.path} accessibility and 320px text reflow`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route.path);
    await readRoute(page);
    await scan(page, info, "route");
    for (const scale of [1, 2]) {
      await page.setViewportSize({ width: 320, height: 900 });
      if (scale === 2) await page.evaluate(() => {
        // Text-only enlargement, including px-authored text; keep layout dimensions unchanged.
        const elements = Array.from(document.querySelectorAll<HTMLElement>("body *"));
        const sizes = elements.map(element => getComputedStyle(element).fontSize);
        elements.forEach((element, index) => { element.style.fontSize = `${parseFloat(sizes[index]) * 2}px`; });
      });
      await readRoute(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${scale * 100}% text at 320px`).toBeLessThanOrEqual(1);
      for (const heading of await page.locator("main h1,main h2").all()) {
        await heading.scrollIntoViewIfNeeded();
        await expect(heading).toBeVisible();
      }
    }
  });
}

test("mobile menu keyboard focus is visible and unobscured in forced colors", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await scan(page, info, "mobile-menu");
  // Axe reads authored CSS colors rather than the UA's forced-color paint.
  // Scan the normal menu, then verify actual focus behavior in forced colors.
  await page.emulateMedia({ forcedColors: "active" });
  for (const name of ["Home", "Products", "AI Solutions", "Work & Credibility", "Company", "Contact CrimsonTide"]) {
    const link = page.getByRole("navigation", { name: "Primary mobile" }).getByRole("link", { name, exact: true });
    await expect(link).toBeFocused();
    await expect(link).toBeInViewport();
    expect(await link.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
    })).toBe(true);
    expect(await link.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
    await page.keyboard.press("Tab");
  }
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
});

test("Contact validation, sending and outcomes have accessible states", async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  await page.getByRole("button", { name: "Start Conversation" }).click();
  await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
  for (const field of await page.locator('[aria-invalid="true"]').all()) {
    const id = await field.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    await expect(page.locator(`[id="${id}"]`)).toBeVisible();
  }
  await scan(page, info, "validation");
  for (const outcome of ["success", "confirmation_failed", "submission_failed", "uncertain", "rejected", "invalid"]) {
    await page.reload();
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/api/contact", async route => { await gate; await route.fulfill({ json: { outcome } }); });
    await page.getByLabel("Name", { exact: true }).fill("Test Visitor");
    await page.getByLabel("Work email").fill("visitor@example.com");
    await page.getByLabel("Tell us a little more").fill("Please discuss an integration.");
    await page.getByRole("button", { name: "Start Conversation" }).click();
    await expect(page.getByRole("status")).toHaveText("Sending your enquiry…");
    await scan(page, info, `sending-${outcome}`);
    release();
    await expect(page.getByRole("status")).not.toHaveText("Sending your enquiry…");
    await scan(page, info, outcome);
    await page.unroute("**/api/contact");
  }
});

test("partner selection has keyboard alternatives and accessible pressed state", async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work");
  const buttons = page.locator("[data-partner-grid] button[data-logo]");
  await expect(buttons).toHaveCount(15);
  const first = buttons.first();
  await first.focus();
  await page.keyboard.press("Space");
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await scan(page, info, "partner-selected");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("#work-clients [role=status]")).toContainText("moved to position 3 of 15");
});
