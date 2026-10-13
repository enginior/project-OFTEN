import type { Metadata } from "next";
import { deleteTagAction } from "@/lib/actions/taxonomy";
import { listAllTags } from "@/lib/admin-queries";
import { SaveBanner, parseFeedback } from "@/components/admin/save-banner";
import { ConfirmRowAction } from "@/components/admin/row-action";
import { TagForm, EMPTY_TAG } from "@/components/admin/tag-form";

export const metadata: Metadata = {
  title: "Manage tags",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const feedback = parseFeedback(raw);

  const tags = await listAllTags();

  // Edit mode: ?edit=<id> prefills the form with that tag. Unknown or
  // missing ids fall back to an empty create form.
  const editId = Array.isArray(raw.edit) ? raw.edit[0] : raw.edit;
  const editing = editId ? tags.find((tag) => tag.id === editId) : undefined;
  const formInitial = editing
    ? {
        id: editing.id,
        name: editing.name,
        slug: editing.slug,
      }
    : EMPTY_TAG;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-bone-50 uppercase">
          Tags
        </h1>
        <p className="mt-1 text-sm text-ash-300">
          {tags.length} {tags.length === 1 ? "tag" : "tags"}. Tags are free-form
          labels that complement controlled categories — deleting a tag only
          removes it from entries, never the entries themselves.
        </p>
      </div>

      <SaveBanner feedback={feedback} />

      <section className="border border-forge-700 bg-forge-900 p-6">
        <h2 className="mb-4 border-b border-forge-700 pb-2 font-display text-sm font-bold tracking-widest text-ember-400 uppercase">
          {editing ? "Edit tag" : "New tag"}
        </h2>
        <TagForm initial={formInitial} />
      </section>

      {tags.length === 0 ? (
        <div className="border border-forge-700 bg-forge-900 p-10 text-center">
          <p className="font-display text-sm font-bold tracking-widest text-ash-200 uppercase">
            No tags yet
          </p>
          <p className="mt-2 text-sm text-ash-400">
            Create your first tag above to add flexible labels to entries.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tags.map((tag) => (
            <article
              key={tag.id}
              className="flex flex-col gap-4 border border-forge-700 bg-forge-900 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-bold text-bone-50">
                  {tag.name}
                  {editing?.id === tag.id ? (
                    <span className="ml-3 border border-ember-500 px-2 py-0.5 font-display text-[10px] font-semibold tracking-widest text-ember-400 uppercase">
                      Editing
                    </span>
                  ) : null}
                </h2>
                <p className="mt-1 truncate text-sm text-ash-300">
                  /{tag.slug} · {tag.entryCount}{" "}
                  {tag.entryCount === 1 ? "entry" : "entries"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/admin/tags?edit=${tag.id}`}
                  className="border border-iron-600 px-3 py-1.5 font-display text-xs font-semibold tracking-widest text-ash-200 uppercase no-underline transition-colors hover:border-ember-500 hover:text-ember-400"
                >
                  Edit
                </a>
                <ConfirmRowAction
                  action={deleteTagAction.bind(null, tag.id, "/admin/tags")}
                  label="Delete"
                  confirmTitle={`Delete tag "${tag.name}"?`}
                  confirmBody={
                    tag.entryCount
                      ? `${tag.entryCount} ${tag.entryCount === 1 ? "entry" : "entries"} will lose this tag. They will not be deleted.`
                      : "This permanently removes the tag."
                  }
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
