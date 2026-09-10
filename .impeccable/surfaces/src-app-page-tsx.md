---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Surface brief — Home (`/`)

## Job and audience

A buyer, partner or press contact who arrives knowing the name and little else. They need to establish what kind of company this is before they can decide where to go next. Visitor mode: **Persuade**.

## Outcome and proof

**Primary task:** leave with one relevant next step — a product, a tailored engagement, the evidence, or contact.

**Success:** a click into Products, Solutions, Work or Contact. Not time on page.

**Proof carried here:** the Liguanea case study and the three named clients. Nothing else is claimed on this route.

## Selected direction

Five sections, one argument each, each sized to a viewport:

1. **Hero** — the Product + Solutions proposition. Action: *Explore what we build* → `#home-build`.
2. **What we build** — the two paths side by side: two independent products, four tailored offerings. Actions: each product → its Products anchor; *Explore Solutions* → `/solutions`.
3. **Experience** — capability grounded in the supermarket case and the named clients. Actions: *View case study* → `/work#work-cases`; *Explore our work* → `/work`.
4. **Company, built in Jamaica** — origin related to capability, three supporting principles. Action: *About CrimsonTide* → `/company#company-about`.
5. **Closing** — the invitation, after the explanation and the evidence. Action: *Contact CrimsonTide* → `/contact`.

**Focal moment:** the hero's full-height mesh field, with the headline's closing period in crimson — the first and quietest appearance of the company's colour.

## Scope and boundaries

Product panels precede the solutions panel; products and solutions are not presented as peers of equal weight. The case illustration precedes its copy and is illustration, not additional evidence.

**Anti-goals:** no undifferentiated capability list; no two competing primary actions inside one section; no feature comparison between OpenJM and Sentinel; no capability implied by the case beyond what it documents.

## States and ranges

Five sections, fixed. No filter, modal, or dismissible region. Headlines wrap to at most three lines at display size; lead copy runs 2–4 lines at 53ch. The case illustration must hold its meaning at one column.

## Interaction and layout

Reading order survives at every width: explanation before action, evidence before invitation. Supporting media may simplify on narrow screens; the argument may not.

Every action is reachable by keyboard and touch with no hover dependency. Reveal, focus, reduced-motion, navigation, fragment, footer, and history behavior follows the shared rules in `DESIGN.md`.

## Ordered experience walkthrough

1. **Initial appearance:** the sticky header and Home hero are immediately readable. The full-height mesh is decorative; its artwork starts at scale `1` and vertical offset `0`. *Explore what we build* targets `#home-build`.
2. **Downward entry:** What we build enters as its introduction, Products panel, then the 80ms-delayed Solutions panel. Experience enters as introduction, warehouse case/media, then named-client proof. Company enters as its copy, three 80ms-staggered principles, then action. The closing invitation enters as one group. Each group uses the shared 78% downward gate.
3. **Upward re-entry:** every fully exited Reveal group resets offscreen and replays at the shared 22% upward gate. Direction changes while a group remains visible do not replay it. The hero artwork is separate: its scale and vertical offset continuously return toward their starting values as the page scrolls back to the top.
4. **Section exit and media lifecycle:** revealed copy remains opaque while any part is in the viewport, then resets without an exit fade. The warehouse video and decorative Jamaica/footer canvases pause outside their observed area or while the document is hidden and resume on return; they do not rewind because the user reversed direction. Video failure leaves its poster and unavailable status.
5. **Actions and destinations:** product actions lead to `/products#products-openjm` and `/products#products-sentinel`; solutions to `/solutions`; evidence to `/work#work-cases` and `/work`; company to `/company#company-about`; closing to `/contact`. Shared header, footer, fragment, and history rules apply throughout.
6. **Mobile:** the argument keeps the same order in one-column layouts, the header uses its disclosure menu, and media may simplify without removing copy or actions. Touch has no required hover state.
7. **Reduced motion and no JavaScript:** Reveal content is static and visible, hero scroll transforms remain at their starting values, and ambient media uses its static/poster treatment. Without JavaScript, all copy and actions remain in normal document flow.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

The four outbound destinations (`/solutions`, `/work`, `/company`, `/contact`) are implemented routes. Home retains these destinations rather than replacing them with local anchors.

Reuses: SiteHeader, SiteFooter, SectionLabel, ActionLink, Reveal.
