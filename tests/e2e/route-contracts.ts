import { expect, type Page } from "./fixtures";

// Authored expectations, not values read back from the implementation under test.
export const routes = [
  { path: "/", title: "AI Software Company in Jamaica | CrimsonTide", description: "CrimsonTide is an AI software company in Jamaica developing proprietary products, AI solutions, and custom software for organisations.", sections: ["AI software products", "Proprietary products.", "Technology applied", "Technology built in Jamaica", "Take your potential"] },
  { path: "/products", title: "Conversational AI & Computer Vision Products | CrimsonTide", description: "Explore OpenJM conversational AI and Sentinel computer vision products, independently developed by CrimsonTide for different needs.", sections: ["Conversational AI", "Expand your horizons", "See more."] },
  { path: "/solutions", title: "AI Solutions & Custom Software Development | CrimsonTide", description: "CrimsonTide designs AI solutions and custom software development engagements around an organisation's objectives, context, and operations.", sections: ["AI solutions and", "We start with what", "From a clear objective", "The solution should adapt", "A solution creates value", "Solutions built to work", "Artificial intelligence designed"] },
  { path: "/work", title: "AI Software Experience & Case Studies | CrimsonTide", description: "Explore CrimsonTide's AI software experience, documented case studies, sector relevance, and client relationships.", sections: ["AI software experience", "From real-world context", "Different environments.", "Credibility is also", "Turn experience"] },
  { path: "/company", title: "Jamaica-Built AI Software Company | CrimsonTide", description: "Learn about CrimsonTide, a Jamaica-built AI software company developing proprietary products, AI solutions, and custom software.", sections: ["A Jamaica-built AI", "We build technology", "Technology developed from Jamaica", "Let's talk about what comes next."] },
  { path: "/contact", title: "AI & Custom Software Project Enquiries | CrimsonTide", description: "Start a conversation with CrimsonTide about an AI solution, custom software project, product, integration, or partnership.", sections: ["Let's talk about your", "Start with the context."] },
] as const;

export async function settle(page: Page, waitForFonts = true) {
  await page.evaluate(async fonts => {
    if (fonts) await document.fonts.ready;
    await new Promise<void>(resolve => {
      let previous = "", same = 0;
      const sample = () => {
        const geometry = `${scrollY}:${document.documentElement.scrollHeight}:${document.querySelector("main")?.getBoundingClientRect().height}`;
        same = previous === geometry ? same + 1 : 0;
        previous = geometry;
        if (same >= 3) resolve(); else requestAnimationFrame(sample);
      };
      sample();
    });
  }, waitForFonts);
}

export async function readRoute(page: Page, javaScriptEnabled = true) {
  for (const section of await page.locator("main > section").all()) {
    const heading = section.locator("h1,h2").first();
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    // Traverse the entire section so lazy images and scroll scenes enter.
    await section.evaluate(async (element, animated) => {
      const top = scrollY + element.getBoundingClientRect().top;
      for (let y = top; y < top + element.clientHeight; y += innerHeight * .65) {
        scrollTo({ top: y, behavior: "instant" });
        if (animated) await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      }
    }, javaScriptEnabled);
  }
  await page.locator("footer").scrollIntoViewIfNeeded();
  for (const img of await page.locator("img").all()) {
    // Responsive hidden alternatives are not requested by native lazy loading.
    if (!await img.isVisible()) continue;
    // A responsive source can become lazy again after a viewport change.
    // Move only the document vertically; element.scrollIntoView also scrolls
    // clipped decorative containers horizontally and changes their composition.
    await img.evaluate(element => {
      const rect = element.getBoundingClientRect();
      scrollTo({ top: scrollY + rect.top + rect.height / 2 - innerHeight / 2, behavior: "instant" });
    });
    await expect.poll(() => img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0), { message: `Image decoding: ${await img.getAttribute("src")}`, timeout: 15_000 }).toBe(true);
  }
  await page.locator("footer").scrollIntoViewIfNeeded();
  if (javaScriptEnabled) await settle(page);
}
