// Shared Zod validation schemas — used by admin forms (client) and server
// mutations alike, per AGENTS.md. URL validation rejects non-HTTP(S)
// schemes (javascript:, data:, etc.) at the schema level.

import { z } from "zod";
import {
  ACCESS_TYPES,
  ENTRY_STATUSES,
  ENTRY_TYPES,
  MODALITIES,
  RELEASE_STATUSES,
  RESOURCE_TYPES,
  SKILL_LEVELS,
} from "@/lib/taxonomy";

const urlSchema = z.url({
  protocol: /^https?$/,
  error: "Must be a valid http(s) URL",
});

const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers, hyphens");

export const httpUrlSchema = urlSchema;

export const categorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema,
  description: z.string().max(1000).optional().nullable(),
  section: z.enum(["directory", "learn"]),
});

export const tagSchema = z.object({
  name: z.string().min(1).max(80),
  slug: slugSchema,
});

// Canonical entry validation. `canonicalUrl` is required and must be
// HTTP(S); the optional logoUrl gets the same scheme check when present.
export const entrySchema = z.object({
  name: z.string().min(1).max(200),
  slug: slugSchema,
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(400),
  description: z.string().max(5000).optional().nullable(),
  canonicalUrl: urlSchema,
  entryType: z.enum(ENTRY_TYPES),
  categoryId: z.uuid().optional().nullable(),
  tagIds: z.array(z.uuid()).optional(),
  status: z.enum(ENTRY_STATUSES).default("draft"),
  featured: z.boolean().default(false),
  creator: z.string().max(200).optional().nullable(),
  license: z.string().max(200).optional().nullable(),
  access: z.array(z.enum(ACCESS_TYPES)).optional(),
  modality: z.array(z.enum(MODALITIES)).optional(),
  skillAreas: z.array(z.string().max(80)).optional(),
  skillLevel: z.enum(SKILL_LEVELS).optional().nullable(),
  releaseStatus: z.enum(RELEASE_STATUSES).optional().nullable(),
  resourceType: z.enum(RESOURCE_TYPES).optional().nullable(),
  logoUrl: urlSchema.optional().nullable(),
});

export type EntryInput = z.infer<typeof entrySchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TagInput = z.infer<typeof tagSchema>;

// Helper: slugify arbitrary text for auto-suggested slugs.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}
