// Human-readable display labels for controlled taxonomy values, plus
// entry-section helpers. UI text lives here so database enum values stay
// lowercase-kebab while the interface reads naturally.

import type {
  AccessType,
  EntryType,
  EntryStatus,
  Modality,
  ReleaseStatus,
  ResourceTypeName,
  SkillLevel,
} from "@/lib/types";
import {
  ACCESS_TYPES,
  ENTRY_TYPES,
  MODALITIES,
  RESOURCE_TYPES,
  SKILL_LEVELS,
} from "@/lib/taxonomy";

type LabelMap<T extends string> = Record<T, string>;

const ENTRY_TYPE_LABELS: LabelMap<EntryType> = {
  model: "Model",
  app: "App",
  "developer-tool": "Developer tool",
  "creative-tool": "Creative tool",
  "data-mlops": "Data & MLOps",
  agent: "Agent",
  hardware: "Hardware",
  "learning-resource": "Learning resource",
  research: "Research",
  dataset: "Dataset",
  community: "Community",
};

const SKILL_LEVEL_LABELS: LabelMap<SkillLevel> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  "all-levels": "All levels",
  unknown: "Unknown",
};

const ACCESS_LABELS: LabelMap<AccessType> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  "open-source": "Open source",
  "research-demo": "Research demo",
  unknown: "Unknown",
};

const MODALITY_LABELS: LabelMap<Modality> = {
  text: "Text",
  image: "Image",
  audio: "Audio",
  video: "Video",
  "3d-spatial": "3D / spatial",
  multimodal: "Multimodal",
  code: "Code",
  robotics: "Robotics",
  other: "Other",
};

const RELEASE_STATUS_LABELS: LabelMap<ReleaseStatus> = {
  active: "Active",
  beta: "Beta",
  deprecated: "Deprecated",
  archived: "Archived",
  unknown: "Unknown",
};

const RESOURCE_TYPE_LABELS: LabelMap<ResourceTypeName> = {
  "official-documentation": "Official documentation",
  "tutorial-guide": "Tutorial / guide",
  course: "Course",
  "book-reference": "Book / reference",
  "research-paper": "Research paper",
  "benchmark-evaluation": "Benchmark / evaluation",
  "dataset-catalog": "Dataset / catalog",
  "video-lecture": "Video / lecture",
  "community-podcast": "Community / podcast",
  certification: "Certification",
};

const ENTRY_STATUS_LABELS: LabelMap<EntryStatus> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function entryTypeLabel(value: EntryType): string {
  return ENTRY_TYPE_LABELS[value];
}

export function skillLevelLabel(value: SkillLevel): string {
  return SKILL_LEVEL_LABELS[value];
}

export function accessLabel(value: AccessType): string {
  return ACCESS_LABELS[value];
}

export function modalityLabel(value: Modality): string {
  return MODALITY_LABELS[value];
}

export function releaseStatusLabel(value: ReleaseStatus): string {
  return RELEASE_STATUS_LABELS[value];
}

export function resourceTypeLabel(value: ResourceTypeName): string {
  return RESOURCE_TYPE_LABELS[value];
}

export function entryStatusLabel(value: EntryStatus): string {
  return ENTRY_STATUS_LABELS[value];
}

export type SortOption =
  | "featured"
  | "recently-added"
  | "recently-updated"
  | "alphabetical";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "recently-added", label: "Recently added" },
  { value: "recently-updated", label: "Recently updated" },
  { value: "alphabetical", label: "Alphabetical" },
];

export function sortLabel(value: SortOption): string {
  return SORT_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export const PAGE_SIZE = 12;

// Directory listing facets. "unknown" is omitted from filter UI so it can
// never be presented as a real classification.
export const DIRECTORY_TYPE_FACETS: { value: EntryType; label: string }[] =
  ENTRY_TYPES.filter((t) => t !== "learning-resource").map((t) => ({
    value: t,
    label: ENTRY_TYPE_LABELS[t],
  }));

export const LEARN_RESOURCE_TYPE_FACETS: {
  value: ResourceTypeName;
  label: string;
}[] = RESOURCE_TYPES.map((t) => ({ value: t, label: RESOURCE_TYPE_LABELS[t] }));

export const SKILL_LEVEL_FACETS: { value: SkillLevel; label: string }[] =
  SKILL_LEVELS.filter((s) => s !== "unknown").map((s) => ({
    value: s,
    label: SKILL_LEVEL_LABELS[s],
  }));

export const ACCESS_FACETS: { value: AccessType; label: string }[] =
  ACCESS_TYPES.filter((a) => a !== "unknown").map((a) => ({
    value: a,
    label: ACCESS_LABELS[a],
  }));

export const MODALITY_FACETS: { value: Modality; label: string }[] =
  MODALITIES.map((m) => ({ value: m, label: MODALITY_LABELS[m] }));

const SECTIONS = ["directory", "learn"] as const;
export type EntrySection = (typeof SECTIONS)[number];

export function isEntrySection(value: string): value is EntrySection {
  return (SECTIONS as readonly string[]).includes(value);
}

export function sectionLabel(section: EntrySection): string {
  return section === "directory" ? "AI Directory" : "Learn";
}

// Which public section an entry belongs to. Learning resources and anything
// filed under a learn-section category render under /learn; everything else
// (including uncategorised entries) renders under /directory.
export function sectionFromEntry(entry: {
  entryType: EntryType;
  category?: { section: EntrySection } | null;
}): EntrySection {
  if (
    entry.entryType === "learning-resource" ||
    entry.category?.section === "learn"
  ) {
    return "learn";
  }
  return "directory";
}
