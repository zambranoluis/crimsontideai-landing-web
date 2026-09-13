import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { writeFile } from "node:fs/promises";

type Frame = { route: string | undefined; y: number; time: number };
type Recording = Window & { navigationFrames?: Frame[]; navigationFrame?: number };

async function record(page: Page) {
  await page.evaluate(() => {
    const state = window as Recording;
    state.navigationFrames = [];
    const sample = () => {
      const main = Array.from(document.querySelectorAll<HTMLElement>("main[data-navigation-route]"))
        .find(element => element.getClientRects().length);
      state.navigationFrames!.push({ route: main?.dataset.navigationRoute, y: scrollY, time: performance.now() });
      state.navigationFrame = requestAnimationFrame(sample);
    };
    sample();
  });
}

async function frames(page: Page, info: TestInfo, name: string) {
  const result = await page.evaluate(() => {
    const state = window as Recording;
    cancelAnimationFrame(state.navigationFrame!);
    return state.navigationFrames!;
  });
  const path = info.outputPath(name);
  await writeFile(path, JSON.stringify(result));
  await info.attach(name, { path, contentType: "application/json" });
  return result;
}

async function atDestination(page: Page, path: string, section?: string) {
  await expect(page).toHaveURL(new URL(path, "http://localhost:3001").href);
  const main = page.locator(`main[data-navigation-route="${path}"]:visible`);
  const heading = main.locator(section ? `#${section} :is(h1,h2,h3)` : "h1").first();
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport();
  await expect.poll(() => page.evaluate(id => id
    ? Math.abs(document.getElementById(id)!.getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop))
    : scrollY, section)).toBeLessThan(2);
  // Include settled frames, so a focus-induced second jump is observable.
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function footerStart(page: Page) {
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
  await expect(page.locator("footer")).toBeInViewport();
  return page.evaluate(() => scrollY);
}

for (const label of ["Products", "Solutions", "Work", "Company", "Contact"]) {
  test(`footer ${label} heading starts at top across routes and on its own route`, async ({ page }, info) => {
    await page.goto("/");
    const path = `/${label.toLowerCase()}`;
    for (const samePage of [false, true]) {
      const link = page.locator("footer h2").getByRole("link", { name: label, exact: true });
      await expect(link).toHaveAttribute("href", path);
      await link.scrollIntoViewIfNeeded();
      // A real keyboard activation also verifies the new heading focus state.
      await link.focus();
      expect(await link.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe("none");
      const start = await page.evaluate(() => scrollY);
      await record(page);
      if (samePage) await page.keyboard.press("Enter");
      else await link.click();
      await atDestination(page, path);
      const samples = await frames(page, info, samePage ? "same-route.json" : "cross-route.json");
      if (samePage) {
        expect(samples.every(frame => Math.abs(frame.y - start) < 2 || frame.y < 2)).toBe(true);
      } else {
        const destination = samples.filter(frame => frame.route === path);
        expect(destination.length).toBeGreaterThan(0);
        expect(destination.every(frame => frame.y < 2)).toBe(true);
        expect(samples.filter(frame => frame.route === "/").every(frame => Math.abs(frame.y - start) < 2)).toBe(true);
      }
    }
    await expect(page.locator("footer h2").getByRole("link", { name: "Legal & Support" })).toHaveCount(0);
  });
}

for (const [path, section] of [["/products", "products-sentinel"], ["/solutions", "solutions-context"]]) {
  for (const cached of [false, true]) {
    test(`${path} section paints top then scrolls down (${cached ? "cached" : "slow"})`, async ({ page }, info) => {
      await page.goto(cached ? path : "/work");
      if (cached) {
        await footerStart(page);
        await page.locator('footer h2 a[href="/work"]').evaluate((link: HTMLAnchorElement) => link.click());
        await atDestination(page, "/work");
      } else {
        await page.route(`**${path}?*`, async route => {
          await new Promise(resolve => setTimeout(resolve, 450));
          await route.continue();
        });
      }
      const start = await footerStart(page);
      await record(page);
      await page.locator(`footer a[href="${path}#${section}"]`).evaluate((link: HTMLAnchorElement) => link.click());
      await atDestination(page, path, section);
      const samples = await frames(page, info, "section-frames.json");
      const destination = samples.filter(frame => frame.route === path);
      expect(destination[0].y).toBeLessThan(2);
      const final = destination.at(-1)!.y;
      expect(destination.some(frame => frame.y > 2 && frame.y < final - 2)).toBe(true);
      expect(destination.every((frame, index) => index === 0 || frame.y >= destination[index - 1].y - 1)).toBe(true);
      expect(samples.filter(frame => frame.route === "/work").every(frame => Math.abs(frame.y - start) < 2)).toBe(true);
    });
  }
}

test("same-page sections scroll from the current position without a top reset", async ({ page }, info) => {
  await page.goto("/solutions");
  for (let attempt = 0; attempt < 2; attempt++) {
    const start = await footerStart(page);
    await record(page);
    await page.locator('footer a[href="/solutions#solutions-context"]').evaluate((link: HTMLAnchorElement) => link.click());
    await atDestination(page, "/solutions", "solutions-context");
    const samples = await frames(page, info, `same-section-${attempt}.json`);
    const final = samples.at(-1)!.y;
    expect(final).toBeLessThan(start);
    expect(samples.every(frame => frame.y >= final - 1)).toBe(true);
    expect(samples.some(frame => frame.y < start - 2 && frame.y > final + 2)).toBe(true);
  }
});

test("reduced motion still paints top before instantly positioning a cross-route section", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work");
  await footerStart(page);
  await record(page);
  await page.locator('footer a[href="/products#products-sentinel"]').evaluate((link: HTMLAnchorElement) => link.click());
  await atDestination(page, "/products", "products-sentinel");
  const destination = (await frames(page, info, "reduced-frames.json")).filter(frame => frame.route === "/products");
  expect(destination[0].y).toBeLessThan(2);
  expect(destination.every(frame => frame.y < 2 || Math.abs(frame.y - destination.at(-1)!.y) < 2)).toBe(true);
});

for (const input of ["wheel", "keyboard", "touch"] as const) {
  test(`${input} input interrupts automatic section scrolling`, async ({ page }) => {
    await page.goto("/work");
    await footerStart(page);
    await page.locator('footer a[href="/products#products-sentinel"]').evaluate((link: HTMLAnchorElement) => link.click());
    await expect(page).toHaveURL(/\/products$/);
    await page.waitForFunction(() => scrollY > 40 && scrollY < document.getElementById("products-sentinel")!.offsetTop - 300);
    if (input === "wheel") await page.mouse.wheel(0, -100);
    else if (input === "keyboard") await page.keyboard.press("ArrowUp");
    else await page.evaluate(() => window.dispatchEvent(new Event("touchmove")));
    await page.waitForTimeout(250);
    const stopped = await page.evaluate(() => scrollY);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => scrollY)).toBeCloseTo(stopped, 0);
    expect(await page.locator("#products-sentinel").evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThan(200);
  });
}

test("footer heading links retain no-JavaScript navigation", async ({ browser }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: info.project.use.viewport });
  const page = await context.newPage();
  await page.goto("http://localhost:3001/");
  for (const path of ["/products", "/solutions", "/work", "/company", "/contact"]) {
    await page.locator(`footer h2 a[href="${path}"]`).click();
    await expect(page).toHaveURL(new URL(path, "http://localhost:3001").href);
    await expect(page.locator("main h1")).toBeInViewport();
    expect(await page.evaluate(() => scrollY)).toBe(0);
  }
  await context.close();
});
for (const [path, section] of [["/products", "products-sentinel"], ["/solutions", "solutions-context"]]) {
  test(`${path} waits for fonts and two stable geometry frames`, async ({ page }, info) => {
    await page.goto("/work");
    await page.evaluate(() => {
      const state = window as Window & { releaseNavigationFonts?: () => void };
      const ready = new Promise<void>(resolve => { state.releaseNavigationFonts = resolve; });
      Object.defineProperty(document.fonts, "ready", { configurable: true, get: () => ready });
    });
    await footerStart(page);
    await record(page);
    await page.locator(`footer a[href="${path}#${section}"]`).evaluate((link: HTMLAnchorElement) => link.click());
    await expect(page.locator(`main[data-navigation-route="${path}"]:visible`)).toBeVisible();
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    const duringResize = await page.evaluate(async pathname => {
      const firstSection = document.querySelector<HTMLElement>(`main[data-navigation-route="${pathname}"] > section`)!;
      const initialHeight = firstSection.getBoundingClientRect().height;
      const state = window as Window & { releaseNavigationFonts?: () => void };
      state.releaseNavigationFonts!();
      const positions: number[] = [];
      // Simulate a section above the anchor gaining height over several paints.
      for (let index = 1; index <= 6; index++) {
        await new Promise<void>(resolve => requestAnimationFrame(() => {
          firstSection.style.minHeight = `${initialHeight + index * 160}px`;
          positions.push(scrollY);
          resolve();
        }));
      }
      return positions;
    }, path);
    expect(duringResize.every(y => y === 0)).toBe(true);
    await atDestination(page, path, section);
    await frames(page, info, "font-and-geometry-frames.json");
  });
}

test("Back interrupts a running section scroll and restores the departing position", async ({ page }) => {
  await page.goto("/work");
  const start = await footerStart(page);
  await page.locator('footer a[href="/products#products-sentinel"]').evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page).toHaveURL(/\/products$/);
  await page.waitForFunction(() => scrollY > 40 && scrollY < document.getElementById("products-sentinel")!.offsetTop - 300);
  await page.goBack();
  await expect(page).toHaveURL(/\/work$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(start, 0);
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(start, 0);
});

test("a newer route cancels a section request waiting for fonts", async ({ page }) => {
  await page.goto("/work");
  await page.evaluate(() => {
    const state = window as Window & { releaseNavigationFonts?: () => void };
    const ready = new Promise<void>(resolve => { state.releaseNavigationFonts = resolve; });
    Object.defineProperty(document.fonts, "ready", { configurable: true, get: () => ready });
  });
  await footerStart(page);
  await page.locator('footer a[href="/products#products-sentinel"]').evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page.locator('main[data-navigation-route="/products"]:visible')).toBeVisible();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.locator('footer h2 a[href="/contact"]').evaluate((link: HTMLAnchorElement) => link.click());
  await atDestination(page, "/contact");
  await page.evaluate(() => (window as Window & { releaseNavigationFonts?: () => void }).releaseNavigationFonts!());
  await page.waitForTimeout(600);
  await atDestination(page, "/contact");
});
