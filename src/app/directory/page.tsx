import type { Metadata } from "next";
import { EntryListing } from "@/components/entry-listing";
import { ACCESS_FACETS, DIRECTORY_TYPE_FACETS, MODALITY_FACETS } from "@/lib/labels";
import { parseEntryFilter } from "@/lib/params";
import { getCategoryFacets, getTagFacets, listPublicEntries } from "@/lib/queries";

export const metadata: Metadata = {
  title: "AI Directory",
  description:
    "A curated directory of AI models, applications, developer tools, hardware, and more. Every entry links to its canonical source.",
  alternates: { canonical: "/directory" },
};

// Filters, sorting, and pagination are database-backed per request; a blocking
// route is intentional (no shell should stream before data is available).
export const instant = false;

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filter = parseEntryFilter(raw, "directory");
  const [categories, tags] = await Promise.all([
    getCategoryFacets("directory"),
    getTagFacets("directory"),
  ]);

  return (
    <EntryListing
      section="directory"
      filter={filter}
      loadEntries={listPublicEntries}
      heading="AI Directory"
      intro="Browse curated AI models, applications, developer tools, creative tools, agents, hardware, and research. Every entry links to its official source."
      searchPlaceholder="Search models, tools, frameworks…"
      facetGroups={[
        {
          key: "type",
          label: "Type",
          options: DIRECTORY_TYPE_FACETS,
          selected: filter.entryTypes,
        },
        {
          key: "modality",
          label: "Modality",
          options: MODALITY_FACETS,
          selected: filter.modalities,
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
