// Controlled vocabularies for the directory taxonomy.
// Single source of truth: consumed by both the Drizzle schema (pgEnum) and
// the Zod validation schemas, so the database and API validation can never
// drift apart.

export const ENTRY_TYPES = [
  "model",
  "app",
  "developer-tool",
  "creative-tool",
  "data-mlops",
  "agent",
  "hardware",
  "learning-resource",
  "research",
  "dataset",
  "community",
] as const;

export const ENTRY_STATUSES = ["draft", "published", "archived"] as const;

export const CATEGORY_SECTIONS = ["directory", "learn"] as const;

export const SKILL_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "all-levels",
  "unknown",
] as const;

export const ACCESS_TYPES = [
  "free",
  "freemium",
  "paid",
  "open-source",
  "research-demo",
  "unknown",
] as const;

export const MODALITIES = [
  "text",
  "image",
  "audio",
  "video",
  "3d-spatial",
  "multimodal",
  "code",
  "robotics",
  "other",
] as const;

export const RELEASE_STATUSES = [
  "active",
  "beta",
  "deprecated",
  "archived",
  "unknown",
] as const;

export const RESOURCE_TYPES = [
  "official-documentation",
  "tutorial-guide",
  "course",
  "book-reference",
  "research-paper",
  "benchmark-evaluation",
  "dataset-catalog",
  "video-lecture",
  "community-podcast",
  "certification",
] as const;
