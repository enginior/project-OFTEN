import type { Metadata } from "next";
import { deleteCategoryAction } from "@/lib/actions/taxonomy";
import { listAllCategories } from "@/lib/admin-queries";
import { sectionLabel, type EntrySection } from "@/lib/labels";
import { SaveBanner, parseFeedback } from "@/components/admin/save-banner";
import { ConfirmRowAction } from "@/components/admin/row-action";
import {
  CategoryForm,
  EMPTY_CATEGORY,
} from "@/components/admin/category-form";

export const metadata: Metadata = {
  title: "Manage categories",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const feedback = parseFeedback(raw);

  const categories = await listAllCategories();

  // Edit mode: ?edit=<id> prefills the form with that category. Unknown or
  // missing ids fall back to an empty create form.
  const editId = Array.isArray(raw.edit) ? raw.edit[0] : raw.edit;
  const editing = editId
    ? categories.find((category) => category.id === editId)
    : undefined;
  const formInitial = editing
    ? {
        id: editing.id,
        name: editing.name,
        slug: editing.slug,
        description: editing.description ?? "",
        section: editing.section,
      }
    : EMPTY_CATEGORY;

  const directory = categories.filter((c) => c.section === "directory");
  const learn = categories.filter((c) => c.section === "learn");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-bone-50 uppercase">
          Categories
        </h1>
        <p className="mt-1 text-sm text-ash-300">
          {categories.length} {categories.length === 1 ? "category" : "categories"}{" "}
          across the AI Directory and Learn sections. Deleting a category
          leaves its entries uncategorised — it never deletes them.
        </p>
      </div>

      <SaveBanner feedback={feedback} />

      <section className="border border-forge-700 bg-forge-900 p-6">
        <h2 className="mb-4 border-b border-forge-700 pb-2 font-display text-sm font-bold tracking-widest text-ember-400 uppercase">
          {editing ? "Edit category" : "New category"}
        </h2>
        <CategoryForm initial={formInitial} />
      </section>

      {categories.length === 0 ? (
        <div className="border border-forge-700 bg-forge-900 p-10 text-center">
          <p className="font-display text-sm font-bold tracking-widest text-ash-200 uppercase">
            No categories yet
          </p>
          <p className="mt-2 text-sm text-ash-400">
            Create your first category above to organise the library.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {(
            [
              { section: "directory" as EntrySection, items: directory },
              { section: "learn" as EntrySection, items: learn },
            ].map(({ section, items }) =>
              items.length ? (
                <section key={section} className="flex flex-col gap-3">
                  <h2 className="border-b border-forge-700 pb-2 font-display text-sm font-bold tracking-widest text-ash-200 uppercase">
                    {sectionLabel(section)} — {items.length}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {items.map((category) => (
                      <article
                        key={category.id}
                        className="flex flex-col gap-4 border border-forge-700 bg-forge-900 p-4 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-base font-bold text-bone-50">
                            {category.name}
                            {editing?.id === category.id ? (
                              <span className="ml-3 border border-ember-500 px-2 py-0.5 font-display text-[10px] font-semibold tracking-widest text-ember-400 uppercase">
                                Editing
                              </span>
                            ) : null}
                          </h3>
                          <p className="mt-1 truncate text-sm text-ash-300">
                            /{category.slug} · {category.entryCount}{" "}
                            {category.entryCount === 1 ? "entry" : "entries"}
                          </p>
                          {category.description ? (
                            <p className="mt-1 text-xs text-ash-400">
                              {category.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`/admin/categories?edit=${category.id}`}
                            className="border border-iron-600 px-3 py-1.5 font-display text-xs font-semibold tracking-widest text-ash-200 uppercase no-underline transition-colors hover:border-ember-500 hover:text-ember-400"
                          >
                            Edit
                          </a>
                          <ConfirmRowAction
                            action={deleteCategoryAction.bind(
                              null,
                              category.id,
                              "/admin/categories",
                            )}
                            label="Delete"
                            confirmTitle={`Delete category "${category.name}"?`}
                            confirmBody={
                              category.entryCount
                                ? `${category.entryCount} ${category.entryCount === 1 ? "entry" : "entries"} will become uncategorised. They will not be deleted.`
                                : "This permanently removes the category."
                            }
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null,
            )
          )}
        </div>
      )}

      <p className="text-xs text-ash-400">
        Entries referencing a deleted category keep their other data;
        reassign their category from the entry editor.
      </p>
    </div>
  );
}
