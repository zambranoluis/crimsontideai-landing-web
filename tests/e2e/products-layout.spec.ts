import { expect, test, type Page } from "@playwright/test";

const products = ["openjm", "sentinel"] as const;

async function checkLayout(page: Page, label: string) {
  await page.evaluate(() => document.fonts.ready);
  for (const product of products) {
    const scene = page.getByTestId(`${product}-scene`);
    await page.locator(`#products-${product}`).evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - 88, behavior: "instant" }));
    const heading = page.locator(`#${product}-heading`);
    await expect(heading).toBeVisible();
    const reveal = heading.locator("..");
    await expect(reveal).toHaveCSS("opacity", "1");
    const geometry = await scene.evaluate(element => {
      const bounds = (target: Element) => {
        const { x, y, width, height } = target.getBoundingClientRect();
        return { x, y, width, height, right: x + width, bottom: y + height };
      };
      return {
        intro: bounds(element.children[0]), preview: bounds(element.children[1]), steps: bounds(element.children[2]),
        closing: bounds(element.nextElementSibling!),
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });
    const { intro, preview, steps, closing } = geometry;
    expect(geometry.overflow).toBeLessThanOrEqual(1);
    expect(steps.y).toBeGreaterThan(intro.bottom);
    expect(closing.y).toBeGreaterThan(steps.bottom);
    expect(closing.y).toBeGreaterThan(preview.bottom);
    if (page.viewportSize()!.width >= 1024) {
      expect(Math.abs(intro.x - steps.x)).toBeLessThan(1);
      expect(Math.abs(intro.y - preview.y)).toBeLessThan(1);
      expect(preview.width / intro.width).toBeCloseTo(1.5, 2);
      if (product === "openjm") expect(intro.right).toBeLessThan(preview.x);
      else expect(preview.right).toBeLessThan(intro.x);
    } else {
      expect(preview.y).toBeGreaterThan(intro.bottom);
      expect(steps.y).toBeGreaterThan(preview.bottom);
    }
    await page.screenshot({ path: `build/products-refinement/${label}-${product}.png` });
    // Capture the feature/exit region too, with all real copy resolved by Reveal.
    for (const step of await scene.locator("[data-feature-step]").all()) {
      await step.evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - innerHeight * .35, behavior: "instant" }));
      await expect(step.locator("p")).toBeVisible();
      await expect(step.locator("[data-reveal]")).toHaveCSS("opacity", "1");
    }
    const exit = page.locator(`#products-${product}`).getByRole("link", { name: /Explore/ });
    await exit.scrollIntoViewIfNeeded();
    await expect(exit).toBeInViewport();
    await page.screenshot({ path: `build/products-refinement/${label}-${product}-exit.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
}

test("product introductions and features share alternating columns with wider mocks", async ({ page }, info) => {
  await page.goto("/products");
  await checkLayout(page, info.project.name);
});

test("short desktop and reduced motion retain columns with static complete previews", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "Desktop fallback boundaries run once.");
  for (const mode of ["short", "reduced"] as const) {
    await page.setViewportSize({ width: 1440, height: mode === "short" ? 650 : 900 });
    await page.emulateMedia({ reducedMotion: mode === "reduced" ? "reduce" : "no-preference" });
    await page.goto("/products");
    for (const product of products) {
      await expect(page.getByTestId(`${product}-scene`)).toHaveAttribute("data-scene-enabled", "false");
      await expect(page.getByTestId(`${product}-preview`)).toHaveAttribute("data-active-step", "2");
      await expect(page.getByTestId(`${product}-preview`).locator("..")).toHaveCSS("position", "static");
    }
    await checkLayout(page, mode);
  }
});

test("without JavaScript, columns and mobile reading order keep both exits readable", async ({ browser }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "No-JS contexts run once.");
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport });
    const page = await context.newPage();
    await page.goto("/products");
    for (const product of products) {
      await expect(page.getByTestId(`${product}-scene`)).toHaveAttribute("data-scene-enabled", "false");
      await expect(page.locator(`[data-mesh-fallback="${product}"]`)).toBeVisible();
    }
    // No-JS content has no Reveal attributes; check the complete document directly.
    for (const product of products) {
      const scene = page.getByTestId(`${product}-scene`);
      await scene.scrollIntoViewIfNeeded();
      const layout = await scene.evaluate(element => Array.from(element.children).map(child => {
        const { x, y, width, bottom } = child.getBoundingClientRect(); return { x, y, width, bottom };
      }));
      const [intro, preview, steps] = layout;
      if (viewport.width >= 1024) {
        expect(intro.x).toBe(steps.x);
        expect(intro.y).toBe(preview.y);
        expect(product === "openjm" ? intro.x < preview.x : preview.x < intro.x).toBe(true);
      } else {
        expect(preview.y).toBeGreaterThan(intro.bottom);
        expect(steps.y).toBeGreaterThan(preview.bottom);
      }
      await page.locator(`#products-${product}`).screenshot({ path: `build/products-refinement/nojs-${viewport.width}-${product}.png` });
      await expect(scene.locator("li p")).toHaveCount(3);
      for (const paragraph of await scene.locator("li p").all()) await expect(paragraph).toBeVisible();
      const exit = page.locator(`#products-${product}`).getByRole("link", { name: /Explore/ });
      await exit.scrollIntoViewIfNeeded();
      await expect(exit).toBeInViewport();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await context.close();
  }
});

test("fragment history retains the existing native anchor destination", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "Sticky fragment history runs once.");
  for (const product of products) {
    await page.goto("/");
    await page.goto(`/products#products-${product}`);
    const scene = page.getByTestId(`${product}-scene`);
    await expect(scene).toHaveAttribute("data-scene-enabled", "true");
    await expect(page.locator(`#${product}-heading`)).toBeInViewport();
    await scene.locator('[data-feature-step="1"]').evaluate(element => {
      const rect = element.getBoundingClientRect();
      const header = document.querySelector("header")!.getBoundingClientRect().height;
      scrollTo({ top: scrollY + rect.top + rect.height / 2 - (header + (innerHeight - header) / 2) + 3, behavior: "instant" });
    });
    await expect(scene).toHaveAttribute("data-active-step", "1");
    await page.getByRole("link", { name: "Company", exact: true }).first().click();
    await expect(page).toHaveURL(/\/company$/);
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`/products#products-${product}$`));
    // Confirmed against the original HEAD: header client navigation returns to
    // the fragment itself. Non-fragment reading-position restoration has its
    // separate regression coverage in home-products-motion.spec.ts.
    await expect(page.locator(`#${product}-heading`)).toBeInViewport();
    await expect(scene).toHaveAttribute("data-active-step", "0");
  }
});
