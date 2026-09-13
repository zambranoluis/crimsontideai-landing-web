import { test, expect, baseURL } from "./fixtures";

const valid = { name: "Test Visitor", email: "visitor@example.com", message: "Automated local endpoint verification." };
for (const scenario of [
  { name: "foreign origin", headers: { origin: "https://foreign.invalid" }, body: JSON.stringify(valid), status: 403, outcome: "rejected" },
  { name: "cross-site fetch", headers: { "sec-fetch-site": "cross-site" }, body: JSON.stringify(valid), status: 403, outcome: "rejected" },
  { name: "unsupported content", headers: { "content-type": "text/plain" }, body: JSON.stringify(valid), status: 415, outcome: "rejected" },
  { name: "malformed JSON", headers: {}, body: "{", status: 400, outcome: "rejected" },
  { name: "oversize body", headers: {}, body: JSON.stringify({ ...valid, message: "x".repeat(33000) }), status: 413, outcome: "rejected" },
  { name: "missing fields", headers: {}, body: "{}", status: 400, outcome: "invalid" },
  { name: "honeypot", headers: {}, body: JSON.stringify({ ...valid, website: "bot" }), status: 400, outcome: "rejected" },
] as const) {
  test(`real Contact HTTP rejects ${scenario.name}`, async ({ request }) => {
    const headers: Record<string, string> = { "content-type": "application/json", origin: baseURL };
    for (const [key, value] of Object.entries(scenario.headers)) if (value) headers[key] = value;
    // A Buffer sends literal wire bytes; Playwright JSON-encodes string data.
    const response = await request.post("/api/contact", { headers, data: Buffer.from(scenario.body) });
    expect(response.status()).toBe(scenario.status);
    expect(await response.json()).toMatchObject({ outcome: scenario.outcome });
    expect(response.headers()["cache-control"]).toBe("no-store");
  });
}

test("real Contact HTTP uses local mock or fails safely without production SMTP", async ({ request }) => {
  const response = await request.post("/api/contact", { data: valid });
  const production = process.env.TEST_GROUP === "production";
  expect(response.status()).toBe(production ? 503 : 200);
  expect(await response.json()).toEqual(production ? { outcome: "submission_failed" } : { outcome: "success", mocked: true });
});
