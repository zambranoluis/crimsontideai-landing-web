# End-to-end tests

Catalog of the supported Playwright commands, projects, and runtime facts for this
repository. This file records what exists and how to invoke it. The rules that govern
its use are defined by the checks and conventions in this repository.

## Commands

| Command | Mode | Purpose |
| --- | --- | --- |
| `npm run test:e2e` | headless | Default functional run. |
| `npm run test:e2e:headed` | visible browser | Watch selected tests execute at normal speed. |
| `npm run test:e2e:ui` | Playwright Test UI | Select, filter, and analyse tests, traces, DOM, network, and locators. |
| `npm run test:e2e:debug` | Playwright Inspector | Step through a selected test. |
| `npm run test:e2e:report` | report viewer | Open the HTML report of the last local run. |

Narrow any run with the standard Playwright selectors:

```bash
npm run test:e2e -- --project=desktop-chromium
npm run test:e2e -- tests/e2e/smoke.spec.ts
npm run test:e2e -- --grep "home route"
```

## Projects

| Project | Device | Viewport | Covers |
| --- | --- | --- | --- |
| `desktop-chromium` | Desktop Chrome | 1280x800 | Desktop range, `1024px` and above. |
| `tablet-chromium` | Desktop Chrome with touch | 768x1024 | Tablet range, `768px` to `1023px`. |
| `mobile-chromium` | Pixel 5 | device default | Mobile range, below `1024px`. |

## Runtime

- Base URL: `http://localhost:3000`. It is the only supported local origin.
- Web server: `npm run dev`, started by Playwright when port 3000 is free and reused
  when a compatible server is already running. In CI the server is not reused.
- Browser: Chromium only. Install it with `npx playwright install chromium`.

## Generated output

- `playwright-report/` holds the HTML report of the last local run.
- `test-results/` holds traces, failure screenshots, and per-test artifacts.

Both directories are git-ignored working output. They are not evidence of coverage and
are not committed.

## Home and Products motion

`home-products-motion.spec.ts` exercises the current Home/Products components:
entrance timing and reverse reading, actual preview emphasis, sticky containment and
release, direct product anchors, fast scrolling and browser history, mounted resizing,
keyboard focus, reduced motion, and server-rendered content without JavaScript. It also
checks shared entrances on all six routes and the seven viewport sizes in the approved
Home/Products plan. Desktop-only cases are intentionally skipped on touch projects.

On the Windows npm runner, use the extra separator to forward Playwright options:

```powershell
npm run test:e2e -- -- --workers=2
npm run test:e2e -- -- --project=desktop-chromium tests/e2e/home-products-motion.spec.ts
```

With the local server running, `node scripts/capture-home-products.mjs` captures all
seven viewport sizes and separate normal/fast/reverse scroll recordings at 1440x900
and 390x844. Output defaults to `%TEMP%/crimsontide-home-products`; an optional directory
argument changes the destination. `--scroll-only` refreshes just the recordings.
Captures support visual review; they are not accepted visual regression baselines or
evidence of physical-device, Safari, or Firefox behavior.
