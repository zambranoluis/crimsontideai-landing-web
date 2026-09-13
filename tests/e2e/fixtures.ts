import { test as base, expect, type BrowserContext, type BrowserContextOptions, type Page } from "@playwright/test";

export { expect };
export type { Page, TestInfo, Locator } from "@playwright/test";
export const baseURL = process.env.TEST_BASE_URL ?? `http://localhost:${process.env.TEST_GROUP === "production" ? 3101 : 3001}`;

export const test = base.extend<{ expectedPageErrors: RegExp[]; browserErrorGuard: void }>({
  expectedPageErrors: async ({}, provide) => { await provide([]); },
  browserErrorGuard: [async ({ browser, context, expectedPageErrors }, provide, info) => {
    const errors: string[] = [];
    const watchPage = (page: Page) => {
      page.on("pageerror", error => errors.push(error.message));
      page.on("crash", () => errors.push(`Browser renderer crashed: ${page.url()}`));
    };
    const watch = (target: BrowserContext) => {
      target.on("page", watchPage);
      for (const page of target.pages()) watchPage(page);
    };
    watch(context);
    const original = browser.newContext.bind(browser);
    const project = info.project.use;
    browser.newContext = async (options: BrowserContextOptions = {}) => {
      const target = await original({ baseURL, viewport: project.viewport, hasTouch: project.hasTouch ?? false,
        isMobile: project.isMobile ?? false, reducedMotion: project.reducedMotion ?? "no-preference", ...options });
      watch(target);
      return target;
    };
    try { await provide(); } finally {
      browser.newContext = original;
      await info.attach("browser-errors", { body: JSON.stringify(errors), contentType: "application/json" });
      expect(errors.filter(message => !expectedPageErrors.some(pattern => pattern.test(message))), "Unexpected browser exceptions").toEqual([]);
    }
  }, { auto: true }],
});
