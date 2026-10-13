// Temporary end-to-end verification of Phase 4 admin auth.
// Run: npx tsx scripts/verify-auth.ts  (server must be running on :3100)
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE ?? "http://localhost:3100";
const EMAIL = process.env.ADMIN_EMAIL ?? "[EMAIL]";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "correct-horse-battery-9";

const results: string[] = [];
function check(name: string, ok: boolean, detail = "") {
  results.push(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`);
}

async function main() {
  const browser = await chromium.launch();

  // 1. Anonymous user is redirected from /admin to /admin/login.
  {
    const page = await browser.newPage();
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/admin\/login/, { timeout: 15000 });
    check("anonymous /admin redirects to /admin/login", page.url().includes("/admin/login"));
    await page.close();
  }

  // 2. Wrong password shows an error and does not authenticate.
  {
    const page = await browser.newPage();
    await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
    // Wait for hydration: React attaches __reactProps$ to the form element
    // once the client component takes over. Clicking before this turns into
    // a native POST the JS-enabled browser cannot follow.
    await page.waitForFunction(
      () => {
        const form = document.querySelector("form");
        return Boolean(form && Object.keys(form).some((k) => k.startsWith("__reactProps$")));
      },
      { timeout: 20000 },
    );
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', "not-the-right-password");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const url = page.url();
    const text = await page.textContent("body");
    check(
      "wrong password stays on login with error",
      url.includes("/admin/login") && /invalid|incorrect|wrong|credentials/i.test(text ?? ""),
      url
    );
    await page.close();
  }

  // 3. Correct credentials sign in and land on the admin dashboard.
  {
    const page = await browser.newPage();
    page.on("response", (r) => {
      if (r.request().method() === "POST") {
        console.log(
          `[t3] POST ${r.status()} ${r.url()} redirect=${r.headers()["x-action-redirect"] ?? "-"} cookie=${r.headers()["set-cookie"] ? "yes" : "no"}`
        );
      }
    });
    page.on("pageerror", (e) => console.log(`[t3] PAGEERROR: ${String(e).slice(0, 300)}`));
    await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => {
        const form = document.querySelector("form");
        return Boolean(form && Object.keys(form).some((k) => k.startsWith("__reactProps$")));
      },
      { timeout: 20000 },
    );
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    // A pre-hydration click turns into a native POST the browser cannot
    // follow; hydration was confirmed above, so one click + generous wait
    // is deterministic (the dashboard's own Sign out button also matches
    // 'button[type=submit]', so blind retries would log out mid-test).
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/?$/, { timeout: 20000 });
    check("valid login reaches /admin", /\/admin\/?(?:\?.*)?$/.test(new URL(page.url()).pathname), page.url());
    await page.waitForTimeout(1000);

    // 4. Session cookie is HttpOnly.
    const cookies = await page.context().cookies();
    const session = cookies.find((c) => c.name.toLowerCase().includes("session"));
    check("session cookie set", Boolean(session), session?.name);
    check(
      "session cookie is HttpOnly",
      Boolean(session?.httpOnly),
      session ? `httpOnly=${session.httpOnly}` : "missing"
    );
    check(
      "session cookie is SameSite=Lax/Strict",
      session ? ["Lax", "Strict"].includes(session.sameSite ?? "") : false,
      session ? `sameSite=${session.sameSite}` : "missing"
    );

    // 5. Sign out clears the session and returns to the home page.
    const signOut = page
      .locator('button:has-text("Sign out"), a:has-text("Sign out"), button:has-text("Log out")')
      .first();
    if (await signOut.count()) {
      await signOut.click();
      await page.waitForURL((u) => new URL(u).pathname === "/", { timeout: 15000 }).catch(() => {});
      check("sign out returns to home page", new URL(page.url()).pathname === "/", page.url());
      // The session is gone: /admin must bounce back to the login page.
      await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
      await page.waitForURL(/\/admin\/login/, { timeout: 15000 }).catch(() => {});
      check(
        "signed-out /admin redirects to login",
        page.url().includes("/admin/login"),
        page.url()
      );
    } else {
      check("sign out control present", false, "no sign-out control found on dashboard");
    }
    await page.close();
  }

  await browser.close();
  console.log(results.join("\n"));
  const failed = results.filter((r) => r.startsWith("FAIL"));
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
