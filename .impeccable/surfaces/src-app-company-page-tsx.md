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

**Focal motion:** About moves continuously from brain to gear to bulb with the reader's scroll, while Jamaica carries origin through the supplied map. The closing radar supports the invitation; neither map implies deployed infrastructure.

## Scope and boundaries

Jamaica media is atmospheric. **Test:** remove every image from this section and the proposition must still stand. If it doesn't, the section is relying on scenery.

**Anti-goals:** no team grid, no founder photography, no timeline of milestones, no press logos, no office imagery presented as scale, no flags or tourism imagery. *Team* and *Insights* appear as footer labels but have no content and must not be invented to fill the page.

## States and ranges

Three principles, fixed. One origin section. The layout must not require a fourth principle for balance.

## Interaction and layout

About copy, particles and principles stack through 900px. Jamaica statements use four columns on desktop, two through 1023px, and one below 360px. Below 768px the Jamaica map and closing radar occupy their own space clear of copy. No tabs, dialogs, hover dependency or hidden principle content.

Reveal, focus, reduced-motion, navigation, fragment, footer, and history behavior follows the shared rules in `DESIGN.md`.

## Ordered experience walkthrough

1. **Initial appearance:** the hero is immediately readable and *Discover CrimsonTide* targets `#company-about` below the sticky header.
2. **Downward entry:** About CrimsonTide enters as one introduction followed by three principles at 0/80/160ms delays. Built in Jamaica then enters as one copy group, followed by the closing invitation. The shared 78% downward gate governs each group.
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

- Hero: full-width `company-hero.png`, static cover framing, left-aligned text and dark contrast overlay. The Discover action is visible at 1366 x 768.
- About: three equal outlined, unnumbered principles. The normal-flow canvas follows `(0.85 * viewport height - artwork top) / (artwork height + 0.60 * viewport height)`, clamped to 0-1. Brain holds through 5%; gear holds at 45-55%; bulb holds from 95%. Transitions use smoothstep interpolation and seeded spatial correspondence, so reverse scrolling restores the same geometry. Prototype path names were corrected to match their silhouettes.
- Particle appearance retains the supplied dual-color settings: 1,800 desktop particles, flow 2, flow speed 1.35, drift 0.5, depth 1, size 1.9, back #ff0a0a and front #470000. Density falls to 1,200 on tablet and 900 on mobile. Timed cycling and response lag are replaced by direct scroll progress; bounded ambient flow remains.
- Frames run at approximately 30 Hz only while visible. Canvas DPR is capped at 1.75 and each backing dimension at 1,200px. Layout/scroll, initial load, fragments, page restoration, resizing and visibility changes synchronize progress. Observers, listeners and frames are disposed on unmount.
- A supplied-geometry static particle SVG remains visible with no JavaScript, reduced motion, unavailable canvas or a lost context. Runtime motion preference changes switch between it and the canvas.
- Jamaica: `company-tecnology.png` with its island focal point to the right on desktop. The four informational statements use the supplied target, Jamaica, proprietary-technology and world icons; they have no interaction semantics.
- Closing: extracted `company-radar.png` and the original 1672 x 941 overlay coordinate system share one scaling container. Waves run for 6.8 seconds, the sweep for 8.5 seconds. CSS transform/opacity animation pauses offscreen and in hidden documents; static map and guide rings remain without JavaScript or with reduced motion.
- Decorative artwork has empty alternatives, is excluded from the accessibility tree and cannot receive keyboard focus. No new dependency or shared API change.

## Verification evidence

24 Company Chromium checks passed serially on port 3001 across desktop, tablet and mobile. Lint, typecheck, production build and diff whitespace checks passed. Coverage includes shape endpoints and reversal, fast jumps, unclipped silhouettes, resizing, initial fragments, history restoration, lifecycle suspension, runtime preferences, canvas fallback, no JavaScript, keyboard actions, menu navigation, reveal re-entry, unmount cleanup, radar alignment, throttled image decoding and overflow.

Full-page and section screenshots are in `.impeccable/review/company/`, including 1440px desktop, 768px tablet, 393px mobile, 320px narrow, 1366 x 768 laptop and 640 x 400 zoom-equivalent layouts. Static full-page captures use reduced motion; particle endpoint captures use the rendered canvas without scrolling it to take a screenshot.

Evidence limits: Chromium emulation rather than physical devices or Safari/Firefox. The 200% check uses the equivalent CSS viewport, not native browser zoom. Hidden-tab behavior is tested with a synthetic document-visibility signal. This is focused visual/accessibility review, not a complete WCAG audit.

The Impeccable detector ran once. Its palette advisories reflect supplied animation colors; type advisories include existing responsive sizes. Project-wide stale generated metadata and the unset build-path preference remain outside this task. Review and documentation used the inline fallback workflow because subagents are unavailable.
