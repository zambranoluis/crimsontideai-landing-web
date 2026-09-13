---
version: 1
slug: "src-app-products-page-tsx"
primary_target: "src/app/products/page.tsx"
related_targets:
  - "src/app/products/_sections"
  - "src/app/products/_components"
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

1. **Hero** — a static supplied `hero.png` composition frames two distinct product contexts. Action: *Explore our products* → `#products-openjm`.
2. **OpenJM** — conversational work, three supporting points, origin and availability. Preview illustration. Action → `https://openjm.ai`.
3. **Sentinel** — computer vision, three supporting points, deployment context. Preview illustration. Action → `https://crimsontide.app`.

The two showcases use the same mirrored reading system: introduction, preview, three ordered supporting points, then the product note and outbound action. OpenJM and Sentinel retain their own copy, wordmarks, preview artwork, and assigned accent treatment; the shared sequence is not a feature comparison.

**Focal moment:** distinct product wordmarks and illustrative previews within mirrored desktop showcases. No product-dot legend is displayed.

## Scope and boundaries

**Untouched:** the product sites themselves. This route explains and hands off; it does not host registration, demo booking, pricing, model catalogues or documentation.

**Anti-goals:** no tiering language ("basic / advanced"); no shared functional narrative forced between the two; no feature matrix; no claim that a preview is live software.

## States and ranges

Previews are illustrative and `aria-hidden`. Their sample labels, metrics and chart data are composition, not readings, and must never be mistaken for capability claims or made to look live.

Three supporting points per product, fixed. Main regions stack below 1024px. Both feature lists are ordered vertical sequences.

Reading order at narrow widths for both products: introduction → preview → three features → note and action. At 1024px and above, OpenJM places introduction/features left and preview right; Sentinel mirrors those columns. This desktop layout remains when sticky motion is disabled.

## Interaction and layout

Pointer effects (tilt, parallax) add nothing a touch or keyboard user loses. Illustration activity pauses outside the viewport, while the document is hidden, and under reduced motion.

Both outbound actions open new tabs with `noopener noreferrer`; configured destinations do not establish external availability.

Reveal, focus, reduced-motion, navigation, fragment, footer, and history behavior follows the shared rules in `DESIGN.md`.

## Ordered experience walkthrough

1. **Initial appearance:** the static supplied hero image and copy are immediately readable and link to `#products-openjm`. A direct OpenJM or Sentinel fragment lands with its heading clear of the sticky header and visible even when the jump skips a Reveal threshold.
2. **Downward entry:** OpenJM introduction and description enter first. On eligible desktop viewports, its preview sticks below the measured header while three feature steps enter and activate in order as their centres cross the usable viewport midpoint. Sentinel repeats the three-step reading progression with its own preview and layout. Reveal groups use the shared 78% downward gate.
3. **Upward re-entry and reverse progression:** fully exited copy groups replay at the shared 22% upward gate. The active product step and preview state move `2 → 1 → 0` as the reader scrolls back; a visible Reveal group does not restart merely because direction changed.
4. **Section exit and artwork lifecycle:** the sticky preview releases inside its showcase before the outbound action and cannot overlap the next region. Product canvases and chart loops pause outside the viewport or while the document is hidden and resume without rewinding on return.
5. **Actions and destinations:** *Explore OpenJM* opens `https://openjm.ai`; *Explore Sentinel* opens `https://crimsontide.app`. Both use a new tab with `noopener noreferrer`. Corporate header and footer destinations remain available, and ordinary non-fragment browser history is intended to restore the prior reading position, with scene state derived from that viewport. Direct product-fragment history can return to the native anchor itself; it is not proof of arbitrary midpoint restoration. See the shared navigation evidence limits.
6. **Mobile and static fallback:** below 1024px, below 700px height, on non-fine pointers, or under reduced motion, sticky scene control is disabled. At narrow widths the completed preview appears in normal flow before all three readable features; at desktop width the mirrored columns remain; no feature is hidden behind scene state.
7. **Reduced motion and no JavaScript:** previews use completed static states, illustration motion stops, and every Reveal group is visible without transition. No-JavaScript output keeps hero, product copy, previews, feature lists, and exits readable in document order.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

**Decision:** the two product exits open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`, keeping the corporate site available as the return point.

There is no closing section on this route. This is deliberate: a third action would compete with the two product exits.

Reuses: SiteHeader, SiteFooter, ActionLink, Reveal, ProductMotion.
