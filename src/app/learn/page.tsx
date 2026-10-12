import type { Metadata } from "next";
import { Container } from "@/components/container";
import { SearchForm } from "@/components/search-form";

export const metadata: Metadata = {
  title: "Learn & Upskill",
  description:
    "A curated index of AI education and technical references: documentation, courses, books, research papers, benchmarks, and datasets.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  return (
    <>
      <section className="border-b border-forge-700">
        <Container className="py-14">
          <h1 className="text-4xl text-bone-50">Learn &amp; Upskill</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ash-300">
            Documentation, courses, tutorials, books, research papers,
            benchmarks, and datasets — indexed, not copied. Every resource
            links to its canonical home.
          </p>
          <div className="mt-8 max-w-xl">
            <SearchForm
              action="/learn"
              label="Search learning resources"
              placeholder="Search courses, papers, docs…"
            />
          </div>
        </Container>
      </section>
      <section aria-labelledby="library-heading">
        <Container className="py-14">
          <h2 id="library-heading" className="sr-only">
            Resource library
          </h2>
          <div className="border border-forge-700 bg-forge-900 p-8 text-center">
            <p className="font-display text-sm font-semibold tracking-widest text-iron-400 uppercase">
              Library empty
            </p>
            <p className="mt-2 text-sm text-ash-300">
              No learning resources have been published yet. The first batch
              will be indexed here shortly.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
