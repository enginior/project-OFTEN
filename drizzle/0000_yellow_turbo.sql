CREATE TYPE "public"."access_type" AS ENUM('free', 'freemium', 'paid', 'open-source', 'research-demo', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."category_section" AS ENUM('directory', 'learn');--> statement-breakpoint
CREATE TYPE "public"."entry_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."entry_type" AS ENUM('model', 'app', 'developer-tool', 'creative-tool', 'data-mlops', 'agent', 'hardware', 'learning-resource', 'research', 'dataset', 'community');--> statement-breakpoint
CREATE TYPE "public"."modality" AS ENUM('text', 'image', 'audio', 'video', '3d-spatial', 'multimodal', 'code', 'robotics', 'other');--> statement-breakpoint
CREATE TYPE "public"."release_status" AS ENUM('active', 'beta', 'deprecated', 'archived', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('official-documentation', 'tutorial-guide', 'course', 'book-reference', 'research-paper', 'benchmark-evaluation', 'dataset-catalog', 'video-lecture', 'community-podcast', 'certification');--> statement-breakpoint
CREATE TYPE "public"."skill_level" AS ENUM('beginner', 'intermediate', 'advanced', 'all-levels', 'unknown');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"section" "category_section" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text NOT NULL,
	"description" text,
	"canonical_url" text NOT NULL,
	"entry_type" "entry_type" NOT NULL,
	"category_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"creator" text,
	"license" text,
	"access" "access_type"[],
	"modality" "modality"[],
	"skill_areas" text[],
	"skill_level" "skill_level",
	"release_status" "release_status",
	"resource_type" "resource_type",
	"logo_url" text,
	"last_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "entry_tags" (
	"entry_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "entry_tags_entry_id_tag_id_pk" PRIMARY KEY("entry_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_tags" ADD CONSTRAINT "entry_tags_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_tags" ADD CONSTRAINT "entry_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_section_idx" ON "categories" USING btree ("section");--> statement-breakpoint
CREATE INDEX "entries_status_idx" ON "entries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "entries_category_idx" ON "entries" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "entries_type_idx" ON "entries" USING btree ("entry_type");--> statement-breakpoint
CREATE INDEX "entries_featured_idx" ON "entries" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "entries_created_at_idx" ON "entries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "entry_tags_tag_id_idx" ON "entry_tags" USING btree ("tag_id");