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

Every action is reachable by keyboard and touch with no hover dependency. Sections reveal on scroll; anything focused resolves immediately, and the whole reveal is disabled under reduced motion. Content already visible on load, and content scrolled past, stays resolved.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

Four of the five outbound destinations (`/solutions`, `/work`, `/company`, `/contact`) do not exist yet. Home links to them as intended destinations; a builder must not silently retarget them to anchors on this page to avoid the dead end.

Reuses: SiteHeader, SiteFooter, SectionLabel, ActionLink, Reveal.
