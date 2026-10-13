// Parsing and serialization of shareable listing query params. All values
// are validated against the controlled vocabularies; anything unknown or
// malformed falls back to defaults rather than erroring, so old/shared URLs
// never produce server errors.

import type {
  AccessType,
  EntryType,
  Modality,
  ResourceTypeName,
  SkillLevel,
} from "@/lib/types";
import type { EntrySection, SortOption } from "@/lib/labels";
import {
  ACCESS_FACETS,
  DIRECTORY_TYPE_FACETS,
  LEARN_RESOURCE_TYPE_FACETS,
  MODALITY_FACETS,
  PAGE_SIZE,
  SKILL_LEVEL_FACETS,
} from "@/lib/labels";

export const MAX_QUERY_LENGTH = 200;
export const MAX_PAGE = 500;

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type EntryFilter = {
  section: EntrySection;
  q: string;
  categorySlug?: string;
  entryTypes: EntryType[];
  modalities: Modality[];
  access: AccessType[];
  skillLevels: SkillLevel[];
  resourceTypes: ResourceTypeName[];
  tagSlugs: string[];
  sort: SortOption;
  page: number;
};

export const DEFAULT_FILTER: Omit<EntryFilter, "section"> = {
  q: "",
  entryTypes: [],
  modalities: [],
  access: [],
  skillLevels: [],
  resourceTypes: [],
  tagSlugs: [],
  sort: "featured",
  page: 1,
};

function getSingle(params: RawSearchParams, key: string): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function getAll(params: RawSearchParams, key: string): string[] {
  const value = params[key];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function allowedValues<T extends string>(options: { value: T }[]): Set<T> {
  return new Set(options.map((o) => o.value));
}

const DIRECTORY_TYPES = allowedValues(DIRECTORY_TYPE_FACETS);
const RESOURCE_TYPES = allowedValues(LEARN_RESOURCE_TYPE_FACETS);
const SKILL_LEVELS = allowedValues(SKILL_LEVEL_FACETS);
const ACCESS_VALUES = allowedValues(ACCESS_FACETS);
const MODALITY_VALUES = allowedValues(MODALITY_FACETS);

const SORTS: Set<SortOption> = new Set([
  "featured",
  "recently-added",
  "recently-updated",
  "alphabetical",
]);

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function parseEntryFilter(
  params: RawSearchParams,
  section: EntrySection,
): EntryFilter {
  const rawQuery = getSingle(params, "q") ?? "";
  const q = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);

  const categorySlug = getSingle(params, "category");

  const sortRaw = getSingle(params, "sort");
  const sort: SortOption = sortRaw && SORTS.has(sortRaw as SortOption)
    ? (sortRaw as SortOption)
    : DEFAULT_FILTER.sort;

  const pageRaw = Number.parseInt(getSingle(params, "page") ?? "1", 10);
  const page = Number.isNaN(pageRaw)
    ? 1
    : Math.min(Math.max(pageRaw, 1), MAX_PAGE);

  return {
    section,
    q,
    categorySlug:
      categorySlug && SLUG_PATTERN.test(categorySlug)
        ? categorySlug
        : undefined,
    entryTypes: getAll(params, "type").filter((v): v is EntryType =>
      DIRECTORY_TYPES.has(v as EntryType),
    ),
    modalities: getAll(params, "modality").filter((v): v is Modality =>
      MODALITY_VALUES.has(v as Modality),
    ),
    access: getAll(params, "access").filter((v): v is AccessType =>
      ACCESS_VALUES.has(v as AccessType),
    ),
    skillLevels: getAll(params, "level").filter((v): v is SkillLevel =>
      SKILL_LEVELS.has(v as SkillLevel),
    ),
    resourceTypes: getAll(params, "resource").filter(
      (v): v is ResourceTypeName => RESOURCE_TYPES.has(v as ResourceTypeName),
    ),
    tagSlugs: getAll(params, "tag").filter((v) => SLUG_PATTERN.test(v)),
    sort,
    page,
  };
}

export function isFilterActive(filter: EntryFilter): boolean {
  return Boolean(
    filter.q ||
      filter.categorySlug ||
      filter.tagSlugs.length ||
      filter.entryTypes.length ||
      filter.modalities.length ||
      filter.access.length ||
      filter.skillLevels.length ||
      filter.resourceTypes.length ||
      filter.sort !== DEFAULT_FILTER.sort ||
      filter.page > 1,
  );
}

// Builds the query string for a link that changes one dimension of the
// current filter (e.g. next page) while preserving everything else.
export function buildFilterQuery(
  filter: EntryFilter,
  overrides: Partial<EntryFilter> = {},
): string {
  const merged = { ...filter, ...overrides };
  const search = new URLSearchParams();
  if (merged.q) search.set("q", merged.q);
  if (merged.categorySlug) search.set("category", merged.categorySlug);
  for (const tag of merged.tagSlugs) search.append("tag", tag);
  for (const type of merged.entryTypes) search.append("type", type);
  for (const modality of merged.modalities) search.append("modality", modality);
  for (const access of merged.access) search.append("access", access);
  for (const level of merged.skillLevels) search.append("level", level);
  for (const resource of merged.resourceTypes)
    search.append("resource", resource);
  if (merged.sort !== DEFAULT_FILTER.sort) search.set("sort", merged.sort);
  if (merged.page > 1) search.set("page", String(merged.page));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function pageCountFor(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}
