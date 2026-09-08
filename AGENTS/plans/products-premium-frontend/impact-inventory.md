# Impact inventory

Plan: `products-premium-frontend`

Status: Draft. This inventory describes proposed impact; it does not establish implementation or verification. Scope, decisions, and verification are owned by [action-plan.md](action-plan.md).

| Unit | Current state | Dependencies and risks | Next action |
| --- | --- | --- | --- |
| Products route and content | No `/products` source route exists. | Approved Products copy, external destinations, existing shared shell, anchor callers from Home/footer. | Await approval, then stage 1. |
| Products artwork and previews | Reference PNG/HTML/video resources are available; no Products production assets/components exist. | Supplied composition; safe illustrative reconstruction; responsive crop and proportions. | Await approval, then stages 1-2. |
| Products meshes and motion | Three reference mesh documents run continuous canvas loops; Home has useful lifecycle controls. | Aggregate rendering work, density/resolution, cleanup, reduced-motion/static behavior. | Await approval, then stage 2; verify actual runtime in stage 3. |
| Home and shared shell | Existing implementation includes pre-existing uncommitted work. Preserved dependency, not an edit target. | Navigation and footer are reused; shared defects could require separate revision. | Reconcile current files before execution; check route traversal in stage 3. |
| Playwright probes and runtime | Three Chromium projects configured; runtime/browser usability unverified. README omits tablet. | Port 3000 compatibility, installed browser, isolated output, correct project selection. | After approval and implementation, verify prerequisites and run disposable probes in stage 3. |
| Final verification | No implementation checks performed for this draft. | Scope integrity, completed browser evidence, removal of disposable probes, default checks. | Stage 4 after implementation and browser verification. |
| Tracking and handoff | Initial Draft artifacts saved. No implementation unit active. | Explicit approval of the complete plan. | Record approval only after the user's subsequent approval message; reconcile working tree before stage 1. |

No existing source, shared component, Home plan, reference, dependency, test configuration, or context document is an authorized edit target in this draft.
