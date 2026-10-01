import { defineConfig } from "@playwright/test";

const port = 4103;

export default defineConfig({
  testDir: "./e2e",
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  // The standalone server the Dockerfile runs, over the `npm run build` output.
  webServer: {
    command: `mkdir -p .next/standalone/.next && cp -R .next/static .next/standalone/.next/ && cp -R public .next/standalone/ && cd .next/standalone && PORT=${port} HOSTNAME=127.0.0.1 node server.js`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
