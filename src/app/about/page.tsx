import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Hephaestus' Automaton is, how it is curated, and how links and categories are maintained.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    title: "Curated, not scraped",
    body: "Entries are selected and described by a human editor. We do not mirror or host the linked apps, papers, models, or documentation.",
  },
  {
    title: "Canonical links only",
    body: "Every entry points to its official or canonical source. Community or secondary links are clearly labeled.",
  },
  {
    title: "Claims are earned",
    body: "Nothing is called free, open source, verified, or current unless the entry's fields actually support the claim.",
  },
  {
    title: "Editorial, not ranked",
    body: "Featured picks are curated by the editor. We do not present live rankings or benchmarks without a published methodology.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-forge-700">
        <Container className="py-14">
          <h1 className="text-4xl text-bone-50">About</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ash-300">
            Hephaestus&apos; Automaton is a public, curated directory and
            knowledge library for AI models, applications, development tools,
            hardware, research, and learning resources.
          </p>
        </Container>
      </section>
      <section aria-labelledby="principles-heading">
        <Container className="py-14">
          <h2 id="principles-heading" className="text-2xl text-bone-50">
            Curation principles
          </h2>
          <dl className="mt-8 grid gap-6 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="border border-forge-700 bg-forge-900 p-6">
                <dt className="font-display text-base font-semibold tracking-wide text-ember-400 uppercase">
                  {p.title}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ash-300">
                  {p.body}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
      <section aria-labelledby="maintenance-heading" className="border-b-0">
        <Container className="py-14">
          <h2 id="maintenance-heading" className="text-2xl text-bone-50">
            Scope &amp; maintenance
          </h2>
          <div className="mt-4 max-w-2xl space-y-4 text-sm leading-relaxed text-ash-300">
            <p>
              The site stores directory metadata only: names, descriptions,
              categories, tags, and links to canonical sources. All linked
              resources are hosted by their respective owners.
            </p>
            <p>
              Categories and tags are maintained by the site&apos;s editor and
              evolve as the catalogue grows. Spotted a broken link or want to
              suggest a resource? Reach the maintainer via the project&apos;s
              repository or contact channel.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
