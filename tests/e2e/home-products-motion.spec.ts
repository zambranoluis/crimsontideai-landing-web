import { expect, test, type Locator, type Page } from "@playwright/test";

async function jump(page: Page, top: number) {
  await page.evaluate(top => scrollTo({ top, behavior: "instant" }), top);
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function alignStep(step: Locator, offset = 3) {
  await step.evaluate((element, offset) => {
    const rect = element.getBoundingClientRect();
    const header = document.querySelector("header")!.getBoundingClientRect().height;
    scrollTo({ top: scrollY + rect.top + rect.height / 2 - (header + (innerHeight - header) / 2) + offset, behavior: "instant" });
  }, offset);
}

async function eligible(page: Page) {
  return page.evaluate(() => matchMedia("(min-width: 1024px) and (min-height: 700px) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches);
}

async function untransformedDocumentBounds(locator: Locator) {
  return locator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const transform = getComputedStyle(element).transform;
    const displacement = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
    return { top: scrollY + rect.top - displacement, bottom: scrollY + rect.bottom - displacement };
  });
}

async function replayTarget(page: Page) {
  const reveals = page.locator("[data-reveal]");
  await expect(reveals.first()).toBeAttached();
  const index = await reveals.evaluateAll(elements => {
    const maximumScroll = document.documentElement.scrollHeight - innerHeight;
    return elements.findIndex(element => {
      const rect = element.getBoundingClientRect();
      const transform = getComputedStyle(element).transform;
      const displacement = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
      const top = scrollY + rect.top - displacement;
      const bottom = scrollY + rect.bottom - displacement;
      return top > innerHeight + 16 && bottom < maximumScroll - 16;
    });
  });
  expect(index, "route needs a reveal group with room to exit in both directions").toBeGreaterThanOrEqual(0);
  return reveals.nth(index);
}

test("reveal content already in the initial viewport is immediately readable", async ({ page }) => {
  await page.goto("/solutions");
  const hero = page.locator("[data-reveal]").first();
  await expect(hero).toHaveAttribute("data-reveal", "revealed");
  await expect(hero).toHaveCSS("opacity", "1");
  expect(await hero.evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(page.viewportSize()!.height);
});

test("entrance uses both layout thresholds, resets offscreen, and replays in either direction", async ({ page }) => {
  await page.goto("/");
  const reveal = await replayTarget(page);
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
  const bounds = await untransformedDocumentBounds(reveal);
  const height = page.viewportSize()!.height;
  await jump(page, bounds.top - height * .78 - 4);
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
  await expect(reveal).toHaveCSS("opacity", "0");
  expect(await reveal.evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42)).toBe(20);
  await jump(page, bounds.top - height * .78 + 4);
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");
  await expect(reveal).toHaveCSS("opacity", "1");
  expect(await reveal.evaluate(element => getComputedStyle(element).transform)).toBe("none");
  await expect(reveal).toHaveCSS("transition-duration", "0.65s, 0.65s");

  // Small direction changes while the group is on screen do not restart it.
  await jump(page, bounds.top - height * .78 - 4);
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");
  await jump(page, bounds.top - height * .78 + 4);
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");

  await reveal.evaluate(element => {
    element.setAttribute("data-exit-transitions", "0");
    element.addEventListener("transitionstart", () => {
      if (element.getAttribute("data-reveal") === "hidden") {
        element.setAttribute("data-exit-transitions", String(Number(element.getAttribute("data-exit-transitions")) + 1));
      }
    });
  });
  await jump(page, bounds.bottom + 4);
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
  await expect(reveal).toHaveAttribute("data-exit-transitions", "0");

  await jump(page, bounds.bottom - height * .22 + 4);
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
  await jump(page, bounds.bottom - height * .22 - 4);
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");
  await expect(reveal).toHaveCSS("opacity", "1");

  await jump(page, bounds.top - height - 4);
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
  await jump(page, bounds.top - height * .78 + 4);
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");
});

for (const product of ["openjm", "sentinel"]) {
  test(`${product} steps advance at the usable midpoint and sticky releases before the CTA`, async ({ page }) => {
    await page.goto("/products");
    test.skip(!await eligible(page), "Normal flow is tested separately on ineligible viewports.");
    const scene = page.getByTestId(`${product}-scene`);
    const preview = page.getByTestId(`${product}-preview`);
    await expect(scene).toHaveAttribute("data-scene-enabled", "true");
    for (let index = 0; index < 3; index++) {
      if (index) {
        await alignStep(scene.locator("[data-feature-step]").nth(index), -4);
        await expect(scene).toHaveAttribute("data-active-step", String(index - 1));
      }
      await alignStep(scene.locator("[data-feature-step]").nth(index));
      await expect(scene).toHaveAttribute("data-active-step", String(index));
      await expect(preview).toHaveAttribute("data-active-step", String(index));
      await expect(preview).toHaveAttribute("data-motion", "running");
      await expect(preview.locator("[data-scene-focus]")).toHaveCount(0);
      // Each mock advances with time at every reading step, without another scroll.
      const frame = () => product === "sentinel"
        ? page.getByTestId("sentinel-scan").getAttribute("transform")
        : page.getByTestId("openjm-particles").locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
      const before = await frame();
      await expect.poll(frame).not.toBe(before);
      const bounds = await preview.boundingBox();
      const header = await page.locator("header").boundingBox();
      expect(bounds!.y).toBeGreaterThanOrEqual(header!.height + 23);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
      if (index > 0) expect(Math.abs(bounds!.y - header!.height - 24)).toBeLessThan(2);
      await expect(scene.locator("[data-feature-step]").nth(index).locator("p")).toHaveCSS("font-size", "16px");
    }
    const section = page.locator(`#products-${product}`);
    const exit = section.getByRole("link", { name: `Explore ${product === "openjm" ? "OpenJM" : "Sentinel"}`, exact: true });
    await exit.evaluate(e => scrollTo({ top: scrollY + e.getBoundingClientRect().top - document.querySelector("header")!.getBoundingClientRect().height - 100, behavior: "instant" }));
    await expect(exit).toBeInViewport();
    const geometry = await scene.evaluate(element => {
      const preview = element.querySelector<HTMLElement>("[data-scene-controlled]")!.getBoundingClientRect();
      const scene = element.getBoundingClientRect();
      return { previewBottom: preview.bottom, sceneBottom: scene.bottom, previewTop: preview.top, header: document.querySelector("header")!.getBoundingClientRect().height };
    });
    expect(geometry.previewBottom).toBeLessThanOrEqual(geometry.sceneBottom + 1);
    expect(geometry.previewTop).toBeLessThan(geometry.header + 24);
    await expect(scene).toHaveAttribute("data-active-step", "2");
    await expect(exit).toHaveAttribute("target", "_blank");
    await expect(exit).toHaveAttribute("rel", "noopener noreferrer");
    // Reverse reading moves the scene and its current reading step backward.
    await alignStep(scene.locator("[data-feature-step]").nth(1));
    await expect(scene).toHaveAttribute("data-active-step", "1");
    await expect(scene.locator('[data-feature-step="1"] [data-reveal]')).toHaveAttribute("data-reveal", "revealed");
    await alignStep(scene.locator("[data-feature-step]").nth(0));
    await expect(scene).toHaveAttribute("data-active-step", "0");
    await expect(preview).toHaveAttribute("data-active-step", "0");
  });
}

test("fast scrolling completes scenes and browser history restores their state", async ({ page }) => {
  await page.goto("/products");
  test.skip(!await eligible(page), "Sticky history requires an eligible viewport.");
  // Hydration enables taller sticky scenes. Measure the destination only after
  // that layout exists; the SSR document height lands midway through Sentinel.
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByTestId("sentinel-scene")).toHaveAttribute("data-scene-enabled", "true");
  await jump(page, await page.evaluate(() => document.body.scrollHeight));
  for (const product of ["openjm", "sentinel"]) {
    await expect(page.getByTestId(`${product}-scene`)).toHaveAttribute("data-active-step", "2");
  }
  const scene = page.getByTestId("sentinel-scene");
  await alignStep(scene.locator('[data-feature-step="1"]'));
  await expect(scene).toHaveAttribute("data-active-step", "1");
  const saved = await page.evaluate(() => scrollY);
  await page.goto("/company");
  await page.goBack();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByTestId("sentinel-scene")).toHaveAttribute("data-active-step", "1");
  await expect.poll(() => page.locator("body").evaluate((_, saved) => Math.abs(scrollY - saved), saved)).toBeLessThan(4);
  await expect(page.getByTestId("sentinel-scene").locator('[data-feature-step="1"] [data-reveal]')).toHaveAttribute("data-reveal", "revealed");
  await page.goForward();
  await expect(page).toHaveURL(/\/company$/);
  await expect(page.locator("h1")).toBeVisible();
});

test("mounted resizing and reduced-motion changes switch to complete normal flow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "A single mounted desktop context crosses the boundaries.");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products");
  const scene = page.getByTestId("openjm-scene");
  await alignStep(scene.locator('[data-feature-step="1"]'));
  for (const size of [{ width: 1023, height: 900 }, { width: 1440, height: 699 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    await expect(scene).toHaveAttribute("data-scene-enabled", "false");
    await expect(scene).toHaveAttribute("data-active-step", "2");
    await expect(scene.locator("[data-feature-step]")).toHaveCount(3);
    await expect(scene.locator('[data-feature-step="0"]')).toHaveCSS("min-height", "auto");
    await expect(page.getByTestId("openjm-preview").locator("..")).toHaveCSS("position", "static");
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(scene).toHaveAttribute("data-scene-enabled", "true");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene).toHaveAttribute("data-scene-enabled", "false");
  await expect(scene).toHaveAttribute("data-active-step", "2");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(scene).toHaveAttribute("data-scene-enabled", "true");
});

test("hero motion is bounded and warehouse animation runs only while in view", async ({ page }) => {
  await page.goto("/");
  const art = page.getByTestId("hero-artwork");
  await expect.poll(() => art.evaluate(e => e.style.getPropertyValue("--hero-scale"))).toBe("1");
  await jump(page, page.viewportSize()!.height * .7);
  await expect.poll(() => art.evaluate(e => Number(e.style.getPropertyValue("--hero-scale")))) .toBeCloseTo(1.08, 3);
  await expect.poll(() => art.evaluate(e => Number.parseFloat(e.style.getPropertyValue("--hero-y")))) .toBeCloseTo(-40, 2);
  const media = page.getByTestId("warehouse-media");
  const video = media.locator("video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await media.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(.1);
  expect(await video.evaluate((v: HTMLVideoElement) => ({ muted: v.muted, loop: v.loop, inline: v.playsInline, controls: v.controls })))
    .toEqual({ muted: true, loop: true, inline: true, controls: false });
  await expect(media.getByRole("button")).toHaveCount(0);
  const size = await video.boundingBox();
  expect(size!.width / size!.height).toBeCloseTo(2 / 3, 2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await jump(page, 0);
  await expect.poll(() => art.evaluate(e => e.style.getPropertyValue("--hero-scale"))).toBe("1");
  await expect.poll(() => art.evaluate(e => e.style.getPropertyValue("--hero-y"))).toBe("0px");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await media.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test("warehouse poster supports reduced motion and unavailable video", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const media = page.getByTestId("warehouse-media");
  const video = media.locator("video");
  await media.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", true);
  await expect(video).toHaveJSProperty("currentTime", 0);
  const poster = await video.getAttribute("poster");
  expect((await page.request.get(poster!)).ok()).toBe(true);
  await page.route("**/warehouse.mp4", route => route.abort());
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(media.getByRole("status")).toHaveText("Animation unavailable");
  await expect(page.getByRole("link", { name: "View case study", exact: true })).toHaveAttribute("href", "/work#work-cases");
});

test("keyboard focus reveals immediately, survives blur in view, and resets after exit", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: "Explore Solutions", exact: true });
  const reveal = link.locator("..");
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
  const bounds = await untransformedDocumentBounds(reveal);
  const height = page.viewportSize()!.height;
  await jump(page, bounds.top - height * .9);
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
  await link.evaluate((element: HTMLElement) => element.focus({ preventScroll: true }));
  await expect(link).toBeFocused();
  await expect(reveal).toHaveCSS("opacity", "1");
  await expect(reveal).toHaveCSS("transition-duration", "0s");
  await link.evaluate((element: HTMLElement) => element.blur());
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");
  await jump(page, bounds.bottom + 4);
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
});

test("a reveal taller than the viewport remains visible until its complete exit", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Geometry mutation is covered once.");
  await page.goto("/");
  const reveal = await replayTarget(page);
  await reveal.evaluate((element: HTMLElement) => { element.style.minHeight = "120vh"; });
  const bounds = await untransformedDocumentBounds(reveal);
  const height = page.viewportSize()!.height;
  await jump(page, bounds.top - height * .78 + 8);
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");
  await jump(page, bounds.bottom - height / 2);
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");
  await jump(page, bounds.bottom + 8);
  await expect(reveal).toHaveAttribute("data-reveal", "hidden");
});

test("mounted resize and motion preference changes never hide visible reading content", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Mounted preference transition is covered once.");
  await page.goto("/");
  const reveal = await replayTarget(page);
  const bounds = await untransformedDocumentBounds(reveal);
  const height = page.viewportSize()!.height;
  await jump(page, bounds.top - height * .78 + 8);
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");
  await page.setViewportSize({ width: 1180, height: 760 });
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(reveal).toHaveCSS("opacity", "1");
  expect(await reveal.evaluate(element => Number.parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThan(.001);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(reveal).toHaveAttribute("data-reveal", "revealed");
  await expect(reveal).toHaveCSS("opacity", "1");
});

test("all routes retain readable entrances with reduced motion and without JavaScript", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: testInfo.project.use.viewport, reducedMotion: "reduce" });
  const noJS = await browser.newContext({ viewport: testInfo.project.use.viewport, javaScriptEnabled: false });
  for (const ctx of [context, noJS]) {
    const page = await ctx.newPage();
    for (const route of ["/", "/products", "/solutions", "/work", "/company", "/contact"]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator('[data-reveal="hidden"]')).toHaveCount(0);
      const hidden = await page.locator("main p, main h2, main h3, main a").evaluateAll(elements => elements.filter(element => {
        for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
          const style = getComputedStyle(ancestor);
          if (style.opacity === "0" || style.visibility === "hidden") return true;
        }
        return false;
      }).length);
      expect(hidden).toBe(0);
      if (route === "/products") {
        for (const product of ["openjm", "sentinel"]) {
          const scene = page.getByTestId(`${product}-scene`);
          await expect(scene).toHaveAttribute("data-scene-enabled", "false");
          const preview = await page.getByTestId(`${product}-preview`).boundingBox();
          const step = await scene.locator('[data-feature-step="0"]').boundingBox();
          expect(preview!.y + preview!.height).toBeLessThan(step!.y);
        }
      }
    }
    await ctx.close();
  }
});

for (const [width, height] of [[1440, 900], [1366, 768], [1280, 800], [1024, 768], [768, 1024], [390, 844], [360, 740]]) {
  test(`layout and direct anchors at ${width}x${height}`, async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Explicit matrix uses independent contexts.");
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1024, isMobile: width < 768 });
    const page = await context.newPage();
    await page.goto("/");
    if (width === 1366) await expect(page.getByRole("link", { name: "Explore what we build" })).toBeInViewport({ ratio: 1 });
    for (const product of ["openjm", "sentinel"]) {
      await page.goto("/");
      await page.goto(`/products#products-${product}`);
      const scene = page.getByTestId(`${product}-scene`);
      await expect(scene).toHaveAttribute("data-scene-enabled", String(width >= 1024));
      const heading = page.locator(`#${product}-heading`);
      await expect(heading).toBeInViewport();
      await expect(heading.locator("..")).toHaveAttribute("data-reveal", "revealed");
      expect((await heading.boundingBox())!.y).toBeGreaterThan((await page.locator("header").boundingBox())!.height);
      await expect(scene.locator("[data-feature-step] p").first()).toHaveCSS("font-size", "16px");
      if (width < 1024) {
        const gap = await scene.evaluate(e => e.querySelector('[data-feature-step="0"]')!.getBoundingClientRect().top - e.querySelector('[data-scene-controlled]')!.getBoundingClientRect().bottom);
        expect(gap).toBeGreaterThanOrEqual(39);
      }
    }
    await jump(page, await page.evaluate(() => document.body.scrollHeight));
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await context.close();
  });
}


test("normal motion replays down, up, and down across every route", async ({ page }) => {
  for (const route of ["/", "/products", "/solutions", "/work", "/company", "/contact"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("[data-reveal]").first()).toBeAttached();
    if (route === "/contact") {
      const hero = page.locator("[data-reveal]").first();
      const bounds = await untransformedDocumentBounds(hero);
      const height = page.viewportSize()!.height;
      await jump(page, bounds.bottom + 8);
      await expect(hero).toHaveAttribute("data-reveal", "hidden");
      await jump(page, bounds.bottom - height * .22 - 8);
      await expect(hero).toHaveAttribute("data-reveal", "revealed");
      await jump(page, bounds.bottom + 8);
      await expect(hero).toHaveAttribute("data-reveal", "hidden");
      continue;
    }
    const reveal = await replayTarget(page);
    const bounds = await untransformedDocumentBounds(reveal);
    const height = page.viewportSize()!.height;

    await jump(page, bounds.top - height * .78 + 8);
    await expect(reveal).toHaveAttribute("data-reveal", "revealed");
    await jump(page, bounds.bottom + 8);
    await expect(reveal).toHaveAttribute("data-reveal", "hidden");
    await jump(page, bounds.bottom - height * .22 - 8);
    await expect(reveal).toHaveAttribute("data-reveal", "revealed");
    await jump(page, bounds.top - height - 8);
    await expect(reveal).toHaveAttribute("data-reveal", "hidden");
    await jump(page, bounds.top - height * .78 + 8);
    await expect(reveal).toHaveAttribute("data-reveal", "revealed");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});
