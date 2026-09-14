import { expect, test } from "./fixtures";

test("home route responds and renders its document body", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.locator("body")).toBeVisible();
});

for (const [path, heading] of [["/", "AI software products and solutions, built in Jamaica."], ["/products", "Conversational AI and computer vision products."], ["/solutions", "AI solutions and custom software built around your objectives."], ["/work", "AI software experience, proven in practice."], ["/company", "A Jamaica-built AI software company, moving possibilities forward."], ["/contact", "Let's talk about your AI or custom software project."]] as const) {
  test(`${path} renders its primary heading`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
  });
}
