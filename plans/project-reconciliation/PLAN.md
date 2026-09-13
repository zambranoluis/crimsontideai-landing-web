# Project reconciliation — verifiable, resumable stages

## Objective and boundaries

Reconcile documentation, route briefs, verification tools, tests, and bounded implementation defects before expansion. Preserve the current product identity, approved claims, routes, and intended interactions.

Use the repository-relative workspace **`plans/project-reconciliation/`**. Creating and saving it is Stage 00; no files have been written in Plan Mode.

Execute **one stage per conversation**, then stop after recording its verification and handoff. Changes remain local and uncommitted unless explicitly requested.

## Persistent workspace and resume protocol

```text
plans/project-reconciliation/
├── PLAN.md
├── STATUS.md
├── FINDINGS.md
├── stages/
│   ├── 00-workspace.md
│   ├── 01-current-contracts.md
│   ├── 02-verification-baseline.md
│   ├── 03-documentation.md
│   ├── 04-navigation-home-products.md
│   ├── 05-remaining-routes-and-motion.md
│   └── 06-final-verification.md
└── evidence/
```

- **PLAN.md:** this complete plan, scope, stages, acceptance criteria, and subsequent explicitly agreed amendments.
- **STATUS.md:** stage table, active stage, last completed stage, blockers, verification invalidated by later changes, and the exact next resume prompt.
- **FINDINGS.md:** stable issue IDs, affected files, observed versus intended behavior, classification, owning stage, resolution, and verification reference.
- **Stage records:** objective, entry conditions, checklist, changed files, commands and outcomes, evidence locations, unresolved findings, and next action. Preserve previous attempts when recording reruns.
- **Evidence:** separate directories per stage and run for logs, reports, screenshots, and traces. Ignore generated evidence in Git; retain durable textual conclusions in stage records. Mark unavailable evidence explicitly.

Each verification record includes date, Git HEAD, relevant uncommitted changes, tested source-file hashes, runtime/server mode, browser configuration, command, exit code, and result counts. A report only supports the code state it tested.

**Resume procedure:** read PLAN, STATUS, FINDINGS, and the active stage record; inspect current Git state and compare relevant source changes with the checkpoint. Resume unfinished work or start the next stage. Reopen earlier checks only when changed dependencies invalidate them. Preserve unrelated work.

Use stage states: `not-started`, `in-progress`, `blocked`, `complete`. Interrupted or failing stages remain unfinished. Every stopping point records what was completed and the exact remaining work.

## Stages and completion gates

### Stage 00 — Create the workspace

Save the complete plan and initialize the status, findings, and seven stage records. Seed known audit findings as observations awaiting their assigned verification; distinguish historical test failures from current results. Add the narrow ignore rule for workspace evidence.

**Gate:** all workspace links resolve, every stage has an objective and completion checklist, the next resume prompt is present, and the diff contains only workspace setup and its ignore rule. Stop.

### Stage 01 — Establish current behavior and document responsibilities

Inventory all six routes and shared navigation/footer against source and rendered behavior. Record section order, displayed copy, destinations, interaction states, responsive conditions, motion, and fallbacks.

Resolve the known differences:

- Solutions’ Earth opening and former hero at the end.
- Products’ alternating columns and mobile reading order.
- Work’s reorderable partner grid and removed General Food destination.
- Home’s route-top Company link.
- Current footer groups and social destinations.
- Contact’s email draft flow and Company’s responsive particle sequence.

Classify findings as documentation drift, stale test, confirmed implementation defect, timing/setup problem, missing evidence, or intentional limitation. Keep approved product facts authoritative; do not turn accidental behavior into a requirement.

**Gate:** every route and shared surface has a reviewed contract; every identified mismatch has an owning stage; consequential ambiguities are resolved or explicitly block dependent work. Stop.

### Stage 02 — Repair verification tooling and capture a baseline

Make checks reproducible before changing expectations:

- Route test attachments through Playwright output paths; keep captures and profiling output in ignored, run-specific directories.
- Correct the mesh evidence script’s obsolete Home target.
- Replace instructions relying on the missing terrain configuration with a checked-in, reproducible production-testing option. Keep port 3001 as the standard origin.
- Document required setup and ensure directly imported verification dependencies are declared.
- Standardize reconciliation runs on one Playwright worker. Avoid concurrent builds, profiling, and browser suites.

Run lint, typecheck, build, and the complete existing Chromium suite. Record all failures without modifying assertions to make this baseline pass. Review each skip’s purpose.

**Gate:** tooling runs reproducibly, output remains isolated, test discovery succeeds, and every baseline failure has a recorded classification and owner. Expected existing failures do not block this diagnostic stage; unexplained setup failures do. Stop.

### Stage 03 — Reconcile documentation and Impeccable surfaces

Update existing documents according to their responsibilities:

- README: setup, architecture, verification commands, and document navigation.
- PRODUCT: factual positioning, boundaries, current destinations, and valid reference availability.
- DESIGN: current shared tokens, navigation, motion, responsive rules, and established artwork exceptions.
- Content documentation: actual wording, actions, footer, form states, and reading order.
- Six surface briefs: current composition, behavior, acceptance criteria, and related implementation directories.

Refresh Impeccable’s generated design sidecar after reconciling DESIGN. Run the bundled doctor and assess findings against actual code.

Correct renderer/lifecycle guidance and reproduction commands. Preserve historical reports as dated records; remove “latest” claims and distinguish unavailable local evidence. Do not invent replacement reference assets or measurements.

**Gate:** route contracts and documents agree; local references resolve or explicitly describe unavailable historical material; generated design metadata agrees with DESIGN; unresolved tooling preferences are clearly documented. Stop.

### Stage 04 — Reconcile navigation, Home, and Products tests

Correct stale Company-link expectations and align navigation tests with route-top navigation, section scrolling, clean enhanced URLs, focus, direct fragments, and history restoration.

Preserve current Home background framing, content-anchored mountains, product-card behavior, Products column order, sticky progression, and static fallbacks. Investigate the mountain wrapped-content failure using the intended landmark relationship before changing its assertion or implementation.

For each failure, repair the test when its expectation or setup is wrong; repair runtime code when established behavior is violated. Record the reason.

**Gate:** affected navigation, Home, Products, and shared-mesh suites pass serially across applicable projects. Every changed assertion retains meaningful behavioral coverage; bounded runtime fixes have focused regression verification. Stop.

### Stage 05 — Reconcile remaining routes and shared motion

Address Solutions, Company, Work, Contact, and footer terrain coverage:

- Replace the obsolete initial Solutions Reveal assumption with checks appropriate to its Earth opening.
- Investigate Company replay and journey progression failures.
- Verify Earth and Company hold/release behavior, reverse progression, resizing, and restored positions.
- Preserve partner-grid keyboard, mouse, touch, cancellation, and no-JavaScript behavior.
- Preserve Contact validation, encoded email drafts, retained values, direct contact channels, and absence of delivery claims.
- Verify recurring animation suspension, hidden/offscreen resize handling, context failures, and unmount cleanup.

Use state or geometry readiness instead of arbitrary additional waits. Update affected documentation alongside any confirmed runtime correction.

**Gate:** all affected suites pass serially; each baseline finding is resolved or identified as an out-of-scope limitation requiring a separate decision. Unresolved defects in established behavior block completion. Stop.

### Stage 06 — Verify and close the reconciled baseline

Run final lint, typecheck, production build, whitespace checks, and the full serial Chromium suite against the final source state.

Inspect all six routes at desktop, tablet, and mobile sizes, plus narrow and short-viewport boundary cases. Exercise keyboard navigation, reverse scrolling, reduced motion, no JavaScript, and relevant media/canvas fallbacks. Reuse automated evidence where sufficient; distinguish screenshots from approved visual regression baselines.

Run Impeccable context in the new session, doctor, and the required detector for changed UI targets. Review advisories in context. Refresh any documentation invalidated by fixes and record one current verification summary linked from README.

**Gate:** zero unexplained failures, justified skips, no unresolved in-scope contract defects, accurate documents, reproducible commands, and generated output excluded from Git. Mark the plan complete and record remaining expansion considerations without presenting them as implemented features.

## Defaults and acceptance rules

- No new public routes, endpoints, product features, redesign, deployment, commits, or broad architectural refactoring. Existing public behavior remains compatible.
- Bounded runtime fixes are included when necessary to satisfy established contracts. New product decisions pause only dependent work and are recorded.
- Do not remove meaningful coverage, suppress failures, or loosen tolerances without evidence explaining why the previous check was incorrect.
- Chromium desktop and emulated tablet/mobile are the required baseline. Firefox, Safari, physical devices, and a complete accessibility certification remain explicitly unverified.
- Preserve Impeccable’s unset build-path preference during reconciliation; choosing an expansion design workflow is separate.
- “Clean” means reconciled and verified. Local uncommitted changes are expected and must be distinguished from unrelated work.

Each completed stage ends with a saved prompt such as:

> Resume `plans/project-reconciliation/PLAN.md`. Read STATUS and the relevant stage record, verify the checkpoint against the current working tree, complete Stage NN only, record verification and handoff, then stop.

## Workspace navigation

- [Status and exact resume prompt](STATUS.md)
- [Findings register](FINDINGS.md)
- [Stage 00 — Workspace](stages/00-workspace.md)
- [Stage 01 — Current contracts](stages/01-current-contracts.md)
- [Stage 02 — Verification baseline](stages/02-verification-baseline.md)
- [Stage 03 — Documentation](stages/03-documentation.md)
- [Stage 04 — Navigation, Home, Products](stages/04-navigation-home-products.md)
- [Stage 05 — Remaining routes and motion](stages/05-remaining-routes-and-motion.md)
- [Stage 06 — Final verification](stages/06-final-verification.md)

## Agreed amendments

None. The navigation index and stage-record templates implement the supplied workspace structure without changing scope or gates.
