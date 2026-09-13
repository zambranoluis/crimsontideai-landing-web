import { spawn } from "node:child_process";

const production = process.argv[2] === "production";
// Empty values also override .env.local during the production build.
const env = { ...process.env, NODE_ENV: production ? "production" : "development", TEST_PRODUCTION_BUILD: production ? "1" : "" };
for (const key of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_APP_PASSWORD", "CONTACT_SMTP_USER", "CONTACT_SMTP_PASS"]) env[key] = "";
const next = "node_modules/next/dist/bin/next";
async function run(args) {
  const child = spawn(process.execPath, [next, ...args], { env, stdio: "inherit" });
  const stop = signal => child.kill(signal);
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
  return new Promise(resolve => child.once("exit", code => {
    process.removeListener("SIGTERM", stop);
    process.removeListener("SIGINT", stop);
    resolve(code ?? 1);
  }));
}
if (production) {
  const code = await run(["build"]);
  if (code) process.exit(code);
}
process.exit(await run([production ? "start" : "dev", "--port", production ? "3101" : "3001"]));
