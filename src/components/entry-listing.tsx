import Link from "next/link";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { EntryCard } from "@/components/entry-card";
import { FilterForm, type FacetGroup } from "@/components/filters";
import { Pagination } from "@/components/pagination";
import { SearchForm } from "@/components/search-form";
import { PAGE_SIZE, type EntrySection, sectionLabel } from "@/lib/labels";
import {
  buildFilterQuery,
  isFilterActive,
  pageCountFor,
  type EntryFilter,
} from "@/lib/params";
import type { CategoryFacet, EntryListItem, TagFacet } from "@/lib/queries";
import { cn } from "@/lib/utils";

type ListingResult = Awaited<ReturnType<typeof listForView>>;

async function listForView(
  filter: EntryFilter,
  loadEntries: (filter: EntryFilter) => Promise<{
    items: EntryListItem[];
    total: number;
    page: number;
    pageCount: number;
  }>,
) {
  return loadEntries(filter);
}

// Shared server-rendered listing view for /directory and /learn: hero with
// search, category/tag links, filter sidebar, result grid, and pagination.
// Everything is a GET link or form, so filter combinations are shareable
// URLs and work without client JavaScript.
export async function EntryListing({
  section,
  filter,
  loadEntries,
  heading,
  intro,
  searchPlaceholder,
  facetGroups,
  categories,
  tags,
}: {
  section: EntrySection;
  filter: EntryFilter;
  loadEntries: (filter: EntryFilter) => Promise<ListingResult>;
  heading: string;
  intro: string;
  searchPlaceholder: string;
  facetGroups: FacetGroup[];
  categories: CategoryFacet[];
  tags: TagFacet[];
}) {
  const result = await listForView(filter, loadEntries);
  const basePath = `/${section}`;
  const filterActive = isFilterActive(filter);
  const paginationHref = buildFilterQuery(filter, { page: 1 });

  // Hidden fields keep link-driven params (category, tags) intact when the
  // visitor submits the filter form; unchecked facets simply drop off.
  const hiddenFields: { name: string; value: string }[] = [];
  if (filter.categorySlug)
    hiddenFields.push({ name: "category", value: filter.categorySlug });
  for (const tag of filter.tagSlugs)
    hiddenFields.push({ name: "tag", value: tag });

  return (
    <>
      <section className="border-b border-forge-700">
        <Container className="py-14">
          <h1 className="text-4xl text-bone-50">{heading}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ash-300">
            {intro}
          </p>
          <div className="mt-8 max-w-xl">
            <SearchForm
              action={basePath}
              label={`Search ${sectionLabel(section)}`}
              placeholder={searchPlaceholder}
            />
          </div>
        </Container>
      </section>

      <section aria-labelledby={`${section}-results-heading`}>
        <Container className="py-10">
          <h2 id={`${section}-results-heading`} className="sr-only">
            {heading} results
          </h2>
          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
            <aside className="mb-8 lg:mb-0">
              <nav aria-label="Categories">
                <p className="font-display text-xs font-semibold tracking-widest text-iron-400 uppercase">
                  Categories
                </p>
                <ul className="mt-3 space-y-1.5">
                  <li>
                    <CategoryLink
                      href={`${basePath}${buildFilterQuery(filter, {
                        categorySlug: undefined,
                        page: 1,
                      })}`}
                      active={!filter.categorySlug}
                    >
                      All categories
                    </CategoryLink>
                  </li>
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <CategoryLink
                        href={`${basePath}${buildFilterQuery(filter, {
                          categorySlug: category.slug,
                          page: 1,
                        })}`}
                        active={filter.categorySlug === category.slug}
                      >
                        {category.name}{" "}
                        <span className="text-iron-400">
                          ({category.entryCount})
                        </span>
                      </CategoryLink>
                    </li>
                  ))}
                </ul>
              </nav>
              {tags.length ? (
                <nav aria-label="Tags" className="mt-6">
                  <p className="font-display text-xs font-semibold tracking-widest text-iron-400 uppercase">
                    Tags
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.slice(0, 12).map((tag) => (
                      <Link
                        key={tag.slug}
                        href={`${basePath}${buildFilterQuery(filter, {
                          tagSlugs: filter.tagSlugs.includes(tag.slug)
                            ? filter.tagSlugs.filter((t) => t !== tag.slug)
                            : [...filter.tagSlugs, tag.slug],
                          page: 1,
                        })}`}
                        className={cn(
                          "border px-2 py-0.5 font-display text-xs no-underline",
                          filter.tagSlugs.includes(tag.slug)
                            ? "border-ember-500 bg-ember-500 text-forge-950"
                            : "border-forge-700 text-ash-300 hover:border-ember-600 hover:text-bone-100",
                        )}
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </nav>
              ) : null}
              <div className="mt-6">
                <FilterForm
                  action={basePath}
                  idPrefix={section}
                  query={filter.q}
                  groups={facetGroups}
                  sort={filter.sort}
                  hiddenFields={hiddenFields}
                />
              </div>
            </aside>

            <div>
              <p
                className="font-display text-sm text-iron-400"
                aria-live="polite"
              >
                {result.total} {result.total === 1 ? "entry" : "entries"}
                {filterActive ? " · filters applied" : ""}
              </p>
              {result.items.length ? (
                <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {result.items.map((item) => (
                    <li key={item.entry.id}>
                      <EntryCard
                        item={item}
                        section={section}
                        className="h-full"
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  className="mt-4"
                  title="No matches"
                  hint={
                    filterActive
                      ? "No entries match the current search and filters. Clear a filter or try a broader term."
                      : "Nothing has been published in this section yet. Check back soon."
                  }
                />
              )}
              <Pagination
                className="mt-8"
                action={`${basePath}${paginationHref}`}
                page={result.page}
                pageCount={pageCountFor(result.total)}
              />
              <p className="sr-only">
                Showing up to {PAGE_SIZE} entries per page.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function CategoryLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-display text-sm no-underline",
        active
          ? "border-l-2 border-ember-500 pl-2 text-ember-400"
          : "pl-2.5 text-ash-300 hover:text-bone-100",
      )}
    >
      {children}
    </Link>
  );
}
