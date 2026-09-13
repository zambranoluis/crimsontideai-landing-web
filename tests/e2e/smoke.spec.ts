import { expect, test } from "./fixtures";

test("home route responds and renders its document body", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toBeVisible();
});

for (const [path, heading] of [["/", "We build software products and solutions for real-world problems."], ["/products", "Different products for different problems."], ["/solutions", "Tell us what you want to achieve. Let's build the path to make it possible."], ["/work", "Experience is proven in practice."], ["/company", "We turn possibilities into technology that can move forward."], ["/contact", "Let's talk about what you want to build."]] as const) {
  test(`${path} renders its primary heading`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
  });
}
