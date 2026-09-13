# Public asset cleanup

Page images now live under `/pages/<existing-folder>/images/`. The existing `ai-solutions` and `work-and-credibility` names are preserved. Shared logos and icons retain their directories; the active Home video retains its URL. No redirects, component interfaces, copy, layout, navigation, or animation logic changed.

## Relocations and recovered dependencies

| Resource | Result |
| --- | --- |
| Eight Solutions PNGs | Moved into `public/pages/ai-solutions/images/`; repaired both `/images/solutions/` references and the Earth background, planet, and glow URLs. |
| Four Company images | Moved into `public/pages/company/images/`; removed the obsolete nested `company/company/images` prefix from consumers. |
| Home map | Moved `caribbean-map.png` from the map prototype's assets directory into `public/pages/home/images/`. |
| Home artwork | Corrected the obsolete `pictures` URL to the existing `images` folder. |
| Three Products images | Corrected the obsolete singular `image` URLs to the existing `images` folder. |
| Warehouse poster | Extracted the frame at 8 seconds from `video-detection.mp4` using FFmpeg (`-frames:v 1 -q:v 2`). Inspected the nonblank 1080 × 1350 image with its detection overlay. Saved as `public/pages/home/images/warehouse-poster.jpg`. |
| Original footer export | Moved unchanged into `tests/fixtures/terrain/footer.html`; updated the equation regression, provenance comment, and terrain documentation. Historical iframe profiling serves this fixture through Playwright interception. |

All 14 relocated files match their committed originals (normalizing Git's HTML line endings for comparison). The independent footer reference equations are preserved.

The Company feature data generates `/icons/${icon}.svg`: `target`, `jamaica-map`, `propietary-technology`, and `world` are retained. Product feature glyphs instead use the inline `ProductIcon` path table; its `document` key does not depend on `public/icons/document.svg`.

## Removed resources

34 unused files removed, totaling 17,497,718 bytes before adding the poster:

- 18 prototype/export/settings files: Company morph and radar prototypes and morph settings; Home hero, Technology, both CTA prototypes, and the standalone map prototype; Products OpenJM and Sentinel demos and the three HTML/`.ctnetwork` export pairs; Work's orbit HTML.
- Unused video: `public/pages/home/video-1-home.mp4`.
- Redundant images: Home's `super-market.png` (byte-identical to retained Solutions `solution-market.png`) and Work's `work-public.png` (the site uses `work-public.webp`).
- Unused logos: `logo_bordes.png`, `openjm-icon.svg`, and `sentinel-icon.svg`. The corporate wordmark, full product marks, product wordmarks, and all 15 partner marks remain.
- Unused icons: `arrow`, `bag`, `bell`, `document`, `experience`, `linkedin`, `new-possibilities`, `operational-visibilty`, `social-x`, and `worlk` (`.svg`).

Deletion review covered source consumers, CSS backgrounds/masks, data-generated paths, tests, scripts, project documentation, and local links in retained resources. Prototypes are not loaded by the current implementations. No uncertain deletion candidates remain; every retained public file has a runtime consumer.

## Verification

- Static reference audit: all 83 runtime assets exist, including generated Company icons, CSS masks/backgrounds, and the poster; no unreferenced public files remain.
- Lint, typecheck, production build, and `git diff --check` passed. All six routes prerender successfully.
- Impeccable detection completed: three advisory findings in existing Solutions closing styles (one color and two font sizes). Those values were not changed.
- All 83 public asset URLs responded successfully. All six routes passed the image audit in desktop (1280 × 800), tablet (768 × 1024, touch), mobile (Pixel 5), desktop without JavaScript, and narrow reduced-motion Chromium: 30 route/mode combinations, zero failed local requests or image/CSS/poster decodes. The audit scrolled the document to exercise lazy loading, then explicitly loaded any remaining offscreen images for decode verification.
- Reviewed first-viewport and full-page screenshots for all 18 desktop/tablet/mobile route combinations, plus the relocated Solutions journey images in all three layouts. Full-page overview captures expose Reveal content for review; separate journey captures use the supported reduced-motion composition.
- Historical footer interception returned HTTP 200 and rendered its canvas from the relocated fixture. The independent terrain-equation regression passed.
- Existing blocked-video/poster, Earth image-failure, reduced-motion, no-JavaScript, and canvas-failure coverage ran in the serial suite.

### Existing suite results and limitations

The smoke, Home backgrounds/cards/products motion, Products layout, Company/mountains, Solutions motion/Earth, Work/partners, and terrain/core suites ran with `--workers=1`: **380 passed, 154 skipped, 21 failed** in 16.4 minutes. No failure reported an absent or undecodable relocated asset.

| Failure group | Count | Finding |
| --- | --- | --- |
| Home Company link expectations | 15 | Four mountain-composition modes plus the no-JS background test, in each project, expect `/company#company-about`; committed runtime code already links to `/company`. Navigation was preserved. |
| Initial Solutions Reveal expectation | 3 | The first `[data-reveal]` is in Opportunities below the hero; the test expects it inside the initial viewport. |
| Cross-route reveal replay | 1 | The Company About intro remains revealed at the test's sampled scroll position. The Reveal and Company layout logic are unchanged. |
| Mobile mountain wrapped-content probe | 1 | The test changes heading line-height and expects the absolute mountain base to move more than 20px. It reports no movement. The unchanged layout assertion fails again in isolation; the independent content-anchor alignment assertion passes. |
| Desktop journey progression | 1 | The initial sample read zero progress. The isolated rerun passed. |

The focused rerun finished with **2 passed, 1 skipped, 1 failed** (the mobile mountain probe). These broader assertion failures remain outside this asset-only change; the suite is not wholly green. Relevant Reveal, Solutions page, Home Company markup/styles, and shared Mesh files were verified unchanged against HEAD.

Evidence is saved locally under `%TEMP%/crimsontide-asset-review`, `%TEMP%/crimsontide-asset-tests.log`, `%TEMP%/crimsontide-asset-rerun.log`, `%TEMP%/crimsontide-asset-build.log`, and `%TEMP%/crimsontide-asset-impeccable.json`. Generated `artifacts/` and `build/` screenshots were moved into the review folder. Browser coverage is Chromium emulation, not physical devices, Safari, or Firefox. All changes remain uncommitted.
