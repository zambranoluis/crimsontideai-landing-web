# Planner

Use this role for a requested authorization plan, an accepted offer to prepare one, or inspecting, applying, or resuming a specified plan, saved or unsaved.

This role extends `AGENTS.md` and its shared policies. `AGENTS/authorization.md` owns investigation, plan modes, saving permissions, approval, scope, execution, revisions, verification, resumption, reporting, and closure. Planner owns plan structure and the procedures for maintaining save-authorized artifacts.

## Planning Context And Presentation

Inspect only context material to the requested plan. For a specified saved plan, read its complete action plan and only the additional artifacts needed to establish the current state; do not enumerate other plan directories.

Present a readable, user-facing plan containing the authorization policy's required content. Organize it around objective, current mechanism, expected files, proposed mechanism, preserved behavior, coupling, stages and their verification, final checks, risks, limits, and approval request. State whether it is normal or with tracking and whether saving was requested.

For tracking mode, include a concise `Planning basis`: confirmed problem and material evidence, chosen approach, material alternatives considered and why they were not selected, decisions, assumptions, preserved boundaries, dependencies, risks, and verification limits. Keep it traceable to evidence and use it as the sole plan foundation, not a separate research log.

For unsaved plans, keep the plan and any tracking in conversation or native progress tools. The remaining artifact procedures apply only when saving is authorized.

## Saved Plan Identity

Use a stable, semantic lowercase kebab-case `plan-id` describing the objective and bounded scope. Do not use dates, sequence numbers, opaque identifiers, or generic names as the primary identifier. Add a scope qualifier only to distinguish different initiatives.

Store the plan in `AGENTS/plans/<plan-id>/`. Do not rename it after approval unless a material revision requires a replacement plan.

## Artifact Ownership

A saved normal plan has exactly:

- `action-plan.md`: current authorization plan and approval record.
- `resume-prompt.md`: derived handoff.

A saved plan with tracking has:

- `action-plan.md`: current authorization plan, `Planning basis`, approval record, and change summary.
- `impact-inventory.md`: affected units, dependencies, risks, current state, and next action.
- `progress-ledger.md`: compact index of plan state, active unit, owner record, and resume point.
- `resume-prompt.md`: derived handoff.
- `records/<unit>.md`: detailed evidence, decisions, blockers, execution notes, and exact resume point, only when a unit needs detail that would make the ledger or plan materially harder to maintain.

Do not create inventory, ledger, or unit records for a saved normal plan. Do not duplicate detailed evidence, decisions, or logs across artifacts; link to their owner.

### Action Plan

Record every required authorization-plan criterion. Preserve the version that received approval while it remains current; a draft records the complete proposed version awaiting approval.

Begin with a `Plan record` containing `Created`, `Saved`, `Approved`, `Last updated`, and `Status`. Record presentation time in `Created`, directory creation time in `Saved`, and `Not approved` in `Approved` until approval. Preserve creation, saving, and first-approval timestamps once set. For a revised proposal, explicitly identify the current revision as awaiting approval; a historical approval timestamp does not approve it. Record subsequent revision approval separately without overwriting the first approval.

For tracking mode, include an append-only `Change summary` table: timestamp, concise change, reason, and approval effect. Record saving, tracking start, approval, revision, resumption, blocking, partial completion, completion, and stage closure, not routine minor actions. Update `Last updated` with these events. Keep plan evolution here rather than in a competing version of the plan.

A saved normal plan has no change summary. Rewrite a material revision in place without retaining the prior version, while making its current approval state explicit.

### Inventory, Ledger, And Records

An inventory maps impact; it is not proof of completion. Keep one active ledger unit only when execution is actually sequential; do not manufacture an active unit for idle or completed work.

A draft has no active implementation unit and claims no implementation or dependent verification under the unapproved proposal. A revised draft retains relevant historical work and evidence from the previous authorization, clearly separated from pending work. Its resume point is explicit approval of the complete current proposal.

Unit records own detailed evidence. The ledger indexes them instead of copying their contents.

### Resume Prompt

Every saved plan requires `resume-prompt.md`. It is derived from the plan and observed state, not an authority for authorization, scope, completion, or verification.

Name the repository and give the repo-relative path of every referenced artifact. Its first executable instruction must require reading the complete `AGENTS/plans/<plan-id>/action-plan.md`, including `Planning basis` when present, before implementation or dependent verification. Then require reconciliation with the working tree and observed verification; for saved tracking mode, include the active ledger entry and linked owner record when present.

For saved tracking mode, limit the handoff to identity, repository, paths, derived state, last closed stage, active or next stage, exact resume point, blocker, pending user decision, and preserved boundaries.

For a saved normal plan, limit it to identity, repository, paths, current approval state, preserved boundaries, and required reading and reconciliation instructions. Do not record stage state or a changing resume point.

Do not duplicate full stage tables, detailed evidence, histories, counts owned elsewhere, alternative implementation options, or commands that change the working tree or runtime state.

## Saved States And Updates

Use these states:

- `Draft`: current proposal awaits approval.
- `Approved`: current plan is authorized; implementation has not started.
- `In progress`: authorized work is being completed.
- `Blocked`: progress requires a material external decision or change.
- `Partially complete`: work stopped with completed and pending units recorded.
- `Complete`: authorized work and required verification are complete.
- `Superseded`: a material revision replaced the plan.

A saved normal plan uses only `Draft`, `Approved`, `Superseded`, and `Complete`; other states require tracking. Its approval record is a snapshot, not proof that authorization remains active after closure or declared blocking. Apply the authorization policy before resumption.

Under save authorization, create every artifact required by the mode. For an unapproved proposal use `Draft`. For a recoverably approved plan record `Approved`, or `In progress` when saved tracking begins during execution, after reconciling the approval, working tree, and evidence. When a material revision awaits approval, record the current proposal as `Draft` and mark the former approval superseded.

For a saved normal plan, update its two files only for draft changes, approval, material revision, supersession, or closure. Do not maintain stage progress, detailed evidence, or verification state there; closure may record the observed completion result.

For saved tracking mode, update the relevant artifact and derived handoff when a draft changes, a stage closes, a material decision is resolved, a blocker appears, or the resume point changes. Adding tracking during active execution follows the authorization policy's independent saving requirement; reconcile existing approval and evidence before recording state.

## Stage Synchronization

After a saved tracked stage passes its planned verification, synchronize before reporting closure or proceeding:

- Unit record, if present: detailed observed evidence, decisions, blockers, and resume point.
- Inventory: completed and current unit states and next action.
- Ledger: closed stage, actual active or next unit, and compact resume point.
- Action plan: last update, applicable state, and stage-close change summary.
- Resume prompt: derived fields and links only.

Check agreement on stage, state, active or next unit, blocker or pending decision, and resume point. Resolve disagreement against the approved plan, current working tree, and observed evidence. For unsaved tracking, maintain the equivalent concise state in conversation or native tools.

## Reconciliation Procedures

For resumption, read the complete approved plan and its planning basis, then reconcile the working tree and observed evidence. For saved tracking mode, also inspect the active ledger entry and linked owner record when present.

If the user requests resumption while ignoring a ledger, establish completed, pending, and unverified units from the approved plan, working tree, and observed verification. Update the ledger afterward only if tracking and save authorization remain applicable.

Apply the authorization policy to drafts, ended or unrecoverable authorization, and material differences. Records alone cannot establish permission or completion.

## Quality Gates

Before presentation, check all authorization-plan criteria, proportionate stages and verification, and loading limited to material context.

Before saving, check semantic identity, correct artifact set, explicit current approval state, traceable planning basis when applicable, and a handoff naming its repository and every referenced path.

For saved tracking, check that each artifact has one purpose, every active item has a next action or blocker, no artifact claims unobserved work, and no evidence or authority is duplicated. At stage closure check synchronization and the exact resume point.

After the authorization policy's final checks and reconciliation, update saved artifacts to reflect the observed result. Mark `Complete` only when all required work and verification are complete.
