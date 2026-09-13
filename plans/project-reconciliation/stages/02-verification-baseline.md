# Stage 02 — Repair verification tooling and capture a baseline

[Plan](../PLAN.md) · [Status](../STATUS.md) · [Findings](../FINDINGS.md)

## Objective

Repair verification tooling and capture a baseline, within the corresponding scope and completion gate in PLAN.md. Execute this stage only, retain local uncommitted changes, and stop after saving verification and handoff.

## Entry conditions

Stage 01 complete; contracts and issue owners recorded; no unexplained dependent contract blockers.

## Completion checklist

- [ ] Use Playwright output paths for attachments and ignored run-specific capture/profile directories.
- [ ] Correct obsolete Home mesh evidence target and replace missing terrain configuration instructions with checked-in reproducible production testing on port 3001.
- [ ] Document setup and declare directly imported verification dependencies.
- [ ] Discover tests and standardize runs on one worker; serialize builds, profiling, and browser suites.
- [ ] Run lint, typecheck, production build, and the complete existing Chromium suite without changing baseline assertions.
- [ ] Classify and assign every failure; review the purpose of each skip.
- [ ] Resolve unexplained setup failures; retain expected diagnosed failures as baseline findings.
- [ ] Record source-specific verification, checkpoint, and next resume prompt; stop.

## Attempts and changed files

Not started. No files changed for this stage. Preserve prior attempts when adding reruns.

## Commands, outcomes, and verification

Not run. No pass/fail/skip counts or source-state claims.

For each run record date/time, Git HEAD, relevant uncommitted changes, tested source-file SHA-256 hashes, runtime/server mode, browser configuration, exact command, exit code, result counts, and invalidated earlier checks. Do not treat an earlier report as evidence for changed code.

## Evidence locations

Use `evidence/stage-02/<UTC-timestamp>-run-NN/` relative to the workspace. Evidence is local and ignored; it may be unavailable in another checkout. Retain durable textual conclusions here and explicitly mark missing logs, screenshots, or traces. No runtime evidence is available from Stage 00.

## Unresolved findings

Review FINDINGS.md for this stage's owners and prerequisites. No seed finding has been resolved by this stage.

## Next action and handoff

Begin only after entry conditions are met; complete the checklist and corresponding PLAN gate, update STATUS and FINDINGS, save the exact next-stage resume prompt, then stop.
