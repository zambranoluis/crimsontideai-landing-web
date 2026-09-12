import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const rendererSource = ts.transpileModule(readFileSync("src/app/contact/_sections/ContactHero/contact-mesh.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

// Observe actual rendered highlight paths without exposing test state in the UI.
async function observeHighlights(page: Page) {
  await page.addInitScript(() => {
    const paths = new WeakMap<Path2D, { x: number; y: number; radius: number }[]>();
    const arc = Path2D.prototype.arc;
    Path2D.prototype.arc = function (...args: Parameters<typeof arc>) {
      const points = paths.get(this) ?? [];
      points.push({ x: args[0], y: args[1], radius: args[2] });
      paths.set(this, points);
      return arc.apply(this, args);
    };
    const fill = CanvasRenderingContext2D.prototype.fill;
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args: Parameters<typeof clear>) {
      if (this.canvas.closest('[data-testid="contact-mesh"]')) {
        const canvas = this.canvas as HTMLCanvasElement & { draws?: number };
        canvas.draws = (canvas.draws ?? 0) + 1;
      }
      clear.apply(this, args);
    };
    CanvasRenderingContext2D.prototype.fill = function (path?: Path2D | CanvasFillRule, rule?: CanvasFillRule) {
      if (this.canvas.closest('[data-testid="contact-mesh"]') && Math.abs(this.globalAlpha - .65) < .001) {
        Object.assign(this.canvas, { highlights: path instanceof Path2D ? paths.get(path) ?? [] : [] });
      }
      if (path instanceof Path2D) fill.call(this, path, rule);
      else Reflect.apply(fill, this, [path]);
    };
  });
}

const highlights = (page: Page) => page.getByTestId("contact-mesh").locator("canvas").evaluate(element =>
  (element as HTMLCanvasElement & { highlights: { x: number; y: number; radius: number }[] }).highlights ?? []);

test("Contact keeps real details and hands validated context to email", async ({ page }) => {
  const session = await page.context().newCDPSession(page);
  await session.send("Page.enable");
  let destination = "";
  session.on("Page.frameRequestedNavigation", event => {
    if (event.url.startsWith("mailto:")) destination = event.url;
  });
  const submissions: string[] = [];
  page.on("request", request => { if (request.method() === "POST") submissions.push(request.url()); });
  await page.goto("/contact");
  await expect(page.locator("main")).not.toContainText(/demo|demonstration|message was sent/i);
  await expect(page.locator('main a[href="tel:+18764584187"]')).toBeVisible();
  await expect(page.getByText(/53 Lady Musgrave Road/)).toBeVisible();
  await expect(page.getByText(/279 Poinciana Drive/)).toBeVisible();
  await expect(page.getByRole("button", { name: /(?:Play|Pause) animation/ })).toHaveCount(0);
  const next = page.getByRole("heading", { name: "What happens next", exact: true });
  await expect(next).toBeVisible();
  await expect(next.locator("..").locator("p")).toHaveText("We’ll review your message to understand the context and determine the best way to continue the conversation.");
  expect(await next.evaluate(element => {
    const block = element.parentElement!;
    const jamaica = block.previousElementSibling!;
    const styles = getComputedStyle(block);
    const heading = getComputedStyle(element);
    return {
      previous: jamaica.textContent,
      gap: Math.round(block.getBoundingClientRect().top - jamaica.getBoundingClientRect().bottom),
      padding: styles.paddingTop,
      border: styles.borderTopWidth,
      uppercase: heading.textTransform,
      size: heading.fontSize,
    };
  })).toEqual({ previous: "Jamaica", gap: 32, padding: "24px", border: "1px", uppercase: "uppercase", size: "11px" });
  const submit = page.getByRole("button", { name: "Continue in email" });
  await submit.click();
  await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
  await expect(page.getByLabel("Name", { exact: true })).toHaveAttribute("aria-describedby", "name-error");
  await page.getByLabel("Name", { exact: true }).fill("Avery Brown");
  await expect(page.getByText("Enter your name.", { exact: true })).toHaveCount(0);
  await page.getByLabel("Work email").fill("invalid");
  await submit.click();
  await expect(page.getByLabel("Work email")).toBeFocused();
  await expect(page.getByText("Enter a valid work email.")).toBeVisible();
  await page.getByLabel("Work email").fill("avery@example.com");
  await page.getByLabel("Company or organization").fill("A&B Jamaica");
  await page.getByLabel("What would you like to discuss?").selectOption("AI Solutions");
  await page.getByLabel("Tell us a little more").fill("Cameras & AI?\nLet's discuss #1.");
  await submit.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => destination).toContain("mailto:info@crimsontide.ai?");
  const draft = new URL(destination);
  expect(draft.searchParams.get("subject")).toBe("AI Solutions enquiry");
  expect(draft.searchParams.get("body")).toContain("Cameras & AI?\nLet's discuss #1.");
  expect(draft.searchParams.get("body")).toContain("Organisation: A&B Jamaica");
  expect(draft.searchParams.get("body")).toContain("Work email: avery@example.com");
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Avery Brown");
  expect(submissions).toEqual([]);
});

test("Contact terrain pauses, resumes, respects preference changes and survives navigation", async ({ page }) => {
  await page.goto("/contact");
  const mesh = page.getByTestId("contact-mesh");
  const canvas = mesh.locator("canvas");
  const pixels = () => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await expect(mesh).toHaveAttribute("data-motion", "running");
  const initial = await pixels();
  await expect.poll(pixels).not.toBe(initial);
  await page.getByRole("link", { name: "Start a conversation", exact: true }).click();
  await expect(page).toHaveURL(/#contact-form$/);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(mesh).toHaveAttribute("data-motion", "paused");
  const offscreen = await pixels();
  await page.setViewportSize({ width: page.viewportSize()!.width, height: page.viewportSize()!.height + 20 });
  await page.waitForTimeout(250);
  expect(await pixels()).toBe(offscreen);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(mesh).toHaveAttribute("data-motion", "running");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(mesh).toHaveAttribute("data-motion", "paused");
  const reduced = await pixels();
  await page.waitForTimeout(250);
  expect(await pixels()).toBe(reduced);
  await expect(page.getByRole("button", { name: /(?:Play|Pause) animation/ })).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(mesh).toHaveAttribute("data-motion", "running");
  const oldCanvas = await canvas.elementHandle();
  await page.getByRole("link", { name: "About CrimsonTide", exact: true }).click();
  await expect(page).toHaveURL(/\/company(?:#.*)?$/);
  const detached = await oldCanvas!.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await page.waitForTimeout(250);
  expect(await oldCanvas!.evaluate((element: HTMLCanvasElement) => element.toDataURL())).toBe(detached);
  await page.goBack();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(mesh).toHaveAttribute("data-motion", "running");
});

test("Contact renders static terrain and usable contact channels without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/contact`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("contact-mesh").locator("svg")).toBeVisible();
  await expect(page.getByTestId("contact-mesh").locator("canvas")).toBeHidden();
  await expect(page.locator('main a[href="mailto:info@crimsontide.ai"]').first()).toBeVisible();
  await expect(page.locator("form")).toHaveAttribute("action", "mailto:info@crimsontide.ai");
  await context.close();
});

test("Contact remains readable without horizontal overflow at narrow widths", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/contact");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue in email" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const next = page.getByRole("heading", { name: "What happens next" });
  await expect(next).toBeVisible();
  const nextBounds = await next.locator("..").boundingBox();
  const formBounds = await page.getByRole("heading", { name: "Tell us what you have in mind." }).boundingBox();
  expect(nextBounds!.y + nextBounds!.height).toBeLessThan(formBounds!.y);
});

test("Contact renderer localizes hover, bounds displacement and expires expanding ripples", async ({ page }) => {
  await page.goto("/contact");
  const result = await page.evaluate(source => {
    const renderer = {} as typeof import("../../src/app/contact/_sections/ContactHero/contact-mesh");
    new Function("exports", source)(renderer);
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 700;
    const context = canvas.getContext("2d")!;
    type Point = { x: number; y: number; radius: number };
    const points = new WeakMap<Path2D, Point[]>();
    const originalArc = Path2D.prototype.arc;
    Path2D.prototype.arc = function (...args: Parameters<typeof originalArc>) {
      const path = points.get(this) ?? [];
      path.push({ x: args[0], y: args[1], radius: args[2] });
      points.set(this, path);
      return originalArc.apply(this, args);
    };
    let paths: Point[][] = [];
    const originalFill = context.fill.bind(context);
    context.fill = (path?: Path2D | CanvasFillRule, rule?: CanvasFillRule) => {
      paths.push(path instanceof Path2D ? points.get(path) ?? [] : []);
      if (path instanceof Path2D) originalFill(path, rule);
      else originalFill(path);
    };
    const render = (input?: Parameters<typeof renderer.drawContactMesh>[6]) => {
      paths = [];
      renderer.drawContactMesh(context, 1000, 700, 44, 18, 2, input);
      return { base: [...paths[0], ...paths[1]], light: paths[6], pixels: canvas.toDataURL() };
    };
    try {
      const baseline = render();
      const center = renderer.projectContactPoint(25, 11, 2, 1000, 700, 44, 18);
      const pointer = { x: center.x, y: center.y, strength: 1 };
      const hover = render({ pointer, ripples: [] });
      const changes = baseline.base.map((point, index) => ({
        distance: Math.hypot(point.x - center.x, point.y - center.y),
        lift: point.y - hover.base[index].y,
        dx: point.x - hover.base[index].x,
      }));
      const ripple = (age: number) => render({ pointer: { ...pointer, strength: 0 }, ripples: [{ ...center, age }] });
      const early = ripple(.15);
      const late = ripple(.55);
      const expired = ripple(.9);
      const distance = (list: Point[]) => list.reduce((sum, p) => sum + Math.hypot(p.x - center.x, p.y - center.y), 0) / list.length;
      const overlapping = render({ pointer, ripples: Array.from({ length: 3 }, () => ({ ...center, age: .15 })) });
      return {
        changes,
        hoverChangesPixels: baseline.pixels !== hover.pixels,
        lightPoints: hover.light.length,
        earlyDistance: distance(early.light),
        lateDistance: distance(late.light),
        earlyChangesPixels: early.pixels !== baseline.pixels,
        expiredMatches: expired.pixels === baseline.pixels,
        maxCombinedLift: Math.max(...baseline.base.map((p, i) => p.y - overlapping.base[i].y)),
      };
    } finally {
      Path2D.prototype.arc = originalArc;
    }
  }, rendererSource);
  expect(result.hoverChangesPixels).toBe(true);
  expect(result.lightPoints).toBeGreaterThan(0);
  expect(result.changes.some(point => point.lift > 7.9)).toBe(true);
  for (const point of result.changes) {
    expect(point.dx).toBe(0);
    expect(point.lift).toBeGreaterThanOrEqual(0);
    expect(point.lift).toBeLessThanOrEqual(8);
    if (point.distance >= 140) expect(point.lift).toBe(0);
  }
  expect(result.earlyChangesPixels).toBe(true);
  expect(result.lateDistance).toBeGreaterThan(result.earlyDistance + 50);
  expect(result.expiredMatches).toBe(true);
  expect(result.maxCombinedLift).toBeLessThanOrEqual(8);
});

test("Contact pointer input follows canvas offsets, resets and leaves controls usable", async ({ page }) => {
  await observeHighlights(page);
  await page.clock.install();
  await page.goto("/contact");
  const mesh = page.getByTestId("contact-mesh");
  await expect(mesh).toHaveAttribute("data-ready", "true");
  await expect(mesh).toHaveAttribute("data-motion", "running");
  const hero = page.locator('section[aria-labelledby="contact-heading"]');
  const canvas = mesh.locator("canvas");
  const bounds = (await canvas.boundingBox())!;
  const heroBounds = (await hero.boundingBox())!;
  const x = Math.min(page.viewportSize()!.width - 50, bounds.x + bounds.width * .7);
  const y = Math.min(page.viewportSize()!.height - 50, heroBounds.y + heroBounds.height * .65);
  const heading = page.getByRole("heading", { level: 1 });
  await page.waitForTimeout(800); // Let the existing Reveal entrance settle.
  const before = await heading.boundingBox();
  const fine = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  // Keep short-lived ripples observable even when the test machine is busy.
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
  await page.mouse.move(x, y);
  if (!fine) {
    await page.touchscreen.tap(x, y);
    await page.clock.runFor(300);
    expect(await highlights(page)).toEqual([]);
    return;
  }
  await page.clock.runFor(300);
  expect((await highlights(page)).length).toBeGreaterThan(0);
  for (const point of await highlights(page)) {
    expect(Math.hypot(point.x - (x - bounds.x), point.y - (y - bounds.y))).toBeLessThanOrEqual(148);
  }
  expect(await heading.boundingBox()).toEqual(before);
  await page.mouse.click(x, y);
  await page.mouse.move(5, heroBounds.y + 30); // Stay inside hero, away from visible points.
  await page.clock.runFor(250);
  expect((await highlights(page)).some(p => Math.hypot(p.x - (x - bounds.x), p.y - (y - bounds.y)) < 160)).toBe(true);
  await page.clock.runFor(1000);
  expect(await highlights(page)).toEqual([]);

  // Burst input remains bounded and decays fully.
  for (let i = 0; i < 8; i++) await page.mouse.click(x + i * 3, y);
  await page.mouse.move(5, heroBounds.y + 30);
  await page.clock.runFor(1200);
  expect(await highlights(page)).toEqual([]);
  await page.mouse.move(x, y);
  await page.clock.runFor(300);
  expect((await highlights(page)).length).toBeGreaterThan(0);
  await page.mouse.move(5, 5);
  await expect.poll(() => highlights(page)).toEqual([]);

  // A fourth click evicts the oldest ripple, rather than accumulating rings.
  const first = { detail: 1, clientX: x, clientY: y };
  const distant = { detail: 1, clientX: page.viewportSize()!.width - 60, clientY: heroBounds.y + 70 };
  await hero.dispatchEvent("click", first);
  await page.clock.runFor(120);
  expect((await highlights(page)).some(p => Math.hypot(p.x - (x - bounds.x), p.y - (y - bounds.y)) < 100)).toBe(true);
  await hero.dispatchEvent("pointerleave");
  await hero.dispatchEvent("click", first);
  for (let i = 0; i < 3; i++) await hero.dispatchEvent("click", distant);
  await page.clock.runFor(120);
  expect((await highlights(page)).some(p => Math.hypot(p.x - (x - bounds.x), p.y - (y - bounds.y)) < 100)).toBe(false);
  await hero.dispatchEvent("pointercancel");
  expect(await highlights(page)).toEqual([]);

  await page.mouse.move(x, y);
  await page.clock.runFor(300);
  expect((await highlights(page)).length).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => highlights(page)).toEqual([]);
  await page.mouse.click(x, y);
  expect(await highlights(page)).toEqual([]);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.mouse.move(5, 5);

  // A mouse on a narrow viewport still uses the field's responsive offset.
  await page.setViewportSize({ width: 700, height: 900 });
  await page.clock.runFor(100);
  const narrow = (await canvas.boundingBox())!;
  const narrowX = Math.min(650, narrow.x + narrow.width * .6);
  const narrowY = Math.min(850, narrow.y + narrow.height * .7);
  await page.mouse.move(narrowX, narrowY);
  await page.clock.runFor(300);
  expect((await highlights(page)).length).toBeGreaterThan(0);
  for (const point of await highlights(page)) {
    expect(Math.hypot(point.x - (narrowX - narrow.x), point.y - (narrowY - narrow.y))).toBeLessThanOrEqual(148);
  }
  await page.mouse.move(5, 5);
  expect(await highlights(page)).toEqual([]);

  // Cancel navigation at document bubble, after the hero's own listener ran.
  await page.evaluate(() => document.addEventListener("click", event => event.preventDefault(), { once: true }));
  await page.getByRole("link", { name: "Start a conversation", exact: true }).dispatchEvent("click", { detail: 1, clientX: x, clientY: y });
  await page.clock.runFor(200);
  expect(await highlights(page)).toEqual([]);
  await hero.dispatchEvent("click", { detail: 0, clientX: x, clientY: y });
  await page.clock.runFor(100);
  expect(await highlights(page)).toEqual([]);
  await page.getByRole("link", { name: "Start a conversation", exact: true }).click();
  await expect(page).toHaveURL(/#contact-form$/);
});

test("Contact suspends while hidden and retains static artwork on cold reduced motion or missing canvas", async ({ page }) => {
  await observeHighlights(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  const mesh = page.getByTestId("contact-mesh");
  const canvas = mesh.locator("canvas");
  await expect(mesh).toHaveAttribute("data-ready", "true");
  await expect(mesh).toHaveAttribute("data-motion", "paused");
  const pixels = () => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  const reduced = await pixels();
  await page.waitForTimeout(200);
  expect(await pixels()).toBe(reduced);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(mesh).toHaveAttribute("data-motion", "running");
  const draws = () => canvas.evaluate(element => (element as HTMLCanvasElement & { draws: number }).draws);
  const bounds = (await canvas.boundingBox())!;
  await page.mouse.move(Math.min(page.viewportSize()!.width - 40, bounds.x + bounds.width * .7), Math.min(page.viewportSize()!.height - 40, bounds.y + bounds.height * .6));
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(mesh).toHaveAttribute("data-motion", "paused");
  const hidden = await pixels();
  const hiddenDraws = await draws();
  await page.setViewportSize({ width: page.viewportSize()!.width - 10, height: page.viewportSize()!.height });
  await page.waitForTimeout(200);
  expect(await pixels()).toBe(hidden);
  expect(await draws()).toBe(hiddenDraws);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(mesh).toHaveAttribute("data-motion", "running");
  await expect.poll(pixels).not.toBe(hidden);
  expect(await highlights(page)).toEqual([]);
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  await page.reload();
  await expect(mesh.locator("svg")).toBeVisible();
  await expect(canvas).toBeHidden();
  await expect(page.getByRole("link", { name: "Start a conversation", exact: true })).toBeVisible();
});
