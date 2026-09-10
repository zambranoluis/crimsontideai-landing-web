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
