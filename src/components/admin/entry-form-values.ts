// Shared between the server page that prepares initial values and the client
// EntryForm component. Lives outside entry-form.tsx (which is a client
// component) so server code can invoke entryToFormValues directly. The schema
// import is type-only and is erased at build time.

import type { Entry } from "@/db/schema";

export type EntryFormInitial = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  canonicalUrl: string;
  entryType: string;
  categoryId: string;
  tagIds: string[];
  status: string;
  featured: boolean;
  creator: string;
  license: string;
  access: string[];
  modality: string[];
  skillAreas: string;
  skillLevel: string;
  releaseStatus: string;
  resourceType: string;
  logoUrl: string;
};

export const EMPTY_ENTRY: EntryFormInitial = {
  id: "",
  name: "",
  slug: "",
  summary: "",
  description: "",
  canonicalUrl: "",
  entryType: "model",
  categoryId: "",
  tagIds: [],
  status: "draft",
  featured: false,
  creator: "",
  license: "",
  access: [],
  modality: [],
  skillAreas: "",
  skillLevel: "",
  releaseStatus: "",
  resourceType: "",
  logoUrl: "",
};

// Maps a DB row (with tag IDs) into the flat form shape.
export function entryToFormValues({
  entry,
  tagIds,
}: {
  entry: Entry;
  tagIds: string[];
}): EntryFormInitial {
  return {
    id: entry.id,
    name: entry.name,
    slug: entry.slug,
    summary: entry.summary,
    description: entry.description ?? "",
    canonicalUrl: entry.canonicalUrl,
    entryType: entry.entryType,
    categoryId: entry.categoryId ?? "",
    tagIds,
    status: entry.status,
    featured: entry.featured,
    creator: entry.creator ?? "",
    license: entry.license ?? "",
    access: entry.access ?? [],
    modality: entry.modality ?? [],
    skillAreas: (entry.skillAreas ?? []).join(", "),
    skillLevel: entry.skillLevel ?? "",
    releaseStatus: entry.releaseStatus ?? "",
    resourceType: entry.resourceType ?? "",
    logoUrl: entry.logoUrl ?? "",
  };
}
