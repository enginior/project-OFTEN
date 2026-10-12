// Seed script: populates demo categories and clearly-identified sample
// entries. Per AGENTS.md, never seeds admin credentials. Safe to re-run:
// uses onConflictDoNothing on slugs.

import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and configure it."
  );
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

type CategorySeed = {
  name: string;
  slug: string;
  section: "directory" | "learn";
  description: string;
};

const CATEGORIES: CategorySeed[] = [
  {
    name: "Models",
    slug: "models",
    section: "directory",
    description: "Text, multimodal, vision, speech, and other AI models.",
  },
  {
    name: "AI Applications",
    slug: "ai-applications",
    section: "directory",
    description: "Chat assistants, productivity, writing, and research apps.",
  },
  {
    name: "Developer Tools",
    slug: "developer-tools",
    section: "directory",
    description: "Coding assistants, SDKs, agent frameworks, and evaluation.",
  },
  {
    name: "Data & MLOps",
    slug: "data-mlops",
    section: "directory",
    description: "Datasets, vector databases, retrieval, and model serving.",
  },
  {
    name: "Hardware & Infrastructure",
    slug: "hardware-infrastructure",
    section: "directory",
    description: "GPUs, accelerators, edge devices, and inference runtimes.",
  },
  {
    name: "Research & Evaluation",
    slug: "research-evaluation",
    section: "directory",
    description: "Papers, benchmarks, leaderboards, and evaluation suites.",
  },
  {
    name: "Official Documentation",
    slug: "official-documentation",
    section: "learn",
    description: "Primary documentation maintained by tool and model makers.",
  },
  {
    name: "Courses & Learning Paths",
    slug: "courses-learning-paths",
    section: "learn",
    description: "Structured courses, tutorials, and practical guides.",
  },
  {
    name: "Benchmarks & Datasets",
    slug: "benchmarks-datasets",
    section: "learn",
    description: "Evaluation resources, datasets, and data catalogs.",
  },
];

type EntrySeed = {
  name: string;
  slug: string;
  summary: string;
  canonicalUrl: string;
  entryType: (typeof schema.entryTypeEnum.enumValues)[number];
  categorySlug: string;
  status: "published" | "draft";
  featured: boolean;
  access: (typeof schema.accessTypeEnum.enumValues)[number][];
  modality?: (typeof schema.modalityEnum.enumValues)[number][];
  skillLevel?: (typeof schema.skillLevelEnum.enumValues)[number];
  releaseStatus?: (typeof schema.releaseStatusEnum.enumValues)[number];
  resourceType?: (typeof schema.resourceTypeEnum.enumValues)[number];
};

// Demo entries only — clearly identified sample data, replaceable via admin.
const ENTRIES: EntrySeed[] = [
  {
    name: "OpenAI API Documentation",
    slug: "openai-api-documentation",
    summary:
      "Official reference for OpenAI models, endpoints, and tooling. Sample seed entry.",
    canonicalUrl: "https://platform.openai.com/docs",
    entryType: "learning-resource",
    categorySlug: "official-documentation",
    status: "published",
    featured: true,
    access: ["free"],
    skillLevel: "all-levels",
    releaseStatus: "active",
    resourceType: "official-documentation",
  },
  {
    name: "Anthropic Claude Documentation",
    slug: "anthropic-claude-documentation",
    summary:
      "Official docs for Claude models, prompting guides, and API usage. Sample seed entry.",
    canonicalUrl: "https://docs.anthropic.com",
    entryType: "learning-resource",
    categorySlug: "official-documentation",
    status: "published",
    featured: true,
    access: ["free"],
    skillLevel: "all-levels",
    releaseStatus: "active",
    resourceType: "official-documentation",
  },
  {
    name: "Hugging Face Models",
    slug: "hugging-face-models",
    summary:
      "Open model hub hosting hundreds of thousands of community models. Sample seed entry.",
    canonicalUrl: "https://huggingface.co/models",
    entryType: "model",
    categorySlug: "models",
    status: "published",
    featured: true,
    access: ["free", "open-source"],
    modality: ["text", "image", "audio", "multimodal"],
    releaseStatus: "active",
  },
  {
    name: "Drizzle ORM",
    slug: "drizzle-orm",
    summary:
      "TypeScript ORM with a lightweight, SQL-like API and drizzle-kit migrations. Sample seed entry.",
    canonicalUrl: "https://orm.drizzle.team",
    entryType: "developer-tool",
    categorySlug: "developer-tools",
    status: "published",
    featured: false,
    access: ["free", "open-source"],
    skillLevel: "intermediate",
    releaseStatus: "active",
  },
  {
    name: "pgvector",
    slug: "pgvector",
    summary:
      "Open-source PostgreSQL extension for vector similarity search and RAG. Sample seed entry.",
    canonicalUrl: "https://github.com/pgvector/pgvector",
    entryType: "data-mlops",
    categorySlug: "data-mlops",
    status: "published",
    featured: false,
    access: ["free", "open-source"],
    skillLevel: "advanced",
    releaseStatus: "active",
  },
  {
    name: "Ollama",
    slug: "ollama",
    summary:
      "Run large language models locally on your own machine. Sample seed entry.",
    canonicalUrl: "https://ollama.com",
    entryType: "hardware",
    categorySlug: "hardware-infrastructure",
    status: "published",
    featured: false,
    access: ["free", "open-source"],
    modality: ["text"],
    releaseStatus: "active",
  },
  {
    name: "Papers with Code",
    slug: "papers-with-code",
    summary:
      "Research papers paired with code and leaderboards across ML tasks. Sample seed entry.",
    canonicalUrl: "https://paperswithcode.com",
    entryType: "research",
    categorySlug: "research-evaluation",
    status: "published",
    featured: false,
    access: ["free"],
    skillLevel: "advanced",
    releaseStatus: "unknown",
  },
  {
    name: "Fast.ai Practical Deep Learning",
    slug: "fastai-practical-deep-learning",
    summary:
      "Free course teaching deep learning through hands-on projects. Sample seed entry.",
    canonicalUrl: "https://course.fast.ai",
    entryType: "learning-resource",
    categorySlug: "courses-learning-paths",
    status: "published",
    featured: true,
    access: ["free", "open-source"],
    skillLevel: "beginner",
    releaseStatus: "active",
    resourceType: "course",
  },
  {
    name: "Example Draft Entry",
    slug: "example-draft-entry",
    summary:
      "A draft seed record used to verify that drafts stay hidden from public pages.",
    canonicalUrl: "https://example.com/draft",
    entryType: "app",
    categorySlug: "ai-applications",
    status: "draft",
    featured: false,
    access: ["unknown"],
    skillLevel: "unknown",
    releaseStatus: "unknown",
  },
];

async function main() {
  console.log("Seeding database...");

  const categoryIds = new Map<string, string>();
  for (const category of CATEGORIES) {
    const [row] = await db
      .insert(schema.categories)
      .values(category)
      .onConflictDoNothing({ target: schema.categories.slug })
      .returning();
    if (row) {
      categoryIds.set(category.slug, row.id);
    } else {
      const existing = await db
        .select({ id: schema.categories.id })
        .from(schema.categories)
        .where(eq(schema.categories.slug, category.slug));
      if (existing[0]) categoryIds.set(category.slug, existing[0].id);
    }
  }
  console.log(`  categories: ensured ${CATEGORIES.length}`);

  for (const entry of ENTRIES) {
    const categoryId = categoryIds.get(entry.categorySlug);
    if (!categoryId) throw new Error(`Unknown category: ${entry.categorySlug}`);
    await db
      .insert(schema.entries)
      .values({
        name: entry.name,
        slug: entry.slug,
        summary: entry.summary,
        canonicalUrl: entry.canonicalUrl,
        entryType: entry.entryType,
        categoryId,
        status: entry.status,
        featured: entry.featured,
        access: entry.access,
        modality: entry.modality ?? [],
        skillLevel: entry.skillLevel,
        releaseStatus: entry.releaseStatus,
        resourceType: entry.resourceType,
      })
      .onConflictDoNothing({ target: schema.entries.slug });
  }
  console.log(`  entries: ensured ${ENTRIES.length}`);

  console.log("Done.");
  await client.end();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
