import { test, expect } from "./fixtures";
import { routes, readRoute } from "./route-contracts";

for (const route of routes) {
  for (const mode of ["normal", "reduced", "no-js"] as const) {
    test(`${route.path} route health ${mode}`, async ({ page, browser }, info) => {
      test.skip(mode === "reduced" && !info.project.name.startsWith("desktop"), "Reduced-motion route matrix is desktop; mounted preferences have route owners.");
      test.skip(mode === "no-js" && !info.project.name.startsWith("mobile"), "No-JavaScript route matrix is mobile.");
      const fallback = mode === "no-js" ? await browser.newContext({ javaScriptEnabled: false }) : undefined;
      const target = fallback ? await fallback.newPage() : page;
      try {
        if (mode === "reduced") await target.emulateMedia({ reducedMotion: "reduce" });
        const response = await target.goto(route.path);
        expect(response?.status()).toBe(200);
        await expect(target.locator("h1")).toHaveCount(1);
        await expect(target.locator("h1")).toBeVisible();
        await expect(target).toHaveTitle(route.title);
        await expect(target.locator('meta[name="description"]')).toHaveAttribute("content", route.description);
        await expect(target.locator("html")).toHaveAttribute("lang", "en");
        const headings = await target.locator("main > section").evaluateAll(sections => sections.map(section => section.querySelector("h1,h2")?.textContent?.replace(/\s+/g, " ").trim()));
        expect(headings).toHaveLength(route.sections.length);
        headings.forEach((heading, index) => expect(heading).toContain(route.sections[index]));
        await readRoute(target, mode !== "no-js");
        expect(await target.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
        const hrefs = await target.locator('a[href^="/"]').evaluateAll(links => links.map(link => link.getAttribute("href")!));
        for (const href of hrefs) {
          const destination = new URL(href, "https://site.invalid");
          expect(routes.map(item => item.path)).toContain(destination.pathname);
          if (destination.pathname === route.path && destination.hash) await expect(target.locator(`[id="${destination.hash.slice(1)}"]`)).toHaveCount(1);
        }
        await expect(target.locator("footer")).toBeVisible();
      } finally { await fallback?.close(); }
    });
  }
}

test("unknown routes return 404 with a usable document", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});
