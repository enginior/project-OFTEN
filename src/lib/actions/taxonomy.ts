"use server";

// Server actions for category and tag management. Same security model as
// entry actions: requireAdmin() first, shared Zod validation, friendly
// errors, redirect-with-banner feedback.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, tags } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { categorySchema, tagSchema } from "@/lib/validation";

export type TaxonomyFormState = {
  errors?: Record<string, string>;
  error?: string;
};

function revalidateTaxonomyPaths() {
  // Entries reference categories/tags, so public listings can change.
  revalidatePath("/");
  revalidatePath("/directory");
  revalidatePath("/learn");
}

function single(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function optionalText(formData: FormData, key: string): string | null {
  const value = single(formData, key).trim();
  return value === "" ? null : value;
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[]>;
  const out: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages && messages.length) out[key] = messages.join(" ");
  }
  return out;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

function safeReturnTo(value: FormDataEntryValue | null): string {
  const raw = typeof value === "string" ? value : "";
  return raw.startsWith("/admin/") ? raw : "/admin";
}

// Appends a feedback param to a returnTo path that may already carry a query
// string, so existing filters survive the redirect.
function withParam(path: string, key: string, value: string): string {
  const [base, query] = path.split("?");
  const params = new URLSearchParams(query);
  params.set(key, value);
  return `${base}?${params.toString()}`;
}

export async function saveCategoryAction(
  _prevState: TaxonomyFormState,
  formData: FormData,
): Promise<TaxonomyFormState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: single(formData, "name").trim(),
    slug: single(formData, "slug").trim(),
    description: optionalText(formData, "description"),
    section: single(formData, "section"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const input = parsed.data;

  const id = single(formData, "id");
  const isUpdate = id !== "";
  if (isUpdate) {
    const idCheck = z.uuid().safeParse(id);
    if (!idCheck.success) return { error: "Invalid category reference." };
  }

  // Slug is unique per category; name duplication is allowed but the admin
  // form suggests a slug from the name, so a collision is likely deliberate.
  const conflict = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, input.slug))
    .limit(2);
  if (
    conflict.length &&
    !(isUpdate && conflict.length === 1 && conflict[0].id === id)
  ) {
    return { errors: { slug: "A category with this URL slug already exists." } };
  }

  const values = {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    section: input.section,
    updatedAt: new Date(),
  };

  try {
    if (isUpdate) {
      const updated = await db
        .update(categories)
        .set(values)
        .where(eq(categories.id, id))
        .returning({ id: categories.id });
      if (!updated.length) return { error: "Category no longer exists." };
    } else {
      await db.insert(categories).values(values);
    }
    revalidateTaxonomyPaths();
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { errors: { slug: "A category with this URL slug already exists." } };
    }
    console.error("saveCategoryAction failed", err);
    return { error: "Saving the category failed. Please try again." };
  }

  const target = safeReturnTo(formData.get("returnTo"));
  redirect(withParam(target, "saved", isUpdate ? "updated" : "created"));
}

// Deleting a category does not delete entries: the FK sets their categoryId
// to null (they become uncategorised). The confirm dialog states this.
export async function deleteCategoryAction(
  categoryId: string,
  returnTo: string,
): Promise<void> {
  await requireAdmin();
  const idCheck = z.uuid().safeParse(categoryId);
  const to = safeReturnTo(returnTo);
  if (!idCheck.success) {
    redirect(withParam(to, "error", "Invalid request."));
  }

  // DB work inside try/catch; redirects stay outside (redirect() throws a
  // control-flow error that a catch block would swallow).
  let notFound = false;
  let failed = false;
  try {
    const deleted = await db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning({ id: categories.id });
    if (deleted.length) {
      revalidateTaxonomyPaths();
    } else {
      notFound = true;
    }
  } catch (err) {
    console.error("deleteCategoryAction failed", err);
    failed = true;
  }
  if (failed) {
    redirect(withParam(to, "error", "Delete failed. Please try again."));
  }
  if (notFound) {
    redirect(withParam(to, "error", "Category no longer exists."));
  }
  redirect(withParam(to, "saved", "deleted"));
}

export async function saveTagAction(
  _prevState: TaxonomyFormState,
  formData: FormData,
): Promise<TaxonomyFormState> {
  await requireAdmin();

  const parsed = tagSchema.safeParse({
    name: single(formData, "name").trim(),
    slug: single(formData, "slug").trim(),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const input = parsed.data;

  const id = single(formData, "id");
  const isUpdate = id !== "";
  if (isUpdate) {
    const idCheck = z.uuid().safeParse(id);
    if (!idCheck.success) return { error: "Invalid tag reference." };
  }

  const conflict = await db
    .select({ id: tags.id })
    .from(tags)
    .where(eq(tags.slug, input.slug))
    .limit(2);
  if (
    conflict.length &&
    !(isUpdate && conflict.length === 1 && conflict[0].id === id)
  ) {
    return { errors: { slug: "A tag with this URL slug already exists." } };
  }

  try {
    if (isUpdate) {
      const updated = await db
        .update(tags)
        .set({ name: input.name, slug: input.slug })
        .where(eq(tags.id, id))
        .returning({ id: tags.id });
      if (!updated.length) return { error: "Tag no longer exists." };
    } else {
      await db.insert(tags).values(input);
    }
    revalidateTaxonomyPaths();
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { errors: { slug: "A tag with this URL slug already exists." } };
    }
    console.error("saveTagAction failed", err);
    return { error: "Saving the tag failed. Please try again." };
  }

  const target = safeReturnTo(formData.get("returnTo"));
  redirect(withParam(target, "saved", isUpdate ? "updated" : "created"));
}

export async function deleteTagAction(
  tagId: string,
  returnTo: string,
): Promise<void> {
  await requireAdmin();
  const idCheck = z.uuid().safeParse(tagId);
  const to = safeReturnTo(returnTo);
  if (!idCheck.success) {
    redirect(withParam(to, "error", "Invalid request."));
  }

  let notFound = false;
  let failed = false;
  try {
    const deleted = await db
      .delete(tags)
      .where(eq(tags.id, tagId))
      .returning({ id: tags.id });
    if (deleted.length) {
      revalidateTaxonomyPaths();
    } else {
      notFound = true;
    }
  } catch (err) {
    console.error("deleteTagAction failed", err);
    failed = true;
  }
  if (failed) {
    redirect(withParam(to, "error", "Delete failed. Please try again."));
  }
  if (notFound) {
    redirect(withParam(to, "error", "Tag no longer exists."));
  }
  redirect(withParam(to, "saved", "deleted"));
}
