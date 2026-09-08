# Visual Context

## Status

- **Classification:** context. This document records the CrimsonTide visual system. It is not normative. It does not override `AGENTS.md`, `CLAUDE.md`, or any document in `AGENTS/roles/`.
- **Authority boundary:** `AGENTS/roles/frontend.md` owns normative styling, responsive behavior, accessibility, and motion rules. It also establishes that the `:root` custom properties in `src/app/globals.css` are the **authoritative design tokens**. This document is the design decision source those tokens implement; it is not itself the token source.
- **Related context:** `docs/structure.md` owns composition, spans, spacing, and stacking. This document owns typographic and visual character inside that space.
- **Palette:** the colour values recorded in this document are the normative chromatic reference. Do not substitute a navy-normalized variant of them.

Values expressed as "approximately" are design references, not exact implementation requirements.

## Visual character

CrimsonTide should feel dark, precise, technical, restrained, high-contrast, contemporary, and premium without decorative excess.

Use a deep near-black/navy environment, high-contrast white and blue-grey text, and Crimson red as deliberate action, signal, and emphasis.

Depth comes primarily from tonal variation, thin borders, controlled radii, and restrained interaction — not heavy shadows or excessive glass effects.

Avoid generic AI decorative clichés. Visual complexity should support content rather than compete with it.

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
| Header | `rgba(7,9,13,.90)`, moving toward `rgba(7,9,13,.62)` in the approved translucent state |
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

Preserve these chromatic values; do not substitute navy-normalized variants:

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

The animated hero mesh has its own approved configuration. It is an explicit component exception and must **not** redefine the global brand palette.

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

`docs/structure.md` defines media role, size, placement, allowed crop, and responsive order. This document defines how media should feel.

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

**Entrance reveal.** Major content blocks may enter with opacity `0 → 1` and a rise of up to `24px`, on the standard easing at approximately `0.75s`. It fires once when the block first enters the viewport and does not reverse when it leaves. Content must be complete and readable in its resolved state; the reveal is decoration on arrival, never a gate on access. Under reduced motion the block appears already resolved with no transition. Route changes re-arm the reveal for the newly shown page only.

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

## Visual accessibility

- Maintain sufficient contrast between text and surfaces.
- Preserve visible keyboard focus.
- Do not use hover as the only state that reveals essential information.
- Do not use colour alone for error, active state, or selection.
- Keep touch behaviour complete without hover.
- Do not place secondary text where contrast becomes too weak.
- Motion should supplement state changes rather than communicate state by itself.

## Reference synthesis

When building from reference images, separate evidence into three layers:

1. **Structural evidence** — split ratios, card arrangement, section rhythm, image placement, density. Resolve through `docs/structure.md`.
2. **Visual evidence** — surface depth, border character, typography hierarchy, icon treatment, interaction emphasis, effect intensity. Translate into this system rather than copying another brand literally.
3. **CrimsonTide identity** — always preserve CrimsonTide colour roles, Roboto typography, surface families, action families, restrained premium technology character, and established motion limits.

If a reference contains a strong visual idea that conflicts with project identity, preserve the idea's function but redesign its appearance within CrimsonTide.

## Consistency rule

Before creating a new visual value, check whether the result can be achieved by extending an existing colour role, typography role, button family, surface family, radius family, interaction pattern, or icon treatment. Prefer extension over one-off convention.

## Visual completion criteria

A component or view is visually resolved when these decisions are clear:

- typography roles;
- colour roles;
- background/surface family;
- border/radius family;
- primary/secondary action treatment;
- icon/graphic treatment where present;
- hierarchy between content and supporting media;
- default, hover, active, focus, and disabled appearance where those states exist;
- form error/success/disabled behaviour where applicable;
- motion type, duration, and movement limit;
- effect intensity and purpose;
- touch behaviour where hover is unavailable;
- reduced-motion alternative;
- adaptation of reference imagery into recognizably CrimsonTide styling.
