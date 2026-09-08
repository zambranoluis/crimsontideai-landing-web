# Action Plan — Self-Contained Redaction Of `docs/`

## Plan record

| Field | Value |
| --- | --- |
| Plan id | `docs-context-self-contained-redaction` |
| Mode | Normal plan |
| Created | 2026-09-07 23:15 |
| Saved | 2026-09-07 23:29 |
| Approved | 2026-09-07 23:34 |
| Last updated | 2026-09-07 23:41 |
| Status | Complete |

This plan was explicitly approved on 2026-09-07 with the proposed contact-fact ownership option, executed within `docs/`, and closed after its stage, task-specific, and default completion checks were observed to pass. Its authorization has ended.

## Objective

Rewrite the `docs/` context set so every statement stands on its own authority within this repository. After the change, no document defers to an external file, an upstream version history, or a prior implementation for its meaning.

## Current mechanism causing the problem

The four affected documents were written as derivations of upstream artifacts, so they carry three classes of dangling reference.

1. **Provenance framing** — `Source:` headers, "the source marks…", "the master document says…". These name files that do not exist in this repository.
2. **Version references** — `v7` and `v8` palette vocabulary in `docs/design.md`. No v8 palette exists in this project, so "do not substitute the later navy-normalized v8 palette" instructs against an impossible action.
3. **Prior-implementation conditions** — "where already established", "where that established component label is used", "still valid", "where the family already uses transparency". These condition rules on a codebase state that does not exist: `src/app/` holds only the scaffold and `public/` is empty.

## Files expected to change

| File | Change |
| --- | --- |
| `docs/product.md` | Status block; two "the source marks…" statements; contact-conflict section |
| `docs/ux.md` | Route-provenance note; Team paragraph |
| `docs/design.md` | Status block; eight `v7`/`v8` references; approximately five prior-implementation conditions |
| `docs/content.md` | Status block; all five "Known gaps" items; AI Solutions typo note; footer note; contact selector note; contact information section |
| `docs/structure.md` | No change — already self-contained |

No file outside `docs/` is modified. No code, configuration, or asset changes.

## Change mechanism

Prose rewriting in place. Each rewritten statement converts an external reference into a first-person project fact.

- `Source: <upstream file>` is removed from Status blocks.
- "The source marks this as internal" becomes "This synthesis is internal."
- "The master document says `info@crimsontide.ai`" becomes the value recorded under a neutral label describing what it is (previous-website record), not where it was read.
- "the v7 reference for solution cards" becomes the value stated plainly.
- "may remain where already established" becomes a plain permission carrying its actual constraint: `#7B1420` is permitted as a component-level value accent and must not be promoted to a global Crimson role.

**Layout reference imagery.** The current note asserts that referenced renders do not exist and concludes layouts cannot be derived from them. It is restated as a current-state note that does not foreclose future references: no layout reference imagery is available in the repository yet; until it is, resolve section composition through the patterns in `docs/structure.md`; when reference imagery becomes available, interpret it through the Reference synthesis method already defined in `docs/design.md`. No new rule for handling references is written; the existing owner is referenced.

## Behavior deliberately preserved

- Every `[Pending validation]` marker stays where it is. Baseline: `content.md` 6, `product.md` 4, `ux.md` 5. Counts must be identical after the change.
- Every recorded conflict stays unresolved. Both contact values, both enquiry-option sets, and the duplicate *About CrimsonTide* eyebrow remain recorded as open. Redaction removes provenance, not the conflict.
- All approved copy remains byte-identical. `docs/content.md:157` ("an active source of detection and intelligence") contains the word *source* as approved product copy and must not be edited.
- The Reference synthesis section of `docs/design.md` is unchanged. It is the existing owner of reference-imagery handling; the revised `docs/content.md` note references it rather than restating or narrowing it.
- Legitimate internal references stay: cross-references between `docs/` files, the `AGENTS/roles/frontend.md` authority boundary, and the Playwright-projects note in `docs/structure.md`. All three were verified accurate against the repository.
- All normative content, tables, values, and section ordering are unchanged. This is a redaction pass, not a rewrite of the underlying systems.
- The `Classification: context` framing and the non-override statement in each Status block are retained.

## Coupled change requiring a decision

The contact-detail conflict is recorded in full in both `docs/product.md` and `docs/content.md`. Once provenance labels are stripped, the two copies become near-identical duplicated text with no owner — a deduplication problem the current wording conceals.

- **Proposed.** `docs/product.md` becomes the single owner of contact facts and records the conflict once. The *Contact information* section of `docs/content.md` states the page copy and cross-references `docs/product.md` for the unresolved alternative. No value is lost from either side.
- **Alternative.** Keep both records verbatim, redacted in place.

**Resolved at approval.** The user approved the proposed option. `docs/product.md` owns the contact facts; `docs/content.md` states the page copy and cross-references `docs/product.md` for the unresolved alternative.

## Stages

Each stage is one file and is independently verifiable.

1. `docs/product.md` — Status block, synthesis and purpose notes, contact-conflict section. Establishes the contact-fact ownership later stages depend on.
2. `docs/ux.md` — route-provenance note, Team paragraph.
3. `docs/design.md` — Status block, `v7`/`v8` removal, prior-implementation conditions.
4. `docs/content.md` — Status block, Known gaps including the revised reference-imagery note, inline notes, contact cross-reference. Depends on stages 1 and 3.

## Verification

### Per stage

- `git diff -- docs/<file>` reviewed against the preserved-behavior list above.
- Provenance scan: `grep -niE "\bsource\b|master document|CrimsontideAI_|web-content|\.pdf|\bv7\b|\bv8\b|already established|still valid|later source" docs/<file>` returns only the four verified-legitimate hits — `docs/content.md:157` approved copy, and in `docs/design.md` the authority-boundary line, the `Reference synthesis` heading, and its "reference images" line.

### Final, task-specific

- `grep -c "Pending validation" docs/*.md` returns `content.md:6`, `product.md:4`, `ux.md:5`, `design.md:0`, `structure.md:0`, identical to the pre-change baseline.
- `git diff --stat -- docs/` shows `docs/structure.md` unchanged.
- The revised reference-imagery note asserts no permanent absence and resolves to `docs/structure.md` and `docs/design.md` without introducing a competing rule.

### Default completion checks

- Review of the full `docs/` diff.
- `git diff --check`.
- Maker criteria for authority, precedence, applicability, references, and duplication.

## Residual risk and verification limits

- **Judgment risk.** Restating a prior-implementation condition requires deciding what constraint it expressed. Where the original intent is not recoverable from the text, the value is stated as permitted at component level with the promotion prohibition intact, and the case is flagged in the completion report rather than resolved by invention.
- **No runtime verification.** These are documentation files with no build or test coverage. Correctness is established by diff review and the scans above. No browser or Playwright execution is involved or required.
- **Excluded from scope.** No document records the available asset set (38 icons in SVG and PNG, 3 logo files, `home-section/home.png`, a Roboto variable font), and none of it is present in `public/`. Recording an asset inventory is a separate change direction and is deliberately excluded.

## Improvements beyond scope

None proposed. The asset-inventory gap is recorded as a follow-up only.
