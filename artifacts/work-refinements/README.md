# Work refinements — verification evidence

Implemented locally on 2026-09-11. Changes are uncommitted.

The hero now owns the orbit and ocean background; the closing invitation uses the former hero background. All 15 partner tiles share the existing hover treatment. Each sector image and gradient is clipped together and fades into the actual card surface; badges remain outside the image clip.

## Screenshots

| Surface | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Hero | [1280px](desktop-hero.png) | [768px](tablet-hero.png) | [393px](mobile-hero.png) |
| Closing | [1280px](desktop-closing.png) | [768px](tablet-closing.png) | [393px](mobile-closing.png) |
| Sector cards | [Every card: rest, transition, hover, exit](sector-states.png) | [All five at rest](tablet-sectors.png) | [All five at rest](mobile-sectors.png) |

[All 15 partner hover states](partner-hovers.png). This sheet assembles individually hovered tiles; they are not simultaneously hovered in the interface.

The sector state sheet uses columns for rest, an image transition held at 120ms, full hover, and completed exit. Screenshots and geometry assertions found no image strips, clipped badges, or copy movement within cards. Extra width checks at 320, 899, 900, 1024, and 1440px found zero horizontal overflow and the expected 900px stacking boundary.

## Checks

- `node node_modules/@playwright/test/cli.js test tests/e2e/work.spec.ts --workers=1 --reporter=line`: **19 passed, 17 intentional device-specific skips** across the configured desktop, tablet, and mobile Chromium projects.
- Orbit checks cover initial animation, offscreen pause and re-entry, simulated document visibility changes, reduced-motion changes, client route departure and return, pointer reset, keyboard focus, preserved destinations, and static no-JavaScript presentation.
- Partner checks cover all 15 hover/reset states on desktop, noninteractive marks on touch configurations, and General Food keyboard focus and case-study navigation.
- Sector checks cover every card at rest across three viewports and every card during transition, hover, and exit on desktop. Copy position is measured relative to the card so Reveal motion cannot contaminate the measurement.
- The existing pointer-glow test intermittently measured before its Reveal began. It passed in isolation; the test now waits for the revealed state before awaiting animation completion, preserving its original coordinate tolerance. The final full serial run passes.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`: passed.
- Impeccable detector: advisory findings only, covering retained typography/colors and the black alpha-mask value. The mask value defines opacity, not a visible palette color.

Coverage is Chromium with configured viewport/touch emulation. Firefox, WebKit/Safari, and physical devices were not tested. Document hiding was simulated in the lifecycle test.
