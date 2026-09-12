# Company responsive verification

Implemented full hero map coverage and centered artwork-only scrolling through 1024px and on coarse primary pointers. Desktop full-scene pinning is preserved. Changes are local and uncommitted.

- `tests.log`: 44 passed, four desktop-only skips, serial Chromium.
- `targeted-tests.log`: nine strengthened fallback, cleanup, sizing and rotation checks passed serially.
- `lint.log`, `typecheck.log`, `build.log`: passed.
- `impeccable.json`: six existing palette/type advisories, no blocking findings.
- `geometry.json`: measured track mode, size, distance and sticky top for every capture viewport.
- `desktop-comparison.json`: zero changed pixels in desktop About copy and principles at 1366 x 768 and 1440 x 900, excluding artwork and preceding section.

Hero, brain, gear, bulb, both transitions, approach and release screenshots use viewport captures without locator-induced scroll. `before-*` and `after-about-*` preserve desktop comparisons. `capture.mjs` reproduces the current captures.

Recordings:

- [Mobile entry, release and reverse](390x844-entry-release-reverse.webm)
- [Tablet entry, release and reverse](768x1024-entry-release-reverse.webm)

Browser emulation only: no physical-device, Firefox or Safari evidence. Hidden-document testing uses a synthetic visibility signal. Equivalent CSS viewport sizing represents the zoom check.
