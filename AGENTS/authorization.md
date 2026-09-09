# Authorization And Execution

This shared policy owns investigation, authorization, persistence permissions, execution continuity, verification permissions, reporting, and closure. It extends `AGENTS.md`. `AGENTS/roles/planner.md` owns plan presentation and saved-artifact procedures.

Inspection, search, investigation, reasoning, explanation, diagnostics, clarification, and other non-mutating work do not require change approval. Browser execution remains subject to the permissions below, and delegation to `AGENTS/coordination.md`.

## Modes And Persistence

Use a normal plan by default. Tracking mode must be explicitly requested or identified in the presented plan; do not infer it from size, stages, risk, or approval. A normal plan uses conversational or native progress tracking without repository tracking artifacts. A plan with tracking records decisions, impact, progress, and evidence; when unsaved, keep those records in conversation or native tracking.

Saving requires an explicit user request independently of implementation approval, in either mode. Only save-authorized plans create or maintain repository planning artifacts under `AGENTS/plans/<plan-id>/`. A saved normal plan contains only `action-plan.md` and `resume-prompt.md`; a saved plan with tracking uses Planner's complete artifact set. Requesting saving does not select tracking mode.

A request to save the current unapproved plan authorizes creation and update of its mode's `Draft` artifacts only. These record the proposal, approval-resume point, and, for tracking mode, impact and decisions. Saving does not authorize implementation, dependent verification, applying or resuming the draft, or changes outside its plan directory.

Implementation approval alone never authorizes planning artifacts. If saving is already authorized, that authorization covers updates for approval, material revision, supersession, and closure, plus progress maintenance in tracking mode. Establish required saved tracking artifacts before dependent implementation. Unsaved execution creates no planning files.

Git staging, commits, amendments, and pushes are separate history actions. Plan approval, implementation progress, stage closure, verification, and completion do not authorize them. Do not include, offer, request, or treat them as a routine plan step, stage checkpoint, closure condition, or next action. Perform them only when the user explicitly directs the intended history action and its scope; otherwise leave authorized work uncommitted and continue the approved plan without interruption.

Every persistent project change requires review of the relevant diff and `git diff --check` as minimum final completion checks. Applicable role documents define any additional completion checks. For instruction-system changes, apply the applicable Maker criteria for authority, precedence, applicability, references, and duplication.

## Investigation And Change Direction

Before proposing persistent file changes, inspect enough context to establish the current state, relevant mechanisms, dependencies, viable direction, behavioral effects, and destructive consequences. Use available evidence before asking for information that can be established directly, and resolve every decision that can materially affect the objective, scope, files, change mechanism, or verification.

Ask the user when missing information, ambiguity, conflicting intent, or an unresolved decision materially prevents a responsible change direction. If progress depends on that response, present the established evidence and unresolved matter, end the turn, and do not perform dependent work.

Do not silently expand into coupled mechanisms outside the requested scope. Surface any material coupling or conflict before offering a plan. Investigation and decision resolution may span multiple turns, and a plan must not substitute for work that should occur beforehand.

Once the direction is sufficiently established, explain the current behavior, responsible mechanism, supported direction, material coupling, expected improvements, and known residual effects, limitations, or uncertainty. Keep the result open for correction or adjustment and offer to prepare an authorization plan. Do not present the plan unless the user requests it or explicitly accepts the offer.

## Authorization Plan

Recognition of a possible file change does not require a plan or begin an authorization cycle. The cycle begins only when the user requests a plan or explicitly accepts an offer to prepare one. Every cycle requires a user-visible plan before persistent project files may be created, modified, deleted, or moved.

The plan must state:

- the problem or objective;
- the current mechanism causing the problem, when relevant;
- the files expected to change;
- the mechanism that will be changed;
- any material behavior or mechanism that will be deliberately preserved;
- any required dependent or coupled changes;
- any task-specific verification beyond the applicable completion checks;
- the default final verifications that will be executed;
- identified coupled components, routes, or mechanisms; behavior that must be preserved; planned validation; and any residual risks or verification limits;
- any proposed improvements beyond the requested scope, only when supported by evidence gathered during investigation; absence of additional improvements does not require justification.

Base the plan on established evidence and decisions, and keep its detail proportional while preserving everything required to authorize the complete change. Do not propose manual, visual, browser, or runtime verification unless explicitly requested or materially required to establish correctness.

Use `AGENTS/roles/planner.md` for the structure of every authorization plan and the procedures for saved artifacts and tracking. The requirements in this policy, including required content, saving permissions, approval, scope, revision, execution, verification, and closure controls, remain authoritative.

For a plan with multiple meaningful implementation units, organize the work into independently verifiable stages that incrementally produce the authorized result. For each stage, state its intended outcome and the narrowest verification that can establish it. Keep stage detail proportional and do not introduce verification that is prohibited or separately governed.

If the direction changes before a plan is presented, continue investigation until it is sufficiently resolved. If a presented but unapproved plan changes, present a complete revised plan that includes every unchanged part still in scope, identify the material differences, request approval for the complete revision, and treat the previous plan and approval request as superseded. A difference summary or partial correction cannot replace the complete revised plan.

## Approval And Execution

After presenting a plan, explicitly request approval and end the turn without modifying files. Only explicit approval in a subsequent user message of the latest complete plan authorizes execution. A request to prepare or present a plan, silence, an agent statement, clarification, discussion, inspection, previous work, approval of another plan, or approval of a partial correction, difference summary, or isolated adjustment does not authorize execution or omitted work.

Approval applies only to the scope and change mechanism represented by the approved plan. Each approved plan grants one bounded authorization that begins with approval and remains active only while completing and verifying that plan. Execute it without additional approval while it remains active, but do not modify unrelated files, behavior, formatting, architecture, or mechanisms. Corrections required to complete or verify the approved plan may proceed without additional approval only when they remain within its authorized scope.

## Staged Execution And Progress

For an approved multi-stage plan, use the platform's native planning or progress tool when available; otherwise maintain an equivalent concise checklist. Execution tracking records progress only and does not replace the user-visible authorization plan or its approval.

For every approved plan, the approved action plan, current working tree, and directly observed verification determine actual completion. A ledger, inventory, or record is a resume aid and cannot by itself establish implementation or verification. If the user asks to apply or resume a plan while ignoring its ledger, reconcile the approved plan against the current working tree and observed results before deciding what remains. Apply the Material Revisions rules when that reconciliation reveals a material change.

Complete and verify each stage before proceeding when its outcome can be checked independently. A stage boundary does not end the authorization or require additional approval. Continue automatically while the work remains within the approved scope and change mechanism.

If a stage verification fails, diagnose, correct, and repeat it without additional approval when the correction remains within scope. Apply the Material Revisions rules when the failure or resulting evidence requires a material change.

Operational steps may be split, combined, or reordered without additional approval only when doing so does not materially change the objective, expected files, change mechanism, dependencies, behavior, destructive impact, or verification strategy.

Keep the execution tracker aligned with the actual state of the work. At each stage boundary, record the completed outcome, observed verification result, and next stage. Stage verification supplements and does not replace the required final verification.

After an interruption or when execution continuity is uncertain, reconcile the tracker with the working tree and directly observed results before continuing. Do not infer that a stage is complete from the tracker alone.

## Operational Progress Reporting

During investigation or execution that spans multiple substantial actions, provide brief user-visible progress updates at meaningful boundaries:

- before beginning a substantial block of tool work;
- after completing or verifying a stage;
- when evidence changes the next action;
- when a blocker, material risk, or required decision appears;
- before beginning final verification.

Each update should state what was established, the relevant observed evidence or result, a brief operational rationale for the next action, and what will happen next.

Ground each update in the actual state of the objective rather than a fixed reporting habit. When the current state determines what follows, state it as the actual continuation. When the current objective is met or nearly met and what follows is optional or depends on the user's priorities rather than on the work itself, present it as a possibility, not as an implied continuation. Do not manufacture a next action, task, or improvement to avoid ending an update without one; reaching a clean stopping point is a normal and sufficient outcome.

Keep updates concise and proportional. Do not expose private chain-of-thought, narrate every tool call, repeat the complete plan, or present assumptions and inferences as observed facts.

## Material Revisions

If the user requests a material change after approval, stop dependent file changes and present a complete revised plan for the entire change. Include completed work when it constrains or affects the revision. The requested adjustment does not itself authorize the revised plan.

If execution reveals evidence that materially changes the objective, required files, change mechanism, dependencies, behavior, destructive impact, or verification strategy, stop dependent file changes and present a complete revised plan for the entire remaining change.

In either case, the revised plan replaces the previous plan, and when new approach is settled, the new plan must be presented completely, and requires explicit approval in a subsequent user message. End the revision turn without further file changes and resume only after that approval.

## Completion And Closure

Authorization ends when execution is completed, abandoned, declared blocked, or reported as complete. A temporary interruption does not itself end an active authorization. Reconcile its recoverable approval, scope, working tree, and observed verification before continuing. If authorization ended or cannot be recovered, investigate and present a complete plan for fresh approval before dependent changes. Do not reuse an ended authorization. Any later correction, refinement, addition, or other intended file change is a new change direction and must return to investigation before a new authorization plan may be offered.

After completing approved changes, run the default and applicable completion checks and perform the planned task-specific verification when possible. Report only directly observed changes, execution, checks, tests, runtime behavior, and verification. State the completed changes, observed results, and every material limitation, blocker, or unverified result.

Do not report a plan complete while required work or verification remains failed, unavailable, or unverified. Continue in-scope diagnosis and recovery while useful progress is possible. If an external decision or prerequisite prevents further progress, report the completed and pending work and declare the blocker; apply the resumption rule above. A changed verification strategy follows Material Revisions.

For a plan with tracking, after the applicable completion checks and before reporting completion, perform one bounded final reconciliation. Compare the approved plan and its planning basis (the saved `action-plan.md` and `Planning basis` when saving is authorized) with the current working tree and relevant diff, directly observed verification, and the conversational, native, or save-authorized tracking records needed to establish current state. Confirm that the implementation and evidence preserve material decisions, limits, dependencies, and contracts; that no relevant evidence or required plan condition was lost; and that later corrections did not invalidate checks already reported. Tracking records remain state and resume aids and do not prove implementation or verification.

If this reconciliation finds an omission within the approved scope, correct it, repeat only the affected verification, and reconcile the affected sources again. If it finds a material difference in objective, files, mechanism, dependencies, behavior, destructive impact, or verification strategy, stop closure and apply Material Revisions. If it finds work outside the approved scope, record it as a limitation or follow-up without silently expanding the plan. If it finds no discrepancy, the plan is eligible to be reported complete.

# Browser And Playwright Verification

For an explicit frontend change request, use headless Playwright to inspect the current running implementation when source inspection cannot establish a material visual, interactive, responsive, focus, hydration, or motion state. During authorized frontend implementation, use headless Playwright again to verify every affected browser-dependent behavior before reporting it as complete. Use the narrowest project, spec file, and title filter that can establish the required current or final state.

When visual behavior is in scope, capture and directly inspect the relevant current and final browser states. A capture records observed working state only; it is not a visual baseline or acceptance of that appearance. A user-provided reference defines the desired result only for the behavior it describes.

Visible, UI-mode, debug, slow-interaction, and snapshot-baseline execution require an explicit user request for that mode.

Requesting planning, plan preparation, instruction review, or code review does not authorize browser execution of any mode. An explicit frontend change request authorizes only the required focused headless inspection during investigation; it does not authorize visible, UI-mode, debug, slow-interaction, uncontrolled manual, or snapshot-baseline execution.

Use the repository's supported Playwright commands and its configured origin. Do not open a browser directly, search for a different port, start an alternate application server, or use an uncontrolled manual session.

When browser verification is not permitted, cannot run, or was not executed, report the affected behavior as unverified. Do not claim visual, responsive, hydration, focus, or runtime correctness from source inspection, lint, or build results alone.
