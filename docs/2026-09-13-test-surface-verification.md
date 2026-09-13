# Test-surface verification - 2026-09-13

Status: **Stopped at the user's request. Automated acceptance is incomplete.**
The active runners were interrupted on 2026-09-13; queued verification and profiling
were cancelled. Earlier verification records are unchanged. Completed results below
are distinguished from partial runs and checks that predate the latest changes.

## Scope and ownership

The [coverage matrix](test-coverage.md) maps each documented contract to its owning
suite or a manual release requirement. The [testing guide](../tests/e2e/README.md)
documents commands, environment, artifact locations and diagnosis.

Application changes are limited to wrapping enlarged text, allowing the header
brand to shrink beside the mobile control, and preserving header focus across the
1023/1024px breakpoint (including Contact), without focus-induced page scrolling.
Native CSS smooth scrolling is disabled because it overwrote browser Back positions;
the existing navigation controller still animates ordinary link transitions.
Production verification uses port 3101 and `.next/test-production`, separate from
the active development output. After that build and test process exited, port
3001 still returned HTTP 200 and both output directories remained present.
Contact error focus now runs in a layout effect after React commits the error
markup and enables the fieldset. The previous animation-frame callback could run
before that commit in WebKit. Routes, content, supplied assets and destinations
are preserved.

ProductScene now publishes its measured header offset in a layout effect before
the parent route-ready effect can position a reduced-motion section. Its ongoing
animation and measurement lifecycle remains in the existing passive effect.

## Baseline and corrections

The initial serial Chromium run recorded 621 passes, 50 failures, 133 conditional
skips and zero flaky results across 804 cases. Its evidence is retained in
`baseline-results.json` and `test-results/baseline-artifacts/`.

Superseded diagnostic runs were stopped once their known failure had a concrete
correction. Their retained traces and partial reports are not acceptance results.

This is not a clean count of pre-existing failures: the Home mountain file was
renamed while that run was still active, producing 26 module-loading failures in
later projects. The desktop subset completed before that interference: 250 passed,
9 failed and 9 skipped. The remaining failures were investigated against live files
and traces rather than treated as 50 application defects.

Corrections include the removed Contact button, Home Company destinations,
relocated Solutions hero expectations, normal-flow Reveal selection, current mesh
profiling targets and browser-specific measurement assumptions. Deterministic
geometry/scheduler checks now run once without launching a browser. Detailed
navigation assertions have moved out of smoke coverage.

Frame evidence identified a history-test race: the destination was within 2px while
the scroll controller still had a final frame to write. History setup now waits for
settled geometry. Interruption checks place input during a controlled animation;
the test waits for the input event to reach the document before resuming the clock.
A 1500ms observation forbids any forward progression while allowing native upward
wheel/key movement. The destination must remain below the viewport midpoint, so
completing automatic scrolling followed by a small native step cannot pass.

A separate Earth fragment-history repetition failed 12 of 30 times with an exact
82px offset (667px saved, 749px restored). Frame samples showed native CSS smooth
fragment scrolling continuing through hydration and overwriting browser restoration.
Changing native scrolling to `auto` fixed all 30 subsequent repetitions without
relaxing the position or glow assertions. Diagnostic samples are retained in
`test-results/earth-debug.jsonl` and `test-results/earth-auto-debug.jsonl`.
Font-injection tests flush their changing layout before sampling each frame.

Playwright trace snapshots also call canvas `getBoundingClientRect`; those tool
reads are excluded from the application-only mesh counter. Idle and per-draw limits
remain unchanged. Firefox pointer-capture tests use the actual pointer ID, and
fractional geometry uses subpixel tolerance. Linux desktop WebKit subtracts its
8px classic scrollbar from media-query width: the header test now asserts an exact
CSS viewport of 1023/1024px rather than assuming the outer viewport is identical. Product anchors include their authored
scroll margin as well as document scroll padding. A Firefox protocol height of
427.00003px versus 427px exposed an exact-floating-point comparison in partner
coverage; height stability now uses a 0.0005px tolerance, well below a CSS pixel.

The Firefox no-JavaScript fragment screenshot showed the intended heading fully
visible below the header despite a 59.6px section-edge difference after native
layout. That fallback now checks the correct URL and complete, unobscured target
heading. The two-pixel controller alignment and exact history restoration checks
remain in enhanced-navigation cases.

## Linux WebKit renderer diagnosis

The completed WPE compatibility run recorded 308 passes, two failures and 38
explained mode omissions. Both failures appeared as navigation/frame timeouts.
They reproduced with no competing browser run. Linux kernel logs identify signal
11 in `eadedCompositor`, at the same offset in `libWPEWebKit-2.0.so.1.12.0`.
This is a native renderer crash, not evidence for relaxing destination alignment
or history restoration. The logs are retained in
`test-results/webkit-kernel-crashes.log`; traces and native browser logs are in
`test-results/linux-debug/` and `test-results/linux-production/`.

Linux compatibility now uses the same pinned WebKit version's GTK browser under
Xvfb with a session bus and software compositing. The application and navigation assertions are unchanged.
`TEST_WEBKIT_HEADLESS=1` retains access to the failing WPE mode for diagnosis.
GTK software rendering also exposed a route commit beyond the default five-second
readiness budget. Compatibility uses ten-second observable assertions and a
sixty-second scenario budget. Pixel tolerances and controlled animation/history
observations are unchanged. GTK results do not resolve that WPE compositor issue or establish behavior on
physical Safari/iOS. The runner follows
[Playwright's headed CI setup](https://playwright.dev/docs/ci#running-headed).

Accelerated GTK later aborted on the no-JavaScript Home page (native signal 6).
The crash guard detected it, and all three native diagnostic repetitions failed.
All three repetitions passed with `WEBKIT_DISABLE_COMPOSITING_MODE=1`. Linux
compatibility therefore uses software compositing consistently across its critical
states. `TEST_WEBKIT_ACCELERATED=1` retains the failing accelerated mode for
diagnosis. Rendering and application animations remain enabled; this is not a
claim about GPU performance or physical Safari. The final software repetition run
was interrupted at the user's request; a complete compatibility run with this
setting remains outstanding.

The GTK run also exposed an application initialization race in reduced-motion
Products navigation. A native-scroll trace recorded `scroll-margin-top: 0px` at
instant positioning, followed by `-5px` after ProductScene's passive effect measured
the 127px header. The section remained 5.39px away from the required alignment.
The instrumented reproduction failed twice in three attempts. Publishing the
initial header offset in a layout effect fixed ten subsequent serial GTK
repetitions with the same two-pixel assertion and no retries. Evidence is in
`reduced-scroll-probe` and `product-header-layout-repetitions`. Fresh complete
verification against this application revision was stopped before completion.

## Accessibility and visual review

The latest completed development accessibility run passed 27 scenarios and 63 axe scans with
no automated violations (5.1 minutes) after the Contact focus correction. A separate production run also passed all
27 scenarios. All 63 final scans retain `color-contrast` incomplete findings, and
six retain `video-caption` incomplete findings. This run predates the ProductScene
layout-effect correction. These are review items, not passes
for those rules. Full axe results are retained for manual review.
Scans use applicable WCAG 2.0/2.1/2.2 A/AA rules. This is not accessibility
certification or a substitute for screen-reader and browser-zoom checks.

A long-lived development image-optimizer request for the Home Company image at
1200px stopped responding for WebP requests. The same request completed on the
fresh production server in under a second. The test-owned development server was
restarted before the final development verification; no artwork or framework
change was made to hide this environment failure.

The 123 intentional PNG baselines were generated and inspected in the pinned
Playwright 1.63.0 Ubuntu Noble container. Initial captures with header overlap,
omitted menu content, clipped focus outlines or uncontrolled decorative time were
rejected and retained as ignored diagnostics. Final captures show complete states,
finish finite transitions before measuring regions, and preserve all text and
controls. Earth/Company progress is asserted before its normal-motion screenshots.

## Completed automated results and revision boundaries

| Group | Exact result | Evidence / scope |
| --- | --- | --- |
| Lint and typecheck | Passed before latest ProductScene and runner changes | Windows Node 22.14.0; `lint-final.log`, `typecheck-final.log` |
| Unit | 13 Node + 18 Playwright passed; no skips | `unit-final` |
| Earth fragment history | 30 passed; no retries or skips | `earth-auto-final`; 10 per Chromium project |
| Production build isolation | Build passed; 21 passed, 6 mode omissions | `production-isolation`; desktop route health and real HTTP rejection |
| Accessibility, final Contact focus | 27 passed; no skips or retries | `a11y-final-focus`; 63 scans, incomplete findings retained |
| Visual, final Contact focus | 25 passed, 8 desktop-only motion omissions | `visual-final-focus`; all 123 reviewed PNG comparisons, no updates |
| Mobile navigation history | 30 passed; no retries or skips | `history-acceptance`; three cases repeated ten times |
| Production critical behavior | 299 passed, 49 documented mode omissions | `production-final-focus`; 13.7 minutes, no retries |
| Header CSS breakpoint confirmation | 27 compatibility repetitions + 9 Chromium passed; no skips | `header-css-width`, `header-css-width-chromium` |
| Combined navigation suites | 141 passed; no retries or skips | `navigation-final-fallback`; 9.4 minutes |
| Smoke / health / destinations | 60 passed, 24 documented mode omissions | `smoke-acceptance`; 3.8 minutes |
| Updated partner suite, Chromium | 26 passed, 19 documented device omissions | `partner-precision-chromium`; 1.8 minutes |
| Full serial Chromium | 682 passed, 173 documented mode omissions; no retries | `chromium-acceptance`; 46.2 minutes |
| Final Contact/native-fallback Chromium checks | 75 passed; no skips or retries | `contact-focus-chromium`; 2.1 minutes |
| Contact focus WebKit repetition | 10 passed; no retries or skips | `contact-postcommit-repeat` |
| Native Firefox fallback repetition | 5 passed; no retries or skips | `native-fallback-repeat` |
| Complete compatibility with final software setting | Not run | Queued `compatibility-software-final` cancelled on stop |
| GTK WebKit stability | 20 passed; no retries or skips | `webkit-gtk-route-budget`; both affected journeys repeated ten times, 6.8 minutes |
| Product header initialization | 10 passed; no retries or skips | `product-header-layout-repetitions`; 3.0 minutes |
| Mobile history, final application revision | 30 passed; no retries or skips | `history-final-revision`; three cases repeated ten times, 1.9 minutes |
| Combined navigation, final application revision | 141 passed; no retries or skips | `navigation-final-revision`; 7.5 minutes |
| Software GTK no-JavaScript reproduction | 3 passed; no retries or skips | `gtk-software-nojs`; 1.2 minutes |
| Comparative profiles | Not run; watcher cancelled | Only profiling dry runs completed; no fresh paired baseline |

Linux uses the pinned Playwright 1.63.0 Noble image, bundled Node 24.20.0,
Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6. Windows checks use Node
22.14.0. The completed 682-pass full Chromium run predates both the Contact focus
and ProductScene corrections. The Contact correction has its 75-case Chromium
follow-up and completed production, accessibility and visual checks. The completed
299-pass production, 27-pass accessibility and 123-comparison visual runs all
predate the ProductScene correction. Test-only CSS viewport and protocol-precision
changes have focused Chromium runs. These results do not establish acceptance of
the final source byte for byte.

## Interrupted runs and remaining work

Both active Playwright runners received SIGINT so their partial JSON/HTML reports
could finish. Neither report recorded an unexpected or flaky result. Interruption
and unexecuted cases are not passes or application failures.

| Run | Completed results before stop | Interrupted / not executed |
| --- | --- | --- |
| `chromium-final-source` (855 selected) | 456 passed; 77 executed conditional omissions | 1 interrupted; 321 not executed; 21.7 minutes elapsed |
| `webkit-software-repetitions` (40 selected) | 17 passed | 1 interrupted; 22 not executed; 6.6 minutes elapsed |

Playwright's aggregate skipped count includes unexecuted/interrupted cases here:
399 for Chromium and 23 for WebKit. Those counts must not be presented as fully
reviewed conditional omissions. The interrupted Chromium case was the footer's
deferred canvas allocation check; the interrupted WebKit case was no-JavaScript
footer heading navigation. Detailed results and traces are retained.

An earlier `chromium-final-revision` attempt failed during collection because the
isolated audit directory lacked package/TypeScript configuration. No browser cases
ran; the configuration was copied before the `chromium-final-source` restart.
Earlier failed native-renderer diagnostics and stopped compatibility runs remain
evidence, not acceptance results.

Outstanding automated work:

- Complete a serial Chromium run against the final source with no retry-only passes.
- Complete the 40 software-WebKit repetitions and a fresh full Firefox/WebKit gate.
- Build and run production verification against the ProductScene correction.
- Rerun accessibility and visual groups after that correction; review axe incomplete findings.
- Capture and compare fresh paired mesh and terrain profiles on the same production build.
- Rerun lint, typecheck, build and whitespace checks on the final worktree.
- Run the implemented GitHub Actions workflow on GitHub; local implementation is not a hosted pass.

The testing guide provides the resume commands. No queued group or profiling job
will resume automatically. The aggregate `test:all` command has not completed.

No hosted GitHub Actions pass is claimed: the workflow has been
implemented and its YAML parsed locally, but has not run on GitHub.

Impeccable context and the explicit final detect pass were run. Its eight advisory
findings concern existing global grid/color/type choices; those approved design
choices were preserved. No deterministic header issue was reported. A separate
explicit ProductScene detect pass returned no findings
(`test-results/impeccable-product-header.json`).

## Evidence locations

All run artifacts are ignored working files. The intentional 123 PNG goldens are
under `tests/e2e/visual-baselines/`.

| Local location | Contents |
| --- | --- |
| `test-results/reports/` | Windows unit, history, header, Contact and production-isolation JSON |
| `test-results/linux-development/` | Full Chromium report, earlier diagnostics and rejected visual captures |
| `test-results/linux-audit/` | Accessibility, visual, smoke, history and combined navigation reports |
| `test-results/linux-production/` | Earlier production and compatibility reports, native diagnostics and logs; no final paired profiles |
| `test-results/linux-debug/` | Focus/fallback repetitions and diagnostic traces |
| `test-results/linux-navigation/` | Input-interruption and breakpoint diagnostics |
| `playwright-report/linux-*/` | Corresponding HTML reports |

Automated groups were exercised separately so their reports and environments
remain identifiable; final-source acceptance remains incomplete as listed above.
CI is configured to retain its uploaded reports for 14 days.

## Manual release requirements

- Safari/iOS and Android on physical devices, including orientation and browser chrome.
- Screen-reader operation, actual browser zoom, reading order and all axe incomplete findings.
- Production reverse-proxy origin handling.
- Receipt of both Contact emails through the dedicated Gmail sender.

Production automated runs receive no SMTP credentials. Positive outcomes are
intercepted; the real unconfigured endpoint must fail safely with HTTP 503.

## Worktree

Started on `main` at `64450af12bc5528c04f84e385379cec6c7aa7c02` with a clean worktree.
HEAD remains `64450af12bc5528c04f84e385379cec6c7aa7c02`; all implementation and
documentation changes remain uncommitted and the index is empty. This includes
the intentional visual baselines. No commit was created.

The owned container `crimsontide-test-linux` is stopped (`exited`) and retained,
not removed. Its development, audit, debug, production and navigation reports,
traces and top-level logs were copied to the corresponding ignored host artifact
directories before shutdown. Both interrupted JSON reports are present on the
host. The profiling watcher and queued browser groups were cancelled.

The existing Windows development server was left running; `http://localhost:3001`
returned HTTP 200 after the test container stopped. No further tests or application
edits were made after the stop request. The earlier
`test-results/final-source-hashes.json` predates the final software-rendering runner
change and must not be used as an exact snapshot of this stopped worktree.
