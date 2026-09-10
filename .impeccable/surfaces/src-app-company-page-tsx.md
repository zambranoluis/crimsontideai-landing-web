---
version: 1
slug: "src-app-company-page-tsx"
primary_target: "src/app/company/page.tsx"
related_targets: []
---

# Surface brief — Company (`/company`)

**Status: implemented.** The route includes the hero, company principles, Jamaica section, and closing invitation. Visual refinement may improve their presentation without changing the route structure or claims.

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

**Focal moment:** the Jamaica section, which has to carry origin as substance. It is the one place on the site where atmosphere is doing argumentative work, and the one most likely to slip into decoration.

## Scope and boundaries

Jamaica media is atmospheric. **Test:** remove every image from this section and the proposition must still stand. If it doesn't, the section is relying on scenery.

**Anti-goals:** no team grid, no founder photography, no timeline of milestones, no press logos, no office imagery presented as scale, no flags or tourism imagery. *Team* and *Insights* appear as footer labels but have no content and must not be invented to fill the page.

## States and ranges

Three principles, fixed. One origin section. The layout must not require a fourth principle for balance.

## Interaction and layout

Narrow screens keep the text and the three principles without requiring radial geometry or hover. No tabs, no dialogs, no accordion hiding the principles.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

**Decision:** the hero eyebrow is *Company*; the following content section uses *About CrimsonTide*.

**Decision:** Team and Insights remain visible footer text without links until destinations and content are supplied.

Reuses: SiteHeader, SiteFooter, SectionLabel, ActionLink, Reveal.
