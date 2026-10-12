import Link from "next/link";
import { Container } from "@/components/container";
import { SearchForm } from "@/components/search-form";

function EmptyRack({ label }: { label: string }) {
  return (
    <div className="border border-forge-700 bg-forge-900 p-8 text-center">
      <p className="font-display text-sm font-semibold tracking-widest text-iron-400 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm text-ash-300">
        The forge is being stocked — curated entries will appear here.
      </p>
    </div>
  );
}

export default function HomePage() {
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
      <section aria-labelledby="featured-heading" className="border-b border-forge-700">
        <Container className="py-14">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="featured-heading" className="text-2xl text-bone-50">
              Editor&apos;s picks
            </h2>
            <Link
              href="/directory"
              className="font-display text-sm tracking-widest text-ember-400 uppercase no-underline hover:text-ember-300"
            >
              View all →
            </Link>
          </div>
          <div className="mt-6">
            <EmptyRack label="Nothing on this shelf yet" />
          </div>
        </Container>
      </section>

      <section aria-labelledby="recent-heading" className="border-b border-forge-700">
        <Container className="py-14">
          <h2 id="recent-heading" className="text-2xl text-bone-50">
            Recently forged
          </h2>
          <div className="mt-6">
            <EmptyRack label="No entries yet" />
          </div>
        </Container>
      </section>

      <section aria-labelledby="categories-heading">
        <Container className="py-14">
          <h2 id="categories-heading" className="text-2xl text-bone-50">
            Browse by category
          </h2>
          <div className="mt-6">
            <EmptyRack label="Categories coming online" />
          </div>
        </Container>
      </section>
    </>
  );
}
