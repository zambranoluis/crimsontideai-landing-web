# Execution Practices

This shared policy extends `AGENTS.md` and owns command practices, file operations, runtime resources, temporary output, and tool-output discipline. Authorization is governed by `AGENTS/authorization.md`; worker ownership by `AGENTS/coordination.md`.

## Commands And Output

- Use the environment's shell consistently. In this Windows workspace, use PowerShell syntax; do not route filesystem mutations through another shell.
- Set the tool-level working directory explicitly when invoking commands. Do not depend on a previous command changing directories.
- Prefer `rg` and `rg --files` for targeted searches. Bound searches by relevant paths and patterns.
- Batch independent reads when useful. Keep dependent operations, mutations, and prerequisite checks ordered.
- Ordinary pipelines and scripts are available when they fit the operation. Do not chain commands solely to print separators or mix unrelated output.
- Treat shell text as executable code. Use literal paths and safe quoting; do not treat JSON encoding as shell escaping. Prefer structured tool arguments and file-backed bodies for multiline content.
- Do not reuse reserved environment or system variables for task-specific values.
- Bound tool output to what is needed for the decision. Narrow or split truncated reads; read required instruction documents completely.
- Inspect exit status and terminal output. A started process, partial log, or generated file does not establish successful completion. Report material errors without exposing sensitive values.

## File Operations

- Inspect the current working tree before editing and preserve unrelated user changes.
- Prefer structured patches for edits; review the resulting file and diff, including untracked files.
- Use PowerShell `-LiteralPath` where supported for path-sensitive filesystem operations.
- Before recursive deletion or movement, resolve and verify that every absolute target remains within the intended workspace or explicitly named target directory. Perform the operation in one shell; do not enumerate paths in PowerShell and pass deletion or movement to `cmd /c`.
- Restrict cleanup to known task-owned files. Do not use broad cleanup or restore operations to remove unrelated work.

## Runtime Resources

- Track the identity, owner, purpose, and cleanup responsibility of temporary processes and resources.
- Reuse a compatible resource when safe. Before starting a resource with an exclusive boundary, check whether that boundary is occupied and verify compatibility.
- Verify prerequisites as currently usable before dependent execution. A file, process, port, or artifact merely existing is insufficient. Re-verify when the user reports a prerequisite was repaired.
- Report material runtime conflicts; do not silently bypass them. Follow Tester's narrower server rules for Playwright.
- Start background helpers hidden on Windows unless a visible interactive window was explicitly requested.
- Close task-created processes and sessions when no longer needed. Do not stop pre-existing resources without authorization.

## Temporary Output

- Keep disposable probes, handoffs, and diagnostics temporary; create persistent project artifacts only under the authorization policy.
- Preserve pre-existing reports and diagnostics. Remove only known output created by this task when no longer needed; retain evidence required for reporting or an authorized handoff until it has been consumed.
- Do not treat generated output or its presence on disk as coverage or successful verification.
- Coordinate shared servers and output directories through the coordinator before concurrent use. Do not overwrite another worker's evidence or clean a resource it still needs.
