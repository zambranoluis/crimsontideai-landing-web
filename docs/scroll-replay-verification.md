# Scroll replay verification — 2026-09-10

This record covers the bidirectional Reveal implementation and the route behavior documented in `DESIGN.md` and the six `.impeccable/surfaces/` briefs.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; all six routes statically generated |
| `npm run test:e2e -- -- --workers=2 --reporter=line` | 69 passed, 27 intentional project skips, 0 failed |
| `git diff --check` | Passed |

The motion suite covers untransformed 78% downward and 22% upward gates, complete-exit reset without a transition, down/up/down replay on every route, direction changes near a boundary, groups taller than the viewport, initial visibility, fast jumps, direct fragments, back/forward restoration, focus and blur, mounted resize, live motion-preference changes, and no-JavaScript readability. It also verifies reversible Home hero transforms and Products feature steps, sticky containment, static scene fallback, and ambient media pause/resume.

## Visual pass

The repository capture workflow recorded Home and Products at `1440×900` and `390×844`. Each recording contains a slow downward pass, instant top/bottom jumps, and a reverse pass. Contact sheets sampled the four recordings for clipping, blank or flickering Reveal groups, sticky-preview overlap, reverse progression, header coverage, and horizontal overflow.

No visual regressions were observed. Desktop sticky previews remained contained below the header and released before their exits. Mobile previews and feature text remained in normal flow. Re-entering copy was readable in both directions, and fast jumps did not leave visible destination content transparent.

The recordings and review sheets are local, uncommitted evidence under `%TEMP%/crimsontide-home-products`.

## Browser limits

Automated and visual checks use Chromium desktop plus Playwright tablet/mobile emulation. Safari, Firefox, physical touch hardware, dynamic mobile browser chrome, hardware-specific animation smoothness, and production-host behavior were not verified. The visual pass is inspection evidence, not a pixel-baseline approval.
