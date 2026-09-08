# Tester

Use this document when work creates, changes, reviews, executes, or diagnoses Playwright tests or browser verification.

This document extends root `AGENTS.md` or `CLAUDE.md`.

Also use:

- `AGENTS/roles/coder.md` when test source, configuration, or scripts change;
- `AGENTS/roles/frontend.md` when verification concerns rendering, interaction, accessibility, responsive behavior, or motion.

# Responsibility

This document owns the repository-specific rules for Playwright scope, execution, generated evidence, visual baselines, test design, diagnosis, and reporting.

It does not own application behavior, repository completion checks, or browser-execution authorization. The root policy owns which execution modes are permitted and when.

# Operational Source

- Inspect `tests/e2e/README.md` before Playwright work.
- Treat that document and the repository `npm` scripts as the catalog of supported commands, projects, paths, and runtime facts. The catalog records what exists and how to invoke it; this document owns the rules that govern its use.
- Use the repository `npm` scripts rather than invoking the Playwright CLI directly.
- Do not duplicate the command catalog in agent instructions, and do not place this document's rules in the catalog.

# Execution Modes

The root policy requires focused headless execution for the current and final browser states of relevant frontend changes. It permits that current-state inspection during investigation only when an explicit frontend change request makes browser evidence material, and requires an explicit user request for every other mode.

- `npm run test:e2e` is the default functional mode. Use it for behavioral verification and screenshot capture.
- `npm run test:e2e:headed` runs a visible browser. Use it only when the user explicitly requests to watch a run.
- `npm run test:e2e:ui` opens the Playwright Test interface. Use it only when the user explicitly requests interactive selection or analysis.
- `npm run test:e2e:debug` opens the Playwright Inspector. Use it only when the user explicitly requests step-by-step diagnosis.
- Keep visible, UI, and debug execution controlled by selected tests. They do not authorize free manual navigation.
- Add interaction delay only when the user explicitly requests slower execution.
- Report the project and mode actually used.

# Scope Selection

- Select the narrowest project, spec file, and title filter that can establish the required result.
- Inspect the current real route and state before proposing a frontend change when source inspection cannot establish a material visual, interactive, responsive, focus, hydration, or motion condition.
- After implementation, verify the requested browser-observable behavior on the real route and state before reporting it complete.
- Run the complete suite only when its full scope is required.
- Use `desktop-chromium` for the desktop range, `tablet-chromium` for the tablet range, and `mobile-chromium` for the mobile range, as defined in `AGENTS/roles/frontend.md`.
- Run viewport-independent behavior in one project rather than duplicating it across the others.
- Run every project whose range a change affects in layout, reflow, or interaction.
- When visual behavior is in scope, capture and directly inspect the relevant current and final states. Treat these captures as working evidence, not snapshot baselines or accepted visual output.
- Do not use repeated broad runs to discover an interface iteratively.
- Exercise integrated application routes rather than creating or depending on preview-only pages.
- Adding, renaming, or removing a project in `playwright.config.ts` is a change requiring its own approval.

# Test-Surface Admission

- Begin ordinary implementation-time verification from the real current route or component, its observable states and boundaries.
- Treat existing specs as available test capacity and possible evidence, never as a substitute for inspecting the source.
- Treat tests written during ordinary implementation as disposable probes by default. Remove a probe when the verification it supported is complete.
- Use a disposable targeted probe when no existing spec can establish the required current or final browser state. Keep a probe only when its persistent admission is explicitly included in the approved frontend change.
- Adding, correcting, or removing a persistent spec in `tests/e2e` requires its own approved change. A probe does not become part of the suite by remaining on disk.

# Runtime Boundary

- Use `http://localhost:3000` as the only supported origin.
- Reuse a compatible application server already running on that port.
- Let the Playwright `webServer` configuration start the server when the port is free.
- Do not search for another port, start an alternate application server, or stop a running server to bypass a runtime conflict.
- When port 3000 is held by an incompatible process, stop and report the blocker rather than relocating the run.
- Track and close browser processes or sessions created during execution when they are no longer required.

# Generated Evidence

- `playwright-report/` and `test-results/` are git-ignored working output. Do not commit them and do not treat their presence as evidence of coverage.
- Preserve pre-existing reports and diagnostics. Remove only output created during the current work.
- Report only run identifiers, commands, projects, counts, modes, results, and limitations directly observed.
- Report the current state observed before the change, the final state observed after it, the user-provided reference when one defined the target, and every state or viewport left unverified.
- Do not include credentials, tokens, or sensitive response material in evidence, reports, or committed fixtures.

# Visual Baselines

The repository defines no snapshot baselines. These rules apply when one is introduced.

Do not introduce a snapshot baseline merely to satisfy the required browser verification. Current-state and final-state captures remain working evidence unless a separately authorized change introduces an approved baseline.

- Create or update a baseline only under a change that explicitly authorizes it, and only after the intended final visual behavior is defined.
- Create snapshot candidates only in the headless environment.
- Keep approved snapshot files beside their owning tests.
- Mask continuously animated regions with a stable neutral color.
- Do not edit snapshot pixels manually.
- Do not treat a missing snapshot, a generated candidate, or a passing visible run as evidence that a visual state is approved.

# Test Design

- Base assertions and control flow on machine-readable state: roles, accessible names, routes, response status, and explicit attributes.
- Use `data-testid` for stable markers that no semantic selector can express.
- Do not branch on arbitrary display text.
- Keep functional assertions independent of snapshot baselines.
- Keep mocks limited to the boundary and state required for deterministic verification.
- Do not place secrets or real authentication material in mocks or fixtures.
- For effects, transitions, and animations, measure before, during, and after the behavior when a final-state assertion can hide a temporary defect.

# Diagnosis And Reporting

- Distinguish an application regression, test drift, runtime failure, and environment unavailability before proposing a correction.
- Do not assume that either the implementation or the test is authoritative when they disagree. Classify the mismatch and resolve it against the intended behavior.
- Do not encode observed erratic behavior as a test expectation merely to make a run pass.
- Treat a selected project with no matching spec as reporting no tests. That result is neither a product failure nor browser evidence.
- Re-run affected tests after correcting a failure.
- When execution is not permitted or cannot run, report the resulting verification limit and do not claim the behavior as verified.
