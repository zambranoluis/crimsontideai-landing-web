---
name: CrimsonTide
description: Deep Field — a vast dark ground where light is rare and therefore meaningful.
colors:
  alert-crimson: "#EF3340"
  alert-crimson-hover: "#FF4A56"
  alert-crimson-deep: "#A50F28"
  openjm-signal-blue: "#2356FF"
  detection-cyan: "#7ED9FF"
  instrument-black: "#07090D"
  instrument-black-raised: "#0B0F16"
  raised-slate: "#0E141D"
  raised-slate-high: "#121925"
  readout-white: "#F4F6F8"
  readout-label: "#D9DDE3"
  readout-lead: "#BCC4CE"
  readout-nav: "#AEB6C1"
  readout-muted: "#9AA5B3"
  hairline: "rgb(255 255 255 / 10%)"
  hairline-strong: "rgb(255 255 255 / 18%)"
typography:
  display:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(60px, 4.8vw, 72px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(44px, 3.6vw, 52px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  lead:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.62
  body:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.62
  action:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.4
  label:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    letterSpacing: "0.11em"
rounded:
  xs: "4px"
  sm: "5px"
  md: "12px"
  lg: "14px"
  pill: "999px"
spacing:
  gutter-sm: "20px"
  gutter-md: "40px"
  gutter-lg: "80px"
  section-sm: "80px"
  section-md: "96px"
  section-lg: "112px"
  gap: "24px"
  card: "32px"
  panel: "40px"
components:
  action-primary:
    backgroundColor: "{colors.alert-crimson}"
    textColor: "#FFFFFF"
    typography: "{typography.action}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    height: "50px"
  action-primary-hover:
    backgroundColor: "{colors.alert-crimson-hover}"
  action-primary-active:
    backgroundColor: "{colors.alert-crimson-deep}"
  action-secondary:
    backgroundColor: "rgb(255 255 255 / 4.5%)"
    textColor: "{colors.readout-white}"
    typography: "{typography.action}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    height: "50px"
  action-secondary-hover:
    backgroundColor: "#FFFFFF"
    textColor: "#090B0F"
  action-text:
    backgroundColor: "transparent"
    textColor: "{colors.readout-white}"
    typography: "{typography.action}"
    padding: "12px 0"
    height: "50px"
  card-surface:
    backgroundColor: "linear-gradient(145deg, rgb(255 255 255 / 5.5%), rgb(255 255 255 / 1.8%))"
    textColor: "{colors.readout-muted}"
    rounded: "{rounded.lg}"
    padding: "32px 32px 20px"
  nav-link:
    textColor: "{colors.readout-nav}"
    typography: "{typography.action}"
    rounded: "{rounded.xs}"
    padding: "8px 10px"
    height: "44px"
  nav-link-current:
    backgroundColor: "rgb(255 255 255 / 6%)"
    textColor: "{colors.readout-white}"
  header-bar:
    backgroundColor: "rgb(7 9 13 / 90%)"
    height: "88px"
---

# Design System: CrimsonTide

## Overview

**Creative North Star: "Deep Field"**

The system behaves like a long-exposure image of empty sky. The ground is near-black and almost featureless — a faint 52px grid drifts across the top of the page and fades out by 80% of its height, the way a plate fogs toward its edge. Against that emptiness, every point of light reads as an event. Nothing is bright because brightness is the house style; things are bright because they matter, and the vast quiet around them is what makes them legible.

That principle governs density before it governs colour. Sections run the full height of the viewport below the header, copy holds to roughly 53 characters, and the space between elements is generous to the point of being conspicuous. The restraint is not minimalism for its own sake — it is the mechanism that lets a single crimson action, a single blue product dot, or a single cyan detection trace carry weight without raising its voice. Depth follows the same logic: surfaces are flat, separated by tone and a hairline, never by a soft drop shadow.

The register is technical and premium without decorative excess. It should read as instrumentation built by people who know what they are doing, not as a marketing surface dressed in dark mode.

**Key Characteristics:**

- Near-black ground with a faint, fading structural grid
- Light used sparingly; emptiness is an active material
- Tonal layering and hairlines instead of drop shadows
- One type family, tightly tracked, at large display sizes
- Colour assigned by function — alert, product, detection — never by taste
- Small, fast, deliberate state changes on every interactive element

## Colors

A near-monochrome field of cool blue-blacks and blue-greys, punctured by three saturated colours that each answer to a specific job.

### Primary

- **Alert Crimson** (`#EF3340`): the single loudest element on any screen. Primary actions, the active-navigation underline, and the terminal period in a headline. It is the company's colour and the interface's only alarm.
- **Alert Crimson Hover** (`#FF4A56`): the lift state of a primary action, and the strong end of the error family.
- **Alert Crimson Deep** (`#A50F28`): the pressed state of a primary action, and the ground behind selected text.

### Secondary

- **OpenJM Signal Blue** (`#2356FF`): belongs to OpenJM. The product dot, product-specific accents, and OpenJM's visualisations. It never appears as generic decoration.
- **Detection Cyan** (`#7ED9FF`): belongs to Sentinel's detection visuals — traces, overlays, and the live readouts in the product preview. It reads as a machine seeing something.

### Neutral

- **Instrument Black** (`#07090D`): the page ground. Everything sits on it.
- **Instrument Black Raised** (`#0B0F16`): the mobile navigation panel and secondary full-bleed regions.
- **Raised Slate** (`#0E141D`): the standard raised surface, one tonal step off the ground.
- **Raised Slate High** (`#121925`): the pressed state of navigation surfaces and the highest routine layer.
- **Readout White** (`#F4F6F8`): headings and primary text.
- **Readout Label** (`#D9DDE3`): small uppercase supporting type, including footer headings and form context.
- **Readout Lead** (`#BCC4CE`): lead paragraphs, one step above body.
- **Readout Nav** (`#AEB6C1`): navigation links at rest.
- **Readout Muted** (`#9AA5B3`): body copy and supporting text.
- **Hairline** (`rgb(255 255 255 / 10%)`) and **Hairline Strong** (`rgb(255 255 255 / 18%)`): every border in the system. Structure is drawn, never shaded.

### Named Rules

**The One Star Rule.** At most one crimson-filled element per viewport. Crimson *marks* — the 1px rule under a footer group heading, the active-navigation underline, and a headline's closing period — are hairlines, not stars, and do not count against it. Two filled crimson buttons competing in one region is the failure this rule exists to prevent.

**The Assigned Colour Rule.** Signal Blue is OpenJM's. Detection Cyan is Sentinel's. Crimson is the company's and the interface's alert. A colour never appears outside the thing it belongs to, and no fourth accent is introduced to solve a local problem — if an established role fits, use it.

**The Drawn-Structure Rule.** Separation is a 1px hairline at 10% white, or 18% where the edge must hold its own. Never a shadow, never a solid grey rule.

## Typography

**Display / Body / Label Font:** Roboto (with Helvetica Neue, Arial, sans-serif)

**Character:** One family carries the entire system. Roboto at 500 weight with heavy negative tracking reads as engineered rather than editorial — the letterforms are neutral enough to disappear at body size and structured enough to hold a 72px headline without ornament. The contrast in the system comes from scale and weight, not from a second typeface.

### Hierarchy

- **Display** (500, `clamp(60px, 4.8vw, 72px)`, 1.08, -0.035em): page headlines, one per route. Balanced text wrapping is on.
- **Headline** (500, `clamp(44px, 3.6vw, 52px)`, 1.08, -0.035em): section headings.
- **Title** (500, 26px, 1.08, -0.035em): card and sub-section headings.
- **Lead** (400, 18px, 1.62): the paragraph directly under a headline, in Readout Lead. Capped at 53ch.
- **Body** (400, 16px, 1.62): all other prose, in Readout Muted. Capped at 53ch.
- **Action** (700, 14px, 1.4): button and link labels, navigation.
- **Label** (800, 11px, 0.11em, uppercase): supporting interface labels and footer group headings.

### Named Rules

**The One Family Rule.** Roboto only. No serif, no display face, no mono. A serif headline appearing in a reference composition is a comp, not a licence to add a family.

**The Tight Head Rule.** Every heading rides `-0.035em` tracking and `1.08` line-height, at every size. The tightness is the system's signature; loosening it at small sizes breaks the family resemblance between a 72px hero and a 26px card title.

**The 53-Character Rule.** Prose measures cap at 53ch. In a field this empty, a long line has nothing to bounce off and becomes unreadable.

**Real Copy Rule.** Layouts must accommodate the approved displayed text at its natural reading length. Do not shorten content or force line breaks merely to preserve a composition.

## Layout

A single centred column of `1440px` maximum width, plus page margins, holds every route. The margin is the responsive instrument: `20px` on small screens, `40px` from 768px, `80px` from 1024px. Content never touches the viewport edge and never exceeds the container.

Sections are tall. Each runs `min-height: calc(100svh - header-offset)` with vertical padding stepping `80px → 96px → 112px` across the same breakpoints, so a section occupies roughly one screen and the visitor arrives at one idea at a time. The header is sticky at `88px` (with a `132px` scroll offset reserved between 1024px and 1280px so anchored content clears the wrapped navigation).

Grids are shallow and explicit: two equal columns for the product pair, `1fr 1.15fr` for the solutions panel, six columns for the footer. They collapse to a single column rather than reflowing into denser arrangements.

Behind everything, a 52px square grid drawn in white at 2.5% is fixed to the viewport and masked to transparent by 80% of its height. It is atmosphere, not structure — it never aligns to content and never becomes a layout aid.

Type steps down with the same breakpoints the margins use: display runs `clamp(38px, 5vw, 48px)` below 768px and `clamp(48px, 6vw, 60px)` between 768px and 1024px before reaching its full size; headline and title step correspondingly.

### Named Rules

**The One-Idea-Per-Screen Rule.** A section is sized to a viewport because it should carry one argument. If a section needs two, it is two sections.

**Reading Order Rule.** When a layout stacks, its desktop reading order remains intact: explanation before action, evidence before invitation, and labels with the content they introduce.

## Supporting Media

Supporting media clarifies an idea but never carries a claim that the adjacent text does not make. Product previews and illustrations are composition rather than live product evidence. At narrow widths, media may simplify, move after its associated copy, or be omitted when it would obscure the reading flow. Text, actions, and documented evidence remain present and reachable without it.

## Elevation & Depth

Surfaces are flat. Depth is built from three tonal steps — Instrument Black ground, Raised Slate surface, and a card gradient of white at 5.5% falling to 1.8% — each separated by a hairline. No element casts a drop shadow to indicate that it sits above another.

What the system *does* use is ambient glow: soft, coloured, and diffuse, signalling energy rather than height. A primary action carries a crimson bloom beneath it. Sentinel's detection visuals carry a faint cyan halo. Glow is always the colour of the thing it belongs to and never neutral.

### Shadow Vocabulary

- **Crimson bloom** (`box-shadow: 0 16px 40px rgb(239 51 64 / 20%)`): under a primary action, at rest. The action's energy, not its elevation.
- **Detection halo** (`box-shadow: 0 0 0 1px rgb(110 255 226 / 3%), 0 0 22px rgb(0 239 201 / 7%)`): around Sentinel's live visualisations.
- **Overlay lift** (`box-shadow: 0 24px 70px rgb(0 0 0 / 35%)`): the one structural exception, reserved for the mobile navigation panel. An overlay genuinely leaves the page and is the only thing permitted to say so.
- **Inset highlight** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 12%)`): a top-edge catchlight on a raised surface, standing in for a bevel.

### Named Rules

**The Glow-Not-Shadow Rule.** Colour signals energy; it never signals height. If an element needs to look lifted, raise its tone or strengthen its hairline. The only neutral drop shadow in the system belongs to the mobile navigation overlay.

## Shapes

Rectilinear and softly cornered. Interactive controls take a `5px` radius — small enough to read as machined rather than friendly. Surfaces and cards take `14px`, generous enough to feel like a distinct object on the field. Panels that open from an edge take `12px` on their free corners only, so the joined edge stays flush.

Only two shapes break the rectangle: the `50%` product dot, an 8px circle that colour-codes OpenJM and Sentinel, and the `999px` pill used for status chips. The 24px × 1px rule under each footer heading is unrounded — it is a mark, not an object.

Borders are always 1px and always white at 10% or 18%. There are no double borders, no dashed edges, and no gradient strokes.

### Named Rules

**The Two-Radius Rule.** `5px` for anything you click, `14px` for anything you read inside. A third radius needs a reason that survives being said out loud. *(The current implementation also carries 4px, 8px, 9px, 10px and 16px in isolated places; these are drift, and new work should resolve to the two-radius scale.)*

## Components

Components are **precise and responsive**: quiet at rest, unmistakably alive on interaction. Every state change is small, fast, and runs on the same easing — `.3s cubic-bezier(.2, .75, .2, 1)`.

### Buttons and Action Links

- **Shape:** softly machined corners (5px radius), 50px minimum height, 12px/20px padding, 12px gap between label and icon.
- **Primary:** Alert Crimson fill, white label, crimson hairline border, crimson bloom beneath.
- **Secondary:** white at 4.5% fill on the ground, Readout White label, Hairline Strong border.
- **Text:** no fill, transparent border, no horizontal padding, left-aligned.
- **Hover:** lifts 2px; the trailing arrow slides 4px right. Primary warms to Alert Crimson Hover; secondary inverts to a white fill with near-black text; text turns Alert Crimson Hover.
- **Active:** presses 1px down and the border goes Alert Crimson. Primary deepens to Alert Crimson Deep.
- **Focus:** a 3px Alert Crimson outline at 5px offset — the global focus treatment, never removed.
- **Mobile:** primary actions go full width below 768px.

### Cards and Surfaces

- **Corner style:** 14px radius.
- **Background:** the card gradient, white 5.5% falling to 1.8% at 145°.
- **Border:** 1px Hairline, rising to Hairline Strong when any link inside is hovered.
- **Focus:** the border goes Alert Crimson when focus lands anywhere inside — the card announces itself as a unit rather than highlighting only the focused child.
- **Internal padding:** 32px, with the bottom relaxed to 20px where an action sits at the foot of the card.
- **Shadow:** none. See Elevation & Depth.

### Navigation

- **Style:** Readout Nav at 14px, 4px radius, 44px minimum target, no fill at rest.
- **Current route:** Readout White on white-at-6%, plus a 2px Alert Crimson underline at 9px offset.
- **Hover:** white at 6% fill and Readout White text. **Active:** Raised Slate High fill.
- **Header:** sticky, Instrument Black at 90% with a 16px backdrop blur and a Hairline bottom border, 88px tall.
- **Mobile:** below 1024px the links collapse into a disclosure whose two-line glyph rotates 90° and turns crimson when open; the panel is Instrument Black Raised, 12px bottom corners, Hairline Strong border, and the overlay lift shadow. The separate header action disappears at this size and the contact link lives inside the panel.

### Reveal

Reveal groups are replayable entrances, not permanent completion states. A group enters by rising 20px and fading in over `650ms` on the shared easing. Optional staggering is capped at `160ms` (the current rhythm uses 80ms increments).

On downward scroll, entrance begins when the group's untransformed top reaches 78% of the viewport height. On upward scroll, it begins when the untransformed bottom reaches 22%. Once revealed, the group stays fully readable until it has completely left the viewport; it then resets offscreen without an exit transition and replays the same upward fade at the next qualifying entry. Reversing direction while the group remains on screen never restarts it. This also applies to groups taller than the viewport.

Content intersecting the viewport on initial load is visible immediately. Fast jumps, fragment destinations, browser-history restoration, resizes, and other layout changes resolve visible destination content even when no threshold-crossing frame occurs. Focus entering a group reveals it immediately without animation and holds it while focus remains inside; after blur it stays visible until complete viewport exit.

Under `prefers-reduced-motion`, reveal groups are always visible and transitions are removed. Changing that preference while mounted never hides content currently being read. Without JavaScript, no reveal attributes are added, so content remains visible.

### Motion categories

- **Replayable entrances:** text and content groups follow the Reveal rules above. They reset only while fully offscreen.
- **Reversible scroll-linked effects:** Home hero artwork and eligible desktop Products scenes derive their state from scroll position. Reverse scrolling returns their transforms, progress, and active feature steps toward their starting values rather than treating progress as complete.
- **Ambient loops:** decorative canvases and videos run only while visible, the document is active, and motion is allowed. Leaving and re-entering pauses and resumes them; reverse scrolling does not rewind their internal time. Reduced motion keeps their static fallback visible.

### Shared route and navigation behavior

Every route uses the sticky SiteHeader and the complete SiteFooter. The header exposes the six primary routes, indicates the current route, supplies the skip link, and collapses to a keyboard-operable disclosure below 1024px. Selecting a different route in primary navigation closes the mobile menu and places the new route at the top; modified clicks and selection of the current route retain native behavior. The footer repeats implemented product, solution, work, company, and contact destinations; labels without implemented destinations remain non-links.

Fragment links keep their named destination below the sticky header through the shared scroll offset. Reveal groups at a direct or in-page fragment destination resolve visibly even if the browser jumps over an entrance gate. Back and forward navigation retain the browser's restored route and scroll position, after which scroll-linked scenes and Reveal groups synchronize to the restored viewport. Internal links remain ordinary links, and external product exits open a new tab as documented by the Products surface.

### Named Rules

**The One Easing Rule.** `cubic-bezier(.2, .75, .2, 1)` at `.25s`–`.3s` for state and `650ms` for entrance. A component that invents its own curve breaks the system's sense of being one machine.

## Do's and Don'ts

### Do:

- **Do** let emptiness carry the composition. Generous space between elements is the mechanism that makes rare light meaningful.
- **Do** assign colour by function: crimson for alert and action, Signal Blue for OpenJM, Detection Cyan for Sentinel.
- **Do** draw structure with 1px hairlines at 10% or 18% white.
- **Do** keep every heading at `-0.035em` and `1.08`, at every size.
- **Do** cap prose at 53ch and lead with Readout Lead before dropping to Readout Muted.
- **Do** give every interactive element the full state set — hover lift, 3px crimson focus outline at 5px offset, 1px active press.
- **Do** run every transition on `cubic-bezier(.2, .75, .2, 1)`.
- **Do** keep Jamaica present as origin and context through atmosphere and language.

### Don't:

- **Don't** use a neutral drop shadow for depth. Raise the tone or strengthen the hairline instead; the mobile navigation overlay is the only exception.
- **Don't** put two crimson-filled elements in one viewport.
- **Don't** introduce a second type family. A serif in a reference composition is not a licence.
- **Don't** invent a near-identical colour for one component when an assigned role already fits.
- **Don't** add radii outside 5px and 14px (12px for edge-joined panels).
- **Don't** reach for generic AI decoration — neural-network swirls, glowing orbs, circuit traces, particle soup.
- **Don't** use heavy glassmorphism. The one backdrop blur in the system is the 16px on the sticky header.
- **Don't** represent Jamaica with flags, palms, or tourism imagery.
- **Don't** let a decorative element compete with content; the background grid stays at 2.5% and never aligns to anything.
