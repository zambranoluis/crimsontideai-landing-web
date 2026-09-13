# Reviewed visual baselines

These 123 PNGs cover every route section and footer at desktop, tablet and mobile,
plus menu, Contact validation/success, partner selection, primary focus/hover and
three normal-motion milestones each for Earth, Company, OpenJM and Sentinel.

Environment: Playwright 1.63.0, Chromium, bundled Node 24.20.0, Linux Ubuntu Noble container
`mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`.
Dependencies were installed with `npm ci` inside Linux. Windows captures are not
comparison baselines. The workflow pins the same image digest and package version.

Initial compositions were inspected on 2026-09-13 against the existing interface.
Rejected diagnostic captures (sticky-header overlap, omitted mobile disclosure,
clipped focus outlines and uncontrolled decorative time) were retained outside
this directory. Current captures preserve text, controls and complete compositions.
No masks suppress product content. Normal scene milestones assert actual progress;
decorative timestamps are frozen before initialization while native frames continue.

See [the testing guide](../README.md) for intentional update and comparison commands,
and [the coverage matrix](../../../docs/test-coverage.md) for behavioral ownership.
Baseline updates require visual review; CI never regenerates them automatically.
