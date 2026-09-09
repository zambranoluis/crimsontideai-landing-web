# Design Context

## Ownership and decision status

This document owns art direction, typography, colors, spacing, reading measures, grids, composition, media, component appearance, responsive visual changes, and motion values. `docs/ux.md` owns section sequences and behavior; `docs/content.md` owns wording and its approval status; `docs/product.md` qualifies facts. Frontend owns engineering, responsive ranges, accessibility, and motion constraints; shared policies own authorization and verification.

**Accepted scope:** retain the dark/Crimson/Roboto working direction, qualify inherited decisions, and consolidate visual and spatial guidance. This documentation approval does not constitute visual acceptance of a new composition.

**Working baseline:** unless identified otherwise, values below retain useful guidance from the supplied visual and spatial Markdown. They guide a coherent starting point; they are not immutable requirements or proof that an appearance was approved. **Implementation observation** means inspected source, not validated rendering. **Proposal** requires review before becoming an accepted target. Source labels such as “approved v7” do not establish approval here.

Accepted design decisions define the intended result. Shared CSS tokens in `src/app/globals.css` implement those decisions; token presence cannot approve a design. A discrepancy requires reconciliation, not automatic preference for whichever value is in code.

## Qualified inputs

Local paths below are relative to the repository root.

| Input | Use and limit |
| --- | --- |
| `../mnk-lab/crimsontide-landing-mnk/docs/CrimsontideAI_Design.md` | Visual values and component treatments; its inherited authority claims are not adopted |
| `../mnk-lab/crimsontide-landing-mnk/docs/CrimsontideAI_Structure.md` | Useful measures, alignment, and relationship examples; no mandatory pattern-selection system |
| Corporate PDF qualified in Product | Identity and audience context, not proof of visual acceptance |
| `AGENTS/references/home.png` | Dark landscape/mesh opening, grouped offerings, case/proof, Jamaica atmosphere, expressive closing region |
| `AGENTS/references/products.png` | Full-bleed opening, different OpenJM/Sentinel supporting-point arrangements, product previews, closing note/action rows |
| Current Home/Products components and CSS | Implementation observations, including deviations from references; no browser evidence |

Both reference images were directly inspected. They are desktop compositions, not mobile specifications or evidence of product capabilities. Home's serif closing headline, dropdown indicators, and map treatment do not approve a font change, dropdown workflow, or geographic capability. Products' sample dashboard data does not establish metrics or live functionality.

## Composition from relationships

Begin with the visitor's reading path, the leading element, supporting information, proof, and action. Keep related information close; separate distinct decisions more strongly. Choose columns, rows, lists, or an open composition according to those relationships. A card is useful when it bounds a meaningful unit, not simply because another section uses cards.

Repetition should make peer content recognizable. Change composition when information or priority changes, rather than enforcing variation between every adjacent section. Review page rhythm at both section and component scale: a calm reading region can follow an expressive opening without repeating its visual intensity.

Selective reference methods: [Impeccable layout guidance](https://github.com/pbakaus/impeccable/blob/main/skill/reference/layout.md) informs grouping, hierarchy, density, rhythm, and adaptation; [Taste design/redesign guidance](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md) informs type hierarchy, optical alignment, and repeated-family consistency. Apply those evaluation ideas within the retained identity. No external skill, command, detector, library, or installation is required.

## Visual character

CrimsonTide should feel dark, precise, technical, restrained, high-contrast, contemporary, and premium without decorative excess.

Use a deep near-black/navy environment, high-contrast white and blue-grey text, and Crimson red as deliberate action, signal, and emphasis.

Depth comes primarily from tonal variation, thin borders, controlled radii, and restrained interaction — not heavy shadows or excessive glass effects.

Avoid generic AI decorative clichés. Visual complexity should support content rather than compete with it.

Jamaican origin should support capability and context. Avoid dependence on flags, tourism imagery, or geographic clichés as a substitute for the company's proposition.

## Colour system

Use colours by semantic role. Do not invent nearly identical substitute colours for isolated components when an established role already fits.

### Brand

| Role | Value |
| --- | --- |
| Primary Crimson | `#EF3340` |
| Dark Crimson | `#A50F28` |
| Primary action hover / strong error family | `#FF4A56` |
| Product blue | `#2356FF` |
| Detection cyan | `#7ED9FF` |
| Detection label red | `#FF6973` (component-level detection label only) |

`#FF4A56`, `#2356FF`, and `#7ED9FF` are contextual. They do not replace the primary Crimson role.

### Backgrounds

| Role | Value |
| --- | --- |
| Primary | `#07090D` |
| Secondary | `#0B0F16` |
| Header | `rgba(7,9,13,.90)`, moving toward `rgba(7,9,13,.62)` in the source's translucent reference |
| Closing section | `#05070B` |
| Footer | `#06080B` |

### Surfaces

| Role | Value |
| --- | --- |
| Primary surface | `#0E141D` |
| Secondary surface | `#121925` |
| Quiet transparent card | approximately `rgba(255,255,255,.018)` — the reference for solution, process, industry, and ordinary partner-card families |
| Offer panel | `linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.018))` |
| Case-study / case-media | `#090D14` |
| Proof | approximately `rgba(255,255,255,.02)` |
| Value / about | approximately `rgba(255,255,255,.02)` |
| Camera-frame strong | `#111823`, darker gradient end `#07090E` |
| Closing-CTA dark gradient | `#10151E` and `#090B10` (component-specific) |

### Text

| Role | Value |
| --- | --- |
| Primary | `#F4F6F8` |
| Secondary | `#9AA5B3` |
| Very muted / metadata | `#6F7A88` |
| Navigation default | `#AEB6C1` |
| Lead | `#BCC4CE` |
| Eyebrow / section label | `#D9DDE3` |
| Footer descriptive | `#DBE2EA` |
| Footer links | `#B9C4D1` |
| Footer bottom / muted | `#A7B1BE` |

### Borders

| Role | Value |
| --- | --- |
| Primary line | `rgba(255,255,255,.10)` |
| Strong / panel line | `rgba(255,255,255,.18)` |
| Header CTA Crimson border | approximately `rgba(239,51,64,.50)` |

Visual/media frames use the primary line family unless a component-specific treatment says otherwise. The value accent `#7B1420` is permitted as a component-level value; do not promote it to a global Crimson role.

### Interaction colours

| Role | Value |
| --- | --- |
| Neutral hover background | `#FFFFFF` |
| Neutral hover text | `#090B0F` |
| Primary action hover | `#FF4A56` |
| Navigation hover background | white at approximately 6% opacity |
| Subtle surface hover | white at approximately 4.5% opacity |
| Strong interaction surface | `#111722` |
| Footer icon hover | `#FF4B57` |

Global and focus Crimson use `#EF3340`. Do not introduce a separate brighter global accent role.

### Atmosphere and effect references

These source effect values remain optional references when that effect has a defined purpose:

- Page Crimson halo: `rgba(239,51,64,.13)`
- Page blue halo: `rgba(35,86,255,.08)`
- Spotlight: `rgba(239,51,64,.045)`
- Partner-highlight halo: `rgba(239,51,64,.12)`
- Sentinel halo: `rgba(239,51,64,.20)`
- Case-media halo: `rgba(239,51,64,.16)`
- Case-media internal Crimson border: `rgba(239,51,64,.60)`
- Case-media internal glow: `rgba(239,51,64,.08)`
- Closing CTA Crimson border: `rgba(239,51,64,.27)`
- Closing CTA halo: `rgba(239,51,64,.20)`
- Visual-stage Crimson accent: `rgba(239,51,64,.20)`
- Detection target: `rgba(239,51,64,.75)`
- Island-signal halo: `rgba(239,51,64,.18)`

### Shadow references

Visual references, not implementation requirements:

- Global depth: `0 24px 70px rgba(0,0,0,.35)`
- Card depth: `0 18px 60px rgba(0,0,0,.16)`
- Orbital-core outer Crimson glow: `rgba(239,51,64,.25)`
- Orbital-core inner white glow: `rgba(255,255,255,.18)`
- Internal orbital colours `#FF6D76`, `#65101C`, `#12070A` remain component-specific.

### Hero animated mesh — project-specific exception

The source records the following mesh configuration. Retain it as a component-specific working reference, not an approved global palette change:

- Mesh primary: `#FF0033`
- Mesh highlight: `#330009`
- Mesh background: `#000000`
- Visual opacity: `0.95`
- Glow intensity: `0.63`
- Ambient glow intensity: `0.62`

### Browser surface colour

Where the product exposes a browser/theme surface colour, the design value is `#07090D`. This is a design value only; the mechanism used to expose it is not prescribed here.

### Colour hierarchy rules

- Reserve Crimson for action, signal, active emphasis, and focused highlights.
- Section labels use `#D9DDE3`; the short rule beside them carries Crimson.
- Do not use Crimson as the default long-form body colour.
- Use near-black/dark tonal variation and controlled transparent whites to create section depth.
- Prefer tonal contrast and borders before adding shadow.
- Do not use colour alone to communicate required meaning.
- Do not promote interaction-only or component-exception colours to default surface roles.

## Typography

**Typeface:** Roboto. Fallbacks may be Arial, Helvetica, and sans-serif according to the project's font-delivery method.

**Heading character:** compact line-height approximately `1.08`; tight letter spacing approximately `-0.035em`. Headings should feel architectural and precise, and stronger than body copy through size, weight, contrast, and measure.

**Body:** `16px` across all profiles, line-height approximately `1.62`. Body copy should remain visually quieter than headings. Reuse roles consistently instead of inventing page-specific sizes.

### Type scale by profile

| Role | Mobile `<768` | Tablet `768–1023` | Desktop `≥1024` |
| --- | ---: | ---: | ---: |
| H1 / Display | 38–48px | 48–60px | 60–72px |
| H2 | 30–36px | 36–44px | 44–52px |
| H3 | 20–22px | 22–26px | 24–28px |
| Lead | 17–18px | 18px | 18px |
| Body | 16px | 16px | 16px |
| Eyebrow / section label | 11px | 11px | 11px |

These are design ranges, not an instruction to interpolate continuously or to use a particular CSS function. Do not reduce type below the range merely to preserve desktop geometry — recompose first. Keep line-height and letter-spacing coherent while scale changes.

## Interaction profile by input capability

Viewport width alone does not determine whether hover exists. Separate screen size from input capability.

- **Touch / coarse pointer:** the full experience exists without hover. Do not use pointer tilt or reveal information only on hover. Feedback comes from visible states, focus where applicable, and activation/pressed response.
- **Tablet:** design touch-safe by default. If the device actually provides `hover + fine pointer`, it may adopt the rich hover behaviour allowed for the component family.
- **Desktop with fine pointer:** lift, arrow shift, sheen, and tilt may be used within the established limits.
- **Keyboard:** visible focus at every profile. Never replace focus with hover.
- **Reduced motion:** neutralize decorative movement regardless of viewport size.

### Minimum state matrix

| State | Expected visual signal | Allowed motion |
| --- | --- | --- |
| Default | base shape, contrast, hierarchy | none required |
| Hover | surface/colour change and, where appropriate, restrained lift | only with hover + fine pointer |
| Active / pressed | immediate response; cancel or reduce lift while preserving contrast | brief, not hover-dependent |
| Focus | clearly visible ~3px ring, unambiguous contrast | not required |
| Disabled | 45–55% visual emphasis, silhouette preserved | none |

Do not invent a new state colour when the existing family can communicate the change through contrast, border, surface, or motion.

## Section labels / eyebrows

Labels orient the reader and establish rhythm. They must not compete with headings.

- uppercase; `11px`; weight approximately `800`; letter spacing approximately `0.11em`; colour `#D9DDE3`;
- short Crimson rule: `24px × 2px`, colour `#EF3340`, with only the contained glow established for this treatment.

Keep the treatment functional and restrained. Do not turn every section marker into decorative ornament.

## Buttons

**Shared geometry:** minimum visual height `50px`; horizontal padding `20px`; internal gap `12px`; radius `5px`; text `14px`; weight approximately `700`. A directional arrow/icon may be used when appropriate.

**Primary:** solid Crimson `#EF3340` fill and border; white text; action shadow approximately `0 16px 40px rgba(239,51,64,.20)`. Fine-pointer hover brightens toward `#FF4A56` keeping text white. Standard lift up to `2px`; arrow shift up to `4px` on X.

**Ghost / secondary:** surface approximately `rgba(255,255,255,.045)` or transparent in component families built on transparency; border `rgba(255,255,255,.18)`; high-contrast text. Must remain clearly secondary. On fine-pointer hover, a neutral white surface with `#090B0F` text may be used where the family calls for it.

**Focus:** every interactive control needs a clearly visible focus state on dark surfaces. Ring thickness approximately `3px`. Prefer a Crimson-derived high-contrast ring where contrast remains sufficient. Focus must remain identifiable through more than colour alone when shape or border ambiguity exists.

**Disabled:** preserve silhouette and geometry; remove motion and hover cues; reduce emphasis to approximately `45–55%` opacity where contrast stays understandable. Disabled controls must not look actionable.

**Family rules:** do not create slightly different dimensions for isolated components. Keep icon direction, alignment, and interaction consistent. Use hierarchy and contrast before increasing physical size beyond the family.

## Navigation appearance

- **Default:** text `#AEB6C1`, quiet and low-noise.
- **Hover:** text moves toward white; may use a subtle white background at approximately 6% opacity.
- **Active/current:** same visual family as hover but clearly distinguishable as current location. Must not depend on animation to remain visible.
- **Timing:** approximately `0.25s` for ordinary state transitions. Touch behaviour must remain complete without hover.

## Surfaces and cards

Create depth through tonal changes, fine borders, controlled radii, and selective interaction. Heavy shadow is not the primary depth mechanism.

| Family | Surface | Radius |
| --- | --- | --- |
| Offer panel | `linear-gradient(145deg, rgba(255,255,255,.055), rgba(255,255,255,.018))` | `14px` |
| Case-study panel | `#090D14` | `16px` |
| Proof box | approximately `rgba(255,255,255,.02)` | `13px` |
| Value card | approximately `rgba(255,255,255,.02)` | `12px` |
| Visual/media frame | contextual dark, border `rgba(255,255,255,.10)` | `18px` |

Within a repeated family, keep radius, border treatment, internal hierarchy, icon alignment, and CTA treatment consistent. Do not create a near-duplicate family merely because imagery or copy changes.

## Visual media treatment

The Media roles and framing section below defines purpose, placement, crop, and responsive treatment.

- Use the visual/media frame (primary line family at ~10% white, ~`18px` radius) when media needs a bounded surface.
- Maintain sufficient contrast between the visual and any overlaid text. If legibility needs a tonal layer, keep it local and restrained.
- Do not apply a global Crimson overlay by default. Crimson is signal and emphasis, not a mandatory filter for photography or product imagery.
- Static media must not receive tilt, sheen, or lift merely because it exists. Reserve those for genuinely interactive media.
- Preserve the primary focal point across viewports. If cropping threatens necessary information, treat the media as informational and prioritize meaning.
- Avoid blur, glass, glow, or heavy gradients that reduce readability or turn media into generic decoration.

## Visual density and emphasis

- Every region should have one recognizable primary visual hierarchy. Avoid multiple equally strong Crimson elements competing in the same area.
- Prefer depth through dark tonal variation and borders before adding shadows or effects.
- Use action Crimson to signal intent; do not saturate large areas merely to increase brand presence.
- When multiple actions coexist, one must be unmistakably primary and the others step down in emphasis.
- On smaller viewports, reduce decoration before reducing content or control clarity.

## Form controls

- **Default:** field background `#090C12`; field text `#FFFFFF` (or the established primary text role where the codebase maps it consistently); border `rgba(255,255,255,.10)`; supporting text uses the documented muted family; visible label above or clearly associated with the field.
- **Focus:** strengthen border/ring clearly. Prefer Crimson `#EF3340`; the field reference is approximately `rgba(239,51,64,.70)` on the border with a restrained `rgba(239,51,64,.08)` ring. Preserve approximately `3px` visible focus treatment.
- **Error:** use a treatment close to the primary-hover Crimson family (`#FF4A56`). Always include text explanation; never rely on colour alone.
- **Disabled:** reduce contrast and emphasis without hiding the field. Remove hover and motion cues.
- **Success:** communicate with clear text and/or iconography in addition to colour. Do not invent a new global success colour for one component. Do not reuse Crimson error/action emphasis as the only success signal.

Placeholder text is never the only field label.

## Iconography

- Use simple, precise icon shapes.
- Default icons normally inherit primary or secondary text colour.
- Crimson is reserved for emphasis, active state, or meaningful signal.
- Avoid mixed icon styles inside one component family.
- Icons must not carry essential meaning without accompanying text or an accessible label.

## Visual effects

Effects must reinforce hierarchy, affordance, or identity. They must not become independent decoration.

- **Light sweep / sheen:** selected interactive surfaces only; subtle and localized; duration approximately `0.80s`. Do not use it on every surface simultaneously. Important information must not depend on it.
- **Pointer tilt:** interactive surfaces only; maximum rotation approximately `±1.3deg`; perspective character approximately `900px`. Do not apply to static informational surfaces or move content enough to reduce readability.
- **Crimson glow:** selective interaction/emphasis accent only, secondary to shape, border, colour, and typography. Avoid persistent broad glow across large sections.
- **Borders and highlight lines:** thin borders and short Crimson rules for precision and hierarchy. Prefer localized accent lines over large decorative strokes. Repeated accents keep consistent thickness and visual weight.
- **Background grid:** a fixed, non-interactive layer behind all content, built from two orthogonal 1px lines at approximately 2.5% white on a `52px` cell, masked so it fades out by roughly 80% of the viewport height. It establishes technical texture and must never reduce text contrast or respond to interaction.
- **Pointer spotlight:** a `420px` radial field of `rgba(239,51,64,.045)` fading to transparent at approximately 67%, following the pointer behind the content layer. Fine pointer only, never interactive, and removed entirely under reduced motion. It is atmosphere; nothing may become legible only inside it.

## Hover and interaction character

Rich hover is an enhancement, not a requirement for comprehension.

With hover + fine pointer: ordinary interactive surfaces may lift up to `2px`; subtle surfaces may increase toward approximately 4.5% white overlay; `#111722` may be used as an interaction-only stronger surface where established; buttons may use the documented lift and arrow motion; selected interactive cards may use restrained sheen and pointer tilt.

For touch: no information, control, or state may depend on hover, and the interface must remain understandable in its non-hover state.

## Motion character

Motion should feel short, controlled, precise, and secondary to content.

- **Timing:** fast state approximately `0.25s`; standard surface/action transition approximately `0.30s`; light sweep approximately `0.80s`; entrance reveal approximately `0.75s`.
- **Easing:** curve character equivalent to approximately `0.2 / 0.75 / 0.2 / 1`.
- **Movement limits:** standard lift up to `2px`; directional arrow shift up to `4px`; pointer tilt up to `1.3deg`; entrance rise up to `24px`.

**Entrance reveal.** The retained appearance is opacity `0 → 1`, rise up to `24px`, easing above, and approximately `0.75s` duration. Activation, reversal, focus, and interruption semantics belong to UX and Frontend. Reduced motion shows the resolved appearance with no transition.

Do not animate surrounding layout unexpectedly. Motion must not delay content access, compensate for weak hierarchy, or make essential information available only during animation.

## Footer interaction language

The footer may use a slightly richer interaction layer because its groups are compact and clearly separated.

Colour roles: background `#06080B`; descriptive/tagline text `#DBE2EA`; links `#B9C4D1`; bottom/muted text `#A7B1BE`; animated underline / Crimson line `rgba(239,51,64,.62)` fading to transparent; bottom border accent approximately `rgba(239,51,64,.26)`.

Movement limits: brand mark lift up to `2px` and scale approximately `1.015`; social control lift up to `3px`; footer column lift up to `4px`; column icon lift up to `2px` and scale approximately `1.1`; heading accent rule `24px` default → approximately `42px` on hover; footer link horizontal shift up to `4px`; footer icon hover `#FF4B57`.

Permitted feedback includes restrained Crimson glow on the brand mark, subtle Crimson border/background response on social controls or columns, brighter icons, and white footer links with a small shift plus Crimson underline.

Do not transfer the footer's full interaction intensity to every component family.

## Focus and reduced motion

- Interactive elements must retain a clearly visible focus treatment.
- Motion must supplement colour, shape, or another visible state — never replace them.
- Touch devices must remain complete without hover.
- For reduced-motion preferences, remove or minimize nonessential animation while preserving state clarity.
- Pointer tilt and long decorative sweeps must be neutralized under reduced motion.

Under reduced motion, at minimum: remove the pointer spotlight and the footer animated layer; show entrance reveals already resolved; collapse animation and transition durations to an imperceptible value; disable smooth scrolling; neutralize pointer tilt. Every state, control, and piece of content must remain fully available and distinguishable afterwards.

## Reference synthesis

When building from reference images, separate evidence into three layers:

1. **Structural evidence** — split ratios, card arrangement, section rhythm, image placement, density. Resolve through this document's spatial foundation and composition guidance.
2. **Visual evidence** — surface depth, border character, typography hierarchy, icon treatment, interaction emphasis, effect intensity. Translate into this system rather than copying another brand literally.
3. **CrimsonTide identity** — use the retained working baseline: CrimsonTide colour roles, Roboto typography, surface families, action families, restrained premium technology character, and established motion limits.

If a reference contains a strong visual idea that conflicts with project identity, preserve the idea's function but redesign its appearance within CrimsonTide.

## Consistency rule

Before creating a new visual value, check whether the result can be achieved by extending an existing colour role, typography role, button family, surface family, radius family, interaction pattern, or icon treatment. Prefer extension over one-off convention.


## Spatial foundation

The following source measurements are concrete working guidance. Keep established responsive ranges; choose composition from the content relationships rather than a named template.

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

Unless **viewport** is explicitly stated, percentages refer to the usable width of the active structured container, not raw screen width. Grid spans and percentages communicate intent, not a required CSS implementation. If content, accessibility, or readability requires leaving a range, preserve hierarchy and comprehension first and document the exception.

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

These are working proportions, not templates. Content relationships and reading measure determine whether a split or peer group fits.

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

Language, real copy, and type size shift these ranges. Resolve wrapping through width and composition before introducing manual line breaks. The 55–70ch body and 45–60ch lead ranges are the desktop baseline, not the mobile baseline. Do not preserve desktop line breaks when they create poor wrapping on smaller viewports. Do not continuously reduce type size merely to preserve a horizontal composition — use the typography roles above.

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

## Media roles and framing

Classify each major visual before deciding how it transforms.

- **Informational** — carries information required for comprehension. Preserve the information at every viewport. Geometry may simplify, but meaning must remain available. Do not crop or hide required information.
- **Supporting** — strengthens understanding but is not the only carrier of meaning. May crop, reposition, simplify, or reduce. Preserve its relationship to the content it supports.
- **Atmospheric** — provides mood, identity, or depth without essential meaning. May crop, reposition, reduce, or disappear. Never reduce text legibility or action clarity.

## Height and vertical growth

Avoid fixed heights for copy-led heroes, text-heavy cards, forms, and dynamic content sections. Prefer natural content height plus controlled padding. Use `min-height` only to protect compositional balance. Fixed media regions are acceptable when crop and framing behaviour is defined.

For viewport-oriented compositions, the usable screen is the area below persistent navigation. Section padding and anchor clearance both contribute to where meaningful content begins after navigation. A suitable single-screen composition includes its closing note and primary action in that area; a minimum viewport height alone does not establish that fit. Product showcases can fit on larger desktop screens while requiring natural scrolling on shorter screens or in stacked layouts. This is selective composition guidance under the responsive rules in `AGENTS/roles/frontend.md`, not a universal full-screen section target.

## Actions and interactive target geometry

Design geometry constraints, not implementation instructions:

- Minimum interaction target: 44px.
- Recommended interaction target: 48px.
- Baseline structural form/control height: 48px.
- Primary actions normally use content width on desktop.
- Primary conversion actions may use full available width on mobile.
- Secondary actions should remain content-width on mobile when practical.


## Useful composition relationships

These are optional examples, not a registry that every section must select from. Section purposes, sequence, and actions remain in UX.

| Relationship | Useful geometry and purpose | Narrow-screen treatment |
| --- | --- | --- |
| One message with supporting media | Copy around 5/12 and media 7/12, or balanced 6/6 when both carry comparable meaning | Stack explanation before support; tablet split only if readable |
| Full-bleed opening | Atmosphere spans viewport; copy stays aligned around 5–6/12, or 5–6/8 tablet | Reframe atmosphere around copy; do not scale the whole desktop canvas |
| Section introduction | Heading and support around 5–7/12 desktop, 6/8 tablet | Full content width with controlled text measure |
| Parent topics with nested points | Two 6/12 parent regions when they are peers; nested items share alignment | Stack parent groups and retain their internal membership |
| Peer collections | Three at about 4/12, four at 3/12, or five short categories at about 20% | Tablet usually two-up; mobile one-up for descriptive items |
| Ordered process or journey | Horizontal sequence or copy rail beside steps | Linear order with explicit labels; connectors may simplify |
| Relationship diagram | Radial geometry only when relationships benefit from it | Simplify or linearize while retaining meaningful labels |
| Featured case | Approximately 5/7 or 6/6 for evidence and explanation | Preserve category, title, summary, media, proof, and action relationships; actual sequence belongs to UX |
| Proof or metric strip | Compact aligned items; four across only when content supports it | Two-up tablet; one-up mobile, or two only for very short items; requires actual evidence before adding metrics |
| Form with support | Approximately 7/12 form and 5/12 support | Stack when constrained; full-width controls |
| Closing invitation | About 5–7/12 copy with optional supporting atmosphere | Keep copy and action ahead of optional decoration |
| Navigation and footer | Full desktop navigation; footer groups with common alignment | Collapsed navigation below 1024px; footer brand first, then two-column or stacked groups |
| Featured editorial item and peers | An asymmetric 4/5/3 arrangement may distinguish one featured item | Full-width introduction then two-up tablet, linear mobile; no forced asymmetry |

Equal-height peer rows are useful only while content remains complete. Keep family padding, icon alignment, and action placement consistent; allow text-heavy items to grow. A diagram, metric strip, or editorial cluster is an available relationship, not a request to create new content.

## Route-specific composition

The tables describe spatial relationships, not a second sequence registry. UX owns the route sequence and behavioral order. Unimplemented routes use reference-derived proposals awaiting visual review.

| Region | Working composition and responsive treatment | Status |
| --- | --- | --- |
| Home opening | Full-bleed atmosphere with one aligned copy column, no opposing required visual. Tall opening may grow with content | Source and image share this broad relationship |
| Home offerings | Current source: two product panels, then a full-width solutions region with copy and four offerings. Mobile stacks regions. Image: Products and Solutions are peer parent groups | Different supported references; neither silently replaces the other |
| Home proof | Source: case media beside case copy, with trust names nested in copy; mobile media above copy with a horizontal separator. Image: case/media group beside a separate trust region | Source observation versus image alternative |
| Home company | Source: explanatory copy beside three principles, even split on tablet, stacked mobile. Image adds a large Jamaica visual and places principles beneath | Image alternative; map not an implementation requirement |
| Home closing | Source: restrained copy/action over line atmosphere. Image: stronger media and serif headline | Image's font treatment is not adopted; Roboto remains baseline |
| Products opening | Full-bleed image and mesh, copy capped near 570px desktop/470px tablet; mobile source reserves image space above copy | Source observation; supersedes stale radial-hero description |
| OpenJM | Desktop copy with vertical points beside preview; note and action share a separate lower row. Source split is .9fr/1.3fr with 48px gap | Stacks below 1024px; lower row stacks on mobile |
| Sentinel | Copy beside preview, three supporting points across underneath, then note/action row; not a mirrored OpenJM layout | Main regions stack below 1024px; points remain three-up tablet and become one-up mobile |
| Solutions opening | Preview has copy beside radial atmosphere and metadata | Reference option, not an accepted application hero |
| Solutions problem/context regions | Three starting-needs cards; a separate ordered three-stage journey. Tablet may wrap to two-up; mobile linearizes connectors | Reference-derived proposal |
| Solutions implementation/proof | Copy rail beside three ordered steps; rail above steps on tablet. Case without media beside proof, stacked on tablet/mobile | Reference-derived proposal |
| Work opening | Preview copy and radial atmosphere | Reference option |
| Work case | Case index beside three detail blocks, including objectives; index may hold on desktop and becomes static before details on tablet/mobile | Reference-derived proposal |
| Work industries/relationships | Five peer sectors; one featured relationship and two peers; supporting action panels. Tablet two-up, featured relationship may span; mobile linear | Reference-derived proposal; no unsupported relationship claims |
| Company opening/about | Preview opening uses radial atmosphere; About has copy beside three stacked principles, even tablet split, mobile stacked | Reference-derived proposal |
| Company origin | Copy with atmospheric Jamaica signal; signal may reduce or disappear | Copy carries meaning; no new map facts |
| Solutions, Work, Company closing | Reduced spacing with clear copy/action hierarchy | Reference-derived proposal, no universal full-screen requirement |
| Contact opening | Heading and lead without a secondary action or required media | Preview/reference baseline |
| Contact support/form | About 5/12 support before 7/12 form; support may hold on desktop. Tablet stacks with support static; mobile pairs become single-column and submit may fill width | Reference-derived proposal; states and form contract remain unresolved |

### Current implementation differences

Global source uses 20/40/80px page margins, a 1440px container cap, and section spacing of 80/96/112px across mobile/tablet/desktop. These values implement part of the baseline; they do not prove all components use it.

Products has a compact layout at widths of at least 1280px and heights of at least 800px. It sets showcase height to viewport height minus header offset and uses 13px supporting-point copy in that mode, while the general body reference above is 16px. Record these as current exceptions, not accepted universal type or fitting rules. Their rendered fit/readability was not assessed here.

The Products hero source requests `/images/products/hero.png`, but the checked-in candidate is `public/pages/products/image/hero.png`; the requested public path is absent. This is an existing implementation mismatch outside the documentation edit scope. Do not describe the image as confirmed rendered.

## Media inventory and framing

| Input or slot | Role and treatment |
| --- | --- |
| `public/logos/` brand/product marks | Informational identity; preserve aspect ratio and legibility, never crop meaningful lettering |
| Home hero atmosphere; `public/pages/home/pictures/hero.png` | Available atmospheric input; crop around the reading area, not a claim that the file is currently consumed |
| Home case illustration; `public/pages/home/pictures/super-market.png` | Supporting material; preserve case relationship. An available file is not proof of a real deployment photograph or current usage |
| `public/pages/products/image/hero.png` | Atmospheric candidate; desktop composition gives copy room on the left; mobile may reposition imagery above copy |
| `public/pages/products/image/openjm-preview.webp` and `public/pages/products/image/sentinel-preview.webp` | Current illustrative preview inputs; sample UI and metrics are not verified product data |
| `public/pages/products/video/1.mp4`, `public/pages/products/video/2.mp4` | Available supporting motion inputs; availability alone does not establish use or acceptance |
| Hero radial graphics, meshes, Jamaica signal, and footer animation | Atmospheric references; may simplify, crop, or disappear without losing essential meaning |

Frame informational media to preserve every necessary label; use an equivalent readable presentation if geometry must change. Supporting media retains its focal relationship to the adjacent explanation, while atmosphere can be reduced first. Keep overlaid copy on a calm high-contrast region and use local shading rather than a universal red filter. Define crop and aspect behavior per asset; there is no universal media ratio.

## Review criteria and unresolved visual decisions

A usable section specification identifies hierarchy, text measure, alignment, outer and inner spacing, media role/crop, action emphasis, responsive composition, states, motion values, and relation to neighbouring sections. Longer copy and absent optional media should still produce a coherent region. Retain spacing for meaning rather than preserving an empty decorative slot.

Useful design reference widths remain 360, 390, 768, about 834, 1024, 1280, 1440, and 1920px plus intermediate widths. They are reference points, not configured test projects or mandatory browser runs for this document. A 200% zoom reference, longer/localized copy, focus, reduced motion, and media crops can expose design constraints; execution and verification policy remain with the roles.

Pending visual decisions include whether to adopt Home's image-specific grouping, map, or closing treatment; final compositions for the four unimplemented routes; and any new departure from the working palette or typography. Static consistency and direct inspection of reference images do not establish rendered application quality or visual acceptance.
