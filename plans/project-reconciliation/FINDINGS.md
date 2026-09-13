# Findings register

[Plan](PLAN.md) · [Status](STATUS.md)

All seed observations below come from the user-supplied reconciliation plan. Stage 00 only confirmed candidate paths by filename inventory; it did not review source behavior or reproduce tests. Classification is provisional unless explicitly user-directed. “Historical failure” is not a current result. Original audit logs, screenshots, commands, source hashes, and counts were not supplied and are unavailable here.

Use stable IDs; append resolutions and verification references rather than deleting history. Stage 01 must confirm classifications and assign newly discovered mismatches. Allowed classifications: documentation drift, stale test, confirmed implementation defect, timing/setup problem, missing evidence, intentional limitation. No implementation defect is confirmed by this seed register.

For each entry, update observed versus intended behavior, exact affected files, owning stage, resolution/status, and source-specific verification. An arrow denotes discovery/baseline followed by the resolution owner; explicit coverage/docs owners remain responsible for their gates.

## PR-001

- Affected files / discovery scope: src/app/solutions/page.tsx; docs/content.md; Solutions surface brief (locate in Stage 01)
- Observed: Supplied audit reports Earth opening and former hero at the end; document agreement unverified.
- Intended: Preserve established opening/closing composition and approved copy.
- Classification: documentation drift (provisional)
- Owning stage(s): 01 → 03.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-002

- Affected files / discovery scope: src/app/products/page.tsx; tests/e2e/products-layout.spec.ts; docs/content.md
- Observed: Supplied audit reports alternating columns and mobile reading-order differences.
- Intended: Preserve intended alternating composition and responsive reading order.
- Classification: documentation drift (provisional)
- Owning stage(s): 01 → 03; coverage 04.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-003

- Affected files / discovery scope: src/app/work/_sections/Clients/PartnerGrid.tsx; src/app/work/page.tsx; tests/e2e/work-partners.spec.ts; PRODUCT.md
- Observed: Supplied audit reports reorderable partner grid and removed General Food destination.
- Intended: Confirm current approved destination and preserve keyboard, mouse, touch, cancellation, and no-JavaScript behavior.
- Classification: documentation drift (provisional)
- Owning stage(s): 01 → 03; coverage 05.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-004

- Affected files / discovery scope: src/app/page.tsx; src/components/layout/SiteHeader/SiteHeader.tsx; tests/e2e/navigation.spec.ts; tests/e2e/navigation-transitions.spec.ts
- Observed: Supplied audit reports Home Company link now navigates to route top; old expectations may differ.
- Intended: Review route-top navigation, section scrolling, clean enhanced URLs, focus, fragments, and history.
- Classification: stale test (provisional)
- Owning stage(s): 01 → 04; docs 03.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-005

- Affected files / discovery scope: src/components/layout/SiteFooter/SiteFooter.tsx; docs/content.md; PRODUCT.md
- Observed: Supplied audit reports footer groups/social destinations differ from documents.
- Intended: Document verified groups and approved destinations exactly.
- Classification: documentation drift (provisional)
- Owning stage(s): 01 → 03.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-006

- Affected files / discovery scope: src/app/contact/_sections/ContactSection/ContactForm/ContactForm.tsx; tests/e2e/contact.spec.ts; docs/content.md
- Observed: Supplied audit identifies email draft flow as requiring reconciliation.
- Intended: Preserve validation, encoded draft, retained values, direct channels, and no delivery claims.
- Classification: missing evidence
- Owning stage(s): 01 → 03; coverage 05.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-007

- Affected files / discovery scope: src/app/company/page.tsx; src/app/company/_components/CompanyParticles.tsx; tests/e2e/company.spec.ts
- Observed: Supplied audit identifies responsive particle sequence and conditions requiring reconciliation.
- Intended: Review intended responsive sequence, progression, and fallbacks before treating behavior as contract.
- Classification: missing evidence
- Owning stage(s): 01 → 03; coverage 05.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-008

- Affected files / discovery scope: tests/e2e/; playwright.config.ts; scripts/mesh-evidence.mjs; scripts/terrain-evidence.mjs
- Observed: Supplied audit reports captures/attachments/profiles need output isolation.
- Intended: Use Playwright output paths and ignored run-specific directories.
- Classification: timing/setup problem (provisional)
- Owning stage(s): 02.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-009

- Affected files / discovery scope: scripts/mesh-evidence.mjs
- Observed: Supplied audit reports obsolete Home target.
- Intended: Use a current source- and render-verified target.
- Classification: timing/setup problem (provisional)
- Owning stage(s): 02.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-010

- Affected files / discovery scope: tests/e2e/README.md; docs/terrain-performance.md; playwright.config.ts; package.json
- Observed: Supplied audit reports instructions depend on missing terrain configuration; exact references not yet inspected.
- Intended: Provide checked-in reproducible production testing at port 3001.
- Classification: timing/setup problem (provisional)
- Owning stage(s): 02.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-011

- Affected files / discovery scope: package.json; package-lock.json; tests/e2e/; scripts/; tests/e2e/README.md
- Observed: Supplied audit requests setup/dependency verification and serial runs; no dependency defect confirmed.
- Intended: Declare directly imported verification dependencies and serialize suites/builds/profiling.
- Classification: missing evidence
- Owning stage(s): 02.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-012

- Affected files / discovery scope: README.md; PRODUCT.md; DESIGN.md; docs/content.md; six Impeccable surface briefs and generated sidecar (locate in Stage 03)
- Observed: Supplied audit reports outdated composition, guidance, references, and latest claims.
- Intended: Reconcile document responsibilities, references, renderer/lifecycle guidance, and design metadata; preserve unavailable evidence as such.
- Classification: documentation drift (provisional)
- Owning stage(s): 03.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-013

- Affected files / discovery scope: tests/e2e/company-mountains.spec.ts; src/app/_sections/Company/
- Observed: Historical wrapped-content mountain failure reported in supplied plan; command, date, source hashes, counts, and logs unavailable.
- Intended: Investigate intended content landmark relationship; repair assertion/setup or runtime only with evidence.
- Classification: missing evidence; candidate stale test or implementation defect
- Owning stage(s): 02 baseline → 04.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-014

- Affected files / discovery scope: tests/e2e/solutions-motion.spec.ts; tests/e2e/solutions-earth.spec.ts; src/app/solutions/page.tsx
- Observed: Supplied audit reports obsolete initial Solutions Reveal assumption; no current failing run captured.
- Intended: Check Earth opening and retain meaningful reveal/motion coverage where applicable.
- Classification: stale test (provisional)
- Owning stage(s): 02 baseline → 05.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-015

- Affected files / discovery scope: tests/e2e/company.spec.ts; src/app/company/
- Observed: Historical Company replay and journey progression failures reported in supplied plan; command, date, source hashes, counts, and logs unavailable.
- Intended: Investigate replay/progression and hold-release/reverse/resize/restored positions using state or geometry readiness.
- Classification: missing evidence; candidate timing/setup problem or implementation defect
- Owning stage(s): 02 baseline → 05.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-016

- Affected files / discovery scope: src/lib/animationLifecycle.ts; tests/e2e/mesh.spec.ts; tests/e2e/terrain.spec.ts; tests/e2e/solutions-earth.spec.ts; tests/e2e/company.spec.ts
- Observed: Supplied plan requires lifecycle, resize, failure, and cleanup verification; no current results captured.
- Intended: Verify suspension, hidden/offscreen resize, context fallback, unmount cleanup, and static fallbacks.
- Classification: missing evidence
- Owning stage(s): 04 shared mesh; 05 routes/footer.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-017

- Affected files / discovery scope: tests/e2e/; playwright.config.ts; README.md
- Observed: No current full baseline, skip review, or final responsive/browser evidence established by Stage 00.
- Intended: Capture source-specific serial Chromium results; justify skips and state Firefox/Safari/physical-device/accessibility limits.
- Classification: missing evidence
- Owning stage(s): 02 baseline → 06 final.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.

## PR-018

- Affected files / discovery scope: Impeccable configuration (locate before use)
- Observed: Supplied plan explicitly retains unset build-path preference.
- Intended: Keep preference unset; document advisories without selecting an expansion design workflow.
- Classification: intentional limitation (user-directed)
- Owning stage(s): 03; final review 06.
- Resolution: open; assigned verification pending.
- Verification reference: supplied plan only; no current runtime/test evidence. See [Stage 01](stages/01-current-contracts.md) and [Stage 02](stages/02-verification-baseline.md) when executed.
