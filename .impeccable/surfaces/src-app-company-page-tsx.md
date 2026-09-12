---
version: 1
slug: "src-app-company-page-tsx"
primary_target: "src/app/company/page.tsx"
related_targets: ["src/app/company/_sections", "src/app/company/_components"]
---

# Surface brief — Company (`/company`)

**Status: implemented.** Four reference-led sections use the supplied Company artwork and icons, a scroll-driven particle composition, and an aligned Caribbean radar. Copy, shared navigation/footer and destinations are preserved.

## Job and audience

Someone who wants to understand CrimsonTide as a company rather than as a supplier of one product — a partner, a prospective hire, a journalist, or a buyer doing due diligence before a large commitment. Visitor mode: **Read**, closing on an invitation.

## Outcome and proof

**Primary task:** connect purpose, proprietary development, tailored work and Jamaican origin into one coherent picture, then start a conversation.

**Success:** an enquiry about an opportunity or a partnership rather than a product.

## Selected direction

1. **Hero** — identity and direction. Action: *Discover CrimsonTide* → `#company-about`.
2. **About CrimsonTide** — three principles: proprietary technology, work built around a client's context, carrying ideas into real use. A reading progression, not a values grid.
3. **Built in Jamaica** — origin and regional context with global potential. A section of this route, never a route of its own.
4. **Closing** — Action: *Contact CrimsonTide* → `/contact`.

**Focal motion:** About holds its complete composition stationary while the particles move from brain to gear to bulb with the reader's scroll. Jamaica carries origin through the supplied map. The hero radar introduces regional context; neither map implies deployed infrastructure.

## Scope and boundaries

Jamaica media is atmospheric. **Test:** remove every image from this section and the proposition must still stand. If it doesn't, the section is relying on scenery.

**Anti-goals:** no team grid, no founder photography, no timeline of milestones, no press logos, no office imagery presented as scale, no flags or tourism imagery. *Team* and *Insights* appear as footer labels but have no content and must not be invented to fill the page.

## States and ranges

Three principles, fixed. One origin section. The layout must not require a fourth principle for balance.

## Interaction and layout

About copy, particles and principles stack through 900px. Fine-pointer desktops at least 1024px wide and 700px tall use compact About spacing. The complete scene pins only if it fits below the measured header. Jamaica statements use four columns on desktop, two through 1023px, and one below 360px. Below 768px the Jamaica map and closing photograph occupy their own space clear of copy. No tabs, dialogs, hover dependency or hidden principle content.

Reveal, focus, reduced-motion, navigation, fragment, footer, and history behavior follows the shared rules in `DESIGN.md`.

## Ordered experience walkthrough

1. **Initial appearance:** the hero is immediately readable and *Discover CrimsonTide* targets `#company-about` below the sticky header.
2. **Downward entry:** About CrimsonTide enters as one introduction followed by three principles at 0/80/160ms delays. Once the complete scene's bottom reaches the viewport bottom, eligible desktops hold the heading, both paragraphs, artwork and three principles together for 2.5 usable viewport heights of additional scrolling. After the bulb's final hold, the scene releases naturally into Built in Jamaica, then the closing invitation. Shared Reveal entry gates remain in place.
3. **Upward re-entry:** principles and section copy that fully exited replay at the shared 22% upward gate; content still on screen remains resolved when direction changes.
4. **Section exit:** copy stays fully readable through partial exit and resets without transition only after it is wholly offscreen. Jamaica atmosphere remains supporting presentation rather than a new claim or route.
5. **Actions and destinations:** the hero targets the About section and the closing action leads to `/contact`. Company/footer fragments, primary navigation, and browser-history return follow the shared rules.
6. **Mobile:** the three principles stack in their authored order, with Jamaica and closing copy following. Nothing requires hover, radial layout, tabs, or disclosure.
7. **Reduced motion and no JavaScript:** all identity, principles, Jamaica copy, and actions remain visible in normal flow without entrance animation.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

**Decision:** the hero opens directly with its headline; the following content section does the same, without redundant route or section labels.

**Decision:** Team and Insights remain visible footer text without links until destinations and content are supplied.

Reuses: SiteHeader, SiteFooter, ActionLink, Reveal, animationLifecycle and scrollFrame.


## Artwork and motion implementation

- Hero: `company-radar.png` and its pulse overlay move together in their original 1672 x 941 coordinate system. Both retain responsive alignment and static framing behind the original left-aligned text and contrast overlay. The network image receives the hero preload. Waves run for 6.8 seconds, the sweep for 8.5 seconds; they pause offscreen and in hidden documents. The static map and guide rings remain without JavaScript or with reduced motion. The Discover action remains visible at 1366 x 768.
- About: three equal outlined, unnumbered principles. A Company-local controller uses native sticky positioning and shared `scrollFrame` events, without scroll interception or a new dependency. The scene's natural height determines its sticky top (`viewport height - scene height`); the outer track adds exactly `2.5 * (viewport height - measured header height)`. Progress comes from that track, never the pinned artwork. Brain holds at 0–12%, brain→gear runs at 12–42%, gear holds at 42–58%, gear→bulb runs at 58–88%, and bulb holds at 88–100%. Transitions use smoothstep interpolation and seeded spatial correspondence, so reverse scrolling and fast jumps restore the same geometry.
- When the compact scene cannot fit below the header, the pointer is coarse, the viewport is narrow/short, motion is reduced, JavaScript is absent, or the canvas is unavailable/lost, About stays in normal flow without added scroll distance. Animated normal-flow progress retains `(0.85 * viewport height - artwork top) / (artwork height + 0.60 * viewport height)`, clamped to 0–1. Geometry resynchronizes for scene/header resizing, fonts, restored scroll, fragments and motion-preference changes. All local subscriptions are disposed on unmount.
- On tall screens the full composition resolves its entrance when the hold starts, even if a principle remains below the shared 78% Reveal gate. Shared Reveal behavior is unchanged elsewhere. Company opts out of browser scroll anchoring so hydration cannot shift a restored position by the added track distance. A fresh direct fragment is aligned after track sizing and font loading; reload/history positions are preserved, and user input cancels pending initial alignment.
- Particle appearance retains the supplied dual-color settings: 1,800 desktop particles, flow 2, flow speed 1.35, drift 0.5, depth 1, size 1.9, back #ff0a0a and front #470000. Density falls to 1,200 on tablet and 900 on mobile. Timed cycling and response lag are replaced by direct scroll progress; bounded ambient flow remains.
- Frames run at approximately 30 Hz only while visible. Canvas DPR is capped at 1.75 and each backing dimension at 1,200px. Layout/scroll, initial load, fragments, page restoration, resizing and visibility changes synchronize progress. Observers, listeners and frames are disposed on unmount.
- A supplied-geometry static particle SVG remains visible with no JavaScript, reduced motion, unavailable canvas or a lost context. Runtime motion preference changes switch between it and the canvas.
- Jamaica: `company-tecnology.png` with its island focal point to the right on desktop. The four informational statements use the supplied target, Jamaica, proprietary-technology and world icons; they have no interaction semantics.
- Closing: `company-hero.png` is static cover artwork with lazy loading and no preload. The original section sizing, copy, Reveal behavior and Contact destination remain intact.
- Decorative artwork has empty alternatives, is excluded from the accessibility tree and cannot receive keyboard focus. No new dependency or shared API change.

## Verification evidence

The final Company suite passed 38 Chromium tests serially, with four desktop-only checks skipped on tablet/mobile. Coverage includes full-composition stationarity across both transitions, reverse scroll, fast jumps, final hold and release; measured-fit fallback; canvas failure/context loss; preference changes; no JavaScript; navigation, fragments and restoration; lifecycle suspension and unmount cleanup; image decoding, hero preload and overlay alignment. Relevant navigation checks passed, including a serial rerun of a tablet Products active-route check that initially differed by 4px. Lint, typecheck, production build and whitespace checks passed. Logs are under `artifacts/company-sequence/logs/`.

Earlier reference captures remain in `.impeccable/review/company/`. Current captures and an entry-through-release recording are under `artifacts/company-sequence/`; the 1440 x 900 desktop and 1366 x 768 laptop use matching viewports for every hold and transition. Viewport captures do not scroll a locator into view, which would change the state being documented.

Evidence limits: Chromium emulation rather than physical devices or Safari/Firefox. The 200% check uses the equivalent CSS viewport, not native browser zoom. Hidden-tab behavior is tested with a synthetic document-visibility signal. This is focused visual/accessibility review, not a complete WCAG audit.

The explicit Impeccable detector reports palette advisories for supplied animation colors and type advisories for the existing responsive sizes, including the approved compact 22px principle headings. Project-wide stale generated design metadata remains outside this task.
