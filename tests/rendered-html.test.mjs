import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import net from "node:net";
import test from "node:test";

async function getAvailablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;
  await new Promise((resolve) => server.close(resolve));
  if (!port) throw new Error("Could not allocate a local test port");
  return port;
}

async function waitForServer(url, process, timeoutMs = 30_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (process.exitCode !== null) {
      throw new Error(`Next.js exited before becoming ready (${process.exitCode})`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Timed out waiting for the Next.js production server");
}

test("renders the Sliva News newsroom with Next.js", async (context) => {
  const port = await getAvailablePort();
  const app = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)],
    { stdio: "pipe" },
  );

  let output = "";
  app.stdout.on("data", (chunk) => (output += chunk));
  app.stderr.on("data", (chunk) => (output += chunk));
  context.after(() => app.kill("SIGTERM"));

  const response = await waitForServer(`http://127.0.0.1:${port}/`, app);
  assert.equal(response.status, 200, output);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Sliva News/);
  assert.match(html, /Pilihan redaksi/);
});
