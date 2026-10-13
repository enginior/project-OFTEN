// Derived union types for the controlled vocabularies in taxonomy.ts.
// Keeping these separate avoids circular imports between taxonomy (values),
// validation (Zod schemas), and UI helpers (labels).

import type {
  ACCESS_TYPES,
  ENTRY_STATUSES,
  ENTRY_TYPES,
  MODALITIES,
  RELEASE_STATUSES,
  RESOURCE_TYPES,
  SKILL_LEVELS,
} from "@/lib/taxonomy";

export type EntryType = (typeof ENTRY_TYPES)[number];
export type EntryStatus = (typeof ENTRY_STATUSES)[number];
export type SkillLevel = (typeof SKILL_LEVELS)[number];
export type AccessType = (typeof ACCESS_TYPES)[number];
export type Modality = (typeof MODALITIES)[number];
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];
export type ResourceTypeName = (typeof RESOURCE_TYPES)[number];
