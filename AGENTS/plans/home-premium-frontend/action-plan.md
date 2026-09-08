# Home Premium Frontend

## Plan record

- **Plan ID:** `home-premium-frontend`
- **Mode:** Plan with tracking
- **Created:** 2026-09-08 (first presented in the conversation; exact time not recorded)
- **Saved:** 2026-09-08 18:53:48 UTC
- **Approved:** 2026-09-08 19:00:56 UTC
- **Last updated:** 2026-09-08 19:30:43 UTC
- **Status:** Complete

## Authorization state

The user explicitly approved this saved plan in the resumption message: "the plan is approved." Implementation, dependent verification, and saved tracking updates are authorized within the complete scope below.

The user explicitly authorized Playwright visual verification covering responsiveness, interactivity, animations, and transitions. The planned headless execution is dependent implementation verification and does not begin while this plan is Draft. Saving is not approval, application, or resumption.

## Objective

Replace the current home placeholder at `/` with a complete premium home page using the approved copy, visual system, and composition in `docs/`. Include its header and footer and the planned Playwright verification.

## Planning basis

### Confirmed problem and material evidence

- `src/app/page.tsx` renders a coming-soon heading; its module stylesheet centers that placeholder.
- `src/app/layout.tsx` loads Roboto and supplies placeholder metadata. `src/app/globals.css` contains minimal foundations and system-dependent light/dark colours.
- `public/` contained no supplied assets at investigation time.
- `docs/product.md` records company and product facts, credibility boundaries, and contact facts.
- `docs/content.md` supplies approved Home and shared Footer copy.
- `docs/ux.md` supplies navigation behavior, route destinations, anchors, and the Home document title.
- `docs/structure.md` supplies Home composition, responsive profiles, and media roles.
- `docs/design.md` supplies Roboto typography, colour roles, surface families, motion limits, and the hero mesh exception.
- The user supplied a visual reference at `C:/Users/MrMonka/Documents/GitHub/mnk-lab/crimsontide-landing-mnk/home-section/home.png`.
- `playwright.config.ts` defines desktop, tablet, and mobile Chromium projects and the sole supported origin `http://localhost:3000`.
- `tests/e2e/smoke.spec.ts` checks only that Home responds successfully and renders its document body. It does not establish the richer behavior required here.

### Chosen approach and alternatives

Use the reference for atmosphere and visual direction. Where it differs from the docs, preserve the documented Roboto typography, colour roles, two peer product panels followed by solutions, and company-section composition.

Create supporting assets in code using SVG, CSS, and lightweight canvas rendering. This supports dimensional mesh waves, lighting, and motion without supplied 3D models or animation files. Keep the existing Next.js/React stack and CSS Modules; no additional dependencies are planned.

A literal reproduction of conflicting reference layouts was not selected because the docs define the intended composition and identity. Photographic reconstruction and purported product screenshots were not selected because no authentic source assets were supplied. Supporting illustrations are conceptual and must not imply actual supermarket photography, product screenshots, or measured results.

### Decisions, assumptions, and preserved boundaries

- Scope is Home only, including its header and footer.
- Preserve approved English copy, product independence, and factual limits around the case study and named organisations.
- Preserve the documented destinations for the five other routes; those destinations remain unavailable until separately implemented.
- Do not fabricate unresolved social or legal destinations.
- Keep docs, other routes, Playwright configuration, and the existing persistent test suite outside the change.
- Shared design tokens and root metadata are necessary coupled changes. Future routes will inherit those foundations.
- Treat implementation-time Playwright probes as disposable and remove them after verification.

### Dependencies, risks, and verification limits

The implementation depends on the existing Next.js/React toolchain, Roboto delivery, and the configured Playwright setup. Verify runtime prerequisites before dependent execution. Inspect any server on port 3000 for compatibility; reuse it only when compatible, or let the configured Playwright server start when the port is free.

The result interprets the reference rather than reproducing photographic assets or conflicting layouts exactly. Cross-page journeys remain incomplete because their destination pages are outside scope. Chromium emulation does not establish physical-device or Safari correctness. Screenshot review does not automatically approve snapshot baselines.

## Page and interaction scope

Build:

- Header with CrimsonTide wordmark, current-route state, desktop navigation, and mobile/tablet menu.
- Atmospheric hero with approved copy, animated crimson mesh, and `#home-build` CTA.
- Separate OpenJM and Sentinel panels with distinct supporting visuals, followed by the four-offering solutions panel.
- Featured General Food Supermarket case with illustrative supporting media and the three documented organisations.
- Company section with the three principles.
- Closing CTA and responsive footer.

The collapsed menu moves focus to its first link when opened, closes on Escape with focus returned to the toggle, and closes on outside pointer interaction and navigation. Controls have clear hover, pressed, and keyboard-focus states.

Motion includes restrained entrance reveals, mesh movement, footer atmosphere, and documented button/card transitions. Reduced motion resolves content immediately, stops decorative movement, and disables smooth scrolling. Animation resources stop when hidden or unmounted.

## Expected files

| Area | Expected changes |
| --- | --- |
| Route | `src/app/page.tsx`, `src/app/page.module.css`: home composition and metadata |
| Foundations | `src/app/globals.css`: documented tokens, typography, focus, and reduced-motion foundations |
| Root layout | `src/app/layout.tsx`: replace placeholder metadata and apply the documented browser theme while preserving Roboto |
| Header/footer | Components and colocated CSS Modules under `src/components/sections/SiteHeader/` and `src/components/sections/SiteFooter/` |
| Home sections | Components, illustrations, mesh rendering, and colocated styles/helpers under `src/components/sections/home/` |
| Reused primitives | Only genuinely reused wordmark, icon, action, section-label, and reveal components under `src/components/ui/` |
| Verification | Temporary home probes under `tests/e2e/`, removed after verification; screenshots and diagnostics in ignored output directories |
| Saved tracking | Required artifacts within `AGENTS/plans/home-premium-frontend/` |

## Change mechanism and preserved behavior

Replace the placeholder with composed home sections and replace the minimal theme foundations with the documented token system. Keep content statically rendered where practical, and use narrow client boundaries for browser interactivity and rendering.

Preserve the existing framework, Roboto font setup, CSS Modules ownership, and supported Playwright commands/configuration. Do not introduce a dependency or expand into another route.

Preserve documented links to `/products`, `/solutions`, `/work`, `/company`, and `/contact`. Verify link values without claiming complete cross-page journeys. Unresolved social and legal destinations do not become fabricated links.

## Implementation stages

| Stage | Intended outcome | Narrow verification |
| --- | --- | --- |
| 1 - Foundations and navigation | Design tokens, reusable primitives, home shell, header/footer, and menu behavior | Typecheck, source/diff review, focused headless navigation and focus checks |
| 2 - Complete home experience | All five sections, approved copy, supporting visuals, responsive layouts, and motion | Typecheck, content/link checks, initial full-page screenshot review across the three configured profiles |
| 3 - Visual and behavioral refinement | Correct observed layout, interaction, animation, and transition defects within this scope | Targeted Playwright checks below, followed by review of corrected screenshots |
| 4 - Final verification and closure | Clean implementation, removed disposable probes, reconciled evidence and tracking | Required completion checks and bounded final reconciliation |

After approval, continue automatically between verified stages while work remains within the approved scope. Corrections required to establish the planned outcomes may proceed within that scope. Material changes follow the root Material Revisions procedure.

## Playwright verification

Use headless `npm run test:e2e` with the narrowest home spec/title filters and the existing `desktop-chromium`, `tablet-chromium`, and `mobile-chromium` projects.

Use only `http://localhost:3000`. Verify any existing server is compatible before reuse; otherwise let the configured Playwright server start when the port is free. Do not relocate to another port or bypass an incompatible runtime.

| Concern | Planned verification |
| --- | --- |
| Visual composition | Full-page and focused screenshots reviewed for hierarchy, spacing, typography, media placement, contrast, and reference alignment |
| Responsive behavior | 360, 390, 768, 900, 1024, 1280, 1440, and 1920px widths, plus mounted resizing across navigation breakpoints |
| Usability | No unintended horizontal overflow or clipped content; readable wrapping, usable touch targets, keyboard order, visible focus, menu dismissal, and anchor scrolling |
| Animations and transitions | Observe before, during, and after triggers; check intermediate geometry, layout stability, completion, and continued interaction |
| Preferences and resilience | Reduced motion, touch without hover, 200% zoom, readable content before enhancement, and browser console/hydration errors |

Screenshots establish observed appearance and do not automatically become approved snapshot baselines. Chromium emulation does not establish physical-device or Safari correctness.

Preserve pre-existing reports and diagnostics. Remove temporary probes after the verification they support, and track resources created during execution.

## Tracking

- `AGENTS/plans/home-premium-frontend/action-plan.md` owns the current complete plan, Planning basis, Plan record, and Change summary.
- `AGENTS/plans/home-premium-frontend/impact-inventory.md` maps affected units, dependencies, risks, current state, and next action.
- `AGENTS/plans/home-premium-frontend/progress-ledger.md` is the compact execution-state index and resume aid.
- `AGENTS/plans/home-premium-frontend/resume-prompt.md` is the derived handoff.
- Create `AGENTS/plans/home-premium-frontend/records/<unit>.md` only where detailed evidence warrants a separate record.

Update tracking after verified stages and material blockers. Tracking is not proof of implementation or verification.

## Final checks and closure

Execute:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Review the relevant diff, including newly created files.
- `git diff --check`

Before closure, reconcile the approved plan, including Planning basis, against the actual implementation, relevant diff, directly observed verification, and tracking records. Resolve omissions within scope and repeat affected checks; material differences require a complete revised plan and subsequent approval.

Report every failed, blocked, or unverified result explicitly. Execution evidence and current stage state are recorded in the progress ledger.

## Change summary

| Timestamp | Change | Reason | Approval effect |
| --- | --- | --- | --- |
| 2026-09-08 (exact time not recorded) | Presented the complete home-only plan with tracking and Playwright verification | User requested preparation of this plan | Awaiting explicit approval |
| 2026-09-08 18:53:48 UTC | Saved the plan and required tracking artifacts as Draft | User explicitly requested: "save this plan" | Saving only; implementation and dependent verification remain unapproved |
| 2026-09-08 19:00:56 UTC | Approved and resumed; stage 1 active | Explicit user approval; clean placeholder working tree reconciled with the complete plan | Full saved scope authorized |
| 2026-09-08 19:10:14 UTC | Closed stage 1; Stage 2 - Complete home experience active | Observed scoped implementation and verification; see owner record | Approved scope unchanged |
| 2026-09-08 19:18:17 UTC | Closed stage 2; Stage 3 - Visual and behavioral refinement active | Observed scoped implementation and verification; see owner record | Approved scope unchanged |
| 2026-09-08 19:29:00 UTC | Closed stage 3; Stage 4 - Final verification and closure active | Observed scoped implementation and verification; see owner record | Approved scope unchanged |
| 2026-09-08 19:30:43 UTC | Closed stage 4; plan complete | Observed scoped implementation and verification; see owner record | Approved scope unchanged |
