// Server-side query layer for public pages. Every function here filters on
// status = 'published' — drafts and archived entries can never reach public
// rendering, regardless of page logic. Do not import this module from client
// components; it touches the database.

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  not,
  or,
  sql,
  arrayOverlaps,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import { categories, entries, entryTags, tags } from "@/db/schema";
import type { Entry, Category } from "@/db/schema";
import { PAGE_SIZE, type EntrySection } from "@/lib/labels";
import type { EntryFilter } from "@/lib/params";

export type EntryListItem = {
  entry: Entry;
  categoryName: string | null;
  categorySlug: string | null;
};

export type EntryDetail = {
  entry: Entry;
  category: Category | null;
  entryTags: { name: string; slug: string }[];
};

export type CategoryFacet = {
  name: string;
  slug: string;
  description: string | null;
  entryCount: number;
};

export type TagFacet = {
  name: string;
  slug: string;
  entryCount: number;
};

// Section membership. Learn = dedicated learning resources or anything filed
// under a learn-section category; directory = everything else (including
// entries without a category, which would otherwise fall through the NOT).
function sectionCondition(section: EntrySection): SQL {
  const isLearn = or(
    eq(entries.entryType, "learning-resource"),
    eq(categories.section, "learn"),
  )!;
  if (section === "learn") return isLearn;
  return or(isNull(entries.categoryId), not(isLearn))!;
}

function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, "\\$&");
}

function keywordCondition(q: string): SQL {
  const pattern = `%${escapeLikePattern(q)}%`;
  return or(
    ilike(entries.name, pattern),
    ilike(entries.summary, pattern),
    ilike(entries.description, pattern),
    sql`exists (select 1 from ${entryTags} inner join ${tags} on ${tags.id} = ${entryTags.tagId} where ${entryTags.entryId} = ${entries.id} and ${tags.name} ilike ${pattern})`,
  )!;
}

function listConditions(filter: EntryFilter): SQL[] {
  const conditions: SQL[] = [
    eq(entries.status, "published"),
    sectionCondition(filter.section),
  ];
  if (filter.q) conditions.push(keywordCondition(filter.q));
  if (filter.categorySlug) {
    conditions.push(eq(categories.slug, filter.categorySlug));
  }
  if (filter.entryTypes.length) {
    conditions.push(inArray(entries.entryType, filter.entryTypes));
  }
  if (filter.modalities.length) {
    conditions.push(arrayOverlaps(entries.modality, filter.modalities));
  }
  if (filter.access.length) {
    conditions.push(arrayOverlaps(entries.access, filter.access));
  }
  if (filter.skillLevels.length) {
    conditions.push(inArray(entries.skillLevel, filter.skillLevels));
  }
  if (filter.resourceTypes.length) {
    conditions.push(inArray(entries.resourceType, filter.resourceTypes));
  }
  if (filter.tagSlugs.length) {
    for (const tagSlug of filter.tagSlugs) {
      const taggedEntryIds = db
        .select({ id: entryTags.entryId })
        .from(entryTags)
        .innerJoin(tags, eq(tags.id, entryTags.tagId))
        .where(eq(tags.slug, tagSlug));
      conditions.push(inArray(entries.id, taggedEntryIds));
    }
  }
  return conditions;
}

function listOrderBy(sort: EntryFilter["sort"]) {
  switch (sort) {
    case "recently-added":
      return [desc(entries.createdAt)];
    case "recently-updated":
      return [desc(entries.updatedAt)];
    case "alphabetical":
      return [asc(entries.name)];
    case "featured":
    default:
      // Editorial curation first, then newest within the featured shelf.
      return [desc(entries.featured), desc(entries.createdAt)];
  }
}

export async function listPublicEntries(filter: EntryFilter): Promise<{
  items: EntryListItem[];
  total: number;
  page: number;
  pageCount: number;
}> {
  const where = and(...listConditions(filter));

  const [rows, totals] = await Promise.all([
    db
      .select({
        entry: entries,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(entries)
      .leftJoin(categories, eq(entries.categoryId, categories.id))
      .where(where)
      .orderBy(...listOrderBy(filter.sort))
      .limit(PAGE_SIZE)
      .offset((filter.page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(entries)
      .leftJoin(categories, eq(entries.categoryId, categories.id))
      .where(where),
  ]);

  const total = Number(totals[0]?.total ?? 0);
  return {
    items: rows,
    total,
    page: filter.page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getPublicEntryBySlug(
  slug: string,
): Promise<EntryDetail | null> {
  // Lowercase + spaces-to-hyphens so case/space variants of a real slug
  // resolve (the page redirects them to the canonical URL). No other
  // characters are stripped: an invalid slug like foo_bar must miss, never
  // silently match an entry after truncation. The DB lookup itself is the
  // awaited suspense point that lets a miss render a real 404 under PPR.
  const normalized = slug.toLowerCase().replace(/\s+/g, "-");
  const [row] = await db
    .select({ entry: entries, category: categories })
    .from(entries)
    .leftJoin(categories, eq(entries.categoryId, categories.id))
    .where(and(eq(entries.status, "published"), eq(entries.slug, normalized)))
    .limit(1);
  if (!row) return null;
  const tagRows = await db
    .select({ name: tags.name, slug: tags.slug })
    .from(entryTags)
    .innerJoin(tags, eq(tags.id, entryTags.tagId))
    .where(eq(entryTags.entryId, row.entry.id))
    .orderBy(asc(tags.name));
  return { entry: row.entry, category: row.category, entryTags: tagRows };
}

export async function getCategoryFacets(
  section: EntrySection,
): Promise<CategoryFacet[]> {
  const rows = await db
    .select({
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      entryCount: count(entries.id),
    })
    .from(categories)
    .leftJoin(
      entries,
      and(eq(entries.categoryId, categories.id), eq(entries.status, "published")),
    )
    .where(eq(categories.section, section))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
  return rows
    .map((row) => ({ ...row, entryCount: Number(row.entryCount) }))
    .filter((row) => row.entryCount > 0);
}

export async function getTagFacets(
  section: EntrySection,
): Promise<TagFacet[]> {
  const rows = await db
    .select({
      name: tags.name,
      slug: tags.slug,
      entryCount: count(),
    })
    .from(tags)
    .innerJoin(entryTags, eq(entryTags.tagId, tags.id))
    .innerJoin(entries, eq(entries.id, entryTags.entryId))
    .leftJoin(categories, eq(entries.categoryId, categories.id))
    .where(and(eq(entries.status, "published"), sectionCondition(section)))
    .groupBy(tags.id)
    .orderBy(asc(tags.name));
  return rows
    .map((row) => ({ ...row, entryCount: Number(row.entryCount) }))
    .filter((row) => row.entryCount > 0);
}

export async function getFeaturedEntries(
  limit: number,
): Promise<EntryListItem[]> {
  return db
    .select({
      entry: entries,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(entries)
    .leftJoin(categories, eq(entries.categoryId, categories.id))
    .where(and(eq(entries.status, "published"), eq(entries.featured, true)))
    .orderBy(desc(entries.createdAt))
    .limit(limit);
}

export async function getRecentEntries(limit: number): Promise<EntryListItem[]> {
  return db
    .select({
      entry: entries,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(entries)
    .leftJoin(categories, eq(entries.categoryId, categories.id))
    .where(eq(entries.status, "published"))
    .orderBy(desc(entries.createdAt))
    .limit(limit);
}

// Flat slug list for sitemap.xml. Only published entries are ever returned.
export async function getSitemapEntries(): Promise<
  { slug: string; updatedAt: Date; section: EntrySection }[]
> {
  const rows = await db
    .select({
      slug: entries.slug,
      updatedAt: entries.updatedAt,
      entryType: entries.entryType,
      categorySection: categories.section,
    })
    .from(entries)
    .leftJoin(categories, eq(entries.categoryId, categories.id))
    .where(eq(entries.status, "published"));
  return rows.map((row) => ({
    slug: row.slug,
    updatedAt: row.updatedAt,
    section:
      row.entryType === "learning-resource" || row.categorySection === "learn"
        ? "learn"
        : "directory",
  }));
}
