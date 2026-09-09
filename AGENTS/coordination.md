# Coordination

This shared policy extends `AGENTS.md` and owns execution-mode selection, delegation contracts, ownership, handoffs, integration, and team closure. `AGENTS/authorization.md` controls change and verification permissions; `AGENTS/execution.md` controls operational practices.

## Execution Mode

Use one agent by default. Complexity, available tools, specialist roles, and possible speed or quality gains do not authorize delegation.

Delegation requires an explicit user request or a justified permission request followed by approval. A permission request must state the bounded objective, why independent workers help, number and responsibilities of workers, access and edit scope, and expected evidence. Continue independent authorized work while awaiting the response; do not delegate before approval. If refused, continue with one agent.

Permission applies only to the stated task or plan, never additional edits or future tasks. A plan may authorize a bounded pilot without authorizing delegation during its implementation. Role loading does not create agents or grant delegation permission.

Use one coordinator and a flat team. Workers cannot delegate or create descendants. The coordinator may work directly and owns the combined result.

Before dispatch, verify that the available runtime supports the proposed assignments. Do not invent capabilities or claim that instructions enforce a technical sandbox. If delegation is unavailable, report the limitation and continue useful work directly. If an explicitly required pilot or independent validation cannot run, leave that requirement unverified and apply the authorization policy if the verification strategy must change.

## Assignment Contract

Give each worker a self-contained assignment containing:

- objective and bounded question or deliverable;
- authoritative inputs, repository location, applicable instruction paths, and material decisions;
- permissions, prohibited actions, and the boundary of the user's authorization;
- owned files or explicit read-only scope;
- dependencies, shared resources, and required ordering;
- expected evidence and verification limits;
- return conditions, including completion, blocker, conflict, and incomplete-work reporting.

Workers read the complete applicable root, shared policies, and roles before acting. Use the current model settings unless the user or applicable instructions specify otherwise. Do not equate a specialist document with a native named-agent configuration.

Workers stay within assignments and report material ambiguity or coupling to the coordinator before dependent work. They cannot broaden scope, grant approvals, override policy, or communicate with external parties on the user's behalf without authorization.

## Ownership And Resources

Assign non-overlapping file ownership for concurrent edits. Shared filesystem access is not permission to edit another owner's files. Read-only overlap is allowed.

When work requires overlapping edits, serialize ownership and explicitly hand it over before the next writer starts. The coordinator must not edit worker-owned files concurrently. Resolve unexpected overlap before further dependent changes; preserve each contributor's work and inspect the actual diff.

Assign one owner for a shared server or output directory. Serialize runs that could overwrite reports, test output, or mutable state; use isolated output only when supported and within the authorized verification strategy. Resource cleanup belongs to its recorded owner after all consumers finish.

## Handoffs And Failure

Return findings or changes with file references, observed checks, evidence, assumptions, limitations, unresolved dependencies, and status. Separate completed, pending, and unverified work. Report unexpected edits or side effects immediately.

Handoffs are temporary tool messages or conversational records unless explicitly included in save-authorized planning artifacts under Planner. Do not create separate persistent handoff or reasoning logs.

If a worker fails, stalls, or returns incomplete evidence, the coordinator inspects the actual state and identifies what remains. Stop or isolate conflicting activity before reassignment. Recover directly or reassign within the permitted team scope; seek a revised authorization when recovery materially changes scope or verification. A missing handoff is not successful completion.

## Integration And Closure

The coordinator reconciles worker findings with authoritative inputs, current files, diffs, and observed evidence. Resolve conflicting findings on evidence; do not decide by vote or assume a worker's conclusion proves correctness.

Accept only work within the approved objective and file ownership. Verify integrated changes and recheck evidence affected by corrections. Report a worker's unverified claim as such.

Before final closure, account for every assignment, pending worker, shared resource, and material finding. Stop remaining task workers when their work is no longer needed, preserve required evidence, and complete applicable authorization checks. Report static findings separately from observed delegation behavior and runtime limitations.
