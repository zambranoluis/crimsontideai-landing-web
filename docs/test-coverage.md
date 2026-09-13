# Test ownership matrix

This matrix describes behavioral ownership. Execution results belong in the dated
verification record, currently [2026-09-13](2026-09-13-test-surface-verification.md); a test existing does not establish a pass. Chromium device
projects are emulation. Automated accessibility scans are not certification.

**Stopped at the user's request.** Passes in this table refer to completed runs,
which may predate the latest ProductScene or runner changes; see the dated record
for revision boundaries. The final Chromium run and software-WebKit repetitions
were interrupted. All GTK-pending entries remain pending, and final production,
accessibility, visual and static verification is outstanding. No coverage row
alone establishes final-worktree acceptance.

| Contract | Owner | Modes / boundaries | Verification (2026-09-13) |
| --- | --- | --- | --- |
| Basic route availability and heading | smoke | Six routes, desktop/tablet/mobile | Passed: smoke |
| Status, sole h1, section order, content, decoded images, internal links, overflow, metadata, language, 404 | route-health + route-contracts | Six routes; three viewport classes; reduced desktop; no-JS mobile; Firefox/WebKit critical matrix | Passed: Chromium, smoke, production; GTK pending |
| Route-top, section positioning, fixed header, focus, active routes, clean URLs, hashes, modified links | navigation | Chromium + critical engines; modifier-mouse new tabs on fine-pointer desktop | Passed: combined navigation, production; GTK pending |
| Destination-first painting, geometry/font readiness, interruption, rapid requests, Back/Forward | navigation-transitions + navigation | Frame evidence; ten serial mobile history repetitions with retries disabled | Passed: combined navigation, 30 mobile repeats; GTK pending |
| Menu dismissal, Escape, breakpoint focus | header | 1023/1024px; keyboard; all engines | Passed: 27 compatibility repeats + 9 Chromium; GTK pending |
| Product exits and contact destinations | destinations | Native activation with intercepted external destinations; no third-party availability claim | Passed: smoke, production; GTK pending |
| Contact validation, template escaping, ordered delivery, transport outcomes and request rejection | tests/contact-email.test.ts | Node without browser; real SMTP excluded | Passed: 13 Node checks |
| Contact sending lock, duplicate prevention, unknown/failed response uncertainty, retention, cleanup | contact-email | Intercepted positive outcomes; controlled timeout clock; real local mock / unconfigured production | Passed: 75 follow-ups, production, 10 WebKit repeats |
| Actual HTTP origin, size, JSON, validation, media-type rejection | contact-http | Local development and isolated credential-free production | Passed: production + isolated endpoint checks |
| Contact terrain pointer, lifecycle, no-JS, canvas failure | contact | Chromium detailed instrumentation | Passed: full Chromium |
| Earth pin/release, reverse progression, cold and mounted preferences, resizing, no-JS | solutions-earth | Chromium; responsive scene boundaries | Passed: full Chromium |
| Delivery journey, Context, process and particle art | solutions-motion | Chromium; preference/failure/lifecycle contracts | Passed: full Chromium |
| Company morph, radar, responsive tracks, cleanup | company | Chromium detailed geometry and rendering | Passed: full Chromium |
| Product scenes, bidirectional Reveal, fragments, history, fallbacks | home-products-motion + products-layout | Chromium detail; observable layout in critical engines | Passed: full Chromium |
| Product header offset published before reduced-motion route positioning | navigation-transitions | Exact two-pixel alignment; serial GTK repetition | Passed: 10 focused GTK repeats and final Chromium navigation; full gates incomplete |
| Home network, warehouse video, supplied hero art | home-backgrounds + products-layout | Media lifecycle and static alternatives | Passed: full Chromium |
| Home card preview motion | home-card-motion | Pointer, keyboard, reduced motion | Passed: full Chromium |
| Home Company mountain composition | home-company-mountains | Normal/reduced/no-JS/canvas failure | Passed: full Chromium |
| Work sectors, orbit, partner assets, pointer glow | work | Chromium detail | Passed: full Chromium |
| Sector stagger at 1199/1200px, reverse entry, mounted reduced motion | work-reveal | Fine-pointer Chromium boundary coverage | Passed: full Chromium |
| Session-only partner insertion, keyboard/tap alternative, focus, cancellation and cleanup | work-partners | Critical engines for observable outcomes; CDP touch only Chromium | Passed: Chromium + production; GTK pending |
| Mesh and terrain geometry, sampling, scheduling | mesh-core + terrain-core | Dedicated unit project; no browser/server | Passed: 18 deterministic checks |
| Mesh and terrain visibility, document lifecycle, preferences, renderer failure and navigation cleanup | mesh + terrain | Chromium instrumentation | Passed: full Chromium |
| Unexpected browser exceptions, including standalone contexts | fixtures | All behavioral groups; injected errors require a per-test expectedPageErrors pattern | Passed: browser groups; crash-event diagnostic added for final compatibility |
| WCAG A/AA scans, menu, validation/sending/outcomes, selected partner, focus, forced colors, 320px and doubled text | accessibility | Three Chromium projects; incomplete axe findings attached for review | Passed automated scenarios; incomplete rules require review |
| Section compositions, menu, form validation/success, partner selection, action focus/hover | visual | Pinned Linux Chromium; each viewport; reduced motion | Passed: reviewed Linux visual comparisons |
| Earth/Company/Products normal motion milestones | visual | Frozen decorative timestamps and asserted scroll progress, desktop fine pointer | Passed: 12 normal-motion comparisons |
| Actual Safari/iOS and Android behavior | Manual release | Physical devices, touch, orientation and browser chrome | Manual release pending |
| Screen readers, browser zoom and nuanced contrast/reading order | Manual release | Assistive technology plus all axe incomplete findings | Manual release pending |
| Proxy origin preservation and actual receipt of both emails | Manual release | Production deployment and dedicated sender; never inferred from mocks | Manual release pending |

Conditional omissions must carry a reason in the report. Pure checks are selected
once by configuration. Chromium CDP instrumentation does not establish behavior
in Firefox or WebKit; those projects exercise their observable critical paths.
