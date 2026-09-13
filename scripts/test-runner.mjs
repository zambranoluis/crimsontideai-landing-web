import { spawnSync } from "node:child_process";

const group = process.argv[2];
const extra = process.argv.slice(3).filter(arg => arg !== "--");
function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const node = (args, env) => run(process.execPath, args, env);
if (group === "all") {
  node(["node_modules/eslint/bin/eslint.js", "."]);
  node(["node_modules/next/dist/bin/next", "typegen"]);
  node(["node_modules/typescript/bin/tsc", "--noEmit"]);
  for (const name of ["unit", "smoke", "e2e", "a11y", "visual", "cross-browser", "production"]) node(["scripts/test-runner.mjs", name]);
} else {
  if (group === "unit") node(["--conditions=react-server", "--import", "tsx", "--test", "tests/contact-email.test.ts"]);
  const args = ["node_modules/@playwright/test/cli.js", "test", ...extra];
  const env = { ...process.env, TEST_GROUP: group };
  if (group === "cross-browser" && process.platform === "linux" && process.env.TEST_WEBKIT_HEADLESS !== "1") {
    // GTK's accelerated compositor aborts on the no-JS Home fallback in Xvfb.
    // Keep rendering and animation enabled through its software compositor.
    env.WEBKIT_DISABLE_COMPOSITING_MODE = process.env.TEST_WEBKIT_ACCELERATED === "1" ? "0" : "1";
  }
  if (group === "cross-browser" && process.platform === "linux" && !process.env.DISPLAY && process.env.TEST_WEBKIT_HEADLESS !== "1") {
    // Supply the session bus and X11 required by the GTK browser in Linux CI.
    run("dbus-run-session", ["--", "xvfb-run", "-a", process.execPath, ...args], env);
  } else node(args, env);
}
