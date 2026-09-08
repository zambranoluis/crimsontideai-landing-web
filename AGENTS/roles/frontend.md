# Frontend

Use this document for frontend-specific code organization, browser rendering, interaction, frontend contract consumption, or frontend behavior.

This document extends root `AGENTS.md` or `CLAUDE.md`, and `AGENTS/roles/coder.md`.
Also use `AGENTS/roles/backend.md` when the affected code is a Next.js BFF route or other server-only behavior.

# Responsibility

This document owns:

- frontend code organization;
- client and server rendering boundaries;
- browser contract consumption;
- interface state and recovery behavior;
- component and client-state ownership;
- styling and visual density;
- responsive behavior;
- accessibility;
- motion;
- browser and visual verification conditions.

It does not own BFF contract production, Spring validation, upstream failure translation, or server-side domain decisions.

# Established Structure

# Component And State Ownership

- Keep each component focused on one interface responsibility.
- Keep feature workflows and application contracts out of domain-neutral primitives.
- Prefer composition over components with unrelated behavioral modes.
- Keep data access and non-trivial state transitions outside presentational components.
- Keep components independent from raw transport representations.
- Prefer local state when broader ownership is unnecessary.
- Use shared state only when multiple consumers require the same authoritative client-side value or behavior.
- Do not duplicate state that can be derived reliably.
- Derive values during rendering when no independent state transition is required.
- Do not use an effect to synchronize React state that can be derived from props, existing state, or stable inputs. Derive it during rendering instead. Use state updates from effects only when synchronizing with an external system or representing an independent asynchronous transition.
- Do not trigger side effects during rendering.
- Avoid unnecessary effects, global state, rerenders, and memoization.

# Client And Server Boundaries

- Prefer Server Components when browser interactivity is not required.
- Use Client Components for browser APIs, local interactive state, effects, or event handling.
- Keep Client Component boundaries as narrow as practical.
- Keep server-only logic, dependencies, credentials, and protected configuration outside browser bundles.
- Do not access browser APIs during server rendering.
- Keep initial rendering deterministic and avoid hydration mismatches.
- Use post-hydration information to refine secondary behavior when the server cannot resolve it safely.
- Do not replace the primary content tree unexpectedly after hydration.
- Browser services must call internal `/api/*` routes unless the established architecture explicitly defines another browser-safe boundary.
- Do not call protected Spring or OpenJM endpoints directly from browser code.

# Contract Consumption

Treat the established browser-facing BFF contract as the source of truth for frontend behavior.
Apply the inherited contract-tracing rules when that contract is not separately documented.

Rules:

- Consume only established statuses, fields, codes, and payload shapes.
- Do not make interface behavior depend on raw Spring or OpenJM representations.
- Do not parse arbitrary human-readable messages to determine control flow.
- Use documented machine-readable states or codes for deterministic branching.
- Use messages as display content only when the browser-facing contract identifies them as safe.
- Keep user-facing failure behavior independent from wording outside the browser-facing contract.
- Use a stable generic fallback when a safe public message is absent or the response violates the expected contract.
- Do not expose unexpected fields, diagnostics, internal URLs, or transport details.
- Treat a required but undefined state distinction as a contract dependency that its owner must resolve.

# Frontend Validation

- Use frontend validation for immediate interaction feedback.
- Do not treat frontend validation as authoritative enforcement.
- Keep it consistent with the browser-facing contract.
- Prevent locally detectable malformed submissions when safe and interactionally appropriate.
- Keep correctable feedback accessible and associated with the relevant control.
- Preserve entered values after a correctable failure when safe.
- Do not infer security-sensitive facts from response wording or timing.

# Interface States And Recovery

- Represent every loading, ready, empty, error, and recovered state that the affected interface can reach under its established contract.
- Distinguish initial loading, background refresh, and stale-data recovery when their behavior differs.
- Use an empty state only after absence of data is confirmed.
- Do not present unresolved, partial, delayed, or failed data as empty.
- Preserve previous valid content during background refresh when it remains usable.
- When the established contract identifies partial data as usable, keep it visible and communicate its limitations.
- Keep unaffected regions usable when a failure is local or recoverable.
- Provide retry or another safe next action when recovery is possible.
- Preserve user input after recoverable action failures when safe.
- Do not replace an entire page for a recoverable local failure.
- Do not allow expected request failures to become uncaught render failures.
- Do not show raw exceptions, stack traces, persistence errors, provider diagnostics, or infrastructure details.

# Styling And Visual System

Use CSS Modules as the standard component styling system.

- Keep application and shared component styles in the established `src/styles` locations.
- Keep global CSS limited to tokens, resets, base typography, and genuinely global behavior.
- Prefer existing design tokens, variables, primitives, and shared styles over new one-off values.
- Do not introduce Sass, CSS-in-JS, a UI kit, or another styling system unless explicitly authorized.
- Do not use Tailwind utility classes for application styling unless explicitly authorized.
- Preserve and reuse established shadow treatments when they serve the affected visual language.
- Do not introduce a new decorative shadow language without an authorized design requirement.
- Keep functional content compact and proportion-controlled on large viewports.
- Reflow or stack content on smaller viewports before increasing component scale.
- Size cards, dialogs, panels, forms, and controls according to their content and function.
- Use hierarchy, contrast, spacing, and local emphasis before increasing scale.

# Responsive Behavior

Preserve usability across the established primary ranges:

- mobile: below `1024px`;
- desktop: `1024px` and above.

Use narrower established breakpoints when the affected feature already requires them.

- Prefer flexible layout behavior over viewport-specific hardcoding.
- Avoid unintended horizontal scrolling, clipped controls, and unreadable content.
- Preserve usable navigation, forms, dialogs, tables, cards, and interactive states.
- Preserve content hierarchy when regions reflow or stack.
- Keep touch targets usable without inflating unrelated interface elements.

# Accessibility

- Use semantic HTML when available.
- Preserve keyboard and touch interaction.
- Preserve visible focus indicators and logical focus order.
- Give inputs accessible labels and interactive controls accessible names.
- Associate validation and error feedback with affected controls.
- Do not communicate meaning through color alone.
- Preserve sufficient contrast and readability.
- Preserve screen-reader behavior when the affected interface is exposed to assistive technology.
- Do not let animation, conditional rendering, or recovery behavior disrupt focus without necessity.

# Motion

Use the mechanism established by the affected feature.

- Model coordinated animation and transition sequences as declarative, named stages. Advance a stage from the responsible animation, transition, interaction, or external completion event, not from a fixed delay. Timers may serve only as idempotent recovery fallbacks when completion events can be suppressed or cancelled, or when elapsed time is an explicit product behavior.
- Prefer CSS transitions and keyframes for simple local motion.
- Continue using Framer Motion where the existing component or coordinated behavior already depends on it.
- Use a motion library when CSS cannot represent the required established behavior sufficiently.
- Do not add another motion dependency without explicit authorization.
- Add new motion only when it improves feedback, state clarity, usability, perceived responsiveness, or an explicitly requested visual experience.
- Prefer `transform` and `opacity` over layout-heavy animated properties when behavior permits.
- Respect `prefers-reduced-motion` and preserve existing reduced-motion behavior.
- Preserve layout, focus order, readability, keyboard navigation, and touch interaction during motion.
- Do not block interaction during animation unless the interaction requires it.

# Frontend-Specific Verification

The repository completion checks are owned by `coder.md`.

Use Playwright browser or visual verification.
When Playwright will be executed, additionally use `AGENTS/roles/tester.md` and follow the repository test architecture and supported `npm` commands.
When browser execution would otherwise be required to establish correctness, report the unverified behavior without claiming visual or runtime correctness.
Do not claim visual, responsive, hydration, focus, or runtime correctness from the code source, lint or build results alone.
