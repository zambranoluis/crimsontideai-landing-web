# Plan record

- Created: 2026-09-08
- Saved: 2026-09-08
- Approved: Not approved
- Last updated: 2026-09-08
- Status: Draft
- Plan ID: `products-premium-frontend`
- Mode: Saved plan with tracking

# Objective

Build the premium Products route at `/products` from the supplied Products references, preserving their cinematic composition and independent OpenJM and Sentinel showcases. Adapt the efficient animation lifecycle already used by Home to the Products visuals, using Next.js Server Components, CSS Modules, optimized local artwork, and narrowly scoped client animation components.

The user requested a tracked, saved plan with Playwright authorized. This draft records headless implementation verification, including screenshot capture. Saving this draft does not begin implementation or dependent browser verification; explicit approval of this complete plan remains required.

# Planning basis

## Confirmed evidence and decisions

- The current route tree contains Home at `src/app/page.tsx` and no Products route. Home, shared components, and an unrelated Home plan contain pre-existing uncommitted work.
- The user resolved the initial Home/Products ambiguity: use `AGENTS/references/products`, and preserve the Home implementation whose mesh the user reports runs well.
- `AGENTS/references/products/products.png` leads the Products composition: cinematic hero, OpenJM showcase, Sentinel showcase, then the existing footer. The supplied `image/hero.png` is the available hero artwork. The screenshot guides composition rather than requiring its text to be embedded as pixels.
- This user-selected composition takes precedence for this task over the abstract radial hero and mirrored Sentinel arrangement described in `docs/structure.md`. Do not edit the context documents as part of this implementation.
- `docs/content.md`, Products section, supplies the page headline, descriptions, three supporting points per product, supporting lines, and action labels. `docs/product.md` and `docs/ux.md` establish the independent product identities and corporate bridge purpose.
- Confirmed external actions: Explore OpenJM -> `https://openjm.ai`; Explore Sentinel -> `https://crimsontide.app`. Use ordinary same-tab navigation. The hero action targets `#products-openjm`; both showcase sections own their existing documented anchor IDs.
- `src/components/sections/home/HeroMesh.tsx` already gates animation on intersection, document visibility, and reduced motion; limits drawing to approximately 30 draws per second; caps pixel density at 1.5; observes size; and cleans up observers and frame callbacks. The user's good runtime experience is user-reported, not a measured baseline from this investigation.
- The three Products mesh prototypes run continuous canvas frame loops without corresponding lifecycle gates. Their parameter files define different geometry per section. Adapt the visual shapes to bounded Products-owned rendering rather than importing their document scripts.
- The OpenJM and Sentinel animation HTML files contain embedded UI screenshots plus particle/chart/tilt mechanisms. Sentinel's source uses overlays to anonymize portions of an underlying screenshot. Reconstruct illustrative interface visuals with native HTML/SVG/CSS and neutral labels; do not publish an unmasked embedded screenshot or portray sample charts as live data or verified product metrics.
- The external mock at `C:/Users/MrMonka/Documents/GitHub/mnk-lab/crimsontide-landing-mnk/web-mock` is a read-only behavioral reference. Its hash-based page switcher and standalone iframe documents are not the Next.js implementation architecture.
- `SiteHeader`, `SiteFooter`, `ActionLink`, `SectionLabel`, and `Reveal` already provide applicable shared presentation and navigation mechanisms. Reuse their public interfaces without changing them. Existing Home and footer product links target `/products#products-openjm` and `/products#products-sentinel`.
- `package.json` and `playwright.config.ts` provide headless Playwright and desktop, tablet, and mobile Chromium projects at `http://localhost:3000`. `tests/e2e/README.md` omits the configured tablet project and describes the mobile range differently from the normative Frontend role; use the configured projects and role-owned ranges. Correcting that catalog is outside this plan.

## Chosen approach and alternatives

- Keep the page and copy as Server Components. Isolate canvas lifecycle and decorative motion in small client components; avoid frame-driven React state.
- Implement Products-owned meshes with the same scheduling and lifecycle principles as Home. Reuse the pattern, not a new shared renderer that would require changing Home. Product section geometry and coloration follow the supplied Products references while text, controls, and shared surfaces retain existing tokens.
- Preserve animated mesh identity. A completely static substitution was not selected because the user specifically endorsed the working Home animation approach.
- Recreate product preview interfaces as bounded illustrative visuals with localized CSS transform/opacity motion and small SVG accents. Avoid transplanting the prototypes' continuously running tilt, particle, chart, and timer systems. Keep essential content readable without JavaScript or motion.
- Use the supplied hero image as a local optimized image with reserved dimensions, responsive sizing/cropping, and appropriate above-the-fold loading. Avoid autoplay video, new rendering libraries, and a new styling system; none is needed for the selected mechanism.
- Keep the existing shared shell and all Home files unchanged. This contains regression exposure and preserves the existing successful Home rendering.

## Assumptions, dependencies, and limits

- Same-tab external product navigation is a conventional implementation choice; only the two confirmed destinations are contractual. Verify link behavior locally without accessing or asserting the external applications.
- The supplied artwork and preview prototypes establish appearance, not additional product capability claims. No metrics, onboarding, forms, product integrations, or additional routes are introduced.
- Existing shared navigation links to other unimplemented routes remain a known site limitation. This plan makes `/products` and its product anchors usable; it does not implement `/solutions`, `/work`, `/company`, or `/contact`.
- Browser availability and the compatibility of port 3000 are verified when execution reaches the browser stage. Their current usability has not been established by this draft.
- Browser measurements can establish lifecycle behavior and rendering work in the tested environment. They do not prove physical-device performance, universal frame rates, or real external-product integration.

# Scope and expected files

| Unit | Expected additions or updates | Responsibility |
| --- | --- | --- |
| Route | `src/app/products/page.tsx`, `src/app/products/page.module.css` | Static route composition, Products metadata, main landmark, shared header/footer integration. |
| Sections | `src/components/sections/products/ProductsHero.tsx`, `OpenJMShowcase.tsx`, `SentinelShowcase.tsx`, `ProductsSections.module.css` in that directory | Approved copy, cinematic hierarchy, responsive layout, supporting points, anchors, actions. |
| Product previews | `src/components/sections/products/OpenJMPreview.tsx`, `SentinelPreview.tsx`, `ProductPreviews.module.css` | Separate illustrative product interfaces and their restrained visual treatments. |
| Mesh and motion | `src/components/sections/products/ProductsMesh.tsx`, `ProductsMesh.module.css`, `ProductMotion.tsx` | Section-specific mesh presets, bounded canvas work, static fallback, motion lifecycle control for previews. |
| Local media | `public/images/products/hero.png` | Copy the supplied hero artwork for optimized local delivery. No original reference file changes. |
| Disposable verification | `tests/e2e/products-premium.probe.spec.ts` | Temporary implementation probe; remove after verification. No persistent test-surface admission. |
| Working evidence | Unique run directories under `test-results/products-premium-frontend/` | Screenshots and diagnostics from this task, isolated from pre-existing output. Git-ignored working evidence. |
| Tracking | `AGENTS/plans/products-premium-frontend/action-plan.md`, `impact-inventory.md`, `progress-ledger.md`, `resume-prompt.md`; `records/<unit>.md` only when needed | Approval, bounded stage tracking, evidence references, and derived handoff state. |

Component-local decomposition may be adjusted within the listed Products directory when it preserves the same responsibilities, mechanism, and scope. Changes to other application directories, shared components, project dependencies/configuration, persistent tests, reference files, instruction files, or context documents require a material revision if found necessary.

# Implementation and preserved behavior

1. Compose `/products` with the existing header and footer, one main landmark and H1, page title `Products — CrimsonTide`, and route-specific descriptive metadata.
2. Follow the Products screenshot's hero/OpenJM/Sentinel sequence and visual emphasis. Use the existing Roboto and design tokens, proportion-controlled content, responsive section spacing, and distinct product previews. Keep the page free of a separate closing CTA section.
3. Render complete copy and primary links on the server. The hero action reaches the OpenJM section. Put `products-openjm` and `products-sentinel` on their respective semantic sections so Home and footer deep links land correctly under the sticky header.
4. Reconstruct OpenJM's conversational workspace and Sentinel's camera/analytics presentation as decorative illustrative previews. Reserve visual space, use neutral demonstration labels, and keep preview controls out of the focus order. All real actions remain semantic links outside the artwork.
5. Implement up to one mesh per referenced Products section. Cache per-frame geometry for reuse, avoid per-point blur shadows, bound density/resolution, cap drawing around 30 Hz, and calculate motion from elapsed time. Pause offscreen and in hidden documents; draw a stable reduced-motion state; resize safely; cancel callbacks and disconnect observers on unmount. Use a deterministic SVG fallback if canvas or JavaScript is unavailable.
6. Gate decorative preview motion on visibility, document visibility, and motion preference. Prefer transform/opacity CSS motion with bounded layers. Do not attach continuous pointer tilt to static informational artwork or animate layout dimensions.
7. Reflow for mobile below 768px, tablet 768-1023px, and desktop at 1024px and above. Preserve content-first reading order, readable type, usable touch targets, keyboard focus, and no unintended horizontal overflow.
8. Reuse Home's mechanisms as inspected reference only. Preserve all Home source, the shared shell and tokens, existing inbound links, and unrelated uncommitted work. No existing project files are deleted or moved; only task-created disposable probes/resources are removed after use.

# Stages

| Stage | Intended outcome | Narrowest stage verification |
| --- | --- | --- |
| 1. Route and content | Products route, hero asset, semantic section skeleton, complete approved copy and confirmed navigation using the existing shell. | Review route/copy/anchor/link contracts and source ownership; run `npm run typecheck`. |
| 2. Visual implementation | Reference-led responsive sections, independent native previews, and Products meshes with Home-derived lifecycle controls. | Review server/client boundaries, deterministic fallback, scheduling/cleanup, CSS reflow rules, and preservation of Home; run `npm run lint` and `npm run typecheck`. Browser-dependent outcomes remain open until stage 3. |
| 3. Browser verification and scoped correction | Actual route rendering, navigation, responsive behavior, motion, and rendering-work evidence across relevant Chromium projects. | Run the targeted headless probes and screenshot review described below. Correct within-scope failures and repeat only affected checks. |
| 4. Final verification and reconciliation | Disposable probes removed, required completion checks observed, tracking reconciled, limitations recorded. | Relevant diff review including new files; `git diff --check`; `npm run lint`; `npm run typecheck`; `npm run build`; one bounded reconciliation of this plan, working tree, observed verification, and tracking. |

After approval, complete and verify each independently checkable stage and synchronize tracking before proceeding automatically. Stage boundaries do not require additional approval. A material change to this plan's scope or mechanism requires a complete revised plan and subsequent approval.

# Playwright verification

## Authority and execution boundary

- The user explicitly authorized Playwright in this plan request. Execute focused headless checks and screenshot capture during the approved implementation. No browser is run merely to save this draft.
- Use `npm run test:e2e -- tests/e2e/products-premium.probe.spec.ts` with the narrowest applicable `--project` and `--grep` filters. Confirm selection with `--list` before execution. No broad suite run is required.
- Use `desktop-chromium` (1280x800), `tablet-chromium` (768x1024), and `mobile-chromium` (configured Pixel 5 emulation) for affected responsive layouts. Run viewport-independent contracts once on desktop. Add focused widths around 768 and 1024 only to the disposable resize check.
- Verify the process and actual application at `http://localhost:3000` before reuse. Reuse a compatible server or allow the configured Playwright webServer to start one when free. An incompatible occupant is a blocker; do not switch ports or terminate unrelated processes.
- Preserve pre-existing evidence using `--reporter=line` and a unique `--output=test-results/products-premium-frontend/<run-id>` per run. Store screenshots via the probe's output path. Clean up only task-owned probes and processes; retain relevant diagnostic output and record its paths without treating file presence as proof.
- This plan does not request headed, UI, debug, slow-interaction, or snapshot-baseline modes. No external application login, submission, or live product verification is included.

## Assertions and review

1. Route/content contracts: `/products` returns 200, correct document title and H1, all approved section text, one main landmark, active Products navigation, and exact external product URLs. Assert real links; intercept external navigation if exercising activation, without loading third-party applications.
2. Navigation: hero anchor, direct `/products#products-openjm` and `/products#products-sentinel` entry, Home-to-Products link traversal, and Products-to-Home return. Check section positioning against the sticky header. Exercise mobile/tablet menu toggle, focus entry, Escape return, and route-link closure through the reused shell. A shared-component defect is reported rather than silently fixed outside scope.
3. Layout and visuals: headless screenshots at all three configured profiles, plus targeted section captures as necessary; inspect hierarchy, artwork crop, preview proportions, mesh placement, section spacing, readable text, button visibility, and absence of clipping/overflow. Check mounted resize across layout/navigation boundaries separately from fresh viewport loading. Screenshots are review evidence, not approved snapshot baselines.
4. Accessibility and resilience: keyboard reachability and visible focus for actual actions, skip link, touch-safe navigation, semantic labels, reduced-motion mode, and readable primary content/static decoration with JavaScript disabled. This is focused verification, not a comprehensive accessibility certification.
5. Motion lifecycle: instrument actual canvas drawing/frame activity before the trigger and sample before/during/after scrolling a mesh offscreen, bringing it back, changing motion preference, resizing, and navigating away/back. Check bounded canvas dimensions, capped draw cadence, stopped work while inactive, resumed motion without a time jump, and absence of duplicate work after remount. State attributes alone are insufficient proof. Test hidden-document pause with a controlled supported Chromium mechanism when available; report it unverified if the environment cannot establish that state reliably.
6. Rendering diagnostics: record available frame/draw and long-task observations during a bounded scroll/animation sample. Distinguish first draw/resize work from continuous animation. Use the evidence to correct disproportionate work within scope; do not promise an unmeasured speedup or universal FPS target.
7. Runtime: observe hydration/browser errors, failed local asset requests, and image loading. Verify Home still renders and its mesh runs after returning from Products; do not claim the entire Home page or the external products were revalidated.

# Risks, limits, and closure

- Products has several illustrated regions, so Home's successful single-mesh experience alone cannot prove equivalent aggregate cost. Verify actual draw lifecycle and bound per-section work.
- Supplied screenshot proportions need deliberate mobile recomposition; desktop fidelity does not establish responsive correctness.
- Illustrative previews reproduce product identity and reference composition without constituting real applications or claims about sample data.
- Some existing navigation destinations remain unimplemented; external application availability is outside local verification.
- The current uncommitted Home/shared work is a dependency and must remain untouched. Required shared fixes, new dependencies, new routes, or test configuration changes trigger revision instead of scope expansion.
- Report every failed, blocked, or unexecuted check and affected behavior. Static checks do not establish browser correctness; screenshots do not establish performance or integration.
- Final reconciliation compares the approved action plan including Planning basis with actual files, diffs, verification, and the relevant tracking artifacts. Correct omissions within scope and repeat affected verification. Mark Complete only after required work and checks are complete; use an appropriate incomplete state for a blocker.

# Change summary

| Timestamp | Change | Reason | Approval effect |
| --- | --- | --- | --- |
| 2026-09-08 | Created and saved initial tracked draft with headless Playwright verification. | User requested a tracked saved plan after confirming Products references, Home preservation, and both product destinations. | Draft only; complete plan awaits explicit approval. |
