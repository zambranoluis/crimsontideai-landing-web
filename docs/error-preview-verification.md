# Error-page preview verification

## Surface direction

`/error-preview` is a development-only, immersive recovery-page preview in the existing Deep Field world. Its desktop composition follows the supplied 1672 × 941 reference: recovery copy on the left, a cropped crimson planet at upper right, astronaut and terrain in the foreground, then the compact CrimsonTide footer. On narrow screens the reading order is copy and recovery actions, scene, then footer.

The interaction is deliberately decorative. Pointer movement in the artwork aims a Canvas 2D searchlight from the astronaut's shoulder; a touch tap aims it without preventing scrolling. Once Canvas initializes, the astronaut becomes a focusable searchlight-control group: arrow keys adjust the light and Home restores its direction. Click, tap, Enter, and Space on the astronaut are inert. The artwork and desktop scene use clipping that cannot become an internal scroll container, so focus preserves layer alignment. Reduced motion removes the light fade transition. Visibility observation, document visibility, and unmount cleanup pause or dispose the runtime. The server-rendered PNG layers, content, and links remain usable if Canvas or module initialization fails and without JavaScript.

## Asset provenance

All scene imagery is supplied in `public/error_page/`:

- `cloud-stars.png`, `planet.png`, `red-dust.png`, `terrain.png`, and `astronaut.png` are the five separately rendered scene layers used by the route.
- `preview.png` is the supplied 1672 × 941 visual reference only. It is not rendered by the page.

No generated replacement artwork or extracted preview composite is shipped.

## Verification

- `npx eslint src/app/error-preview tests/e2e/error-preview.spec.ts`, `npm run typecheck`, and `git diff --check` passed.
- Serial Chromium: `npx playwright test tests/e2e/error-preview.spec.ts --workers=1` passed 15 checks with 6 intentional single-coverage skips. It covers desktop, tablet, and mobile layouts; mouse and touch aiming; keyboard control; inert astronaut click/Enter/Space input; Tab and Shift+Tab scene alignment; reduced motion; Canvas failure; no JavaScript; recovery navigation cleanup; and the 320 × 568 reading order/footer.
- A production server returned `404 Not Found` for `/error-preview` and for an unrelated missing route. `sitemap.xml` did not contain `error-preview`.
- Visual captures were reviewed at reference-sized desktop, tablet, mobile, and 320 × 568: `.impeccable/review/error-preview/{desktop-final,tablet,mobile,compact}.png`. No clipping, horizontal overflow, contrast loss, or unreachable recovery action was observed.
- One scoped Impeccable detection pass reported 15 advisory-only local color and type-ramp deviations. They are intentional route-owned values required to preserve the supplied composition; it reported no blocking issue.

Browser coverage is Chromium on Windows with emulated tablet/mobile profiles. Firefox, WebKit, and physical-device behavior were not exercised.
