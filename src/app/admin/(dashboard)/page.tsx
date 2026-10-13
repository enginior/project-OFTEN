import Link from "next/link";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { entries, categories, tags } from "@/db/schema";

export const instant = false;

export default async function AdminDashboardPage() {
  const [entryCount, categoryCount, tagCount] = await Promise.all([
    db.select({ value: count() }).from(entries),
    db.select({ value: count() }).from(categories),
    db.select({ value: count() }).from(tags),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-bone-50 uppercase">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-ash-300">
          Manage the directory library.
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Entries", value: entryCount[0]?.value ?? 0, href: "/admin/entries" },
          { label: "Categories", value: categoryCount[0]?.value ?? 0, href: "/admin/categories" },
          { label: "Tags", value: tagCount[0]?.value ?? 0, href: "/admin/tags" },
        ].map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="block border border-forge-700 bg-forge-900 p-6 no-underline transition-colors hover:border-ember-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-400"
          >
            <dt className="font-display text-xs font-medium tracking-widest text-ash-400 uppercase">
              {stat.label}
            </dt>
            <dd className="mt-2 font-display text-4xl font-bold text-bone-50">
              {stat.value}
            </dd>
          </Link>
        ))}
      </dl>

      <div className="border border-forge-700 bg-forge-900 p-6">
        <h2 className="font-display text-lg font-bold tracking-wide text-bone-50 uppercase">
          Quick actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/entries/new"
            className="bg-ember-500 px-4 py-3 font-display text-sm font-bold tracking-widest text-forge-950 uppercase no-underline transition-colors hover:bg-ember-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-400"
          >
            New entry
          </Link>
          <Link
            href="/directory"
            className="border border-forge-600 px-4 py-3 font-display text-sm font-medium tracking-widest text-ash-200 uppercase no-underline transition-colors hover:border-ember-500 hover:text-ember-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-400"
          >
            View public directory
          </Link>
        </div>
      </div>
    </div>
  );
}
