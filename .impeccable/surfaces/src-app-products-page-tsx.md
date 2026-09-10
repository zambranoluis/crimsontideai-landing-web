---
version: 1
slug: "src-app-products-page-tsx"
primary_target: "src/app/products/page.tsx"
related_targets: []
---

# Surface brief — Products (`/products`)

## Job and audience

Someone who has understood that CrimsonTide ships products and now needs to work out which one addresses their problem. They may arrive from Home, from the header, or on a direct anchor to one product. Visitor mode: **Persuade**.

## Outcome and proof

**Primary task:** reach the right product's own site — `https://openjm.ai` or `https://crimsontide.app`.

**Secondary outcome:** recognising that neither product fits, and using corporate navigation to raise a tailored enquiry instead.

**Success:** an outbound click to the correct product.

## Selected direction

Two separate showcases, not a comparison table. The products solve different problems for different people; a table would invite the reader to rank them.

1. **Hero** — frames two distinct product contexts. Action: *Explore our products* → `#products-openjm`.
2. **OpenJM** — conversational work, three supporting points, origin and availability. Preview illustration. Action → `https://openjm.ai`.
3. **Sentinel** — computer vision, three supporting points, deployment context. Preview illustration. Action → `https://crimsontide.app`.

The two showcases are deliberately **not mirrored**. OpenJM's supporting points sit as a vertical list inside its copy column; Sentinel's form a three-column row beneath its copy and preview. Different information, different arrangement.

**Focal moment:** the two product dots — Signal Blue for OpenJM, Crimson for Sentinel — which are the only place in the site where the two brands are colour-coded against each other.

## Scope and boundaries

**Untouched:** the product sites themselves. This route explains and hands off; it does not host registration, demo booking, pricing, model catalogues or documentation.

**Anti-goals:** no tiering language ("basic / advanced"); no shared functional narrative forced between the two; no feature matrix; no claim that a preview is live software.

## States and ranges

Previews are illustrative and `aria-hidden`. Their sample labels, metrics and chart data are composition, not readings, and must never be mistaken for capability claims or made to look live.

Three supporting points per product, fixed. Main regions stack below 1024px; Sentinel's points collapse to one column below 768px.

Reading order at narrow widths — OpenJM: copy including points → preview → note and action. Sentinel: copy → preview → points → note and action.

## Interaction and layout

Pointer effects (tilt, parallax) add nothing a touch or keyboard user loses. Illustration activity pauses outside the viewport, while the document is hidden, and under reduced motion.

Both outbound actions are ordinary links. Whether they open in a new tab is an open decision below.

Reveal, focus, reduced-motion, navigation, fragment, footer, and history behavior follows the shared rules in `DESIGN.md`.

## Ordered experience walkthrough

1. **Initial appearance:** the hero copy is immediately readable over static decorative mesh and links to `#products-openjm`. A direct OpenJM or Sentinel fragment lands with its heading clear of the sticky header and visible even when the jump skips a Reveal threshold.
2. **Downward entry:** OpenJM introduction and description enter first. On eligible desktop viewports, its preview sticks below the measured header while three feature steps enter and activate in order as their centres cross the usable viewport midpoint. Sentinel repeats the three-step reading progression with its own preview and layout. Reveal groups use the shared 78% downward gate.
3. **Upward re-entry and reverse progression:** fully exited copy groups replay at the shared 22% upward gate. The active product step and preview state move `2 → 1 → 0` as the reader scrolls back; a visible Reveal group does not restart merely because direction changed.
4. **Section exit and artwork lifecycle:** the sticky preview releases inside its showcase before the outbound action and cannot overlap the next region. Product canvases and chart loops pause outside the viewport or while the document is hidden and resume without rewinding on return.
5. **Actions and destinations:** *Explore OpenJM* opens `https://openjm.ai`; *Explore Sentinel* opens `https://crimsontide.app`. Both use a new tab with `noopener noreferrer`. Corporate header and footer destinations remain available, and browser back/forward restores the prior route, scroll position, active step, and visible groups.
6. **Mobile and static fallback:** below 1024px, below 700px height, on non-fine pointers, or under reduced motion, sticky scene control is disabled. The completed preview appears in normal flow before all three readable features; no feature is hidden behind scene state.
7. **Reduced motion and no JavaScript:** previews use completed static states, illustration motion stops, and every Reveal group is visible without transition. No-JavaScript output keeps hero, product copy, previews, feature lists, and exits readable in document order.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

**Decision:** the two product exits open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`, keeping the corporate site available as the return point.

There is no closing section on this route. This is deliberate: a third action would compete with the two product exits.

Reuses: SiteHeader, SiteFooter, SectionLabel, ActionLink, Reveal, ProductMotion.
