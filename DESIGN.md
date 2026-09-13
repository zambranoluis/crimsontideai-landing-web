---
name: CrimsonTide
description: Deep Field — a vast dark ground where light is rare and therefore meaningful.
colors:
  alert-crimson: "#EF3340"
  alert-crimson-hover: "#FF4A56"
  alert-crimson-deep: "#A50F28"
  action-primary-bg: "#C62038"
  action-primary-hover-bg: "#DC2A40"
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
  navigation:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.62
  footer-heading:
    fontFamily: "Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0"
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
  showcase-sm: "72px"
  showcase-md: "104px"
  showcase-lg: "144px"
  showcase-gap-sm: "40px"
  showcase-gap-md: "56px"
  showcase-gap-lg: "80px"
  gap: "24px"
  card: "32px"
  panel: "40px"
components:
  action-primary:
    backgroundColor: "{colors.action-primary-bg}"
    textColor: "#FFFFFF"
    typography: "{typography.action}"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    height: "50px"
  action-primary-hover:
    backgroundColor: "{colors.action-primary-hover-bg}"
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
    backgroundColor: "{colors.alert-crimson-deep}"
    textColor: "#FFFFFF"
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
    padding: "32px"
  nav-link:
    textColor: "{colors.readout-nav}"
    typography: "{typography.navigation}"
    rounded: "{rounded.xs}"
    padding: "8px 10px"
    height: "44px"
  nav-link-current:
    backgroundColor: "rgb(255 255 255 / 6%)"
    textColor: "{colors.readout-white}"
  header-bar:
    backgroundColor: "rgb(7 9 13 / 90%)"
    height: "88px"
  header-action:
    backgroundColor: "transparent"
    textColor: "{colors.readout-white}"
    typography: "{typography.action}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    height: "50px"
  contact-field:
    backgroundColor: "{colors.raised-slate}"
    textColor: "{colors.readout-white}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "12px"
    height: "48px"
  contact-submit:
    backgroundColor: "{colors.alert-crimson-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "12px 20px"
    height: "50px"
  footer-heading:
    textColor: "{colors.readout-white}"
    typography: "{typography.footer-heading}"
    padding: "0 0 12px"
  mobile-menu:
    backgroundColor: "{colors.instrument-black-raised}"
    padding: "12px"
---

# Design System: CrimsonTide

## Overview

**Creative North Star: "Deep Field"**

The ground is near-black, with a faint fixed grid and generous space around the content. Light gives emphasis to actions, product illustrations and supplied artwork. The register is technical and premium, with CrimsonTide's capability and Jamaican origin carried by the copy and compositions.

The shared tokens above describe defaults extracted from `src/app/globals.css` and shared components. Route modules deliberately override measures, type, spacing, colors, radii and motion. Those implemented exceptions are part of the current design, not instructions to normalize the site. Product truth lives in `PRODUCT.md`, exact text in `docs/content.md`, and ordered route experiences in `.impeccable/surfaces/`.

**Key Characteristics:**

- Near-black ground with a faint, fading structural grid
- Crimson actions and restrained light against generous space
- Tonal layers, hairlines and route-owned artwork
- Roboto typography with responsive, locally adjusted measures
- Distinct product previews without a shared feature-comparison narrative
- Replayable entrances, reversible scroll scenes and suspended ambient loops

## Colors

Alert Crimson is the brand, focus and navigation accent; its hover and deep variants support interaction and selection. Shared filled primary actions use dedicated `--action-primary-bg` (`#C62038`) and `--action-primary-hover-bg` (`#DC2A40`) tokens, matching the existing Solutions action palette. White labels have 5.73:1 contrast at rest and keyboard focus, 4.72:1 on hover, and 7.78:1 when pressed on Deep Crimson (`#A50F28`). OpenJM Signal Blue and Detection Cyan remain available product tokens. The current illustrations also use local colors: Sentinel has green/cyan readouts, Contact has supplied blue/red terrain, Company particles retain their supplied reds, and Solutions defines its own crimson. Preserve these artwork palettes rather than recoloring them to a generic token role.

Instrument Black is the page ground; Instrument Black Raised, Raised Slate and Raised Slate High serve panels, fields and active states. Readout White, Lead, Muted, Label and Nav define the shared text hierarchy. Hairline and Hairline Strong are the usual white borders. Footer ground/text, tinted card borders, errors and artwork have explicit local values. Preview metrics are illustrative, never live operational evidence.

**The Assigned Colour Rule.** Reuse the shared color role when it fits, and preserve supplied artwork and documented local palettes. Do not invent a new brand accent to resolve a routine component state.

**The Action Hierarchy Rule.** Give each content region a clear primary action. Several sections and their actions may share a viewport; a universal one-filled-button-per-viewport limit is not implemented.

## Typography

Roboto, loaded by the root layout, falls back to Helvetica Neue, Arial and sans-serif. The frontmatter display/headline/title values describe the desktop defaults, not every heading on every route.

| Shared role | Below 768px | 768–1023px | From 1024px |
| --- | --- | --- | --- |
| h1 | clamp(38px, 5vw, 48px) | clamp(48px, 6vw, 60px) | display token |
| h2 | clamp(30px, 4vw, 36px) | 42px | headline token |
| h3 | 22px | 24px | title token |

Shared h1–h4 use balanced wrapping, 1.08 line-height and -0.035em tracking; h1–h3 use weight 500. Body defaults to 16px/1.62. ActionLink labels are 14px/1.4 at 700, while ordinary header links inherit 400/1.62. Footer headings are 12px/1.5 at 700, uppercase with zero tracking. Contact's What happens next label uses the 11px uppercase label treatment.

Local examples: Home principles use 22px/1.2 and -0.02em; Home offering headings use 16px/1.35 and -0.015em; Products feature headings use 22px/1.3 and body 16px/1.7. OpenJM and Sentinel showcase headings use different clamps. Earth has a 32–52px heading and a 49ch paragraph; product features allow 55ch, Home's build introduction 66ch, and some introductions use pixel widths. There is no global paragraph max-width or uniform 53ch cap. Intentional authored line breaks remain presentation.

**The One Family Rule.** Use the established Roboto family for interface text; supplied product wordmarks remain assets.

**The Readable Measure Rule.** Preserve local heading metrics and paragraph measures. Layout must accommodate the displayed copy without shortening it to enforce a universal line count.

## Layout

Most content uses a 1440px maximum with responsive page margins of 20/40/80px at 768px and 1024px. The footer instead uses a 1600px maximum and clamp(20px, 2.6vw, 40px) gutters. The fixed background grid is 52px, white at 2.5%, fading by 80%; it does not animate or align content.

Two shared vertical scales coexist: section space is 80/96/112px, showcase space is 72/104/144px; showcase gaps are 40/56/80px. Home middle sections and product showcases use the latter. Routes also own hero padding, compact scenes and sticky tracks. Home's hero has a viewport-minus-header minimum and its closing a 65svh minimum. Earth and Company measure their own scene fit; Products and Delivery have distinct media-query eligibility. Coarse pointers disable Products/Delivery sticky enhancement but do not prohibit Earth or Company artwork-only pinning. See the route briefs for mode selection and normal-flow/static fallback.

Grids reflow locally: Home build panels stack below 1024px; product desktop columns stay mirrored from 1024px even without motion; Work industries use five/three/one columns across 1200px and 768px; Company Jamaica statements use four/two/one across 1024px and 360px. Contact details/form stay in two columns through tablet and stack below 768px. Footer groups use six/three/two columns across 1200px and 768px. These are not a universal grid-collapse rule.

Supporting media clarifies the adjacent idea without extending its claims. Narrow-screen reading order preserves explanations, features, evidence and actions; route briefs specify where previews sit. Images can crop and artwork can simplify while text remains reachable.

Scrollbars use the WebKit pseudo-element path where supported: 8px track, rounded muted thumb and crimson thumb hover. The standard fallback uses `scrollbar-width: thin` and muted-on-dark `scrollbar-color`, with no separate hover color. `.noScrollbar` hides intentionally nonessential nested bars. All overrides, including hiding, are inside `forced-colors: none`, preserving native forced-colors behavior.

**The Reading Order Rule.** Responsive layout and disabled animation preserve the authored reading sequence. A section's height follows its content and route composition, not a universal viewport quota.

## Elevation & Depth

The shared field uses tonal layers and hairlines. ActionLink primary has a crimson bloom; the mobile menu uses a neutral overlay shadow. Local product previews, badges, media surfaces and artwork use additional shadows, inset highlights, glows and filters. The mobile menu is not the only neutral-shadow consumer, and the header is not the only blur consumer.

Shared examples are the primary action's `0 16px 40px rgb(239 51 64 / 20%)` bloom and mobile navigation's `0 24px 70px rgb(0 0 0 / 35%)` shadow. Preserve local source values when documenting a route's depth treatment; preview illustration values are not global component tokens.

**The Restrained Depth Rule.** Use the established tonal surface and border before adding depth; preserve intentional preview and supplied-artwork shadows without turning them into a universal rule.

## Shapes

Shared ActionLink and form controls use 5px corners, navigation 4px, offer panels commonly 14px, and the mobile menu 12px on its lower corners. Product feature badges use 10px, footer social controls 3px, and circular terrain/orbit/status artwork uses its own geometry. There is no product-dot legend. Borders commonly use the two white hairlines, with deliberate crimson/tinted and illustration-specific exceptions.

**The Component Radius Rule.** Reuse a component's existing geometry; preserve route-owned shapes instead of imposing a two-radius palette on the entire site.

## Components

### Actions

ActionLink variants share a 50px minimum, 12px/20px padding, 12px icon gap, 5px radius and 300ms shared easing. Primary uses the dedicated action fill and matching border at rest/focus and on hover, with white text and the existing brand-crimson bloom; secondary has white-at-4.5% fill and a strong hairline; text has transparent border, no horizontal padding and left alignment. Fine hover lifts primary/secondary 2px, moves every trailing arrow 4px, and changes each variant's color; the text control itself does not lift. Active presses 1px and adds a crimson border; primary also deepens. Global keyboard focus is a 3px crimson outline at 5px offset. Primary alone becomes full width below 768px. Global reduced-motion CSS removes transition duration; route overrides may also remove transforms.

Header Contact CrimsonTide is an outlined secondary action: transparent on desktop, 50%-alpha crimson border and 16px horizontal padding. In the mobile menu it is a full-width secondary action with a separated row and the same outline; menu link styling also applies. It is not the filled primary button.

### Cards

Home build panels use the offer gradient, 14px corners and 32px padding (24px/20px on mobile). Nested product cards instead use a dark translucent ground and 20px padding, a hover hairline and crimson focus-within border. Their visible-only shimmer and 2px hover/focus lift are route-owned; offering icons have separate short hover effects. Work evidence and industry cards use image masks, local pointer glow and badges. Noninteractive cards keep their content semantics rather than becoming implied links.

### Header and footer

The sticky header has 90%-opaque Instrument Black, 16px backdrop blur and a bottom hairline. Its 88px minimum becomes a two-row layout from 1024–1279px with a 132px shared offset; at 1280px it returns to one row. Ordinary links have 44px desktop targets, 14px regular type, and local 250ms color/background transitions. Current-route links use a white-at-6% fill and 2px crimson underline at 9px offset. Fine hover strengthens text/background; active uses Raised Slate High.

Below 1024px a native details/summary menu has 48px targets, a rotating two-line glyph and a scrollable panel. JavaScript adds focus on opening, Escape/outside-click closure and breakpoint focus handling. Native disclosure and real links remain usable without JavaScript.

Footer category headings link to route tops except Legal & Support. Items link to the authored sections or route; Privacy, Terms and Support remain non-links. Category hover/focus-within exposes a faint crimson panel and expands the heading's baseline from a 22px mark across the heading. Item hover or link focus draws a rule under the option label; hovering an item does not underline siblings. The item hover selector also styles non-linked legal labels without adding navigation semantics. Desktop rows are at least 36px; mobile rows and social targets become 44px. Footer copy and destinations are inventoried once in `docs/content.md`.

### Contact form

Inputs/select/textarea use Raised Slate, a strong hairline, 5px corners, 12px padding and inherited 16px type; fields have a 48px minimum and textarea 148px with vertical resize. Labels are 14px/700, field gaps 8px and form gaps 20px. Focus uses a crimson border and a 3px 25%-alpha crimson outline at 2px offset; it differs from link/button focus. Placeholders are muted at full opacity and caret is crimson. Errors use Crimson Hover at 14px; a persistent polite live region carries status.

Submit is a separate 16px/700 form button, deep crimson at rest, dark page ground on enabled hover, 1px active press and a 180ms transition. Disabled submit uses Raised Slate, strong hairline and label color; disabled fieldsets retain full-opacity muted text. Fields lock while sending; submit also locks for the three-second sent state. Reduced motion removes submit transforms/transitions. See Contact's brief and setup guide for workflow and uncertainty handling.

### Reveal and motion

Shared Reveal rises 20px and fades over 650ms using `cubic-bezier(.2, .75, .2, 1)`. Default staggering uses 80ms increments capped at 160ms. Work industries override five-column desktop delays to 0/80/160/240/320ms; Solutions Process owns grouped 0/40/80/120/160ms desktop entrances and individual narrow entrances.

Downward entry occurs when the untransformed top reaches 78% of viewport height; upward entry when the bottom reaches 22%. Revealed groups remain readable until completely offscreen, then reset without exit transition. Reversing while visible never restarts them. Initial intersecting content, fast jumps, geometry changes, direct fragments and focused groups resolve immediately. Focus holds visibility until blur and subsequent full exit. Reduced motion keeps all groups visible; server output has no hiding attributes.

Products, Earth, Company and Delivery derive reversible state from scroll position. Ambient loops instead pause/resume elapsed time and do not rewind on reverse scroll. `docs/animation-lifecycle.md` records actual observation targets, minimum ratios and exceptions; each route brief records static/SVG/canvas failure behavior. No-JavaScript output retains content and native links.

### Shared route and navigation behavior

`SiteNavigation`, `InternalLink` and each route's `NavigationMain` coordinate enhanced internal actions. An ordinary route activation, including the current route, goes to the top and focuses its first heading. Repeated section activation runs again from the current reading position. Enhanced section links use clean route URLs without hashes; their authored hrefs retain fragments for native navigation.

For cross-route sections, the departing page retains its position until the destination main activates. The destination first resets to top; after fonts are ready and geometry matches on two frames, it focuses the target heading and scrolls down with a bounded 300–1000ms cubic ease. Same-page section activation starts from the current position. Header scroll-padding and target scroll-margin contribute to alignment. Direct native fragments preserve their URLs and align instantly after readiness, without the top-first phase. Temporary tabindex is removed on blur.

New requests supersede old ones. Wheel, touchmove, pointerdown and scroll keys outside editable controls interrupt active section travel. Popstate/hashchange cancel pending movement; a 15-second timeout and unmount cleanup dispose callbacks. Reduced motion makes section alignment instant. Modified clicks, new tabs, downloads, external links, the native skip link and no-JavaScript links keep native behavior.

Back/Forward is intended to restore the prior route position, then synchronize scenes and visible groups. Direct product-fragment history can return to the anchor itself. The reconciliation baseline observed one intermittent mobile history-restoration failure that passed its isolated rerun; this is not a uniformly green history result. See `docs/documentation-reconciliation.md`.

**The Shared Action Easing Rule.** Shared actions use the source easing at 300ms and Reveal at 650ms; preserve separately documented local timing and reduced-motion behavior.

## Do's and Don'ts

### Do:

- **Do** preserve CrimsonTide's dark field, supplied assets, product independence and displayed copy.
- **Do** use shared tokens for shared primitives and retain source-owned route exceptions.
- **Do** preserve responsive reading order and complete static fallbacks.
- **Do** distinguish decorative progress from business status and preview data from evidence.
- **Do** keep keyboard focus visible and provide tap/keyboard alternatives to dragging.
- **Do** pause ambient work using its actual documented observation target and clean it up on unmount.

### Don't:

- **Don't** impose universal heading metrics, 53ch measures, viewport heights or two-radius limits on local compositions.
- **Don't** add unsupported claims, missing footer destinations or obsolete product dots and section labels.
- **Don't** move text or hijack controls for decorative pointer effects.
- **Don't** treat test intent, a historical passing run or an isolated rerun as current production certification.
- **Don't** replace supplied Jamaica context with flags or tourism imagery.
