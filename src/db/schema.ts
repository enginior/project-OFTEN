// Drizzle schema for Hephaestus' Automaton.
//
// Content model: directory metadata only. Entries link to canonical
// external sources; the app never hosts or mirrors the underlying
// resources.
//
// Public queries must filter on status = 'published' (enforced at the
// query layer in Phase 3, not via views, to keep admin writes simple).

import {
  boolean,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  ACCESS_TYPES,
  CATEGORY_SECTIONS,
  ENTRY_STATUSES,
  ENTRY_TYPES,
  MODALITIES,
  RELEASE_STATUSES,
  RESOURCE_TYPES,
  SKILL_LEVELS,
} from "@/lib/taxonomy";

export const entryStatusEnum = pgEnum("entry_status", ENTRY_STATUSES);
export const entryTypeEnum = pgEnum("entry_type", ENTRY_TYPES);
export const categorySectionEnum = pgEnum("category_section", CATEGORY_SECTIONS);
export const skillLevelEnum = pgEnum("skill_level", SKILL_LEVELS);
export const accessTypeEnum = pgEnum("access_type", ACCESS_TYPES);
export const modalityEnum = pgEnum("modality", MODALITIES);
export const releaseStatusEnum = pgEnum("release_status", RELEASE_STATUSES);
export const resourceTypeEnum = pgEnum("resource_type", RESOURCE_TYPES);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  // bcrypt/argon2 hash — never plaintext. Populated via a one-time CLI
  // script in Phase 4, not by the seed.
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    section: categorySectionEnum("section").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("categories_section_idx").on(t.section)],
);

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const entries = pgTable(
  "entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    summary: text("summary").notNull(),
    description: text("description"),
    canonicalUrl: text("canonical_url").notNull(),
    entryType: entryTypeEnum("entry_type").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
      // Deleting a category must not delete its entries.
      onDelete: "set null",
    }),
    status: entryStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    // Optional metadata — left null when unknown, never invented.
    creator: text("creator"),
    license: text("license"),
    access: accessTypeEnum("access").array(),
    modality: modalityEnum("modality").array(),
    skillAreas: text("skill_areas").array(),
    skillLevel: skillLevelEnum("skill_level"),
    releaseStatus: releaseStatusEnum("release_status"),
    // Learning-resource-specific classification.
    resourceType: resourceTypeEnum("resource_type"),
    logoUrl: text("logo_url"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("entries_status_idx").on(t.status),
    index("entries_category_idx").on(t.categoryId),
    index("entries_type_idx").on(t.entryType),
    index("entries_featured_idx").on(t.featured),
    index("entries_created_at_idx").on(t.createdAt),
  ],
);

export const entryTags = pgTable(
  "entry_tags",
  {
    entryId: uuid("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.entryId, t.tagId] }),
    index("entry_tags_tag_id_idx").on(t.tagId),
  ],
);

// Convenience SQL for keyword search over name/summary/description/tags
// is handled at the query layer (Phase 3) using ILIKE; a full-text
// tsvector + GIN index is a documented follow-up once the corpus grows.

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type EntryTag = typeof entryTags.$inferSelect;
