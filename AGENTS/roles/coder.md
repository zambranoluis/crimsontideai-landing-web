# Coder

Use this document for every task that creates, changes, deletes, reviews, or reasons about code.

This document extends root `AGENTS.md` or `CLAUDE.md`.
Frontend document add surface-specific behavior.

# Responsibility

This document owns the engineering rules shared by all code work:

- change integrity;
- code and boundary structure;
- data and contract discipline;
- error handling;
- implementation quality;
- code-work verification.

# Change Integrity

- Preserve behavior and compatible public contracts that the task does not require changing.
- Identify affected callers, consumers, tests, contracts, and dependent mechanisms before changing shared behavior.
- Update coupled code only when required to keep the authorized change correct and complete.
- Do not reorganize unrelated code during a functional change.
- Do not add speculative extensibility.
- Remove artifacts made obsolete by the authorized change.
- Do not leave commented-out code, stale comments, unreachable branches, unused imports, or unused variables.

# Architecture And Structure

- Follow the established architecture and do not bypass its boundaries for implementation convenience.
- Keep behavior in the layer that owns it.
- Preserve trust boundaries.
- Pass data through explicit contracts rather than another layer's internal representation.
- Make external interactions and side effects visible in code structure.
- Avoid hidden shared mutable state.
- Keep each module, type, function, and component focused on one coherent responsibility.
- Name modules, types, functions, components, variables, and implementations according to the process, responsibility, or domain behavior they represent.
- Prefer names that express owned behavior over names derived only from incidental implementation mechanisms.
- Do not use arbitrary, misleading, sequence-based, or temporary names.
- Prefer existing project utilities and platform capabilities when sufficient.
- Add an abstraction only when it materially improves reuse, responsibility isolation, testability, or control of complexity.
- Add a dependency only when its verified benefit justifies its integration and maintenance cost.
- Follow established naming, organization, typing, and formatting conventions.
- Keep comments focused on intent, constraints, or non-obvious decisions.

# Data And Contracts

- Treat external data as untrusted until validated by the boundary responsible for relying on it.
- Validate required shape, type, range, format, and owned semantic constraints.
- Normalize representations only when the responsible layer requires a stable internal or public contract.
- Keep state distinctions machine-readable when consumers require deterministic behavior.
- Do not encode control flow in arbitrary human-readable text.
- Do not silently discard contract violations that affect correctness.
- Preserve backward compatibility when required by the authorized scope.

When an affected contract is not separately documented, inspect its producing boundary, shared types or utilities, affected consumers, upstream producers, and any authoritative documentation for the upstream leg.
Resolve material disagreement among those sources before changing dependent behavior.

# Errors And Failure Behavior

- Handle expected failures at the layer that owns their meaning.
- Propagate failures through the contract established for the receiving layer.
- Convert unexpected failures into controlled behavior at the responsible boundary.
- Do not expose raw exceptions or internal diagnostics through public or untrusted surfaces.
- Preserve safe diagnostic context in the appropriate trusted channel when operationally useful.
- Do not suppress compiler, type, lint, validation, build, or test failures.
- Do not treat a failed or unverified path as complete.

# Implementation Quality

- Keep conditionals and state transitions consistent with the authority that owns the represented rule.
- Handle null, empty, unavailable, malformed, and failed states when the applicable contract permits them.
- Avoid repeated work when an existing result can be reused safely.
- Avoid premature optimization that reduces clarity without a verified need.
- Document a non-obvious tradeoff when future maintenance depends on understanding it.

# Verification

Verification consists of repository completion checks plus the narrowest task-specific checks that exercise the changed behavior.

Default completion checks for implementation changes are:

- for changes in `crimsontide-landing-web`: run `npm run lint` and `npm run build` and `npm run typecheck` from the repository root;

Documentation-only or instruction-only changes do not require application builds unless the task changes generated or executable behavior.

Rules:

- Complete the authorized implementation before final verification.
- Run every completion check applicable to the repositories changed.
- Add targeted checks selected from the changed behavior, contract, and risk.
- Do not use targeted checks as a replacement for completion checks.
- Re-run affected checks after correcting a failure.
- Distinguish failures caused by the change from directly verified pre-existing failures.
- Report checks that could not run and the resulting limitation.
- Do not infer runtime correctness from static inspection when executable verification is materially required and available.
- Do not run optional or separately governed verification unless its applicability condition is satisfied.
