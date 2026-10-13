// Server-side query layer for admin pages. Unlike public queries
// (src/lib/queries.ts), these functions return entries of every status —
// drafts and archived entries are exactly what the admin must be able to
// manage. Every caller is behind requireAdmin(); do not import from client
// components or public pages.

import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, entries, entryTags, tags } from "@/db/schema";
import type { EntryStatus } from "@/lib/types";

export const ADMIN_PAGE_SIZE = 20;
export const MAX_ADMIN_PAGE = 500;

function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, "\\$&");
}

export type AdminEntryListItem = {
  entry: typeof entries.$inferSelect;
  categoryName: string | null;
};

export type AdminEntryList = {
  items: AdminEntryListItem[];
  total: number;
  page: number;
  pageCount: number;
};

export async function listAdminEntries(params: {
  q: string;
  status?: EntryStatus;
  page: number;
}): Promise<AdminEntryList> {
  const page = Math.min(Math.max(params.page, 1), MAX_ADMIN_PAGE);
  const conditions: SQL[] = [];
  if (params.status) conditions.push(eq(entries.status, params.status));
  const trimmed = params.q.trim().slice(0, 200);
  if (trimmed) {
    const pattern = `%${escapeLikePattern(trimmed)}%`;
    conditions.push(or(ilike(entries.name, pattern), ilike(entries.slug, pattern))!);
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totals] = await Promise.all([
    db
      .select({ entry: entries, categoryName: categories.name })
      .from(entries)
      .leftJoin(categories, eq(entries.categoryId, categories.id))
      .where(where)
      .orderBy(desc(entries.updatedAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
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
    page,
    pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
  };
}

export type EntryForEdit = {
  entry: typeof entries.$inferSelect;
  tagIds: string[];
};

export async function getEntryForEdit(id: string): Promise<EntryForEdit | null> {
  const entry = await db.query.entries.findFirst({ where: eq(entries.id, id) });
  if (!entry) return null;
  const tagRows = await db
    .select({ tagId: entryTags.tagId })
    .from(entryTags)
    .where(eq(entryTags.entryId, id));
  return { entry, tagIds: tagRows.map((row) => row.tagId) };
}

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  section: "directory" | "learn";
  entryCount: number;
};

export async function listAllCategories(): Promise<AdminCategory[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      section: categories.section,
      entryCount: count(entries.id),
    })
    .from(categories)
    .leftJoin(entries, eq(entries.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.section), asc(categories.name));
  return rows.map((row) => ({ ...row, entryCount: Number(row.entryCount) }));
}

export type AdminTag = {
  id: string;
  name: string;
  slug: string;
  entryCount: number;
};

export async function listAllTags(): Promise<AdminTag[]> {
  const rows = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      entryCount: count(entryTags.entryId),
    })
    .from(tags)
    .leftJoin(entryTags, eq(entryTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(asc(tags.name));
  return rows.map((row) => ({ ...row, entryCount: Number(row.entryCount) }));
}

/** Select options for the entry form: every category, grouped by section. */
export async function listCategoryOptions(): Promise<
  { id: string; name: string; section: "directory" | "learn" }[]
> {
  return db
    .select({ id: categories.id, name: categories.name, section: categories.section })
    .from(categories)
    .orderBy(asc(categories.section), asc(categories.name));
}

/** Select options for the entry form: every tag, alphabetically. */
export async function listTagOptions(): Promise<
  { id: string; name: string }[]
> {
  return db.select({ id: tags.id, name: tags.name }).from(tags).orderBy(asc(tags.name));
}
