# CrimsonTide website

CrimsonTide is a six-route Next.js marketing website for the company, its products, AI solutions, work, and contact demonstration.

## Development

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

## Source architecture

- Each App Router route owns its sections in `_sections/<SectionName>/`. Home uses `src/app/_sections`; named routes use `src/app/<route>/_sections`.
- Section-owned helpers, data, styles, and artwork stay beside that section. Components shared only within one route live in that route's `_components` directory.
- `src/components/layout` contains the site header and footer. `src/components/sections` contains only cross-route sections, and `src/components/ui` contains shared primitives.
- Route `page.tsx` files own metadata and compose sections; they do not own section copy or data.

## Project documents

- `docs/content.md` owns displayed copy, actions, contact details, and demonstration states.
- `DESIGN.md` owns the shared visual, motion, navigation, and responsive behavior rules.
- `PRODUCT.md` owns company and product positioning.
- `.impeccable/surfaces/` owns the ordered experience and route-specific behavior for each of the six implemented surfaces.
- `tests/e2e/README.md` owns the supported browser-check commands and local runtime details.
- `docs/scroll-replay-verification.md` records the latest implementation verification and its browser limits.
- `docs/home-products-verification.md` is a labelled historical verification record, not a source of current behavior.

When an interaction changes, update its route brief (and `DESIGN.md` when the rule is shared) in the same change as the implementation and behavioral tests. A change is not complete while those descriptions and checks disagree.
