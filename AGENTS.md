# AGENTS.md --- Hephaestus' Automaton

## Project mission

Build **Hephaestus' Automaton**, a public, curated directory and
knowledge library for AI models, apps, development tools, hardware,
research, and learning resources.

The site stores **directory metadata only**: names, descriptions,
categories, tags, links to canonical sources, and editorial metadata. It
does **not** mirror or host the underlying apps, papers, documentation,
models, or other linked content.

The public experience is read-only. The owner/admin can create, edit,
publish/unpublish, categorize, and delete directory entries through a
protected admin interface.

## Product principles

-   Make the library useful, browsable, searchable, and easy to
    maintain.
-   Link to canonical/official sources whenever possible; clearly label
    community or secondary links.
-   Do not imply an entry is endorsed, verified, free, open source, or
    current unless that has been checked and the relevant field supports
    the claim.
-   Keep the public site fast, accessible, responsive, and SEO-friendly.
-   Prefer a small, maintainable implementation over premature
    complexity.
-   Never commit secrets, credentials, or production data to the
    repository.

## Recommended stack and deployment

Use the current stable, mutually compatible versions unless the existing
repository establishes a different working baseline.

-   **Framework:** Next.js App Router with TypeScript.
-   **UI:** React, Tailwind CSS, and a small reusable component system.
    Prefer square corners and deliberate, consistent spacing.
-   **Database:** PostgreSQL hosted by a managed provider compatible
    with Vercel, such as Neon or Supabase. Vercel can host the Next.js
    app while the database is a separate managed service; do not assume
    the application filesystem is durable storage.
-   **ORM/migrations:** Drizzle ORM or Prisma. Inspect the repository
    before choosing; use one ORM, not both.
-   **Validation:** Zod or an equivalent schema validator, shared
    between forms and server-side operations where practical.
-   **Authentication:** A secure, established authentication solution or
    a carefully implemented single-admin login. Never build custom
    password storage or authentication cryptography.
-   **Hosting:** Vercel for the Next.js application, connected to the
    Git repository; managed PostgreSQL for persistent data.
-   **Testing:** Use the repository's existing test stack. Otherwise add
    focused unit/integration tests for validation, authorization, and
    CRUD behavior.

Before adding dependencies, inspect `package.json`, lockfiles, the
existing directory structure, and current project conventions. Do not
replace a working stack without a clear reason.

## Information architecture

### 1. Home

Purpose: surface a changing selection of notable and powerful AI models
and useful discoveries.

Suggested content: - Featured models/tools curated by the admin. -
Recently added or updated entries. - Popular categories. - Search entry
point. - Optional "Editor's picks" and "Recently researched" sections.

Do not claim a live ranking, benchmark, or "most powerful" status
without a defined methodology and current evidence. Prefer labels such
as "Featured," "Editor's picks," or "Notable models" when ranking
criteria are editorial.

### 2. AI Directory

Recommended public navigation label: **AI Directory**. This is clearer
and more scalable than "AI Sources."

Purpose: browse models, apps, APIs, agents, development tools, hardware,
and other AI-related products/resources.

Support search, category and tag filters, sorting, pagination or
incremental loading, and a useful empty state. Each entry should link to
its canonical source.

### 3. Learn / Upskill

Purpose: index AI education and technical references without copying
their content.

Include courses, tutorials, documentation, learning paths, books,
communities, research papers, benchmarks, datasets, and practical
guides. The UI may offer type-specific filters and difficulty labels.

### 4. About

Explain the project's purpose, curation principles, scope, and how
links/categories are maintained. Include a way to report a broken link
or suggest a resource if feasible. Be transparent that linked resources
are hosted by their respective owners.

### 5. Admin

A private, authenticated area for managing directory entries,
categories, tags, and featured status. Keep admin pages and mutation
endpoints inaccessible to anonymous users.

## Visual direction

The design should feel like a modern blacksmith's workshop: **volcanic,
industrial, assertive, precise, and high contrast**. Avoid bubbly,
rounded SaaS styling.

Suggested visual system: - Near-black / forge-charcoal backgrounds. -
Iron, ash, and warm off-white for surfaces and text. - Molten orange,
ember red, and restrained brass as accents. - Square or minimally
rounded corners; sharp dividers and grid lines. - Bold condensed or
industrial-feeling display typography paired with a highly readable body
font. - Strong labels, compact metadata, clear hierarchy, and deliberate
whitespace. - Optional restrained textures inspired by forged metal,
heat maps, or technical schematics; never at the expense of
readability. - Motion should be purposeful and subtle, with
reduced-motion support.

Avoid overusing glow effects, gradients, flames, or distressed textures.
The site should look engineered, not like a game UI mockup. Establish
design tokens for colors, spacing, borders, typography, focus rings, and
component states; reuse them consistently.

## Suggested taxonomy

Use a controlled top-level category and optional tags. Categories should
be editable by the admin rather than hard-coded into page logic.

### AI Directory categories

-   **Models** --- text/LLMs, multimodal, vision, speech/audio, image
    generation, video generation, embeddings, rerankers, code models,
    3D/spatial, small/on-device models.
-   **AI Applications** --- chat assistants, productivity,
    search/research, writing, translation, meeting notes, knowledge
    management, customer support.
-   **Developer Tools** --- coding assistants, IDE integrations,
    APIs/SDKs, agent frameworks, orchestration, evaluation,
    observability, prompt tools, testing, deployment.
-   **Creative Tools** --- image/photo editing, illustration, design,
    video editing, animation, music/audio, voice, 3D assets,
    presentation tools.
-   **Data & MLOps** --- datasets, labeling, synthetic data, vector
    databases, retrieval/RAG, pipelines, experiment tracking, model
    serving, monitoring.
-   **Agents & Automation** --- agent platforms, workflow automation,
    browser/computer-use agents, integrations.
-   **Hardware & Infrastructure** --- GPUs, accelerators, workstations,
    edge devices, inference hardware, cloud platforms, local inference,
    model runtimes.
-   **Gaming & Interactive** --- game development, NPC/character tools,
    procedural content, game AI research, interactive storytelling.
-   **Business & Industry** --- analytics, sales, marketing, finance,
    legal, healthcare, education, manufacturing, robotics, science.
-   **Research & Evaluation** --- papers, benchmarks, leaderboards,
    research labs, technical reports, evaluation suites.
-   **Communities & Organizations** --- labs, open-source communities,
    forums, events, newsletters.

### Learn / Upskill resource types

-   Official documentation
-   Tutorials and practical guides
-   Courses and learning paths
-   Books and reference material
-   Research papers and technical reports
-   Benchmarks and evaluation resources
-   Datasets and data catalogs
-   Videos, lectures, and workshops
-   Communities, newsletters, and podcasts
-   Certifications and structured programs

Suggested facets across entries: - **Skill area:** prompting, software
engineering, ML fundamentals, data engineering, agents, RAG,
fine-tuning, inference/optimization, AI safety/evaluation, creative
workflows, robotics, hardware. - **Level:** Beginner, Intermediate,
Advanced, All levels, Unknown. - **Access:** Free, Freemium, Paid, Open
source, Research/demo, Unknown. These are not mutually exclusive in
every case; model them carefully rather than forcing an inaccurate
single label. - **Status:** Active, Beta, Deprecated, Archived,
Unknown. - **Modality:** Text, Image, Audio, Video, 3D/Spatial,
Multimodal, Code, Robotics, Other.

Do not create a huge rigid taxonomy on day one. Start with the
categories that have actual entries, allow multiple tags, and make
categories/tags maintainable. Avoid duplicate categories with slightly
different spellings.

## Data model

Design a normalized schema appropriate to the chosen ORM. At minimum, an
entry should support:

-   `id`: stable primary key (UUID or equivalent).
-   `name`: required display name.
-   `slug`: unique URL-safe identifier.
-   `summary`: short card description.
-   `description`: optional longer editorial description.
-   `canonicalUrl`: required validated HTTP(S) URL.
-   `entryType`: e.g. model, app, developer tool, learning resource,
    research, dataset, hardware, community.
-   `categoryId`: reference to a category, where appropriate.
-   `tags`: many-to-many relation or equivalent normalized structure.
-   `status`: draft, published, archived; public queries return
    published entries only.
-   `featured`: boolean for editorial curation.
-   `createdAt`, `updatedAt`: timestamps.
-   Optional `creator/maintainer`, `license`, `pricing/access`,
    `modality`, `skillLevel`, `releaseStatus`, `logo/image URL`,
    `sourceType`, and `lastVerifiedAt` when useful and supported by
    data.

Use separate `Category` and `Tag` entities if the chosen ORM supports
relational data well. Add indexes for slug, publication status,
category, entry type, and fields used for common search/filter
operations. Enforce uniqueness and referential integrity in the
database, not only in the UI.

Do not add fields merely because they are conceivable. Keep optional
metadata optional, and do not invent values when they are unknown. Avoid
scraping linked sites or importing their content unless explicitly
requested and legally appropriate.

## CRUD and permissions

-   Public visitors can list, search, filter, sort, and view
    **published** entries only.
-   Only authenticated admins can create, update, publish/unpublish,
    archive, or delete entries and manage taxonomy.
-   Enforce authorization on the server for every mutation and protected
    admin read. Hiding buttons is not authorization.
-   Validate all inputs server-side. Validate URLs as HTTP(S); reject
    `javascript:`, `data:`, and other unsafe schemes.
-   Use parameterized ORM queries. Never concatenate untrusted user
    input into SQL.
-   Use CSRF protections appropriate to the authentication/session
    approach.
-   Rate-limit login and other sensitive endpoints where practical.
-   Use secure, HttpOnly, SameSite cookies and appropriate Secure
    settings in production.
-   Hash passwords with a modern password-hashing library if local
    password authentication is used. Never store plaintext passwords.
-   Keep secrets in environment variables and deployment secret
    settings. Commit only `.env.example` with placeholder values.
-   Prefer archive/soft-delete when preserving editorial history is
    useful; otherwise implement deliberate, confirmed deletion. Never
    silently delete related content through unintended cascading
    behavior.
-   Return useful validation errors without exposing stack traces,
    database details, or secrets.

## Search, browsing, and SEO

-   Support keyword search over name, summary, description, and tags
    where practical.
-   Combine search with category, type, tag, modality, skill level,
    access, and status filters when relevant.
-   Use stable, shareable query parameters for filters and pagination.
-   Provide clear sort options, such as Featured, Recently added,
    Recently updated, and Alphabetical.
-   Use server-rendered pages or server components for indexable public
    content where appropriate.
-   Add descriptive page titles, metadata, canonical URLs, Open Graph
    metadata, sitemap, and robots configuration.
-   Do not expose draft/archived entries through public pages, search
    results, metadata, or sitemaps.
-   Show a helpful broken-link/report path if feasible; do not claim
    links are live unless actually checked.

## Accessibility and responsive behavior

-   Use semantic HTML, accessible names, keyboard-operable controls,
    visible focus indicators, sufficient contrast, and sensible heading
    order.
-   Do not rely on color alone to communicate status.
-   Respect `prefers-reduced-motion`.
-   Make directory filters and admin forms usable on mobile and with
    keyboard navigation.
-   Provide loading, error, empty, and success states.
-   Avoid tiny metadata text and hover-only functionality.

## Suggested routes

Adapt these to the existing project conventions:

-   `/` --- home
-   `/directory` --- AI Directory
-   `/directory/[slug]` --- public entry detail
-   `/learn` --- education and research resources
-   `/learn/[slug]` --- learning resource detail, if separate routing
    improves the experience
-   `/about` --- project/about page
-   `/admin/login` --- admin sign-in
-   `/admin` --- admin dashboard
-   `/admin/entries` --- entry management
-   `/admin/entries/new` --- create entry
-   `/admin/entries/[id]/edit` --- edit entry
-   `/admin/categories` and `/admin/tags` --- taxonomy management

If a single `entries` table powers both directory and learning
resources, use type-specific presentation and filtering rather than
duplicating the same record across separate tables. Pick a coherent URL
strategy and keep it stable.

## Engineering workflow

Before making changes: 1. Inspect the repository structure, package
manager, scripts, current dependencies, environment examples, and
existing conventions. 2. Read existing documentation and preserve
working code unless there is a reason to change it. 3. Identify the
smallest implementation that satisfies the task and explain material
architectural decisions in the PR/commit summary.

When implementing: - Use TypeScript with strict typing; avoid `any`
unless justified and isolated. - Prefer small, composable components and
server-side data access. - Keep database access out of client
components. - Keep secrets and admin authorization logic on the
server. - Use reusable form fields and shared validation schemas. -
Provide migrations and a clear seed strategy for categories/sample
entries. - Seed only clearly identified demo/sample records; never seed
default admin credentials. - Avoid hard-coded fake metrics, fake
popularity counts, fake reviews, or invented model rankings. - Use
optimistic UI only where rollback and error handling are correct. - Keep
dependencies minimal and maintained. - Add comments for non-obvious
decisions, not for self-explanatory code. - Do not rewrite unrelated
files or perform destructive migrations without explanation and
safeguards.

## Environment and deployment

Provide an `.env.example` with variable names and safe placeholders
only. Likely variables include the database connection string and
authentication/session secrets required by the chosen implementation.
Document which variables are required for local development and
production.

Document: - Install command matching the repository's package manager. -
Local development command. - Database setup and migration commands. -
Seed command, if applicable. - Lint, type-check, test, and build
commands. - Vercel environment-variable setup and deployment steps. -
How to create the first admin securely. - Backup/export and restore
considerations for the database.

Do not assume a local SQLite file or any file written at runtime will
persist on Vercel. If SQLite is chosen for local tests, do not use a
local filesystem database as production storage on Vercel. Keep database
credentials out of client bundles and logs.

## Definition of done

A task is complete when applicable items below are satisfied:

-   Public pages work on desktop and mobile and match the forge-inspired
    square UI.
-   Public visitors cannot mutate data and never see drafts or archived
    entries.
-   Admin authentication and server-side authorization protect every
    CRUD operation.
-   Create, edit, publish/unpublish, archive/delete, and taxonomy
    operations validate inputs and show clear feedback.
-   Search, filters, pagination/sorting, and empty/error states behave
    correctly for the affected pages.
-   Database schema changes include migrations and do not
    unintentionally destroy data.
-   `lint`, type-check, relevant tests, and production build pass, or
    any pre-existing failures are clearly reported.
-   No secrets, credentials, or real user data are committed.
-   Documentation describes local setup and production deployment
    accurately.
-   External resources are linked rather than copied into the app.

## Agent communication

When reporting work, summarize: 1. What changed and why. 2. Key
files/routes affected. 3. Database migrations or environment variables
required. 4. Commands/tests run and their results. 5. Known limitations
or follow-up recommendations.

If requirements are ambiguous, choose the simplest reversible option
consistent with this document and explain the assumption. Ask only when
a decision could materially affect security, data integrity, or product
direction.
