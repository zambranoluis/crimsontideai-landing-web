import { expect, test, type Page } from "@playwright/test";
import { contactMessages } from "../../src/app/contact/contact-validation";

async function fill(page: Page) {
  await page.goto("/contact");
  await page.getByLabel("Name", { exact: true }).fill("Avery Brown");
  await page.getByLabel("Work email").fill("avery@example.com");
  await page.getByLabel("Tell us a little more").fill("Please discuss our integration.\nA&B #1.");
}

test("Contact prevents overlapping submits and locks editing while sending", async ({ page }) => {
  let count = 0;
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/contact", async route => {
    count++;
    await gate;
    await route.fulfill({ json: { outcome: "success" } });
  });
  await fill(page);
  await page.getByRole("button", { name: "Start Conversation" }).focus();
  await page.evaluate(() => {
    const form = document.querySelector("form")!;
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect(page.getByRole("button", { name: "Sending…" })).toBeDisabled();
  await expect(page.getByRole("status")).toHaveText("Sending your enquiry…");
  await expect(page.getByRole("status")).toHaveAttribute("aria-atomic", "true");
  for (const name of ["Name", "Work email", "Company or organization", "What would you like to discuss?", "Tell us a little more"]) await expect(page.getByLabel(name, { exact: true })).toBeDisabled();
  await expect.poll(() => count).toBe(1);
  release();
  await expect(page.getByRole("status")).toHaveText(contactMessages.success);
  await expect(page.getByLabel("Name", { exact: true })).toBeEditable();
});

for (const outcome of ["confirmation_failed", "submission_failed", "uncertain", "rejected"] as const) {
  test(`Contact handles ${outcome} without automatic resubmission`, async ({ page }) => {
    let count = 0;
    await page.route("**/api/contact", async route => {
      count++;
      await route.fulfill({ status: outcome === "confirmation_failed" ? 200 : 502, json: { outcome } });
    });
    await fill(page);
    await page.getByRole("button", { name: "Start Conversation" }).click();
    await expect(page.getByRole("status")).toHaveText(contactMessages[outcome]);
    const partial = outcome === "confirmation_failed";
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue(partial ? "" : "Avery Brown");
    await expect(page.getByLabel("Tell us a little more")).toHaveValue(partial ? "" : "Please discuss our integration.\nA&B #1.");
    await expect(page.getByRole("button", { name: "Start Conversation" })).toBeEnabled({ timeout: 5000 });
    expect(count).toBe(1);
  });
}

test("Contact focuses server-side field errors and preserves entered values", async ({ page }) => {
  await page.route("**/api/contact", route => route.fulfill({ status: 400, json: { outcome: "invalid", errors: { organisation: "Use 200 characters or fewer." } } }));
  await fill(page);
  await page.getByRole("button", { name: "Start Conversation" }).click();
  await expect(page.getByLabel("Company or organization")).toBeFocused();
  await expect(page.getByRole("status")).toHaveText(contactMessages.invalid);
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Avery Brown");
  await page.getByLabel("Company or organization").fill("A&B");
  await expect(page.getByLabel("Company or organization")).toHaveAttribute("aria-invalid", "false");
});

for (const failure of ["network", "invalid response", "timeout"] as const) {
  test(`Contact treats ${failure} as uncertain and retains the message`, async ({ page }) => {
    let count = 0;
    await page.route("**/api/contact", async route => {
      count++;
      if (failure === "network") await route.abort("failed");
      else if (failure === "invalid response") await route.fulfill({ status: 502, contentType: "text/html", body: "Gateway unavailable" });
      // For timeout, leave the request pending until the browser aborts it.
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await fill(page);
    if (failure === "timeout") await page.clock.install();
    await page.getByRole("button", { name: "Start Conversation" }).click();
    await expect.poll(() => count).toBe(1);
    if (failure === "timeout") await page.clock.fastForward(125_001);
    await expect(page.getByRole("status")).toHaveText(contactMessages.uncertain);
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue("Avery Brown");
    await expect(page.getByRole("button", { name: "Start Conversation" })).toBeEnabled();
    expect(count).toBe(1);
  });
}

test("Contact development endpoint reports mocked delivery honestly", async ({ page }) => {
  await fill(page);
  const response = page.waitForResponse("**/api/contact");
  await page.getByRole("button", { name: "Start Conversation" }).click();
  expect(await (await response).json()).toEqual({ outcome: "success", mocked: true });
  await expect(page.getByRole("status")).toHaveText("Development preview: your enquiry was processed locally. No emails were sent.");
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("");
});

test("Contact cleans up a pending request when navigating away", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/contact", () => { requests++; });
  await fill(page);
  await page.getByRole("button", { name: "Start Conversation" }).click();
  await expect.poll(() => requests).toBe(1);
  await page.getByRole("link", { name: "About CrimsonTide", exact: true }).click();
  await expect(page).toHaveURL(/\/company/);
  await page.goBack();
  await expect(page.getByRole("button", { name: "Start Conversation" })).toBeEnabled();
  await expect(page.locator("form [role=status]")).toBeEmpty();
  expect(requests).toBe(1);
});

test("Contact form keyboard order skips the honeypot and limits input lengths", async ({ page }) => {
  await fill(page);
  await page.getByLabel("Name", { exact: true }).focus();
  for (const label of ["Work email", "Company or organization", "What would you like to discuss?", "Tell us a little more"]) {
    await page.keyboard.press("Tab");
    await expect(page.getByLabel(label)).toBeFocused();
  }
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Start Conversation" })).toBeFocused();
  for (const [label, limit] of [["Name", 120], ["Work email", 254], ["Company or organization", 200], ["Tell us a little more", 5000]] as const) {
    await expect(page.getByLabel(label, { exact: true })).toHaveAttribute("maxlength", String(limit));
  }
});
