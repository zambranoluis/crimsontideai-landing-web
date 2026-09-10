---
version: 1
slug: "src-app-solutions-page-tsx"
primary_target: "src/app/solutions/page.tsx"
related_targets: []
---

# Surface brief — AI Solutions (`/solutions`)

**Status: implemented.** The route includes all seven sections, the five-step delivery process, the two three-part engagement narratives, the Liguanea case summary, named clients, and the contact exits.

## Job and audience

An organisation with an objective or a workflow problem rather than a product shortlist. They want to know whether CrimsonTide can take their situation and build something around it — and what that engagement actually looks like. Visitor mode: **Persuade**.

## Outcome and proof

**Primary task:** reach Contact carrying context — knowing roughly what kind of engagement they are asking for.

**Success:** a contact enquiry that names an objective.

**Proof carried here:** the Liguanea case and the named clients, used to support *implementation capability*, not to imply the same solution.

## Selected direction

Seven sections. The middle four are the substance: they explain an engagement as a sequence rather than a menu.

1. **Hero** — tailored AI work introduced. Action: *Discuss an AI solution* → `/contact`.
2. **Problems & Opportunities** — the three shapes a request takes: a challenge, a process to improve, a new capability to build.
3. **Process** — discover → design → prototype and validate → implement and integrate → evolve. A practical sequence shown as an ascending path on wide screens and a vertical ordered sequence below 1024px.
4. **Built Around Your Context** — objective → environment → solution. An ordered narrative, deliberately not a wizard or a configurator. The triangle hologram visualises their relationship without hiding the explanatory copy.
5. **From Concept to Real Use** — build → connect → put into use. Ordered steps, not completion states; nothing here is a progress indicator.
6. **Experience** — case and clients supporting implementation intent. Action → `/work#work-cases`.
7. **Closing** — Action: *Discuss an AI solution* → `/contact`.

**Focal moments:** the ascending five-step process, the objective/environment/solution hologram, and the three-step delivery journey where the connectors carry the reading direction.

## Scope and boundaries

The four offering labels used elsewhere in the site — AI Solutions, Custom Software Development, Product Customisation, Integrations & Deployments — are **facets of this one route**, not four service pages. A builder must not expand them into separate routes.

**Anti-goals:** no pricing, no engagement-length estimate, no team-size claim, no methodology branding, no capability implied beyond what a named project supports.

## States and ranges

Three items in section 2, five in section 3, three in section 4, and three in section 5 — fixed. Copy stays comfortably readable. Process and delivery steps must remain readable when their wide-screen connectors disappear.

## Interaction and layout

Below 1200px the process introduction sits above its steps. Below 1024px the process becomes a vertical reading order and the staircase treatment is dropped. The context diagram sits above its information panels on tablet and the panels stack on mobile. No local form and no modal — interruption and return are handled by the shared header.

The hologram animation runs only while its section is near the viewport and the document is visible. Reduced motion receives a still composition, and the full objective, environment, and solution copy remains in server-rendered HTML without JavaScript.

All exits are links; nothing depends on hover.

Reveal, focus, reduced-motion, navigation, fragment, footer, and history behavior follows the shared rules in `DESIGN.md`.

## Ordered experience walkthrough

1. **Initial appearance:** the hero is immediately readable and *Discuss an AI solution* links to `/contact` without preselecting a topic.
2. **Downward entry:** Problems & Opportunities enters as an introduction followed by challenge, process, and capability groups. The five-step Process follows, then Built Around Your Context with objective, environment, and solution. From Concept to Real Use follows with build, connect, and put into use. Experience then enters as introduction, featured retail case, named clients, and finally the closing invitation. Staggered groups use the shared reveal behavior.
3. **Upward re-entry:** groups that fully exited replay in reverse reading travel at the shared 22% gate. Connectors and ordering do not become a completion indicator, and changing direction while content remains visible does not restart it.
4. **Section exit:** each group stays fully opaque until complete viewport exit, then resets offscreen without an exit transition. Static regions gain no additional choreography.
5. **Actions and destinations:** hero and closing actions lead to `/contact`; the featured case links to `/work#work-cases`. Header/footer links, direct fragments, and browser-history return use the shared route rules.
6. **Mobile:** opportunities, process steps, context panels, delivery steps, and proof become vertical reading sequences. Copy, labels, proof, and actions remain present without hover or a local form.
7. **Reduced motion and no JavaScript:** all groups are visible in normal flow with no entrance transitions; the context mesh is still, and content and destinations are unchanged.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

**Decision:** the Contact route does not preselect a topic. This route links to Contact without adding a query parameter or other hand-off mechanism.

Reuses: SiteHeader, SiteFooter, ActionLink, Reveal.
