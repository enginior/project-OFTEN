// End-to-end verification of Phase 5 admin CRUD and authorization.
// Run: npx tsx scripts/verify-crud.ts  (server must be running on :3100)
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { chromium, type Page } from "playwright";

const BASE = process.env.VERIFY_BASE ?? "http://localhost:3100";
const EMAIL = process.env.ADMIN_EMAIL ?? "[EMAIL]";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "correct-horse-battery-9";

const results: string[] = [];
function check(name: string, ok: boolean, detail = "") {
  results.push(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`);
}

// Client forms need hydration before their server-action submit works;
// React attaches __reactProps$ to the form element when hydrated.
async function waitHydrated(page: Page) {
  await page.waitForFunction(
    () => {
      const forms = document.querySelectorAll("form");
      return Array.from(forms).some((form) =>
        Object.keys(form).some((k) => k.startsWith("__reactProps$")),
      );
    },
    { timeout: 20000 },
  );
}

async function login(page: Page) {
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await waitHydrated(page);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/?$/, { timeout: 20000 });
}

function row(page: Page, text: string) {
  return page.locator("article", { hasText: text });
}

const CATEGORY = "Verify Forge Category";
const CATEGORY_SLUG = "verify-forge-category";
const TAG = "verify-forge-tag";
const TAG_SLUG = "verify-forge-tag";
const ENTRY = "Verify Widget Model";
const ENTRY_SLUG = "verify-widget-model";
const ENTRY_URL = `${BASE}/directory/${ENTRY_SLUG}`;

// Removes leftover rows from previous runs (by slug, so renames don't dodge
// cleanup) so the script is idempotent. The db module is imported dynamically
// because module init requires DATABASE_URL, which dotenv loads at runtime.
async function cleanup() {
  const [{ eq }, { db }, { categories, entries, tags }] = await Promise.all([
    import("drizzle-orm"),
    import("@/db"),
    import("@/db/schema"),
  ]);
  await db.delete(entries).where(eq(entries.slug, ENTRY_SLUG));
  await db.delete(categories).where(eq(categories.slug, CATEGORY_SLUG));
  await db.delete(tags).where(eq(tags.slug, TAG_SLUG));
}

async function main() {
  await cleanup();

  const browser = await chromium.launch();

  // Accept all confirm dialogs (delete actions use window.confirm).
  async function newPage(): Promise<Page> {
    const page = await browser.newPage();
    page.on("dialog", (dialog) => dialog.accept().catch(() => {}));
    return page;
  }

  // A1. Anonymous users are redirected away from every admin page.
  {
    const page = await browser.newPage();
    for (const path of [
      "/admin",
      "/admin/entries",
      "/admin/entries/new",
      "/admin/categories",
      "/admin/tags",
    ]) {
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
      await page.waitForURL(/\/admin\/login/, { timeout: 15000 }).catch(() => {});
      check(
        `anonymous ${path} redirects to /admin/login`,
        page.url().includes("/admin/login"),
        page.url(),
      );
    }
    // A2. A non-GET request to an admin page route is denied. Next rejects
    // page-route POSTs with 405 before the proxy runs, and any POST carrying
    // a server-action id is still rejected server-side by requireAdmin().
    // Playwright's request context follows redirects by default, which would
    // mask the proxy's 307 to /admin/login as the login page's 200. Disable
    // redirects so we can assert on the actual denial response.
    const response = await page.request.post(`${BASE}/admin/categories`, {
      failOnStatusCode: false,
      maxRedirects: 0,
    });
    check(
      "anonymous POST to /admin/categories is denied",
      response.status() >= 300,
      `status=${response.status()} loc=${response.headers().location ?? "-"}`,
    );
    await page.close();
  }

  const page = await newPage();
  await login(page);
  check("admin login reaches dashboard", page.url().includes("/admin"), page.url());

  try {
    // ---- Categories ----
    await page.goto(`${BASE}/admin/categories`, { waitUntil: "networkidle" });
    await waitHydrated(page);

    await page.fill('input[name="name"]', CATEGORY);
    const suggested = await page.inputValue('input[name="slug"]');
    check("category slug auto-suggests from name", suggested === CATEGORY_SLUG, suggested);
    await page.click('button:has-text("Create category")');
    await page.waitForURL(/saved=created/, { timeout: 20000 });
    check("category create redirects with saved=created", true, page.url());
    check(
      "category row appears with entry count",
      (await row(page, CATEGORY).count()) === 1,
    );

    // Duplicate slug is rejected inline.
    await page.fill('input[name="name"]', "Second Category");
    await page.fill('input[name="slug"]', CATEGORY_SLUG);
    await page.click('button:has-text("Create category")');
    await page.waitForSelector('p[role="alert"]:has-text("slug already exists")', {
      timeout: 10000,
    });
    check("duplicate category slug shows inline error", true);

    // Edit via ?edit=<id>.
    await page.goto(`${BASE}/admin/categories?edit=`, { waitUntil: "networkidle" });
    await row(page, CATEGORY).locator('a:has-text("Edit")').click();
    await waitHydrated(page);
    check(
      "edit link prefills the category form",
      (await page.inputValue('input[name="name"]')) === CATEGORY,
    );
    await page.fill('input[name="name"]', `${CATEGORY} Prime`);
    await page.click('button:has-text("Save category")');
    await page.waitForURL(/saved=updated/, { timeout: 20000 });
    check(
      "category rename lands with saved=updated",
      (await row(page, `${CATEGORY} Prime`).count()) === 1,
      page.url(),
    );

    // ---- Tags ----
    await page.goto(`${BASE}/admin/tags`, { waitUntil: "networkidle" });
    await waitHydrated(page);

    await page.fill('input[name="name"]', TAG);
    check(
      "tag slug auto-suggests from name",
      (await page.inputValue('input[name="slug"]')) === TAG_SLUG,
    );
    await page.click('button:has-text("Create tag")');
    await page.waitForURL(/saved=created/, { timeout: 20000 });
    check(
      "tag row appears after create",
      (await row(page, TAG).count()) === 1,
      page.url(),
    );

    await page.fill('input[name="name"]', "Other Tag");
    await page.fill('input[name="slug"]', TAG_SLUG);
    await page.click('button:has-text("Create tag")');
    await page.waitForSelector('p[role="alert"]:has-text("slug already exists")', {
      timeout: 10000,
    });
    check("duplicate tag slug shows inline error", true);

    await row(page, TAG).locator('a:has-text("Edit")').click();
    await waitHydrated(page);
    await page.fill('input[name="name"]', `${TAG} two`);
    await page.click('button:has-text("Save tag")');
    await page.waitForURL(/saved=updated/, { timeout: 20000 });
    check("tag rename lands with saved=updated", true, page.url());

    // ---- Entries ----
    await page.goto(`${BASE}/admin/entries/new`, { waitUntil: "networkidle" });
    await waitHydrated(page);

    await page.fill('input[name="name"]', ENTRY);
    await page.fill(
      'textarea[name="summary"]',
      "A test entry used for automated CRUD verification.",
    );
    await page.fill('input[name="canonicalUrl"]', "https://example.com/verify-widget");
    const entrySlug = await page.inputValue('input[name="slug"]');
    check("entry slug auto-suggests from name", entrySlug === ENTRY_SLUG, entrySlug);
    await page.click('button:has-text("Create entry")');
    await page.waitForURL(/saved=created/, { timeout: 20000 });
    check("entry create redirects with saved=created", true, page.url());

    await page.goto(`${BASE}/admin/entries?q=${ENTRY_SLUG}`, {
      waitUntil: "networkidle",
    });
    const entryRow = row(page, ENTRY);
    check("new entry appears in admin list", (await entryRow.count()) === 1);
    check(
      "new entry starts as draft",
      /Draft/.test((await entryRow.textContent()) ?? ""),
    );

    // Draft entries are invisible on the public site.
    let resp = await page.goto(ENTRY_URL, { waitUntil: "domcontentloaded" });
    check("draft entry detail returns 404", resp?.status() === 404, String(resp?.status()));
    resp = await page.goto(`${BASE}/directory?q=${ENTRY_SLUG}`, {
      waitUntil: "domcontentloaded",
    });
    const publicBody = (await page.textContent("body")) ?? "";
    check("draft entry hidden from public directory", !publicBody.includes(ENTRY));

    // Publish: the entry becomes publicly visible.
    await page.goto(`${BASE}/admin/entries?q=${ENTRY_SLUG}`, {
      waitUntil: "networkidle",
    });
    await entryRow.locator('button:has-text("Publish")').click();
    await page.waitForURL(/saved=status-published/, { timeout: 20000 });
    check("publish action redirects with saved=status-published", true, page.url());
    resp = await page.goto(ENTRY_URL, { waitUntil: "domcontentloaded" });
    check("published entry detail returns 200", resp?.status() === 200, String(resp?.status()));
    const detailBody = (await page.textContent("body")) ?? "";
    check("published entry detail shows name", detailBody.includes(ENTRY));

    // Feature / unfeature toggle.
    await page.goto(`${BASE}/admin/entries?q=${ENTRY_SLUG}`, {
      waitUntil: "networkidle",
    });
    await entryRow.locator('button:has-text("Feature")').click();
    await page.waitForURL(/saved=featured/, { timeout: 20000 });
    check("feature toggle redirects with saved=featured", true, page.url());

    // Unpublish again: hidden from the public site.
    await entryRow.locator('button:has-text("Unpublish")').click();
    await page.waitForURL(/saved=status-draft/, { timeout: 20000 });
    resp = await page.goto(ENTRY_URL, { waitUntil: "domcontentloaded" });
    check("unpublished entry detail returns 404 again", resp?.status() === 404, String(resp?.status()));

    // Tag the entry via the edit form, then verify the tag row count updates.
    await page.goto(`${BASE}/admin/entries?q=${ENTRY_SLUG}`, {
      waitUntil: "networkidle",
    });
    await entryRow.locator('a:has-text("Edit")').click();
    await waitHydrated(page);
    await page.getByRole("checkbox", { name: `${TAG} two` }).check();
    await page.click('button:has-text("Save changes")');
    await page.waitForURL(/saved=updated/, { timeout: 20000 });
    await page.goto(`${BASE}/admin/tags`, { waitUntil: "networkidle" });
    check(
      "tagged entry count reflected in tag list",
      /1 entry/.test((await row(page, `${TAG} two`).textContent()) ?? ""),
    );

    // Delete the entry (confirm dialog auto-accepted).
    await page.goto(`${BASE}/admin/entries?q=${ENTRY_SLUG}`, {
      waitUntil: "networkidle",
    });
    await entryRow.locator('button:has-text("Delete")').click();
    await page.waitForURL(/saved=deleted/, { timeout: 20000 });
    check("entry delete redirects with saved=deleted", true, page.url());
    check(
      "deleted entry gone from admin list",
      (await row(page, ENTRY).count()) === 0,
    );
    resp = await page.goto(ENTRY_URL, { waitUntil: "domcontentloaded" });
    check("deleted entry detail returns 404", resp?.status() === 404, String(resp?.status()));

    // ---- Cleanup taxonomy ----
    await page.goto(`${BASE}/admin/categories`, { waitUntil: "networkidle" });
    await row(page, `${CATEGORY} Prime`).locator('button:has-text("Delete")').click();
    await page.waitForURL(/saved=deleted/, { timeout: 20000 });
    check(
      "category delete lands with saved=deleted",
      (await row(page, CATEGORY).count()) === 0,
      page.url(),
    );

    await page.goto(`${BASE}/admin/tags`, { waitUntil: "networkidle" });
    await row(page, `${TAG} two`).locator('button:has-text("Delete")').click();
    await page.waitForURL(/saved=deleted/, { timeout: 20000 });
    check("tag delete lands with saved=deleted", true, page.url());
    check("tag gone from list", (await row(page, TAG).count()) === 0);
  } finally {
    await page.close();
  }

  await browser.close();
  console.log(results.join("\n"));
  const failed = results.filter((r) => r.startsWith("FAIL"));
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  console.log(results.join("\n"));
  process.exit(1);
});
