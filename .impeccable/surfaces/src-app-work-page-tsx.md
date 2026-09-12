---
version: 1
slug: "src-app-work-page-tsx"
primary_target: "src/app/work/page.tsx"
related_targets: []
---

# Surface brief — Work & Credibility (`/work`)

**Status: implemented and visually refined.** The route includes the documented case, five illustrated sector panels, a static grid of all 15 supplied relationship marks, an orbit-led hero, and a static closing invitation.

## Job and audience

Someone assessing whether CrimsonTide has actually delivered anything, and whether what it delivered is relevant to their sector. Often the most sceptical visitor on the site, and frequently the one who decides. Visitor mode: **Persuade**.

## Outcome and proof

**Primary task:** understand the evidence *and its limits*, then move to solutions or contact.

**Success:** an enquiry that references a sector or the case.

**Proof carried here:** the Liguanea case study, five sectors of relevance, three confirmed clients, and the supplied set of partner relationship marks. The additional marks do not imply a published project, result, endorsement, or client status.

## Selected direction

1. **Hero** — uses `experience-work.png` as the ocean background, preloaded at high priority. Copy sits left and the orbit sits right on desktop; below 900px the reading order is copy, action, then orbit. Heading typography is preserved. Action: *View case studies* → `#work-cases`.
2. **Case studies** — gives General Food Supermarket one enclosing evidence surface: identity copy sits on the left of a faded storefront banner, followed by equal Context, Applied technology, and Operational objectives columns ordered icon/title → copy → image. The columns begin at 1024px and stack below it. No redundant case action: the full documented case is already present on this route.
3. **Industries** — centres the introduction, then uses the five supplied sector images in five columns from 1200px, three below that, and one below 768px. Each image and gradient sit inside a clipping layer so zoom cannot escape. The layer fades to transparency into the actual card surface in resting and hover states, including the local pointer glow. Crimson icon badges sit outside that clip and cross the image/copy boundary. Retail connects explicitly to the case. The closing context and *Explore solutions for your sector* action form a compact horizontal strip that stacks on mobile.
4. **Clients & Partnerships** — presents all 15 supplied relationship marks in a static, proportion-balanced grid. All tiles share the same fine-pointer background and inset-border hover treatment and timing. Only General Food links to the documented case and receives keyboard focus; other marks remain noninteractive.
5. **Closing** — keeps the invitation left-aligned over `hero.png`, loaded normally, with no orbit column. Action: *Contact CrimsonTide* → `/contact`.

**Focal moment:** the case study's three-part structure, which is the only fully documented piece of evidence the company has and should be given the room to read as substantial.

## Scope and boundaries

The case does not extend past what it documents: AI-enabled camera technology across operational areas including cashier zones, with analytical visibility into activity, behaviour and operational patterns, for security, loss prevention, operational visibility and operational decision-making.

**Anti-goals:** no invented metrics, no percentage improvements, no testimonials, no unsupported destinations or project detail for relationship marks, and no illustrated chart that reads as measured data. Sector relevance is not a claim of complete industry coverage.

## States and ranges

One case study. Five sectors. Fifteen supplied relationship marks, of which three are confirmed clients. The layout must not look broken or padded at those counts. In particular, a design that needs six sectors or four cases to balance is the wrong design.

## Interaction and layout

No filter, carousel, expanded-case dialog, or hidden proof detail. Everything is present in the page. Noninteractive case-detail and sector panels do not receive link affordances. On fine pointers with motion allowed, those panels carry a faint approximately 180px crimson glow local to the pointer; copy never moves. Their badges and hairlines strengthen gently on hover. Pointer state returns to neutral on exit, cancellation, document hiding, reduced-motion changes, and unmount. Touch and reduced-motion modes retain the static fades and badges.

The hero-owned orbit preserves true circular tracks, a central hub, and three useful linked satellites: *Real experience* → `#work-clients`, *Proven in practice* → `#work-cases`, and *Built for what’s next* → `/solutions`. Hover and keyboard focus highlight the associated track. Fine-pointer movement is bounded to the artwork and returns to neutral on exit.

Orbit motion runs only while the artwork intersects the viewport, the document is active, and motion is allowed. It pauses offscreen or in a hidden document and resumes without advancing hidden time. There is no manual pause/resume control or reserved control space. Observers, media listeners, document listeners, and pending animation frames are removed on unmount.

A sticky case index, if used, becomes static and sits before the case details on smaller screens. Labels and proof stay readable without hover.

Reveal, focus, reduced-motion, navigation, fragment, footer, and history behavior follows the shared rules in `DESIGN.md`.

## Ordered experience walkthrough

1. **Initial appearance:** the hero is immediately readable; *View case studies* moves to `#work-cases` below the sticky header.
2. **Downward entry:** Case studies enters as introduction, case identity, banner, Context, Applied technology, and Operational objectives. Industries enters as introduction, five illustrated sector groups in responsive rows with capped staggering, then its solutions action. Clients & Partnerships enters as introduction and a complete static relationship grid, followed by the closing invitation. Each content group uses the shared 78% downward gate.
3. **Upward re-entry:** fully exited case, sector, and client groups replay at the shared 22% upward gate. Their documentary order remains unchanged; visible groups never restart on direction change alone.
4. **Section exit:** evidence remains opaque until its group fully clears the viewport, then resets without an exit transition. There is no collapse, carousel state, or hidden continuation.
5. **Actions and destinations:** the hero, retail panel, General Food mark, and orbit case satellite reach `#work-cases`; the sector action and orbit solutions satellite lead to `/solutions`; the relationship satellite reaches `#work-clients`; the closing action leads to `/contact`. Direct anchors and browser-history return follow the shared rules and resolve destination copy visibly.
6. **Mobile:** case details, sectors, and relationships form one continuous vertical reading order. Below 900px the hero stacks copy, case-study action, then orbit. The closing remains a single left-aligned invitation and contact action. Any desktop connective or column treatment disappears before it can obscure labels or proof.
7. **Reduced motion and no JavaScript:** every case, sector, relationship mark, orbit link, and action remains visible. Orbit tracks and satellites form a complete static composition.

## Constraints and open decisions

Platform: web, English, one locale. WCAG 2.2 AA.

**Decision:** no dedicated case route or *Explore the case* action is introduced in this phase. The documented case remains fully readable in place.

**Decision:** General Food Supermarket is presented as the documented retail case. Guardsman Group and Beryllium remain confirmed client relationships without unsupported project detail. The other supplied marks are presented only as partner relationships.

Reuses: SiteHeader, SiteFooter, ActionLink, Reveal. Route-owned image sections and the isolated Orbit client component remain under `src/app/work/_sections`.
