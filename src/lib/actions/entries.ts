"use server";

// Server actions for entry CRUD. Every action begins with requireAdmin() —
// the authoritative authorization check; hiding UI is not authorization.
// Inputs are validated with the shared Zod schemas; on validation or
// constraint failure the action returns a useful, non-internal error
// message (never stack traces or database details).

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { entries, entryTags, tags } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { entrySchema } from "@/lib/validation";

export type EntryFormState = {
  errors?: Record<string, string>;
  error?: string;
};

// Row actions redirect back to the list; the target must be a local admin
// path to rule out open redirects via tampered inputs.
function safeReturnTo(value: FormDataEntryValue | null): string {
  const raw = typeof value === "string" ? value : "";
  return raw.startsWith("/admin/") ? raw : "/admin/entries";
}

// Appends a feedback param to a returnTo path that may already carry a query
// string (e.g. /admin/entries?q=foo), so the list's filters survive.
function withParam(path: string, key: string, value: string): string {
  const [base, query] = path.split("?");
  const params = new URLSearchParams(query);
  params.set(key, value);
  return `${base}?${params.toString()}`;
}

function revalidatePublicPaths(slug?: string) {
  // Public pages render per request, but revalidate anyway so any cached
  // variant (CDN, future caching) can never serve stale or unpublished data.
  revalidatePath("/");
  revalidatePath("/directory");
  revalidatePath("/learn");
  if (slug) {
    revalidatePath(`/directory/${slug}`);
    revalidatePath(`/learn/${slug}`);
  }
}

function single(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function optional(formData: FormData, key: string): string | null {
  const value = single(formData, key).trim();
  return value === "" ? null : value;
}

function multi(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .filter((v): v is string => typeof v === "string" && v.trim() !== "");
}

// Builds the Zod input from FormData. Arrays arrive as repeated fields;
// skillAreas is a single comma-separated input.
function parseEntryForm(formData: FormData) {
  return entrySchema.safeParse({
    name: single(formData, "name"),
    slug: single(formData, "slug").trim(),
    summary: single(formData, "summary"),
    description: optional(formData, "description"),
    canonicalUrl: single(formData, "canonicalUrl").trim(),
    entryType: single(formData, "entryType"),
    categoryId: optional(formData, "categoryId"),
    tagIds: multi(formData, "tagIds"),
    status: single(formData, "status") || "draft",
    featured: formData.get("featured") === "on",
    creator: optional(formData, "creator"),
    license: optional(formData, "license"),
    access: multi(formData, "access"),
    modality: multi(formData, "modality"),
    skillAreas: multi(formData, "skillAreas"),
    skillLevel: optional(formData, "skillLevel"),
    releaseStatus: optional(formData, "releaseStatus"),
    resourceType: optional(formData, "resourceType"),
    logoUrl: optional(formData, "logoUrl"),
  });
}

// Turns a Zod error into a flat field->message map. Array/compound errors
// are joined so one message renders per field.
function fieldErrors(error: z.ZodError): Record<string, string> {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[]>;
  const out: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages && messages.length) out[key] = messages.join(" ");
  }
  return out;
}

// Postgres unique-violation (23505) backstop. The pre-check below handles
// the common case with a friendlier message; this catches races.
function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

function isForeignKeyViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23503"
  );
}

export async function saveEntryAction(
  _prevState: EntryFormState,
  formData: FormData,
): Promise<EntryFormState> {
  await requireAdmin();

  const parsed = parseEntryForm(formData);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }
  const input = parsed.data;
  const id = single(formData, "id");
  const isUpdate = id !== "";

  if (isUpdate) {
    const uuidCheck = z.uuid().safeParse(id);
    if (!uuidCheck.success) return { error: "Invalid entry reference." };
  }

  // Slug must be unique across all entries (published or not).
  const slugConflict = await db
    .select({ id: entries.id })
    .from(entries)
    .where(eq(entries.slug, input.slug))
    .limit(2);
  if (
    slugConflict.length &&
    !(isUpdate && slugConflict.length === 1 && slugConflict[0].id === id)
  ) {
    return {
      errors: { slug: "An entry with this URL slug already exists." },
    };
  }

  // Selected tag ids must all exist — the FK covers this at the database
  // level, but validating up front gives a clean message on bad input.
  if (input.tagIds?.length) {
    const existingTags = await db
      .select({ id: tags.id })
      .from(tags)
      .then((rows) => new Set(rows.map((row) => row.id)));
    const missing = input.tagIds.filter((tagId) => !existingTags.has(tagId));
    if (missing.length) {
      return {
        errors: { tagIds: "One or more selected tags no longer exist." },
      };
    }
  }

  const values = {
    name: input.name,
    slug: input.slug,
    summary: input.summary,
    description: input.description ?? null,
    canonicalUrl: input.canonicalUrl,
    entryType: input.entryType,
    categoryId: input.categoryId ?? null,
    status: input.status,
    featured: input.featured,
    creator: input.creator ?? null,
    license: input.license ?? null,
    access: input.access ?? [],
    modality: input.modality ?? [],
    skillAreas: input.skillAreas ?? [],
    skillLevel: input.skillLevel ?? null,
    releaseStatus: input.releaseStatus ?? null,
    resourceType: input.resourceType ?? null,
    logoUrl: input.logoUrl ?? null,
    updatedAt: new Date(),
  };

  try {
    if (isUpdate) {
      const updated = await db
        .update(entries)
        .set(values)
        .where(eq(entries.id, id))
        .returning({ slug: entries.slug });
      if (!updated.length) return { error: "Entry no longer exists." };

      await db.transaction(async (tx) => {
        await tx.delete(entryTags).where(eq(entryTags.entryId, id));
        if (input.tagIds?.length) {
          await tx.insert(entryTags).values(
            input.tagIds.map((tagId) => ({ entryId: id, tagId })),
          );
        }
      });
      revalidatePublicPaths(updated[0].slug);
    } else {
      const inserted = await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(entries)
          .values(values)
          .returning({ id: entries.id, slug: entries.slug });
        if (input.tagIds?.length) {
          await tx.insert(entryTags).values(
            input.tagIds.map((tagId) => ({ entryId: created.id, tagId })),
          );
        }
        return created;
      });
      revalidatePublicPaths(inserted.slug);
    }
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { errors: { slug: "An entry with this URL slug already exists." } };
    }
    if (isForeignKeyViolation(err)) {
      return { error: "The selected category or tags no longer exist. Review your choices and try again." };
    }
    // Unknown failure: log server-side, surface a generic message.
    console.error("saveEntryAction failed", err);
    return { error: "Saving the entry failed. Please try again." };
  }

  redirect(`/admin/entries?saved=${isUpdate ? "updated" : "created"}`);
}

const statusSchema = z.enum(["draft", "published", "archived"]);

export async function setEntryStatusAction(
  entryId: string,
  status: "draft" | "published" | "archived",
  returnTo: string,
): Promise<void> {
  await requireAdmin();
  const idCheck = z.uuid().safeParse(entryId);
  const statusCheck = statusSchema.safeParse(status);
  const to = safeReturnTo(returnTo);
  if (!idCheck.success || !statusCheck.success) {
    redirect(withParam(to, "error", "Invalid request."));
  }

  // DB work inside try/catch; redirects stay outside (redirect() throws a
  // control-flow error that a catch block would swallow).
  let notFound = false;
  let failed = false;
  try {
    const updated = await db
      .update(entries)
      .set({ status: statusCheck.data, updatedAt: new Date() })
      .where(eq(entries.id, entryId))
      .returning({ slug: entries.slug });
    if (updated.length) {
      revalidatePublicPaths(updated[0].slug);
    } else {
      notFound = true;
    }
  } catch (err) {
    console.error("setEntryStatusAction failed", err);
    failed = true;
  }
  if (failed) {
    redirect(withParam(to, "error", "Status change failed. Please try again."));
  }
  if (notFound) {
    redirect(withParam(to, "error", "Entry no longer exists."));
  }
  redirect(withParam(to, "saved", `status-${statusCheck.data}`));
}

export async function toggleEntryFeaturedAction(
  entryId: string,
  returnTo: string,
): Promise<void> {
  await requireAdmin();
  const idCheck = z.uuid().safeParse(entryId);
  const to = safeReturnTo(returnTo);
  if (!idCheck.success) {
    redirect(withParam(to, "error", "Invalid request."));
  }

  // The DB work happens inside try/catch; redirects stay outside because
  // redirect() itself throws a control-flow error the catch would swallow.
  const [current] = await db
    .select({ featured: entries.featured })
    .from(entries)
    .where(eq(entries.id, entryId))
    .limit(1);
  if (!current) {
    redirect(withParam(to, "error", "Entry no longer exists."));
  }

  let failed = false;
  try {
    await db
      .update(entries)
      .set({ featured: !current.featured, updatedAt: new Date() })
      .where(eq(entries.id, entryId));
    revalidatePublicPaths();
  } catch (err) {
    console.error("toggleEntryFeaturedAction failed", err);
    failed = true;
  }
  if (failed) {
    redirect(withParam(to, "error", "Update failed. Please try again."));
  }
  redirect(withParam(to, "saved", "featured"));
}

// Deliberate, confirmed hard delete (admin confirms in a dialog before this
// runs). Entry-tag links cascade by design; nothing else is deleted.
export async function deleteEntryAction(
  entryId: string,
  returnTo: string,
): Promise<void> {
  await requireAdmin();
  const idCheck = z.uuid().safeParse(entryId);
  const to = safeReturnTo(returnTo);
  if (!idCheck.success) {
    redirect(withParam(to, "error", "Invalid request."));
  }

  let failed = false;
  try {
    const deleted = await db
      .delete(entries)
      .where(eq(entries.id, entryId))
      .returning({ slug: entries.slug });
    if (deleted.length) revalidatePublicPaths(deleted[0].slug);
  } catch (err) {
    console.error("deleteEntryAction failed", err);
    failed = true;
  }
  if (failed) {
    redirect(withParam(to, "error", "Delete failed. Please try again."));
  }
  redirect(withParam(to, "saved", "deleted"));
}
