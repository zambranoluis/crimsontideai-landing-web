import { expect, test, type Locator, type Page } from "@playwright/test";

const cards = (page: Page) => page.locator("#home-build article");

async function enter(card: Locator) {
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute("data-motion", "running");
  await expect(card.locator("xpath=../..")).toHaveCSS("opacity", "1");
}

async function ambientTime(card: Locator) {
  return card.evaluate(element => {
    const animation = element.getAnimations({ subtree: true }).find(a => a instanceof CSSAnimation && a.animationName.includes("ambientShimmer"));
    return Number(animation?.currentTime);
  });
}

test("ambient passes alternate, pause individually and suspend with the document", async ({ page }) => {
  await page.goto("/");
  const first = cards(page).first();
  const second = cards(page).nth(1);
  await enter(first);
  const timing = await cards(page).evaluateAll(elements => elements.map(element => {
    const style = getComputedStyle(element.querySelector("span")!, "::before");
    return [style.animationDuration, style.animationDelay];
  }));
  expect(timing).toEqual([["10s", "0s"], ["10s", "5s"]]);
  const start = await ambientTime(first);
  await expect.poll(() => ambientTime(first)).toBeGreaterThan(start + 100);

  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(first).toHaveAttribute("data-motion", "paused");
  await page.waitForTimeout(80);
  const hidden = await ambientTime(first);
  await page.waitForTimeout(150);
  expect(await ambientTime(first)).toBe(hidden);
  await page.evaluate(() => {
    delete (document as unknown as { hidden?: boolean }).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(first).toHaveAttribute("data-motion", "running");
  await expect.poll(() => ambientTime(first)).toBeGreaterThan(hidden);

  await page.locator("footer").scrollIntoViewIfNeeded();
  for (const card of [first, second]) await expect(card).toHaveAttribute("data-motion", "paused");
  await page.waitForTimeout(80);
  const offscreen = await ambientTime(first);
  await page.waitForTimeout(150);
  expect(await ambientTime(first)).toBe(offscreen);
  await enter(first);
  await expect.poll(() => ambientTime(first)).toBeGreaterThan(offscreen);

  // Seek only after lifecycle checks: WAAPI play/pause overrides CSS playback.
  const samples = await first.evaluate(element => {
    const animation = element.getAnimations({ subtree: true }).find(a => a instanceof CSSAnimation && a.animationName.includes("ambientShimmer"))!;
    animation.pause();
    const shimmer = element.querySelector("span")!;
    return [200, 800, 5000, 10000].map(time => {
      animation.currentTime = time;
      return Number(getComputedStyle(shimmer, "::before").opacity);
    });
  });
  expect(samples[0]).toBeGreaterThan(0);
  expect(samples.slice(1)).toEqual([0, 0, 0]);
});

test("hover and keyboard focus give one pass without ambient overlap or clipped focus", async ({ page }) => {
  await page.goto("/");
  test.skip(!await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches), "Fine pointer interaction only");
  const card = cards(page).first();
  await enter(card);
  for (let entry = 0; entry < 3; entry++) {
    await card.hover();
    await expect(card).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -2)");
    const state = await card.evaluate(element => {
      const shimmer = element.querySelector("span")!;
      return {
        ambient: getComputedStyle(shimmer, "::before").animationPlayState,
        hidden: getComputedStyle(shimmer, "::before").visibility,
        interaction: getComputedStyle(shimmer, "::after").animationIterationCount,
      };
    });
    expect(state).toEqual({ ambient: "paused", hidden: "hidden", interaction: "1" });
    if (entry === 0) {
      await page.waitForTimeout(850);
      expect(await card.evaluate(e => getComputedStyle(e.querySelector("span")!, "::after").opacity)).toBe("0");
    }
    await page.mouse.move(0, 0);
    await expect(card).toHaveCSS("transform", "none");
  }
  // Tab into the existing link; the wrapper introduces no tab stop.
  await page.keyboard.press("Tab");
  await card.locator("a").focus();
  await expect(card.locator("a")).toBeFocused();
  await expect(card.locator("a")).toHaveCSS("outline-width", "3px");
  await expect(card).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -2)");
  const focus = await card.evaluate(element => {
    const link = element.querySelector("a")!;
    const a = link.getBoundingClientRect(), b = element.getBoundingClientRect();
    return { room: Math.min(a.left - b.left, b.right - a.right, a.top - b.top, b.bottom - a.bottom), overflow: getComputedStyle(element).overflow };
  });
  expect(focus.room).toBeGreaterThanOrEqual(8);
  expect(focus.overflow).toBe("visible");
  await page.keyboard.press("Tab");
  await expect(cards(page).nth(1).locator("a")).toBeFocused();
});

test("solution icons stay centered and informational, with distinct bounded hover motion", async ({ page }) => {
  await page.goto("/");
  // Locate the rows through their existing decorative assets, without new semantics.
  const icons = page.locator('#home-build img[class*="offeringIcon"]');
  await expect(icons).toHaveCount(4);
  const fine = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  const names: string[] = [];
  for (const icon of await icons.all()) {
    const row = icon.locator("..");
    await row.scrollIntoViewIfNeeded();
    const geometry = await icon.evaluate(element => {
      const icon = element.getBoundingClientRect(), text = element.nextElementSibling!.getBoundingClientRect();
      return { delta: Math.abs(icon.top + icon.height / 2 - text.top - text.height / 2), focusable: element.parentElement!.querySelectorAll("a, button, [tabindex]").length };
    });
    expect(geometry.delta).toBeLessThanOrEqual(1);
    expect(geometry.focusable).toBe(0);
    if (fine) {
      await row.hover();
      const motion = await icon.evaluate(element => {
        const animation = element.getAnimations()[0] as CSSAnimation;
        animation.pause();
        animation.currentTime = 189;
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return { name: animation.animationName, x: matrix.m41, y: matrix.m42, scale: Math.hypot(matrix.m11, matrix.m12), angle: Math.atan2(matrix.m12, matrix.m11) * 180 / Math.PI };
      });
      expect(Math.abs(motion.x)).toBeLessThanOrEqual(3);
      expect(Math.abs(motion.y)).toBeLessThanOrEqual(3);
      expect(motion.scale).toBeLessThanOrEqual(1.05001);
      expect(Math.abs(motion.angle)).toBeLessThanOrEqual(4.001);
      names.push(motion.name);
      await page.mouse.move(0, 0);
      await expect(icon).toHaveCSS("transform", "none");
    } else {
      await row.tap();
      await expect(icon).toHaveCSS("animation-name", "none");
    }
  }
  if (fine) expect(new Set(names).size).toBe(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

test("reduced motion removes spatial effects and preserves static feedback", async ({ page }) => {
  await page.goto("/");
  const card = cards(page).first();
  await enter(card);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(card).toHaveAttribute("data-motion", "paused");
  await card.locator("a").focus();
  await expect(card).toHaveCSS("transform", "none");
  await expect(card).toHaveCSS("border-top-color", "rgb(239, 51, 64)");
  expect(await card.evaluate(e => e.getAnimations({ subtree: true }).filter(a => a instanceof CSSAnimation).length)).toBe(0);
  const icon = page.locator('#home-build img[class*="offeringIcon"]').first();
  await icon.hover();
  await expect(icon).toHaveCSS("transform", "none");
  await expect(icon).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await enter(card);
});

test("without JavaScript the section stays readable and its destinations work", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  const page = await context.newPage();
  await page.goto("/");
  for (const card of await cards(page).all()) {
    await expect(card.locator("p")).toBeVisible();
    expect(await card.getAttribute("data-motion")).toBeNull();
    expect(await card.evaluate(e => getComputedStyle(e.querySelector("span")!, "::before").animationName)).toBe("none");
  }
  await expect(page.locator('#home-build a[href="/products#products-openjm"]')).toBeVisible();
  await expect(page.locator('#home-build a[href="/products#products-sentinel"]')).toBeVisible();
  await page.locator('#home-build a[href="/solutions"]').click();
  await expect(page).toHaveURL(/\/solutions$/);
  await context.close();
});

test("route unmount disconnects each card observer and removes its lifecycle listeners", async ({ page }) => {
  await page.addInitScript(() => {
    const audit = { observed: 0, disconnected: 0, removedVisibility: 0, removedMotion: 0 };
    Object.assign(window, { cardLifecycleAudit: audit });
    const NativeObserver = window.IntersectionObserver;
    window.IntersectionObserver = class extends NativeObserver {
      card = false;
      observe(target: Element) {
        if (target.matches('#home-build article')) { this.card = true; audit.observed++; }
        super.observe(target);
      }
      disconnect() { if (this.card) audit.disconnected++; super.disconnect(); }
    };
    const remove = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.removeEventListener = function(type, listener, options) {
      if (this === document && type === "visibilitychange") audit.removedVisibility++;
      if (this instanceof MediaQueryList && this.media === "(prefers-reduced-motion: reduce)" && type === "change") audit.removedMotion++;
      return remove.call(this, type, listener, options);
    };
  });
  await page.goto("/");
  await enter(cards(page).first());
  const audit = () => page.evaluate(() => (window as unknown as { cardLifecycleAudit: { observed: number; disconnected: number; removedVisibility: number; removedMotion: number } }).cardLifecycleAudit);
  const before = await audit();
  await page.locator('#home-build a[href="/solutions"]').click();
  await expect(page).toHaveURL(/\/solutions$/);
  await expect(cards(page)).toHaveCount(0);
  const after = await audit();
  expect(after.observed - after.disconnected).toBe(0);
  expect(after.disconnected - before.disconnected).toBe(2);
  expect(after.removedVisibility - before.removedVisibility).toBeGreaterThanOrEqual(2);
  expect(after.removedMotion - before.removedMotion).toBeGreaterThanOrEqual(2);
});
