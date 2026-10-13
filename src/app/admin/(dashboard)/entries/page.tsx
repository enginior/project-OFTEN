import type { Metadata } from "next";
import Link from "next/link";
import {
  deleteEntryAction,
  setEntryStatusAction,
  toggleEntryFeaturedAction,
} from "@/lib/actions/entries";
import {
  listAdminEntries,
  ADMIN_PAGE_SIZE,
  MAX_ADMIN_PAGE,
} from "@/lib/admin-queries";
import { entryStatusLabel, entryTypeLabel } from "@/lib/labels";
import type { EntryStatus } from "@/lib/types";
import { SaveBanner, parseFeedback } from "@/components/admin/save-banner";
import { ConfirmRowAction, QuietRowAction } from "@/components/admin/row-action";
import { SearchForm } from "@/components/search-form";

export const metadata: Metadata = {
  title: "Manage entries",
  robots: { index: false, follow: false },
};

export const instant = false;

const STATUS_FILTERS: (EntryStatus | "all")[] = [
  "all",
  "draft",
  "published",
  "archived",
];

const STATUS_BADGE_CLASS: Record<EntryStatus, string> = {
  draft: "border-iron-500 text-ash-300",
  published: "border-brass-500 text-brass-400",
  archived: "border-emberred-500 text-emberred-500",
};

function adminListQuery(params: {
  q: string;
  status: EntryStatus | "all";
  page: number;
}): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status !== "all") search.set("status", params.status);
  if (params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export default async function AdminEntriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const feedback = parseFeedback(raw);

  const q = (Array.isArray(raw.q) ? raw.q[0] : raw.q ?? "").trim().slice(0, 200);
  const statusRaw = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const status: EntryStatus | "all" =
    statusRaw === "draft" || statusRaw === "published" || statusRaw === "archived"
      ? statusRaw
      : "all";
  const pageRaw = Number.parseInt(
    (Array.isArray(raw.page) ? raw.page[0] : raw.page) ?? "1",
    10,
  );
  const page = Number.isNaN(pageRaw)
    ? 1
    : Math.min(Math.max(pageRaw, 1), MAX_ADMIN_PAGE);

  const list = await listAdminEntries({
    q,
    status: status === "all" ? undefined : status,
    page,
  });

  const returnTo = adminListQuery({ q, status, page });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-bone-50 uppercase">
            Entries
          </h1>
          <p className="mt-1 text-sm text-ash-300">
            {list.total} {list.total === 1 ? "entry" : "entries"} total. Only
            published entries appear on the public site.
          </p>
        </div>
        <Link href="/admin/entries/new" className="btn-primary no-underline">
          New entry
        </Link>
      </div>

      <SaveBanner feedback={feedback} />

      <div className="flex flex-col gap-4 border border-forge-700 bg-forge-900 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:w-96">
            <SearchForm
              action="/admin/entries"
              name="q"
              defaultValue={q}
              placeholder="Search by name or slug…"
              hiddenFields={
                status !== "all" ? [{ name: "status", value: status }] : []
              }
              label="Search admin entries"
            />
          </div>
          <nav aria-label="Status filter" className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((value) => {
              const active = value === status;
              return (
                <Link
                  key={value}
                  href={adminListQuery({ q, status: value, page: 1 })}
                  className={
                    active
                      ? "border border-ember-500 bg-ember-500/10 px-3 py-1.5 font-display text-xs font-semibold tracking-widest text-ember-400 uppercase no-underline"
                      : "border border-iron-600 px-3 py-1.5 font-display text-xs font-semibold tracking-widest text-ash-200 uppercase no-underline transition-colors hover:border-ember-500 hover:text-ember-400"
                  }
                >
                  {value === "all" ? "All" : entryStatusLabel(value)}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {list.items.length === 0 ? (
        <div className="border border-forge-700 bg-forge-900 p-10 text-center">
          <p className="font-display text-sm font-bold tracking-widest text-ash-200 uppercase">
            No entries found
          </p>
          <p className="mt-2 text-sm text-ash-400">
            {q
              ? "No entries match this search."
              : "Create your first entry to start the library."}
          </p>
          <div className="mt-4 flex justify-center">
            <Link href="/admin/entries/new" className="btn-primary no-underline">
              New entry
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.items.map(({ entry, categoryName }) => {
            const nextStatus =
              entry.status === "published" ? "draft" : "published";
            return (
              <article
                key={entry.id}
                className="flex flex-col gap-4 border border-forge-700 bg-forge-900 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="font-display text-base font-bold text-bone-50">
                      {entry.name}
                    </h2>
                    <span
                      className={`border px-2 py-0.5 font-display text-[10px] font-semibold tracking-widest uppercase ${STATUS_BADGE_CLASS[entry.status]}`}
                    >
                      {entryStatusLabel(entry.status)}
                    </span>
                    {entry.featured ? (
                      <span className="border border-brass-600 px-2 py-0.5 font-display text-[10px] font-semibold tracking-widest text-brass-400 uppercase">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-ash-300">
                    {entryTypeLabel(entry.entryType)}
                    {categoryName ? ` · ${categoryName}` : ""}
                    {` · /${entry.slug}`}
                  </p>
                  <p className="mt-1 text-xs text-ash-400">
                    Updated{" "}
                    {entry.updatedAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <QuietRowAction
                    action={setEntryStatusAction.bind(
                      null,
                      entry.id,
                      nextStatus,
                      `/admin/entries${returnTo}`,
                    )}
                    label={
                      entry.status === "published" ? "Unpublish" : "Publish"
                    }
                  />
                  <QuietRowAction
                    action={toggleEntryFeaturedAction.bind(
                      null,
                      entry.id,
                      `/admin/entries${returnTo}`,
                    )}
                    label={entry.featured ? "Unfeature" : "Feature"}
                  />
                  <Link
                    href={`/admin/entries/${entry.id}/edit`}
                    className="border border-iron-600 px-3 py-1.5 font-display text-xs font-semibold tracking-widest text-ash-200 uppercase no-underline transition-colors hover:border-ember-500 hover:text-ember-400"
                  >
                    Edit
                  </Link>
                  <ConfirmRowAction
                    action={deleteEntryAction.bind(
                      null,
                      entry.id,
                      `/admin/entries${returnTo}`,
                    )}
                    label="Delete"
                    confirmTitle={`Delete "${entry.name}" permanently?`}
                    confirmBody="This hard-deletes the entry and its tag links. Consider archiving instead to preserve editorial history."
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {list.pageCount > 1 ? (
        <nav
          aria-label="Entries pagination"
          className="flex flex-wrap items-center gap-2"
        >
          {page > 1 ? (
            <Link
              href={`/admin/entries${adminListQuery({ q, status, page: page - 1 })}`}
              className="btn-secondary no-underline"
            >
              Previous
            </Link>
          ) : null}
          <span className="font-display text-xs tracking-widest text-ash-400 uppercase">
            Page {page} of {list.pageCount}
          </span>
          {page < list.pageCount ? (
            <Link
              href={`/admin/entries${adminListQuery({ q, status, page: page + 1 })}`}
              className="btn-secondary no-underline"
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}

      <p className="text-xs text-ash-400">
        Showing up to {ADMIN_PAGE_SIZE} entries per page.
      </p>
    </div>
  );
}
