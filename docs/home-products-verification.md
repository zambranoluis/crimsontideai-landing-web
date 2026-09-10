# Home and Products implementation — 2026-09-09

Implemented the supplied Home/Products composition and motion plan. Changes remain
uncommitted. The pre-existing `.codex/config.toml` modification was preserved.

Home now uses alternating editorial product rows, open solutions and case layouts,
a separate organisation strip, numbered principle rows, and a centred closing section.
Home/Products spacing uses 144/104/72px section tokens and 80/56/40px major-gap tokens.
The hero retains its existing heading scale and has scroll-linked artwork.

Products now have introductions above three feature steps, with previews that stick
only on eligible desktop viewports. The completed preview precedes normal-flow
features on touch, mobile, short, and reduced-motion viewports. The existing preview
motion context carries scene state; continuous values use CSS properties and one shared
scroll-frame scheduler. The case uses its illustration-area anchor so the coverage and
detection sequence takes place while the artwork enters view.

Shared entrances reveal once at 78% of viewport height, with 650ms opacity/20px motion
and optional 80ms staggering capped at 160ms. Focus reveals immediately. Initial-view
and no-JavaScript content remain visible. Other-route changes only split or stagger
reveal groups; their layouts, the header, and the footer retain their designs.

## Static verification

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; static route generation completed |
| `git diff --check` | Passed |
| JSX text comparison against HEAD | No text changes in the 16 modified TSX files |

No dependencies or public route/data interfaces were added or changed. Existing
product assets, factual copy, and external product destinations were retained.

## Functional browser verification

The connected browser runtime reported no available browser. Verification used the
repository's headless Playwright Chromium against `http://localhost:3000`.

Final complete run: `npm run test:e2e -- -- --workers=2 --reporter=line` — **61 passed,
23 skipped**, no failures. Skips cover the desktop-only scenarios in touch projects,
duplicate matrix execution outside the desktop project, and the desktop mobile-menu test.

The suite covers entrance thresholds and persistence, CSS preview emphasis, ordered
step activation, header clearance and sticky release, external-link behavior, direct
anchors, fast/reverse scrolling, back/forward restoration, mounted eligibility changes,
keyboard focus, reduced motion, and no-JavaScript readability. All six routes received
normal, reduced-motion, and no-JavaScript reveal checks. Existing smoke tests passed.

## Rendered evidence

Evidence is saved locally in `%TEMP%/crimsontide-home-products`. Open `review.html` there
for the before/after gallery and the separate scroll recordings.

| Viewports | Findings |
| --- | --- |
| 1440x900, 1366x768, 1280x800, 1024x768 | Sticky previews fit below the measured header; feature text remains at 16px. Home CTA fully visible at 1366x768. |
| 768x1024, 390x844, 360x740 | Complete previews precede features in normal flow; no artificial step heights. Mobile hero detail sits below its copy. |
| All fourteen Home/Products captures | Zero measured horizontal overflow and no page errors. |

Baseline images were captured before editing, with a desktop scroll recording. The
original reveal behavior hid lower sections in initial full-page images, so additional
no-JavaScript composition captures preserve the complete before layout at 1440x900 and
390x900. These are labelled separately from normal-motion captures.

After evidence includes initial and full-page captures at all seven requested sizes,
case progress at 25/65/100%, all three product states on eligible screens, and complete
fallback previews on smaller screens. Separate Home and Products recordings at 1440x900
and 390x844 contain normal, fast, and reverse passes; `scroll-passes.json` records their
approximate start times. Screenshot and video frames were reviewed for clipping,
header overlap, compression, and competing motion.

## Limits

This is Chromium desktop and device-emulation evidence. Physical touch gestures,
dynamic mobile browser chrome, Safari, Firefox, hardware-specific smoothness, and
production-server browser behavior were not verified. Build success is separate from
browser checks against the development server. Visual review does not establish an
approved screenshot baseline. No deployment or commit was performed.
