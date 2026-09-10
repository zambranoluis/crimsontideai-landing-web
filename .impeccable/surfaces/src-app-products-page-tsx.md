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

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

**Decision:** the two product exits open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`, keeping the corporate site available as the return point.

There is no closing section on this route. Whether one belongs — and whether it would compete with the two product actions — is undecided.

Reuses: SiteHeader, SiteFooter, SectionLabel, ActionLink, Reveal, ProductMotion.
