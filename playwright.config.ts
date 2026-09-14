import { defineConfig, devices } from "@playwright/test";

const group = process.env.TEST_GROUP ?? "e2e";
const production = group === "production";
const runLabel = process.env.TEST_RUN_LABEL ?? group;
const baseURL = process.env.TEST_BASE_URL ?? `http://localhost:${production ? 3101 : 3001}`;
const critical = /(?:route-health|not-found|navigation(?:-transitions)?|contact-email|contact-http|work-partners|products-layout|header|destinations)\.spec\.ts/;
const special = /(?:-core|accessibility|visual)\.spec\.ts/;
// Linux WPE's compositor crashes on cached-route transitions in this pinned build.
// The bundled GTK browser exercises the same WebKit engine under Xvfb instead.
const webkitHeadless = process.platform !== "linux" || process.env.TEST_WEBKIT_HEADLESS === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  failOnFlakyTests: true,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  // GTK software rendering under Xvfb can take longer to commit a route.
  // Pixel tolerances and controlled animation/history observations stay unchanged.
  ...(group === "cross-browser" ? { timeout: 60_000, expect: { timeout: 10_000 } } : {}),
  ...(group === "a11y" ? { timeout: 60_000 } : {}),
  ...(group === "visual" ? { timeout: 120_000, expect: { timeout: 15_000 } } : {}),
  outputDir: `test-results/${runLabel}`,
  reporter: [["list"], ["html", { open: "never", outputFolder: `playwright-report/${runLabel}` }], ["json", { outputFile: `test-results/reports/${runLabel}.json` }]],
  snapshotPathTemplate: "{testDir}/visual-baselines/{projectName}/{arg}{ext}",
  updateSnapshots: "none",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: group === "unit" ? [{ name: "unit", testMatch: /-core\.spec\.ts/ }] : group === "cross-browser" ? [
    { name: "desktop-firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 800 } }, testMatch: critical },
    { name: "desktop-webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 }, headless: webkitHeadless }, testMatch: critical },
    { name: "mobile-webkit", use: { ...devices["iPhone 13"], headless: webkitHeadless }, testMatch: critical },
  ] : [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "tablet-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
      },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
    },
  ].map(project => ({ ...project,
    ...(group === "a11y" ? { testMatch: /accessibility\.spec\.ts/ }
      : group === "visual" ? { testMatch: /visual\.spec\.ts/ }
      : group === "smoke" ? { testMatch: /(?:smoke|route-health|destinations)\.spec\.ts/ }
      : production ? { testMatch: critical } : { testIgnore: special }),
  })),
  webServer: group === "unit" ? undefined : {
    stdout: "pipe",
    stderr: "pipe",
    command: production ? "node scripts/test-server.mjs production" : "node scripts/test-server.mjs development",
    url: baseURL,
    reuseExistingServer: !process.env.CI && !production,
    timeout: production ? 240_000 : 120_000,
  },
});
