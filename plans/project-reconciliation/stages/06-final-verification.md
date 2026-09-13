# Stage 06 — Verify and close the reconciled baseline

[Plan](../PLAN.md) · [Status](../STATUS.md) · [Findings](../FINDINGS.md)

## Objective

Verify and close the reconciled baseline, within the corresponding scope and completion gate in PLAN.md. Execute this stage only, retain local uncommitted changes, and stop after saving verification and handoff.

## Entry conditions

Stage 05 complete; no unresolved in-scope contract defects; inspect invalidated earlier verification.

## Completion checklist

- [ ] Run final lint, typecheck, production build, whitespace checks, and full serial Chromium suite against final source state.
- [ ] Inspect six routes at desktop/tablet/mobile plus narrow/short-viewport boundaries.
- [ ] Exercise keyboard navigation, reverse scroll, reduced motion, no JavaScript, and relevant media/canvas fallbacks.
- [ ] Reuse sufficient automated evidence; distinguish screenshots from approved visual regression baselines.
- [ ] Run session Impeccable context, doctor, and required detector for changed UI targets; assess advisories.
- [ ] Refresh invalidated documentation and link one current verification summary from README.
- [ ] Confirm zero unexplained failures, justified skips, no unresolved in-scope defects, reproducible commands, accurate documents, and ignored output.
- [ ] Record explicit unverified browser/device/accessibility limits and expansion considerations without claiming implementation.
- [ ] Mark plan complete only when all gates pass; record final verification and stop.

## Attempts and changed files

Not started. No files changed for this stage. Preserve prior attempts when adding reruns.

## Commands, outcomes, and verification

Not run. No pass/fail/skip counts or source-state claims.

For each run record date/time, Git HEAD, relevant uncommitted changes, tested source-file SHA-256 hashes, runtime/server mode, browser configuration, exact command, exit code, result counts, and invalidated earlier checks. Do not treat an earlier report as evidence for changed code.

## Evidence locations

Use `evidence/stage-06/<UTC-timestamp>-run-NN/` relative to the workspace. Evidence is local and ignored; it may be unavailable in another checkout. Retain durable textual conclusions here and explicitly mark missing logs, screenshots, or traces. No runtime evidence is available from Stage 00.

## Unresolved findings

Review FINDINGS.md for this stage's owners and prerequisites. No seed finding has been resolved by this stage.

## Next action and handoff

Begin only after entry conditions are met; complete the checklist and corresponding PLAN gate, update STATUS and FINDINGS, save the exact next-stage resume prompt, then stop.
