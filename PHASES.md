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

## Phase 2 — Database architecture `[x]`

- [x] Choose ORM (Drizzle) and add dependencies (`drizzle-orm`, `postgres`, `drizzle-kit`, `zod`)
- [x] PostgreSQL schema: `users`, `entries`, `categories`, `tags`, `entry_tags` (unique slug constraints, indexes, FK integrity)
- [x] Entry fields per AGENTS.md data model: name, slug, summary, description, canonicalUrl, entryType, status, featured, timestamps + optional metadata
- [x] Docker Compose for local Postgres (never filesystem-backed storage)
- [x] Migrations via drizzle-kit (`db:generate` / `db:migrate` scripts; first migration `drizzle/0000_yellow_turbo.sql`)
- [x] Zod validation schemas shared by forms and server ops (`src/lib/validation.ts`, HTTP(S)-only URL validation)
- [x] `.env.example` with placeholders only; `.env` gitignored
- [x] Seed script (`npm run db:seed`): demo categories/entries only, no admin credentials, idempotent on slugs
- [x] Verify: migration applied to clean DB, seed verified via psql (9 categories, 8 published + 1 draft entry, 0 users), `lint`, `typecheck`, `build`

## Phase 3 — Public directory & learn UI `[x]`

- [x] `/directory`: keyword search, category/tag/type filters, sort (Featured, Recently added, Recently updated, Alphabetical), pagination
- [x] `/directory/[slug]`: entry detail linking to canonical source
- [x] `/learn` (+ detail routes): resource-type filters, skill level / access facets
- [x] Server-rendered queries returning **published entries only**
- [x] Empty, loading, and error states; shareable query params
- [x] Sitemap, robots, canonical URLs; no draft/archived leakage
- [x] Verify: build, published-only query tests, responsive check

## Phase 4 — Admin authentication `[x]`

- [x] Single-admin auth via established solution (jose HS256 JWT + bcryptjs)
- [x] Secure HttpOnly, SameSite cookies; Secure in production
- [x] Server-side session checks on every admin page and mutation route (`requireAdmin`)
- [x] Password hashing with modern library (bcryptjs, cost 12)
- [x] Rate-limited login endpoint (in-memory sliding window, 5 attempts / 10 min per IP)
- [x] `/admin/login` page; `src/proxy.ts` edge guard for unauthenticated `/admin*`
- [x] Admin dashboard shell at `src/app/admin/(dashboard)/`
- [x] One-time admin CLI (`npm run admin:create`) — never seeded
- [x] Verify: Playwright E2E (`scripts/verify-auth.ts`) — 8/8 pass on dev and production builds

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
| 2026-10-13 | 2 | `npm run db:generate`, `npm run db:migrate` on clean DB, `npm run db:seed` (re-run safe), psql verification (5 tables, 9 categories, 9 entries incl. 1 draft, 0 users), `npm run lint`, `npm run typecheck`, `npm run build` | Pass |
| 2026-10-13 | 4 | Playwright E2E (`npx tsx scripts/verify-auth.ts`) 8/8 checks against `npm run dev` AND `npm run start` (port 3100): anonymous `/admin` → login redirect, wrong-password error, valid login → dashboard, HttpOnly SameSite=Lax cookie, sign-out → home, signed-out `/admin` → login. Plus `npm run lint`, `npm run typecheck`, `npm run build` | Pass |

Fixes during Phase 4: `form action={fn}` on the login form turned a
pre-hydration submit into a native POST the browser could not follow;
switched to `fetch` + `router.push` (`handleSubmitAction` pattern) and
made `handleSubmitAction` error-safe. Added `scripts/verify-auth.ts`
(Playwright) as the durable auth regression suite; `playwright` kept as a
devDependency for Phase 5 CRUD tests.

Fixes during Phase 2: replaced malformed `drizzle.config.ts` (exported a raw
string instead of `defineConfig`, which broke drizzle-kit); corrected seed
types to use Drizzle pgEnum value types instead of plain strings.
