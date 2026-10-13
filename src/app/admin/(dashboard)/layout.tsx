import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/entries", label: "Entries" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/tags", label: "Tags" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative server-side guard. The proxy redirect is defense in
  // depth; this is what actually protects the dashboard.
  const session = await requireAdmin();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: { email: true },
  });

  return (
    <div className="min-h-dvh bg-forge-950">
      <div className="h-1 bg-ember-500" aria-hidden="true" />
      <header className="border-b border-forge-700 bg-forge-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <span className="font-display text-sm font-bold tracking-widest text-bone-50 uppercase">
            Admin workshop
          </span>
          <nav aria-label="Admin navigation" className="order-3 w-full md:order-none md:ml-4 md:w-auto">
            <ul className="flex flex-wrap items-center gap-1">
              {ADMIN_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-3 py-2 font-display text-xs font-medium tracking-widest text-ash-200 uppercase no-underline transition-colors hover:text-ember-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <span className="font-display text-xs tracking-widest text-ash-400 uppercase">
              {user?.email ?? "Admin"}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="border border-forge-600 px-3 py-2 font-display text-xs font-medium tracking-widest text-ash-200 uppercase transition-colors hover:border-ember-500 hover:text-ember-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-400"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
