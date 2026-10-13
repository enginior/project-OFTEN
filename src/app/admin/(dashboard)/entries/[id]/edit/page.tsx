import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { saveEntryAction } from "@/lib/actions/entries";
import { getEntryForEdit, listCategoryOptions, listTagOptions } from "@/lib/admin-queries";
import { EntryForm } from "@/components/admin/entry-form";
import { entryToFormValues } from "@/components/admin/entry-form-values";

export const metadata: Metadata = {
  title: "Edit entry",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [existing, categories, tags] = await Promise.all([
    getEntryForEdit(id),
    listCategoryOptions(),
    listTagOptions(),
  ]);
  if (!existing) notFound();
  const entry = entryToFormValues(existing);

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
          Edit entry
        </h1>
        <p className="mt-1 text-sm text-ash-300">
          {entry.name} · /{entry.slug} ·{" "}
          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
          {entry.canonicalUrl ? (
            <>
              {" · "}
              <a
                href={entry.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ember-400 underline decoration-ember-600 underline-offset-2 hover:text-ember-300"
              >
                View source
              </a>
            </>
          ) : null}
        </p>
      </div>

      <EntryForm
        action={saveEntryAction}
        initial={entry}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
