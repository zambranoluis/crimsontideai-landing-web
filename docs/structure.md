# Structure Context

## Status

- **Classification:** context. This document records the CrimsonTide structure system: composition, grid, spacing, and responsive recomposition. It is not normative. It does not override `AGENTS.md`, `CLAUDE.md`, or any document in `AGENTS/roles/`.
- **Authority boundary:** `AGENTS/roles/frontend.md` owns the normative responsive ranges and layout rules. Its three primary ranges — mobile `<768px`, tablet `768–1023px`, desktop `≥1024px` — match the profiles below.
- **Related context:** `docs/design.md` owns typographic and visual character. This document owns composition, spans, spacing, stacking, and reading measure.

Percentages and ranges below describe valid working zones, not pixel-perfect targets.

## Structural principles

- Responsive design is recomposition, not proportional shrinking.
- Preserve hierarchy, readability, and action priority before preserving desktop geometry.
- Prefer content-driven height over fixed-height composition.
- Use whitespace as an active structural element.
- Keep major sections clearly separated.
- Avoid substantially identical consecutive layouts when another established pattern fits the content.
- Preserve approved content hierarchy; adapt the composition to the content rather than editing content to fit a preferred layout.
- Prevent text from becoming the only dominant structural element when a supporting visual, diagram, proof element, or interface representation can carry part of the hierarchy.
- Maintain a clear relationship between primary content, supporting content, proof, and action.

## Viewport model and grid

| Profile | Range            | Columns | Gutter | Page margin | Default behaviour                                                   |
| ------- | ---------------- | ------: | -----: | ----------: | ------------------------------------------------------------------- |
| Mobile  | below 768px      |       4 |   16px |        20px | stack primary regions vertically                                    |
| Tablet  | 768–1023px       |       8 |   20px |        40px | preserve split compositions only while both regions remain readable |
| Desktop | 1024px and above |      12 |   24px |        80px | maximum primary container 1440px                                    |

### Grid rules

- Align structured content to the active grid, not directly to the viewport edge.
- Decorative and full-bleed backgrounds may extend to the viewport edge while structured content stays inside the container.
- Keep internal alignment consistent across neighbouring sections unless a deliberate pattern change requires otherwise.
- Use asymmetric spans when they establish a meaningful primary/secondary relationship.
- A component may recompose before a global breakpoint if its content becomes constrained. Do not invent a page-specific breakpoint only to preserve desktop geometry.

## Responsive occupancy

Unless **viewport** is explicitly stated, percentages refer to the usable width of the active structured container, not raw screen width. Prefer grid spans; percentages communicate intent, not an instruction to use percentage units in code. If content, accessibility, or readability requires leaving a range, preserve hierarchy and comprehension first and document the exception.

### Span equivalents

| Profile              | Reference spans                                                | Approximate container occupancy                      |
| -------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| Mobile · 4 columns   | 1/4 · 2/4 · 3/4 · 4/4                                          | 25% · 50% · 75% · 100%                               |
| Tablet · 8 columns   | 2/8 · 3/8 · 4/8 · 5/8 · 6/8 · 8/8                              | 25% · 37.5% · 50% · 62.5% · 75% · 100%               |
| Desktop · 12 columns | 3/12 · 4/12 · 5/12 · 6/12 · 7/12 · 8/12 · 9/12 · 10/12 · 12/12 | 25% · 33% · 42% · 50% · 58% · 67% · 75% · 83% · 100% |

### Recommended occupancy by role

| Structural role              | Mobile                  | Tablet                                                           | Desktop                                    |
| ---------------------------- | ----------------------- | ---------------------------------------------------------------- | ------------------------------------------ |
| Full-width structured region | 4/4 · 100%              | 8/8 · 100%                                                       | 12/12 · 100%                               |
| Section intro / primary copy | 4/4 · 100%              | 6–8/8 · 75–100%                                                  | 5–7/12 · 42–58%                            |
| Primary text in a split      | 4/4 · 100%              | 4/8 · 50% when still readable                                    | 5–6/12 · 42–50%                            |
| Supporting media in a split  | 4/4 · 100%              | 4/8 · 50% when still readable                                    | 6–7/12 · 50–58%                            |
| Standalone long-form reading | 4/4 · 100%              | 6–7/8 · 75–87.5%                                                 | 5–7/12 · 42–58%, capped near 760px         |
| Form + support               | each region 4/4 stacked | each region 8/8 stacked; 4/8 + 4/8 only if both stay comfortable | 7/12 + 5/12                                |
| Card in a group of 3         | 4/4 · 100%              | ≈ 4/8 · 50%                                                      | ≈ 4/12 · 33%                               |
| Card in a group of 4         | 4/4 · 100%              | 4/8 · 50%                                                        | 3/12 · 25%                                 |
| Category in a group of 5     | 4/4 · 100%              | ≈ 4/8 · 50%                                                      | ≈ 20% per item when five-up remains viable |

These are defaults. Patterns P01–P19 govern the exact relationship whenever an applicable pattern exists.

### Opening vertical occupancy

Height must not become a rigid constraint. For a normal-content opening or hero:

- Mobile: usually around 70–100% of the initially visible viewport height when content fits without compression.
- Tablet: usually around 65–90%.
- Desktop: usually around 65–85%.

If content needs more height, natural height wins. When reasonable, the first viewport should communicate the primary message and primary action without requiring scroll just to discover the page intent. Do not hide content, over-reduce typography, or force crops merely to hit a height percentage.

### Reading measure by profile

- Mobile: body approximately 32–45ch; lead approximately 28–38ch.
- Tablet: body approximately 45–60ch; lead approximately 36–48ch.
- Desktop: body approximately 55–70ch; lead approximately 45–60ch.

Language, real copy, and type size shift these ranges. Resolve wrapping through width and composition before introducing manual line breaks. The 55–70ch body and 45–60ch lead ranges are the desktop baseline, not the mobile baseline. Do not preserve desktop line breaks when they create poor wrapping on smaller viewports. Do not continuously reduce type size merely to preserve a horizontal composition — exact typography belongs to `docs/design.md`.

## Containers

- Primary container max-width: 1440px.
- Narrow reading container: approximately 760px.
- Centre the primary container once max-width is reached.
- Keep it fluid inside the active page margins.
- Separate full-bleed visual layers from the structured content container.

## Spacing system

Shared structural scale: `4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 128 px`

Avoid arbitrary one-off values when an existing step produces an equivalent relationship.

**Major section separation:** mobile 56–80px; tablet 64–96px; desktop 80–128px. Use the upper end for major conceptual transitions and the lower end when two regions form one connected module.

**Common internal relationships:**

- Heading → paragraph/supporting copy: normally 16–24px.
- Supporting copy → primary action: normally 24–32px.
- Card/panel internal padding: normally 24–32px where density permits.
- Peer-card gap on desktop: approximately 24px unless the active grid relationship dictates another established value.

## Responsive recomposition priority

When space becomes constrained, preserve in this order:

1. content hierarchy;
2. readability;
3. action priority;
4. meaningful media;
5. desktop composition, only when the first four remain intact.

Default behaviour:

- 5/12 + 7/12 desktop splits may become 4/8 + 4/8 on tablet when viable.
- Stack when either side becomes structurally constrained.
- Stack split layouts on mobile by default.
- Put primary explanatory content before supporting or atmospheric visuals on mobile unless content logic requires another order.
- Preserve a logical document and reading order when visual regions move.

## Media roles

Classify each major visual before deciding how it transforms.

- **Informational** — carries information required for comprehension. Preserve the information at every viewport. Geometry may simplify, but meaning must remain available. Do not crop or hide required information.
- **Supporting** — strengthens understanding but is not the only carrier of meaning. May crop, reposition, simplify, or reduce. Preserve its relationship to the content it supports.
- **Atmospheric** — provides mood, identity, or depth without essential meaning. May crop, reposition, reduce, or disappear. Never reduce text legibility or action clarity.

## Height and vertical growth

Avoid fixed heights for copy-led heroes, text-heavy cards, forms, and dynamic content sections. Prefer natural content height plus controlled padding. Use `min-height` only to protect compositional balance. Fixed media regions are acceptable when crop and framing behaviour is defined.

## Actions and interactive target geometry

Design geometry constraints, not implementation instructions:

- Minimum interaction target: 44px.
- Recommended interaction target: 48px.
- Baseline structural form/control height: 48px.
- Primary actions normally use content width on desktop.
- Primary conversion actions may use full available width on mobile.
- Secondary actions should remain content-width on mobile when practical.

## Structural pattern registry

A pattern is determined by content relationship and responsive behaviour — not by colour, imagery, decorative styling, mirroring, or copy length. Reuse an existing pattern before creating a new one.

### P01 — Hero Split

Page opening with one primary message and one dominant supporting visual. Desktop 5/12 content + 7/12 visual; tablet 4/8 + 4/8 when viable; mobile content → visual. Atmospheric visuals may simplify or crop by viewport.

### P02 — Full-Bleed Background

Photography, maps, gradients, or atmosphere extending to the viewport edge while content stays aligned. Desktop full-bleed layer + 5–6/12 content; tablet full-bleed layer + 5–6/8 content; mobile 4/4 content, reframe media as required. Structured content remains inside the primary container.

### P03 — Section Intro

Label, heading, and optional support copy introducing a section. Desktop approximately 5–7/12; tablet approximately 6/8; mobile 4/4. Control measure with width, not forced line breaks.

### P04 — Split Content

Two related regions such as text + image, text + diagram, or content + content. Desktop 5/7 or 6/6; tablet 4/4; mobile stacked. Explanatory content normally precedes supporting media on mobile.

### P05 — Feature Group

One parent topic containing nested features or capabilities. Desktop two 6/12 parent panels; tablet 4/8 + 4/8 or stacked; mobile one parent panel per row. Reuse one nested row structure throughout the family.

### P06 — Three Cards

Desktop three × 4/12; tablet two-up with the third wrapping; mobile one per row. Keep internal hierarchy and padding consistent.

### P07 — Four Cards

Desktop four × 3/12; tablet 2 × 2; mobile one per row when descriptive copy is present. Equal height is acceptable within a row if content is not truncated.

### P08 — Five Category Cards

Five short peer categories. Desktop nested five-column composition within the main container; tablet two-up; mobile one per row. Keep categories equal in structural emphasis.

### P09 — Process / Steps

Desktop horizontal sequence; tablet two-column or vertical depending on density; mobile vertical sequence. Preserve explicit order with labels or numbering. Recompose connectors; never squeeze the desktop connector system into mobile.

### P10 — Journey / Path

Desktop narrative path, normally three stages; tablet simplified path or two-up; mobile linear vertical journey. Connectors must never be the only way sequence is understood.

### P11 — Relationship / Radial Diagram

Desktop radial or orbital composition; tablet simplified radial geometry or stacked nodes; mobile linearized nodes. Preserve every meaningful label when connectors disappear. Do not preserve radial geometry at the cost of readability.

### P12 — Featured Case Study

Desktop 5/7 or 6/6; tablet 4/4 or stacked; mobile stacked. Preferred mobile order: category → title → summary → media → proof → action. Preserve the same hierarchy across viewport variants.

### P13 — Proof / Trust Strip

Desktop compact horizontal row; tablet two per row when four or more items are present; mobile stacked, one per row. Proof must remain understandable without hover or interaction.

### P14 — Form + Support

Desktop approximately 7/12 form + 5/12 support; tablet stack when the form becomes constrained; mobile 4/4 form + 4/4 support, stacked. Mobile controls use full available container width. Keep visible labels associated with fields.

### P15 — Metric / Icon Strip

Desktop four across; tablet two per row; mobile one per row by default. Two mobile columns are allowed only for very short items. Align comparable metrics consistently.

### P16 — Closing CTA

Desktop approximately 5–7/12 copy + optional supporting visual; tablet flexible split or stacked; mobile copy + primary action before supporting media. Keep the primary action structurally dominant.

### P17 — Navigation

Desktop logo + full navigation + primary action while it fits comfortably; tablet reduced or compact navigation when required; mobile logo + menu trigger. Do not continuously shrink navigation text just to preserve every desktop link.

### P18 — Footer

Desktop multi-column composition; tablet brand/context first + approximately two-column link groups; mobile vertical or simple one-to-two-column composition. Recompose; do not proportionally shrink desktop columns. Legal content remains readable and reachable.

### P19 — Editorial / Related Content Cluster

Section introduction + one featured item + related items. Desktop asymmetric 4/5/3 composition; tablet full-width intro + two-column content; mobile linear sequence. Establish exactly one clearly featured item. Do not add a special viewport rule only to preserve desktop asymmetry.

## Additional structural rules

**Product / feature showcase:** desktop content + large supporting visual; tablet usually 4/8 + 4/8; mobile order content → visual → benefits → action. Controlled desktop visual overflow is allowed only when it does not create page overflow or obscure neighbouring content.

**Cards:** keep padding, internal spacing, and action placement consistent within the family. Equal-height desktop rows are acceptable for comparison. Do not truncate essential content to force equal height. Let cards grow with content on mobile.

**Forms:** use full-width controls on mobile. Keep labels visible; placeholder text is not the only label. Keep submit, secondary, and support action hierarchy clear.

## Structural accessibility

- Preserve logical document order and semantic heading hierarchy.
- Preserve keyboard access and visible focus for interactive controls.
- Do not make essential information hover-dependent.
- Prevent unintended horizontal page scrolling.
- Meaningful media must have an equivalent understandable presentation at every viewport.
- Decorative movement must never delay access to content.

## Validation

Reference viewports for design and QA:

- Mobile: 360px and 390px, plus reasonable extremes of the `<768px` range.
- Tablet: 768px and approximately 834px, plus one intermediate width before 1024px.
- Desktop: 1024px, 1280px, and 1440px; also inspect a wide viewport such as 1920px to confirm content is correctly capped by the maximum container.

Profiles are composition ranges, not physical device-model detection.

Validate at minimum: 360px, 390px, 768px, 1024px, 1280px, 1440px, and at least one intermediate width between major ranges.

Also test: long headings and long body copy; minimum and maximum card content; keyboard focus; 200% browser zoom; reduced motion when structural transitions exist; image crops and informational diagrams; horizontal overflow; optional content absent and present.

> The repository's Playwright projects cover three of these widths — `desktop-chromium` at 1280px, `tablet-chromium` at 768px, and `mobile-chromium` via Pixel 5. The remaining widths are design and QA references, not configured test projects.

## Structural completion criteria

A component or view is structurally resolved when the following are clear:

- selected pattern or justified new relationship;
- desktop/tablet/mobile composition;
- grid span and container relationship;
- external and internal spacing;
- copy measure and wrapping expectation;
- stacked content order;
- media role and transformation behaviour;
- action width and priority by viewport;
- behaviour with longer-than-reference content;
- behaviour when optional content is absent;
- relationship to the previous and next major section.
