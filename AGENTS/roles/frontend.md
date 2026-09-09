# Frontend

Use this document for frontend design and UX investigation, review, and implementation, as well as frontend code organization, browser rendering, interaction, external data consumption, and behavior.

This document extends `AGENTS.md` and its applicable shared policies. Also load `AGENTS/roles/coder.md` when code is involved; design or UX investigation alone does not require Coder.
Also use `AGENTS/roles/tester.md` when Playwright tests or browser verification are created, changed, executed, or diagnosed.

# Responsibility

This document owns:

- page composition, design quality, and UX evaluation;
- frontend code organization;
- client and server rendering boundaries;
- external data consumption in frontend code;
- interface state and recovery behavior;
- component and client-state ownership;
- styling and visual density;
- responsive behavior;
- accessibility;
- motion.

It does not own repository completion checks, browser-execution authorization, or Playwright test architecture.

# Design And UX Evaluation

Use the applicable nonempty project sources identified by the root to establish product intent, content, visual language, and spatial requirements. Keep factual content, exact copy, visual direction, and spatial requirements tied to their authoritative sources.

Evaluate the complete page composition as well as the affected component: hierarchy, reading order, typography, rhythm, alignment, density, contrast, imagery, section transitions, navigation, and primary actions. Judge choices against the surface's purpose and the user's intended journey.

Identify deficiencies in usability, composition, and consistency with the established design direction. During implementation, correct deficiencies within the approved scope and mechanism. Surface coupled or out-of-scope deficiencies through the authorization policy rather than silently expanding the change.

Choose density for the surface's purpose. Allow expressive spacing and scale where they serve the composition; keep functional controls proportionate to content and use. Evaluate complete-page consequences even for a local change without treating that evaluation as permission for a page-wide redesign.

Use source inspection for structural findings and authorized browser evidence for observed appearance and interaction. Evaluate against the defined target, not merely the absence of technical errors. Planning and design review do not themselves authorize browser execution.

# Established Structure

Preserve the repository's existing ownership boundaries.

- Use `src/app` for Next.js App Router routes, layouts, metadata, and application boundaries.
- Use `src/app/globals.css` as the single global stylesheet. It is imported by the root layout only.
- Use `src/components/ui` for shared, domain-neutral interface primitives.
- Use `src/components/sections` for landing sections composed for a specific route.
- Use `src/lib` for shared non-component helpers.
- Use `public/` for static assets served at the site root.
- Import internal modules through the `@/*` alias, which resolves to `./src/*`.
- Colocate a component's own module stylesheet, types, and helpers with the component.
- Promote code to a shared location only when actual reuse or a domain-neutral responsibility justifies it.
- Introduce a new shared directory only when an existing location cannot own the responsibility.
- Do not reorganize unrelated code to match an idealized directory template.

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
- Keep static content statically rendered unless a behavior genuinely requires request-time or client-time resolution.

# Data Boundaries

This repository currently serves static landing content and defines no server route handlers. These rules apply when frontend code consumes any external data source, including a form endpoint, content source, or analytics service.

- Consume only fields and states the source's established contract defines.
- Use a stable generic fallback when a safe message is absent or the response violates the expected contract.
- Do not expose unexpected fields, diagnostics, internal URLs, or transport details to the browser surface.
- Keep credentials and protected configuration out of browser-reachable code, including request URLs and client-side environment values.
- Treat a required but undefined state distinction as a contract dependency that its owner must resolve.

# Frontend Validation

- Use frontend validation for immediate interaction feedback.
- Do not treat frontend validation as authoritative enforcement.
- Keep it consistent with the contract of the receiving endpoint.
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
- Do not show raw exceptions, stack traces, or infrastructure details.

# Styling And Visual System

Use plain CSS. Component styles are CSS Modules; shared foundations are global CSS.

- Write component styles in a colocated `<ComponentName>.module.css` and import it from its component.
- Keep `src/app/globals.css` limited to `:root` custom-property tokens, resets, base typography, and genuinely global behavior.
- Treat the `:root` custom properties in `src/app/globals.css` as the authoritative design tokens.
- Prefer existing tokens, primitives, and shared styles over new one-off values.
- Add a token when a value is reused or expresses a design decision; keep genuinely local values in the owning module.
- Do not introduce Sass, CSS-in-JS, a utility-class framework, a UI kit, or another styling system unless explicitly authorized.
- Preserve and reuse established shadow treatments when they serve the affected visual language.
- Do not introduce a new decorative shadow language without an authorized design requirement.
- Keep controls proportion-controlled on large viewports; choose content density according to the page and section purpose.
- Reflow or stack content on smaller viewports before increasing component scale.
- Size cards, dialogs, panels, forms, and controls according to their content and function.
- Use hierarchy, contrast, spacing, and local emphasis before increasing scale.

# Responsive Behavior

Preserve usability across the established primary ranges:

- mobile: below `768px`;
- tablet: `768px` to `1023px`;
- desktop: `1024px` and above.

Introduce a narrower breakpoint only when the affected feature requires it, and define it alongside the styles that use it.

- Prefer flexible layout behavior over viewport-specific hardcoding.
- For viewport-oriented sections, account for sticky or fixed navigation when sizing and aligning content, including the interaction between section padding and anchor offsets.
- Fit the complete content and primary action within the unobscured viewport when readability and spacing allow; otherwise preserve natural vertical growth. Apply fitting selectively by section and available viewport dimensions, without clipping content or reducing readability.
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

Use CSS transitions and keyframes as the default motion mechanism.

- Model coordinated animation and transition sequences as declarative, named stages. Advance a stage from the responsible animation, transition, interaction, or external completion event, not from a fixed delay. Timers may serve only as idempotent recovery fallbacks when completion events can be suppressed or cancelled, or when elapsed time is an explicit product behavior.
- Do not add a motion library without explicit authorization.
- Add new motion only when it improves feedback, state clarity, usability, perceived responsiveness, or an explicitly requested visual experience.
- Prefer `transform` and `opacity` over layout-heavy animated properties when behavior permits.
- Scroll-triggered transitions must play forward when scrolling down across their activation threshold and reverse when scrolling up across the same threshold. Keep them repeatable, and continue interrupted transitions from their current visual state. Keep content resolved while it remains in its reading area or holds keyboard focus.
- Respect `prefers-reduced-motion` and preserve existing reduced-motion behavior.
- Preserve layout, focus order, readability, keyboard navigation, and touch interaction during motion.
- Do not block interaction during animation unless the interaction requires it.

# Frontend-Specific Verification

`AGENTS/roles/coder.md` owns the repository completion checks.
`AGENTS/authorization.md` owns browser execution authority and reporting of unverified behavior.
`AGENTS/roles/tester.md` owns Playwright scope selection, execution methods, evidence, and test design.

- Select the frontend behavior that requires browser verification from the change itself: rendering, interaction, responsive reflow, hydration, focus, or motion.
- Verify responsive behavior in every established range a change affects.
