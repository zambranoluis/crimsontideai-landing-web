import { expect, test } from "./fixtures";

const origin = "https://crimsontide.ai";
const image = `${origin}/og/crimsontide-share.png`;
const imageAlt = "CrimsonTide — AI software company, built in Jamaica.";

const pages = [
  [
    "/",
    "AI Software Company in Jamaica | CrimsonTide",
    "CrimsonTide is an AI software company in Jamaica developing proprietary products, AI solutions, and custom software for organisations.",
  ],
  [
    "/products",
    "Conversational AI & Computer Vision Products | CrimsonTide",
    "Explore OpenJM conversational AI and Sentinel computer vision products, independently developed by CrimsonTide for different needs.",
  ],
  [
    "/solutions",
    "AI Solutions & Custom Software Development | CrimsonTide",
    "CrimsonTide designs AI solutions and custom software development engagements around an organisation's objectives, context, and operations.",
  ],
  [
    "/work",
    "AI Software Experience & Case Studies | CrimsonTide",
    "Explore CrimsonTide's AI software experience, documented case studies, sector relevance, and client relationships.",
  ],
  [
    "/company",
    "Jamaica-Built AI Software Company | CrimsonTide",
    "Learn about CrimsonTide, a Jamaica-built AI software company developing proprietary products, AI solutions, and custom software.",
  ],
  [
    "/contact",
    "AI & Custom Software Project Enquiries | CrimsonTide",
    "Start a conversation with CrimsonTide about an AI solution, custom software project, product, integration, or partnership.",
  ],
] as const;

for (const [path, title, description] of pages) {
  test(`${path} emits complete public SEO metadata`, async ({ page }) => {
    await page.goto(path);
    const url = `${origin}${path === "/" ? "" : path}`;

    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      description,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      url,
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      url,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      title,
    );
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute("content", description);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
      "content",
      "CrimsonTide",
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "en_JM",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      image,
    );
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      "content",
      imageAlt,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      title,
    );
    await expect(
      page.locator('meta[name="twitter:description"]'),
    ).toHaveAttribute("content", description);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      "content",
      image,
    );
  });
}

test("root structured data exposes only confirmed organisation and website details", async ({
  page,
}) => {
  await page.goto("/");
  const payload = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.map((script) => JSON.parse(script.textContent ?? "[]")),
    );
  const entries = payload.flat() as Array<Record<string, unknown>>;
  const organisation = entries.find(
    (entry) => entry["@type"] === "Organisation",
  );
  const website = entries.find((entry) => entry["@type"] === "WebSite");

  expect(organisation).toMatchObject({
    "@id": `${origin}/#organisation`,
    name: "CrimsonTide",
    legalName: "CrimsonTide AI Limited",
    url: origin,
    email: "info@crimsontide.ai",
    telephone: "+1-876-458-4187",
    sameAs: [
      "https://www.instagram.com/crimsontide.ai/",
      "https://www.youtube.com/@CrimsonTideAI",
    ],
  });
  expect(organisation?.address).toHaveLength(2);
  expect(website).toMatchObject({
    "@id": `${origin}/#website`,
    name: "CrimsonTide",
    url: origin,
    inLanguage: "en-JM",
    publisher: { "@id": `${origin}/#organisation` },
  });
});

test("share card, sitemap, and robots expose the canonical public surface", async ({
  page,
}) => {
  await page.goto("/");
  const [card, sitemap, robots] = await Promise.all([
    page.request.get("/og/crimsontide-share.png"),
    page.request.get("/sitemap.xml"),
    page.request.get("/robots.txt"),
  ]);

  expect(card.ok()).toBe(true);
  expect(card.headers()["content-type"]).toContain("image/png");
  expect((await card.body()).length).toBeGreaterThan(0);
  const cardDimensions = await page.evaluate(async (src) => {
    const shareCard = new Image();
    shareCard.src = src;
    await shareCard.decode();
    return { width: shareCard.naturalWidth, height: shareCard.naturalHeight };
  }, "/og/crimsontide-share.png");
  expect(cardDimensions).toEqual({ width: 1200, height: 630 });

  expect(sitemap.ok()).toBe(true);
  expect(sitemap.headers()["content-type"]).toContain("xml");
  const sitemapBody = await sitemap.text();
  expect(sitemapBody.match(/<loc>/g) ?? []).toHaveLength(pages.length);
  for (const [path] of pages)
    expect(sitemapBody).toContain(
      `<loc>${origin}${path === "/" ? "" : path}</loc>`,
    );

  expect(robots.ok()).toBe(true);
  expect(robots.headers()["content-type"]).toContain("text/plain");
  expect(await robots.text()).toContain(
    "User-Agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://crimsontide.ai/sitemap.xml",
  );
});
