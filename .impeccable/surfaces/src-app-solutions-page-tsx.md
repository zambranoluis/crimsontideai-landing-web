---
version: 1
slug: "src-app-solutions-page-tsx"
primary_target: "src/app/solutions/page.tsx"
related_targets:
  - "src/app/solutions/_sections"
  - "src/app/solutions/_components"
---

# Surface brief — AI Solutions (`/solutions`)

**Status: implemented.** The route opens with the Earth invitation, continues through five engagement and proof sections, and closes with the supplied solutions hero.

## Job and audience

An organisation with an objective or a workflow problem rather than a product shortlist. They want to know whether CrimsonTide can take their situation and build something around it — and what that engagement actually looks like. Visitor mode: **Persuade**.

## Outcome and proof

**Primary task:** reach Contact carrying context — knowing roughly what kind of engagement they are asking for.

**Success:** a contact enquiry that names an objective.

**Proof carried here:** the Liguanea case and the named clients, used to support *implementation capability*, not to imply the same solution.

## Selected direction

Seven sections. The opening Earth invitation frames the goal; the middle five explain an engagement as a sequence rather than a menu; the supplied hero closes the route.

1. **Earth opening** — “Tell us what you want to achieve. Let's build the path to make it possible.” introduces tailored AI work through the supplied space, planet, and glow composition. Action: *Discuss an AI solution* → `/contact`.
2. **Problems & Opportunities** — the three shapes a request takes: a challenge, a process to improve, a new capability to build.
3. **Process** — discover → design → prototype and validate → implement and integrate → evolve. A practical sequence shown as an ascending path on wide screens and a vertical ordered sequence below 1024px.
4. **Built Around Your Context** — objective → environment → solution. An ordered narrative, deliberately not a wizard or a configurator. The triangle hologram visualises their relationship without hiding the explanatory copy.
5. **From Concept to Real Use** — build → connect → put into use. Decorative scroll progression through ordered steps; this never reports business completion status.
6. **Experience** — case and clients supporting implementation intent. Action → `/work#work-cases`.
7. **Closing hero** — “Artificial intelligence designed around your objectives.” and the supplied `solution-hero.png` close the route with the same contact action.

**Focal moments:** the opening Earth composition, the ascending five-step process, the objective/environment/solution hologram, and the three-step delivery journey where the connectors carry the reading direction.

## Scope and boundaries

The four offering labels used elsewhere in the site — AI Solutions, Custom Software Development, Product Customisation, Integrations & Deployments — are **facets of this one route**, not four service pages. A builder must not expand them into separate routes.

**Anti-goals:** no pricing, no engagement-length estimate, no team-size claim, no methodology branding, no capability implied beyond what a named project supports.

## States and ranges

Three items in section 2, five in section 3, three in section 4, and three in section 5 — fixed. Copy stays comfortably readable. Process and delivery steps must remain readable when their wide-screen connectors disappear.

## Interaction and layout

Below 1200px the process introduction sits above its steps. Below 1024px the process becomes a vertical reading order and the staircase treatment is dropped. The context diagram sits above its information panels on tablet and the panels stack on mobile. No local form and no modal — interruption and return are handled by the shared header.

The hologram lifecycle observes its root (diagram plus panels) with zero margin, rather than the whole section or only its canvas; ambient work requires intersection and document visibility. Reduced motion receives a still composition, and the full objective, environment, and solution copy remains in server-rendered HTML without JavaScript.

All exits are links; nothing depends on hover.

Reveal, focus, reduced-motion, navigation, fragment, footer, and history behavior follows the shared rules in `DESIGN.md`.

## Ordered experience walkthrough

1. **Initial appearance:** the Earth opening is immediately readable; its `h1` is the route's sole page heading, and *Discuss an AI solution* links to `/contact` without preselecting a topic.
2. **Downward entry:** Problems & Opportunities enters as an introduction followed by challenge, process, and capability groups. The five-step Process follows, then Built Around Your Context with objective, environment, and solution. From Concept to Real Use follows with build, connect, and put into use. Experience then enters as introduction, featured retail case, named clients, and finally the closing invitation. Shared groups use Reveal; Process and Delivery have the route-owned entrance rules below.
3. **Upward re-entry:** groups that fully exited replay in reverse reading travel at the shared 22% gate. Connectors and ordering do not become a completion indicator, and changing direction while content remains visible does not restart it.
4. **Section exit:** each group stays fully opaque until complete viewport exit, then resets offscreen without an exit transition. Delivery reverses its local progression with scroll; reduced-motion and server output remain complete static compositions.
5. **Actions and destinations:** the Earth opening and closing hero actions lead to `/contact`; the featured case links to `/work#work-cases`. Header/footer links, direct fragments, and browser-history return use the shared route rules.
6. **Mobile:** opportunities, process steps, context panels, delivery steps, and proof become vertical reading sequences. Copy, labels, proof, and actions remain present without hover or a local form.
7. **Reduced motion and no JavaScript:** the Earth opening remains a complete static composition; all groups are visible in normal flow with no entrance transitions; the context mesh is still, and content and destinations are unchanged.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

**Decision:** the Contact route does not preselect a topic. This route links to Contact without adding a query parameter or other hand-off mechanism.

Reuses: SiteHeader, SiteFooter, ActionLink, Reveal.

## Route-owned modes and interaction

- **Earth:** mode selection measures copy, scene padding, artwork margin and a 160px art minimum below the measured header. With motion allowed and at least 208px usable height, it tries `pinned`, then `compact-pinned` with tighter spacing, then `artwork-only`. Full/compact modes hold the complete composition in a track twice the usable viewport height; artwork-only lets copy flow before an independently held art track of the same length. Less space or reduced motion selects `static`; no JavaScript uses the complete CSS composition with full glow. There is no fine-pointer or desktop-width gate. Glow and atmosphere derive directly from outer-track progress over 0.85 usable viewport heights, so reverse scrolling retraces the light without a timer. Resizing, fonts, header geometry and history resynchronize it. Copy stays stationary during a full-scene hold.
- **Process:** from 1024px, all five steps enter as one group with 0/40/80/120/160ms delays. Below 1024px, steps enter individually with zero delay. The local controller uses the shared 78% down/22% up gates, complete-exit reset, focus visibility, reduced-motion and no-JavaScript readability. Resize resolves the newly selected layout without hiding visible content.
- **Context terrain:** “Interact with the solution terrain” is a real button. Non-touch pointer movement creates bounded local terrain/parallax response; leaving eases it back. Click/tap adds a 900ms ripple, at most three; Enter/Space activates at the center. Reduced-motion activation gives a brief static highlight instead of a ripple. Suspension clears interaction and freezes elapsed time; no JavaScript or unavailable canvas leaves the SVG composition and all three text panels. The artwork is illustrative, not a configuration tool.
- **Delivery:** sticky progression requires at least 1024px width, 700px height, a fine pointer and allowed motion. Build, Connect and Put into Use progress across 4–28%, 34–58% and 64–88%; the route line finishes by 88% and its arrow at 90–100%. Each stage sequences its node, visual, connector and text. Reverse travel restores earlier values. Other animated viewports use normal flow with individual stages progressing from their viewport entry toward the 50% line. Reduced motion and no JavaScript show all three stages complete without additional pin distance. Ambient stage artwork separately observes each artwork wrapper; offscreen boundaries avoid repeated equivalent writes. All resize, scroll and lifecycle subscriptions are cleaned up on unmount.

Exact opening, Delivery and closing paragraphs are inventoried in `docs/content.md`; decorative progress conveys reading order, never project delivery or completion status.
