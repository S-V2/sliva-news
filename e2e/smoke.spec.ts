import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Serious/critical axe findings present on main when this gate landed, as
// "<page> <rule> <element>". Anything else fails the run, and so does an entry
// that no longer occurs: delete it when the markup is fixed.
import knownViolations from "./known-a11y-violations.json" with { type: "json" };

async function open(page: Page, path: string) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(path, { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  return errors;
}

async function expectInternalLinksResolve(page: Page) {
  const origin = new URL(page.url()).origin;
  const hrefs = await page.locator("a[href]").evaluateAll((anchors) => anchors.map((anchor) => (anchor as HTMLAnchorElement).href));
  for (const href of new Set(hrefs)) {
    const url = new URL(href);
    if (url.origin !== origin) continue;
    const response = await page.request.get(url.pathname + url.search);
    expect(response.status(), href).toBe(200);
    if (url.hash.length > 1) expect(await response.text(), href).toContain(`id="${decodeURIComponent(url.hash.slice(1))}"`);
  }
}

async function expectOnlyKnownA11yViolations(page: Page, path: string) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const found = violations
    .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
    .flatMap((violation) => violation.nodes.map((node) => `${path} ${violation.id} ${node.target.join(" ")}`));
  const known = knownViolations.filter((entry) => entry.startsWith(`${path} `));
  expect(found.filter((entry) => !known.includes(entry)), "new serious/critical axe violations").toEqual([]);
  expect(known.filter((entry) => !found.includes(entry)), "fixed violations still in knownViolations").toEqual([]);
}

test("/ renders the newsroom", async ({ page }) => {
  const errors = await open(page, "/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cerita penting hari ini.");
  const navigation = page.locator("header nav");
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Beranda" })).toBeVisible();
  await page.getByRole("button", { name: "Kucing", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Kucing" })).toBeVisible();
  await page.getByPlaceholder("Email Anda").fill("pembaca@example.com");
  await page.getByRole("button", { name: "Berlangganan gratis" }).click();
  await expect(page.getByText("Email berhasil didaftarkan.")).toBeVisible();

  await expectInternalLinksResolve(page);
  expect(errors).toEqual([]);
});

test("/ has no new serious or critical axe violations", async ({ page }) => {
  await open(page, "/");
  await expectOnlyKnownA11yViolations(page, "/");
});
