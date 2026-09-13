# Automated testing

The behavior owners and manual boundaries are maintained in [the coverage matrix](../../docs/test-coverage.md). Exact results, including failures and omissions, belong in the dated verification record. Historical verification documents are not rewritten by a new run.

## Commands

Run `npm ci` and `npx playwright install --with-deps chromium firefox webkit` first. CI installs from the lockfile in isolated jobs. All motion-heavy runs use one worker; local retries default to zero. CI captures one diagnostic retry but `failOnFlakyTests` rejects retry-only successes.

| Command | Responsibility |
| --- | --- |
| `npm run test:unit` | 13 Node Contact tests and the deterministic mesh/terrain project, without a browser or web server |
| `npm run test:smoke` | Six-route health and essential destinations |
| `npm run test:e2e` | Complete serial Chromium behavior at desktop, tablet and mobile |
| `npm run test:a11y` | WCAG A/AA scans, menu and form states, focus, forced colors and text reflow |
| `npm run test:visual` | Screenshot comparisons, in the pinned Linux container only |
| `npm run test:cross-browser` | Firefox desktop and WebKit desktop/mobile critical paths |
| `npm run test:production` | Build and start on isolated port 3101, then critical behavior |
| `npm run test:all` | Lint, typecheck, unit and every automated group, including production build |

The Node wrapper normalizes Windows npm argument forwarding. Direct invocation avoids shell ambiguity:

```powershell
node scripts/test-runner.mjs e2e navigation.spec.ts navigation-transitions.spec.ts --retries=0
node scripts/test-runner.mjs e2e navigation.spec.ts navigation-transitions.spec.ts --project=mobile-chromium --grep="Back cancels|Back and Forward|Back interrupts" --repeat-each=10 --retries=0
node scripts/test-runner.mjs e2e --list
```

Development remains at `http://localhost:3001`. An existing local development server is reused. Production on 3101 is never reused: the runner builds into `.next/test-production` and starts it with every SMTP credential explicitly empty, overriding local dotenv values. Its build leaves `.next/dev` intact. Successful Contact outcomes are intercepted; the actual production endpoint must return 503 / `submission_failed`. Development integration must return the honest local mock response. Neither verifies inbox receipt.

`TEST_BASE_URL` selects a compatible server URL. `TEST_RUN_LABEL` assigns a unique evidence directory and JSON report; set it when running several selections from the same group. Reports otherwise replace the previous run of that group.

## Projects and selection

Chromium uses 1280x800 desktop, 768x1024 touch tablet, and Pixel 5 mobile emulation. The route matrix also runs reduced-motion desktop and no-JavaScript mobile. Firefox uses 1280x800; WebKit uses 1280x800 and iPhone 13 emulation. Critical suites check observable browser behavior; CDP touch and profiling stay in Chromium. Conditional skips must explain their viewport/engine boundary. Pure tests are selected exactly once by the unit project.

Linux compatibility uses the pinned browser's GTK WebKit port in headed mode under Xvfb with software compositing. The wrapper supplies Xvfb and a D-Bus session when no display is available; both are included in the pinned container. This follows [Playwright's headed CI workflow](https://playwright.dev/docs/ci#running-headed). The headless WPE port reproducibly segfaulted in its compositor during cached-route transitions; kernel logs are retained in the verification evidence. Accelerated GTK also aborted on the no-JavaScript Home page. The launcher sets WebKit's [software-compositing option](https://trac.webkit.org/wiki/EnvironmentVariables), `WEBKIT_DISABLE_COMPOSITING_MODE=1`, for Linux compatibility. No application animation or navigation assertion is disabled. `TEST_WEBKIT_ACCELERATED=1` restores accelerated GTK for diagnosis; those runs do not define the automated gate. `TEST_WEBKIT_HEADLESS=1` opts into WPE for diagnosing that unresolved upstream/native-renderer issue. Windows retains its normal headless WebKit configuration. Compatibility allows 10 seconds for observable readiness and 60 seconds per scenario; exact geometry and controlled timing contracts are unchanged. Neither port establishes physical Safari/iOS behavior.

Exact header-boundary tests assert the media-query width itself. Linux desktop WebKit excludes its 8px classic scrollbar from that width, so its outer viewport is adjusted to exercise the authored 1023/1024px boundary.

Custom contexts inherit the project's viewport, touch/mobile capabilities and motion preference through `fixtures.ts`. Import the shared fixture for browser tests; deterministic tests import Playwright directly. Unexpected page exceptions and browser-reported renderer crashes fail the owning test, including exceptions in popups and standalone contexts. A failure-injection test that intentionally emits an uncaught exception must declare its exact pattern through `expectedPageErrors`; caught renderer failures should emit no browser exception.

## Readiness and diagnosis

Await fonts, renderer diagnostics and decoded visible images. Read each section before checking completeness, including lazy content. Scroll-position assertions wait for settled frames: the former mobile history race accepted the section's final 2px before the animation finished, then overwrote the test's new reading position. Keep the strict history position assertion. Product sections publish their measured header offset before route positioning; delaying that initialization until a passive effect caused a reduced-motion alignment error in GTK WebKit.

Earth fragment-history traces also exposed native CSS smooth scrolling overwriting browser restoration before hydration. Native scrolling is now immediate; the navigation controller continues to own ordinary smooth link transitions. The Earth repetition check retains exact reading-position and glow assertions.

No-JavaScript fragment checks verify the URL and a fully visible target heading below the fixed header. Native engines own placement through font/layout changes; the controller's two-pixel alignment rule applies to enhanced navigation. Server-invalid Contact fields must receive focus after the error markup and enabled fieldset commit, without relying on an animation-frame callback to follow a React commit.

Bounded real-time intervals remain where time is the subject: inactivity, ripple expiry, interrupt persistence, delayed responses and callback cleanup. They are not general readiness sleeps. Trace snapshot geometry reads are excluded from application mesh instrumentation. New form timeout tests use controlled clocks; finite Reveal and CSS states use observable completion.

On failure, open `npx playwright show-trace <trace.zip>`. Read the first-attempt trace, screenshot, browser-errors attachment and relevant frame recording. Use `--retries=0` when reproducing. Run related suites together after a focused fix; an isolated pass cannot establish full-suite stability.

## Accessibility

The suite follows [Playwright's accessibility workflow](https://playwright.dev/docs/accessibility-testing), using axe tags for applicable WCAG 2.0, 2.1 and 2.2 A/AA rules. Every scan attaches the complete result. `incomplete` findings are annotated for manual review, not reported as passes or suppressed. Keyboard/focus, field-error association, partner dragging alternatives and forced-colors checks complement scans. Axe scans authored colors before forced-colors emulation, because its CSS color analysis does not represent the browser's forced-color paint. Scans begin at document top to avoid an arbitrary partial target behind the sticky header.

Text reflow checks use 320 CSS pixels and double computed text sizes, including px-authored text. This is a text-enlargement approximation, not proof of browser zoom or screen-reader compatibility. Review clipped content, meaningful reading order and all inconclusive findings manually.

## Visual goldens

Follow [Playwright's visual-testing guidance](https://playwright.dev/docs/best-practices): generate and compare in the same pinned environment. The container is `mcr.microsoft.com/playwright:v1.63.0-noble`, digest `sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`; the Playwright package is pinned to 1.63.0. Use a Linux checkout with Linux `node_modules` installed by `npm ci`; do not mount Windows dependencies.

`tests/e2e/visual-baselines/` contains only intentional goldens. Missing baselines fail. For an intentional change, run inside the pinned container:

```sh
node scripts/test-runner.mjs visual --update-snapshots=all --retries=0
node scripts/test-runner.mjs visual --retries=0
```

Inspect every changed baseline against the approved interface before accepting it. Never update solely to silence a mismatch. Route sections use reduced motion and deterministic decorative seeds; selected normal-motion scenes keep native frame delivery but freeze decorative timestamps before initialization. Milestones assert the actual Earth glow and Company progress before capture. Text, controls and layout are not masked. State captures include the open menu and full focus outline. Finite transitions finish before measuring screenshot regions. Windows screenshots are diagnostic evidence only.

## Artifacts and profiling

`test-results/<run-label>/` contains traces, screenshots and attachments; `test-results/reports/<run-label>.json` is machine-readable; `playwright-report/<run-label>/` is the HTML report. These, `artifacts/` and `build/` are ignored generated output. CI retains reports for 14 days and does not claim success until a hosted run finishes.

Both profiling workflows accept an output directory and server URL (`MESH_URL` or `TERRAIN_URL`, default 3101). Mesh profiling targets the current Home Company canvas plus OpenJM and Sentinel. Terrain profiling targets the current footer; `--baseline` is only for a historical server that contains the original iframe. Compare two fresh runs on the same machine with no concurrent browsers/builds:

First run `node scripts/test-server.mjs production` in another terminal to serve the credential-free production build on 3101. Stop that server after profiling.

```sh
node scripts/mesh-evidence.mjs test-results/mesh-before --profile-only
node scripts/mesh-evidence.mjs test-results/mesh-after --profile-only
node scripts/compare-mesh-profiles.mjs test-results/mesh-before test-results/mesh-after test-results/mesh-comparison.md
node scripts/terrain-evidence.mjs test-results/terrain-before --profile-only
node scripts/terrain-evidence.mjs test-results/terrain-after --profile-only
node scripts/compare-terrain-profiles.mjs test-results/terrain-before test-results/terrain-after test-results/terrain-comparison.md
```

The reports describe only their recorded inputs, with no hardware-sensitive CI threshold or inferred functional pass. Keep raw JSON, CPU profiles and environment information together.

## Manual release requirements

Real Safari/iOS and Android devices; screen-reader use; browser zoom; axe incomplete findings; production proxy origin handling; and receipt of both Contact emails using the dedicated sender remain release checks. Chromium/WebKit emulation and mock responses do not replace them.
