import type { Metadata } from "next";
import Link from "next/link";
import { saveEntryAction } from "@/lib/actions/entries";
import { listCategoryOptions, listTagOptions } from "@/lib/admin-queries";
import { EntryForm } from "@/components/admin/entry-form";
import { EMPTY_ENTRY } from "@/components/admin/entry-form-values";

export const metadata: Metadata = {
  title: "New entry",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function NewEntryPage() {
  const [categories, tags] = await Promise.all([
    listCategoryOptions(),
    listTagOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/entries"
          className="font-display text-xs font-medium tracking-widest text-ash-400 uppercase no-underline transition-colors hover:text-ember-400"
        >
          ← Back to entries
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-wide text-bone-50 uppercase">
          New entry
        </h1>
        <p className="mt-1 text-sm text-ash-300">
          Add a directory entry. New entries start as drafts until you publish
          them; only the canonical source is linked, never copied.
        </p>
      </div>

      <EntryForm
        action={saveEntryAction}
        initial={EMPTY_ENTRY}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
