---
version: 1
slug: "src-app-solutions-page-tsx"
primary_target: "src/app/solutions/page.tsx"
related_targets: []
---

# Surface brief — AI Solutions (`/solutions`)

**Status: implemented.** The route includes all six sections, the three engagement narratives, the Liguanea case summary, named clients, and the contact exits. Visual refinement remains separate work.

## Job and audience

An organisation with an objective or a workflow problem rather than a product shortlist. They want to know whether CrimsonTide can take their situation and build something around it — and what that engagement actually looks like. Visitor mode: **Persuade**.

## Outcome and proof

**Primary task:** reach Contact carrying context — knowing roughly what kind of engagement they are asking for.

**Success:** a contact enquiry that names an objective.

**Proof carried here:** the Liguanea case and the named clients, used to support *implementation capability*, not to imply the same solution.

## Selected direction

Six sections. The middle three are the substance: they explain an engagement as a sequence rather than a menu.

1. **Hero** — tailored AI work introduced. Action: *Discuss an AI solution* → `/contact`.
2. **Problems & Opportunities** — the three shapes a request takes: a challenge, a process to improve, a new capability to build.
3. **Built Around Your Context** — objective → environment → solution. An ordered narrative, deliberately not a wizard or a configurator.
4. **From Concept to Real Use** — build → connect → put into use. Ordered steps, not completion states; nothing here is a progress indicator.
5. **Experience** — case and clients supporting implementation intent. Action → `/work#work-cases`.
6. **Closing** — Action: *Discuss an AI solution* → `/contact`.

**Focal moment:** the three-step sequence in section 4, where the connectors between steps carry the reading direction.

## Scope and boundaries

The four offering labels used elsewhere in the site — AI Solutions, Custom Software Development, Product Customisation, Integrations & Deployments — are **facets of this one route**, not four service pages. A builder must not expand them into separate routes.

**Anti-goals:** no pricing, no engagement-length estimate, no team-size claim, no methodology branding, no capability implied beyond what a named project supports.

## States and ranges

Three items in section 2, three in section 3, three in section 4 — fixed. Copy at 53ch. Section 4's steps must remain readable when their connectors disappear.

## Interaction and layout

On narrow screens the step sequence becomes a vertical reading order and the connectors are dropped; the step labels stay. No local form and no modal — interruption and return are handled by the shared header.

All exits are links; nothing depends on hover.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

**Decision:** the Contact route does not preselect a topic. This route links to Contact without adding a query parameter or other hand-off mechanism.

Reuses: SiteHeader, SiteFooter, SectionLabel, ActionLink, Reveal.
