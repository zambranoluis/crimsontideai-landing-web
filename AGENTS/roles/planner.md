# Planner

# Purpose

Use this role when the user requests an authorization plan, explicitly accepts an offer to prepare one, or asks to inspect, apply, or resume a named plan.

This role extends the applicable root policy. The root policy owns investigation, authorization, approval, scope, execution, material revision, verification, reporting, and closure. Planner owns the structure of authorization plans and the maintenance rules for plans with tracking.

# Applicability And Loading

Do not enumerate or load `AGENTS/plans/**` by default. When this role applies to a named plan, load only that plan directory. When preparing a new plan, inspect only the context needed to establish its name, scope, approval requirements, and expected tracking artifacts.

A mention of a plan directory, inventory, ledger, pending work, repository, or external documentation does not activate this role or authorize loading its contents unless it materially affects the explicit planning request.

# Plan Modes

Every authorization plan is either a normal plan or a plan with tracking.

- A normal plan is presented, explicitly approved, and executed without persistent planning artifacts.
- A plan with tracking is explicitly identified by the user or in the presented plan. Its tracking artifacts record the plan's state and evidence but do not authorize work independently.

Do not infer tracking from plan size, stages, risk, or approval. When the requested mode is not explicit, use a normal plan.

# Plan Identity

For a plan with tracking, use a stable, semantic `plan-id` in lowercase kebab-case. It must describe the objective and bounded scope, for example `playwright-coverage-expansion` or `dashboard-configuration-test-remediation`.

Do not use dates, sequence numbers, opaque identifiers, or generic names as the primary identifier. Add a concise scope qualifier only when it is needed to distinguish genuinely different initiatives.

The directory of a plan with tracking is `AGENTS/plans/<plan-id>/`. Do not rename a plan with tracking after approval unless a material revision requires a replacement plan.

# Artifact Structure

Every plan with tracking requires these artifacts:

```text
AGENTS/plans/<plan-id>/
  action-plan.md
  impact-inventory.md
  progress-ledger.md
  records/                 # create only when a unit needs its own record
  resume-prompt.md         # required derived handoff
```

`action-plan.md` records the current user-visible authorization plan. It must express every required root-plan criterion in a readable structure, including objective, current mechanism, expected files, change mechanism, preserved behavior, coupling, verification, stages, risks, limits, and approval state. For a plan with tracking, it also contains a `Planning basis` section with the confirmed problem and material evidence, chosen approach, material alternatives considered and why they were not selected, decisions, assumptions, preserved boundaries, dependencies, risks, and verification limits. This section is the sole plan foundation; it is not a parallel authorization or research log. Keep it concise and traceable to material evidence. Do not create a separate artifact for the same foundations. A change to it that materially changes the approved objective, approach, decisions, assumptions, limits, dependencies, or verification strategy requires the root Material Revisions procedure. For an approved plan, it preserves the exact version that received approval. For a `Draft`, it records the proposed version awaiting approval.

Every `action-plan.md` begins with a `Plan record` containing `Created`, `Approved`, `Tracking started`, current `Last updated`, and current `Status` fields. `Created` records when the proposed plan was first presented; `Tracking started` records creation of the persistent plan directory; `Approved` is `Not approved` until the plan is explicitly approved, then records its first approval. Preserve `Created`, `Tracking started`, and an approval timestamp unchanged once set. It also contains an append-only `Change summary` table with timestamp, concise change, reason, and approval effect. This is the central summary of plan evolution, not a separate version of the plan.

`impact-inventory.md` records affected units, dependencies, risks, current state, and next action. It is an impact map, not proof of completion.

`progress-ledger.md` is a compact index of plan state, active unit, owner record, and resume point. Keep one active unit only when the work is actually sequential. Do not manufacture an active unit for an idle or complete plan.

A `Draft` has no active implementation unit. Its ledger identifies explicit approval as its resume point and must not claim implementation or dependent verification.

`records/<unit>.md` owns detailed evidence, decisions, blockers, execution notes, and its exact resume point for one unit. Create it only when that detail would make the ledger or plan materially harder to maintain.

`resume-prompt.md` is a required derived handoff artifact. It is not an authorization, scope, completion, or verification authority. Its first executable instruction must require reading the complete `action-plan.md`, including `Planning basis`, before implementation or dependent verification. It then directs reconciliation with the active ledger entry, linked owner record when present, current working tree, and directly observed verification. Keep it limited to plan identity and links, derived current state, last closed stage, active or next stage, exact resume point, current blocker, pending user decision, and preserved boundaries. Do not duplicate complete stage tables, detailed evidence, execution histories, counts maintained elsewhere, alternative implementation options, or commands that change the working tree or runtime state.

Do not duplicate detailed evidence, decisions, or execution logs across the plan, inventory, ledger, and records. Link to the authoritative artifact instead.

# Lifecycle

Use only these persisted states when applicable:

- `Draft`: an explicitly requested saved initial plan that is awaiting approval and cannot be executed.
- `Approved`: the current action plan is authorized but implementation has not started.
- `In progress`: approved implementation is actively being completed.
- `Blocked`: progress cannot continue without a material external decision or change.
- `Partially complete`: approved work stopped with completed and pending units recorded.
- `Complete`: all authorized work and required verification are complete.
- `Superseded`: a material revision replaced the action plan.

Before approval, prepare and present a normal plan in the user-facing conversation without creating persistent planning artifacts. Treat a plan as a plan with tracking only when the user explicitly requests tracking or when the presented plan identifies that mode. For a plan with tracking, create every required artifact, including `resume-prompt.md`, with state `Draft` only when the user explicitly requests that the current unapproved plan be saved. Saving a plan with tracking does not approve, apply, resume, or otherwise authorize it. After explicit approval of a plan with tracking, create every missing required artifact, including `resume-prompt.md`, before dependent implementation begins and change the state to `Approved` unless implementation begins immediately, in which case it is `In progress`.

For a plan with tracking, update the relevant tracking artifact and `resume-prompt.md` when a saved draft changes, a stage closes, a material decision is resolved, a blocker appears, or the exact resume point changes. Do not use tracking updates as a substitute for required user-facing progress reporting.

For a plan with tracking, append a `Change summary` entry and update `Last updated` when a draft is saved, tracking starts, a plan is approved, revised, resumed, blocked, partially completed, completed, or when a stage closes. Do not record routine minor actions there. Preserve `Created`, `Tracking started`, and an approval timestamp unchanged once set. When a material revision supersedes an approved plan, record that the prior approval was replaced and that the revised plan requires explicit approval.

# Stage Closure And Handoff

After a stage's planned verification succeeds in a plan with tracking, synchronize its tracking before reporting the stage as closed or proceeding to the next stage. Update:

- the unit record, when one exists, with detailed observed evidence, decisions, blockers, and its exact resume point;
- the impact inventory with completed and current unit states and the next action;
- the progress ledger with the closed stage, one actual active or next unit when sequential, and the compact resume point;
- the action plan record with `Last updated`, any applicable lifecycle state, and one append-only stage-close `Change summary` entry; and
- `resume-prompt.md` with only its derived handoff fields and links.

Before declaring closure, check that these artifacts agree on the completed stage, current lifecycle state, active or next unit, blocker or pending decision, and resume point. Reconcile a conflict with the approved action plan, working tree, and directly observed verification before continuing; do not resolve it by choosing one tracking artifact over another. Report the verified stage outcome to the user after this synchronization. Tracking remains part of the approved plan's automatic staged continuation; it does not introduce a commit checkpoint or require another approval.

# Reconciliation And Resumption

The approved action plan, current working tree, and directly observed verification are authoritative for actual completion. Tracking artifacts are records and resume aids; they never establish that code was changed or a check passed.

A `Draft` is not eligible for execution resumption. When the user asks to apply or resume one, present or re-present its complete current plan, request explicit approval, and do not perform dependent work.

When resuming a plan with tracking, inspect the complete action plan, including `Planning basis`, the active ledger entry, linked owner record when present, current working tree, and the evidence needed to establish the next safe action. For a normal plan, reconcile its approved user-visible plan, current working tree, and the evidence needed to establish the next safe action.

When the user explicitly asks to apply or resume a plan with tracking while ignoring its ledger, do not use the ledger to decide scope or completion. Reconcile the approved action plan with the current working tree and observed verification, report completed, pending, and unverified units, then continue only within the approved scope. Update the ledger afterward only if the request retains tracking.

When the user requests tracking for work already executing under a recoverable approved plan, create the required artifacts in `In progress`. Reconcile the original authorization, current working tree, and observed verification before recording the initial state. Do not require new approval when the artifacts faithfully document the approved scope. If the original authorization cannot be recovered or the reconciliation reveals a material difference, apply the root Material Revisions procedure.

If reconciliation reveals a material change to the objective, files, mechanism, dependencies, behavior, destructive impact, or verification strategy, stop dependent execution and apply the root Material Revisions procedure.

# Quality Gates

Before presenting an authorization plan for approval, verify that:

- the action plan contains all root authorization-plan criteria;
- loading remains limited to material planning context and does not load existing plans preventively.

Before saving a plan with tracking as a `Draft`, also verify that its plan-id is semantic, stable, and scoped; its `Planning basis` records the required decision context, is traceable to material evidence, and does not become a parallel research log; and every tracking artifact has the required operational purpose.

After approval of a plan with tracking and before dependent implementation, verify that:

- each required artifact has one operational purpose;
- inventories, ledgers, and records do not claim unobserved implementation or verification;
- every active item has a specific next action or a stated blocker;
- evidence, decisions, and progress are not needlessly duplicated;
- no tracking artifact broadens authorization beyond the root policy; and
- `resume-prompt.md` exists and requires complete action-plan reading before execution.

After each stage of a plan with tracking is verified and before it is reported as closed, verify that:

- the stage-closing synchronization is complete and each artifact retains its defined ownership;
- the action plan, inventory, ledger, record when present, and handoff agree on the current state and exact resume point; and
- `resume-prompt.md` requires complete action-plan reading before execution and contains no duplicate authority, evidence, scope, or state-changing instruction.

After the root completion checks and final reconciliation succeed for a plan with tracking, verify that the action plan, inventory, ledger, record when present, and handoff reflect that result without claiming unobserved implementation or verification. Mark the plan `Complete` only after this check.
