import type { Metadata } from "next";
import { EntryListing } from "@/components/entry-listing";
import { ACCESS_FACETS, LEARN_RESOURCE_TYPE_FACETS, SKILL_LEVEL_FACETS } from "@/lib/labels";
import { parseEntryFilter } from "@/lib/params";
import { getCategoryFacets, getTagFacets, listPublicEntries } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Learn & Upskill",
  description:
    "A curated index of AI education and technical references: documentation, courses, tutorials, books, papers, benchmarks, and datasets.",
  alternates: { canonical: "/learn" },
};

// Filters, sorting, and pagination are database-backed per request; a blocking
// route is intentional (no shell should stream before data is available).
export const instant = false;

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filter = parseEntryFilter(raw, "learn");
  const [categories, tags] = await Promise.all([
    getCategoryFacets("learn"),
    getTagFacets("learn"),
  ]);

  return (
    <EntryListing
      section="learn"
      filter={filter}
      loadEntries={listPublicEntries}
      heading="Learn & upskill"
      intro="A curated index of AI education and technical references — official documentation, courses, tutorials, books, papers, benchmarks, and datasets. We link to the source; we never copy the content."
      searchPlaceholder="Search courses, papers, documentation…"
      facetGroups={[
        {
          key: "resource",
          label: "Resource type",
          options: LEARN_RESOURCE_TYPE_FACETS,
          selected: filter.resourceTypes,
        },
        {
          key: "level",
          label: "Level",
          options: SKILL_LEVEL_FACETS,
          selected: filter.skillLevels,
        },
        {
          key: "access",
          label: "Access",
          options: ACCESS_FACETS,
          selected: filter.access,
        },
      ]}
      categories={categories}
      tags={tags}
    />
  );
}
