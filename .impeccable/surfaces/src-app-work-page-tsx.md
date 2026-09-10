---
version: 1
slug: "src-app-work-page-tsx"
primary_target: "src/app/work/page.tsx"
related_targets: []
---

# Surface brief — Work & Credibility (`/work`)

**Status: implemented.** The route includes the documented case, five sector descriptions, three client entries, and the closing invitation. Visual refinement remains separate work.

## Job and audience

Someone assessing whether CrimsonTide has actually delivered anything, and whether what it delivered is relevant to their sector. Often the most sceptical visitor on the site, and frequently the one who decides. Visitor mode: **Persuade**.

## Outcome and proof

**Primary task:** understand the evidence *and its limits*, then move to solutions or contact.

**Success:** an enquiry that references a sector or the case.

**Proof carried here:** the Liguanea case study, five sectors of relevance, and the three named clients. This is the whole of it.

## Selected direction

1. **Hero** — invites inspection rather than asserting a track record. Action: *View case studies* → `#work-cases`.
2. **Case studies** — General Food Supermarket: context → technology → objectives, in that order. No redundant case action: the full documented case is already present on this route.
3. **Industries** — five areas of sector relevance. Retail connects explicitly to the case. Action: *Explore solutions for your sector* → `/solutions`.
4. **Clients & Partnerships** — the named clients alongside the documented case.
5. **Closing** — Action: *Contact CrimsonTide* → `/contact`.

**Focal moment:** the case study's three-part structure, which is the only fully documented piece of evidence the company has and should be given the room to read as substantial.

## Scope and boundaries

The case does not extend past what it documents: AI-enabled camera technology across operational areas including cashier zones, with analytical visibility into activity, behaviour and operational patterns, for security, loss prevention, operational visibility and operational decision-making.

**Anti-goals:** no invented metrics, no percentage improvements, no testimonials, no logo wall implying more clients than are named, no illustrated chart that reads as measured data. Sector relevance is not a claim of complete industry coverage.

## States and ranges

One case study. Five sectors. Three clients. The layout must not look broken or padded at those counts — in particular, a design that needs six sectors or four cases to balance is the wrong design.

## Interaction and layout

No filter, carousel, expanded-case dialog, or hidden proof detail. Everything is present in the page.

A sticky case index, if used, becomes static and sits before the case details on smaller screens. Labels and proof stay readable without hover.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

**Decision:** no dedicated case route or *Explore the case* action is introduced in this phase. The documented case remains fully readable in place.

**Decision:** General Food Supermarket is presented as the documented retail case. Guardsman Group and Beryllium remain named client relationships without unsupported project detail.

Reuses: SiteHeader, SiteFooter, SectionLabel, ActionLink, Reveal, CaseIllustration.
