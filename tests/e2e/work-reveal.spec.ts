import { test, expect } from "./fixtures";

for (const width of [1199, 1200]) {
  test(`sector reveal order at ${width}px replays and supports reduced motion`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop-chromium", "Fine-pointer breakpoint boundary runs once.");
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/work");
    const cards = page.locator("[data-sector-grid] > [data-reveal]");
    await expect(cards).toHaveCount(5);
    const expected = width === 1200 ? [0, 80, 160, 240, 320] : [0, 80, 160, 0, 80];
    expect(await cards.evaluateAll(elements => elements.map(element => parseFloat(getComputedStyle(element).transitionDelay) * 1000))).toEqual(expected);
    for (const direction of ["down", "up"]) {
      await page.evaluate(down => scrollTo({ top: down ? 0 : document.documentElement.scrollHeight, behavior: "instant" }), direction === "down");
      await expect(cards.first()).toHaveAttribute("data-reveal", "hidden");
      await page.locator("[data-sector-grid]").evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - 150, behavior: "instant" }));
      for (const card of await cards.all()) await expect(card).toHaveAttribute("data-reveal", "revealed");
      for (const card of await cards.all()) await expect(card).toHaveCSS("opacity", "1");
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const card of await cards.all()) {
      // The global reduced-motion floor retains a 0.01ms completion event.
      expect(await card.evaluate(element => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(.00001);
      await expect(card).toHaveCSS("transform", "none");
      await expect(card).toHaveCSS("opacity", "1");
    }
  });
}
