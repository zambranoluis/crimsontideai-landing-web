# Impact Inventory

- **Plan:** `AGENTS/plans/home-premium-frontend/action-plan.md`
- **Status:** Draft
- **Last updated:** 2026-09-08 18:53:48 UTC

This is an impact map, not evidence of implementation or verification. The complete scope, decisions, and verification strategy are owned by the action plan.

| Unit | Affected files or boundary | Dependencies and material risks | Current state | Next action |
| --- | --- | --- | --- | --- |
| Foundations and navigation | App foundations; UI primitives; SiteHeader and SiteFooter components | Global tokens and metadata affect future routes; preserve Roboto, menu accessibility, and documented navigation destinations | Proposed; not started | Await explicit plan approval, then execute stage 1 |
| Complete home experience | Home route and section components, supporting visuals and local styles/helpers | Approved docs and supplied reference; conceptual media must not imply authentic screenshots, photography, or performance evidence | Proposed; not started | After verified stage 1, execute stage 2 |
| Visual and behavioral refinement | Scoped implementation corrections; temporary home Playwright probes; ignored screenshot/diagnostic output | Compatible runtime at localhost:3000; Chromium availability; other route destinations remain outside scope | Proposed; not started | After verified stage 2, execute stage 3 |
| Final verification and closure | Relevant implementation diff, disposable probes, and required completion checks | Observe terminal results; remove probes; preserve existing diagnostics; report verification limits | Proposed; not started | After verified stage 3, execute stage 4 and reconcile |
| Plan tracking | This directory's four required Markdown artifacts; optional unit records only when needed | Save authorization covers Draft artifacts only; tracking does not establish product completion | Draft artifacts saved; no implementation authorized | Maintain Draft; resume at explicit approval |

## Preserved boundaries

The docs, other application routes, Playwright configuration, and existing persistent tests are outside implementation scope. The action plan owns the detailed coupling and residual limitations.