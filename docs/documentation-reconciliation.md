# Documentation reconciliation — 2026-09-13

This sweep reconciles the six route briefs, displayed-copy inventory, Product and Design context, generated design sidecar, architecture/testing guides and historical evidence with the implemented website. It changes documentation and `.impeccable/design.json` only. It does not change application APIs, types, dependencies, tests, scripts, displayed copy or runtime behavior.

The checkout started clean at `1536410bd78d04ec94367b180db76d3ac798eb1a`. Current specifications describe this implementation; historical records retain their original measurements and limitations. `AGENTS.md`, its generated Next.js block, the `CLAUDE.md` include and Impeccable configuration remain unchanged.

## Supplied planning baseline

The preceding sweep reported these results before documentation edits. They are retained as that sweep's evidence, not represented as a new execution:

| Check | Recorded result |
| --- | --- |
| Six routes × desktop, tablet, mobile, reduced motion and no JavaScript | 30 checks: HTTP 200, one h1, no horizontal overflow, no broken image elements, no observed page errors |
| Selected serial Chromium suites | **266 passed, 9 skipped, 4 failed** |
| Three of the failures | Removed “Continue in email” button expected by the Contact smoke assertion |
| Remaining failure | Mobile history restoration; its isolated rerun passed |
| Static/backend checks | Lint, type checking and all 13 contact backend tests passed |
| Working tree at that handoff | Clean; no application or documentation edits |

The passing isolated history rerun does not erase the original failure. This baseline is not a green browser-suite result.

## Verification during documentation implementation

Source review covered route composition, action destinations, controller eligibility, CSS, lifecycle targets, Contact validation/outcome handling and existing tests. Rendered text and links were compared with the revised copy inventory. Test definitions establish intended coverage only; executions are listed separately below.

- A fresh serial rendered inventory covered all six routes at desktop 1440 × 900, touch tablet 768 × 1024, touch/mobile 390 × 844, reduced-motion desktop 1440 × 900, and no-JavaScript 390 × 844. All **30 route/mode checks** returned HTTP 200, one h1, no horizontal overflow, no broken image elements and no observed page errors. The pass scrolled each route and decoded image elements, including lazy images. It did not establish CSS-background failure handling or full accessibility conformance.
- `npm run test:contact`: **13 passed**. Transports were mocked; this verified backend handling and email construction without SMTP delivery.
- `npx playwright test tests/e2e/contact-email.spec.ts --workers=1 --reporter=line --output=test-results/documentation-contact`: **36 passed** across the configured Chromium projects (57.7 seconds). This covered sending locks, outcomes, server errors, network/malformed-response/timeout uncertainty, development mock integration, keyboard order and pending-request navigation cleanup. It did not rerun or resolve the broader suite's smoke/history failures.
- Documentation validation checked local Markdown paths, all six primary/related surface targets, rendered action labels and hrefs, internal route fragments, copy inventory, frontmatter token references, sidecar schema version 2, component references, CSS token names and narrative agreement. Synthesized sidecar color ramps are illustrative; canonical colors match the source-derived frontmatter values.
- All ten sidecar examples were rendered in isolated shadow roots and visually inspected; the CSS parsed and controls were visible. Scoped box sizing keeps standalone preview dimensions consistent with the site.
- Impeccable's read-only `doctor --json` reported only `config-build-path-unset`. The unrelated `buildPath` preference remains unchanged; no automatic repair was run.
- Final whitespace and scope review uses `git diff --check` and verifies that changes are restricted to Markdown and the design sidecar. Changes remain uncommitted at this documentation handoff.

The fresh inventory and helper scripts are local TEMP output (`reconcile-browser.json` and `reconcile-*.cjs`/`.py`); they are not repository deliverables. Contact test artifacts are disposable ignored output under `test-results/`. `playwright-report/` is also ignored; `build/` is not. Historical benchmark/capture paths in older records are described as local files, not working links to unavailable artifacts.

## Separate maintenance follow-ups

| Follow-up | Current finding | Remaining work |
| --- | --- | --- |
| Contact smoke expectation | `tests/e2e/smoke.spec.ts` expects “Continue in email”; the current submit is “Start Conversation” | Reconcile the smoke assertion with the server-email workflow and rerun it across projects |
| Home Company destinations | `home-backgrounds.spec.ts` and `company-mountains.spec.ts` expect `/company#company-about`; the Home action links to `/company` | Update stale destination expectations separately; mountain coverage belongs to Home |
| Mobile history restoration | The baseline failed once and passed in isolation | Diagnose under the serial navigation suite; retain both outcomes until resolved |
| Mesh profiling | `scripts/mesh-evidence.mjs` still requests the removed `hero-mesh` target and former Home scene | Update targeting/capture semantics for `company-mesh` and `company-mountains` before collecting a new comparable profile |

The older [asset-cleanup record](asset-cleanup.md) also retains its **380 passed, 154 skipped, 21 failed** run and **2 passed, 1 skipped, 1 failed** focused rerun, including its mountain/reveal/journey limitations. Those are distinct historical runs; this documentation work does not resolve their assertions or overwrite their results.

## Evidence limits

This is documentation reconciliation, not production certification. Browser coverage is Chromium desktop and emulation, without Firefox, Safari or physical devices. No full accessibility audit, real assistive-technology session, deployment, SMTP connection or inbox receipt was established. Current source was the authority for configured outbound destinations; external product availability was not checked. Lint/type checking results above belong to the supplied baseline; application builds and the full browser suite were not repeated for these documentation-only edits. Production email still requires the setup and manual two-inbox check in [Contact email setup](contact-email-setup.md).
