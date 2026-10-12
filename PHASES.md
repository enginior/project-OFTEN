# PHASES.md — Hephaestus' Automaton Implementation Plan

Phased build plan for the project. The authoritative specification is
[`AGENTS.md`](./AGENTS.md); this file tracks progress against it.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` complete

---

## Phase 1 — Foundation & public UI shell `[x]`

- [x] Scaffold Next.js App Router project (TypeScript, strict, Tailwind v4, ESLint 9)
- [x] Forge design tokens: colors, typography (Oswald display / Source Sans 3 body), spacing, borders, focus states
- [x] Global styles with square corners, high contrast, `prefers-reduced-motion` support
- [x] Base layout: `SiteHeader` (nav), `SiteFooter`, `Container`, `Button`, `Badge`, `SearchForm`
- [x] Pages: `/` (home), `/about`, `/directory` (shell), `/learn` (shell)
- [x] SEO baseline: metadata, Open Graph, favicon
- [x] Verify: `lint`, `typecheck`, production `build`, smoke test all routes return 200

## Phase 2 — Database architecture `[ ]`

- [ ] Choose ORM (Drizzle recommended) and add dependencies
- [ ] PostgreSQL schema: `entries`, `categories`, `tags`, `entry_tags` (unique slug constraints, indexes, FK integrity)
- [ ] Entry fields per AGENTS.md data model: name, slug, summary, description, canonicalUrl, entryType, status, featured, timestamps + optional metadata
- [ ] Docker Compose for local Postgres (never filesystem-backed storage)
- [ ] Migrations via drizzle-kit (`generate` / `migrate` scripts)
- [ ] Zod validation schemas shared by forms and server ops (HTTP(S)-only URL validation)
- [ ] `.env.example` with placeholders only; `.env` gitignored
- [ ] Seed script: demo categories/entries only, no admin credentials
- [ ] Verify: migration applies to clean DB, typecheck, build

## Phase 3 — Public directory & learn UI `[ ]`

- [ ] `/directory`: keyword search, category/tag/type filters, sort (Featured, Recently added, Recently updated, Alphabetical), pagination
- [ ] `/directory/[slug]`: entry detail linking to canonical source
- [ ] `/learn` (+ detail routes): resource-type filters, skill level / access facets
- [ ] Server-rendered queries returning **published entries only**
- [ ] Empty, loading, and error states; shareable query params
- [ ] Sitemap, robots, canonical URLs; no draft/archived leakage
- [ ] Verify: build, published-only query tests, responsive check

## Phase 4 — Admin authentication `[ ]`

- [ ] Single-admin auth via established solution (Auth.js or equivalent)
- [ ] Secure HttpOnly, SameSite cookies; Secure in production
- [ ] Server-side session checks on every admin page and mutation route
- [ ] Password hashing with modern library (never plaintext)
- [ ] Rate-limited login endpoint
- [ ] `/admin/login` page; middleware/redirects for unauthenticated access
- [ ] Verify: anonymous access blocked to `/admin*`, auth unit tests

## Phase 5 — Admin CRUD `[ ]`

- [ ] `/admin` dashboard; `/admin/entries` management list
- [ ] Create / edit / publish / unpublish / archive / delete entries (confirmed deletion)
- [ ] `/admin/categories` and `/admin/tags` taxonomy management
- [ ] Featured toggle for editorial curation
- [ ] Server-side validation on every mutation (Zod), CSRF protection
- [ ] Clear success/error feedback; no stack traces or DB details exposed
- [ ] Verify: CRUD integration tests, authorization tests, lint/typecheck/build

## Phase 6 — Deployment & documentation `[ ]`

- [ ] Vercel deployment steps (Git-connected, env vars configured)
- [ ] Production database setup (Neon or Supabase)
- [ ] README: install, dev, migrations, seed, lint/test/build commands
- [ ] First-admin creation procedure (secure, no default credentials)
- [ ] Backup/export and restore notes
- [ ] Final sweep: lint, typecheck, tests, production build pass
- [ ] Verify: full Definition of Done checklist in AGENTS.md reviewed

---

## Verification log

| Date | Phase | Checks run | Result |
|---|---|---|---|
| 2026-10-13 | 1 | `npm run lint`, `npm run typecheck`, `npm run build`, prod-server smoke test (all routes 200) | Pass |
