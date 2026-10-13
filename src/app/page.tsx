import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { EntryCard } from "@/components/entry-card";
import { SearchForm } from "@/components/search-form";
import {
  getCategoryFacets,
  getFeaturedEntries,
  getRecentEntries,
} from "@/lib/queries";

export const metadata: Metadata = {
  description:
    "Hephaestus' Automaton is a curated directory of AI models, applications, developer tools, hardware, and learning resources. Every entry links to its canonical source.",
  alternates: { canonical: "/" },
};

// Render per-request so newly published entries surface immediately; avoids
// build-time DB access on Vercel where the database is a separate service.
// Blocking is intentional: the home page is fully DB-driven.
export const instant = false;

function Rack({
  headingId,
  title,
  viewAllHref,
  children,
}: {
  headingId: string;
  title: string;
  viewAllHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={headingId} className="border-b border-forge-700">
      <Container className="py-14">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id={headingId} className="text-2xl text-bone-50">
            {title}
          </h2>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="font-display text-sm tracking-widest text-ember-400 uppercase no-underline hover:text-ember-300"
            >
              View all →
            </Link>
          ) : null}
        </div>
        <div className="mt-6">{children}</div>
      </Container>
    </section>
  );
}

// Render per-request so newly published entries surface immediately; avoids
// build-time DB access on Vercel where the database is a separate service.
export default async function HomePage() {
  await connection();
  const [featured, recent, directoryCategories, learnCategories] =
    await Promise.all([
      getFeaturedEntries(6),
      getRecentEntries(6),
      getCategoryFacets("directory"),
      getCategoryFacets("learn"),
    ]);

  const categories = [...directoryCategories, ...learnCategories];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-forge-700">
        <Container className="py-20 sm:py-28">
          <p className="font-display text-sm font-semibold tracking-[0.25em] text-ember-400 uppercase">
            Curated &middot; Independent &middot; Linked to the source
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-bone-50 sm:text-6xl">
            A forge of AI models, tools, and knowledge.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ash-300">
            Hephaestus&apos; Automaton is a curated directory of AI models,
            applications, developer tools, hardware, and learning resources.
            Every entry links to its canonical source — we host nothing but the
            metadata.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/directory" className="btn-primary no-underline">
              Browse the directory
            </Link>
            <Link href="/learn" className="btn-secondary no-underline">
              Learn &amp; upskill
            </Link>
          </div>
          <div className="mt-10 max-w-xl">
            <SearchForm
              action="/directory"
              label="Search the AI directory"
              placeholder="Search models, tools, frameworks…"
            />
          </div>
        </Container>
      </section>

      {/* Editorial shelves */}
      <Rack
        headingId="featured-heading"
        title="Editor's picks"
        viewAllHref="/directory"
      >
        {featured.length ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <li key={item.entry.id}>
                <EntryCard
                  item={item}
                  section="directory"
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nothing on this shelf yet"
            hint="Curated picks will appear here once entries are published and featured."
          />
        )}
      </Rack>

      <Rack headingId="recent-heading" title="Recently forged">
        {recent.length ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((item) => (
              <li key={item.entry.id}>
                <EntryCard
                  item={item}
                  section={item.entry.entryType === "learning-resource" ? "learn" : "directory"}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No entries yet"
            hint="Newly published entries will appear here."
          />
        )}
      </Rack>

      <Rack headingId="categories-heading" title="Browse by category">
        {categories.length ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li
                key={category.slug}
                className="border border-forge-700 bg-forge-900 px-4 py-3"
              >
                <Link
                  href={`/directory?category=${category.slug}`}
                  className="text-base no-underline transition-colors hover:text-ember-300"
                >
                  <span className="text-bone-50">{category.name}</span>
                  <span className="ml-2 font-display text-xs text-iron-400">
                    {category.entryCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Categories coming online"
            hint="Categories will appear here as the catalogue grows."
          />
        )}
      </Rack>
    </>
  );
}
