import type { Metadata } from "next";
import { Container } from "@/components/container";
import { SearchForm } from "@/components/search-form";

export const metadata: Metadata = {
  title: "AI Directory",
  description:
    "Browse a curated directory of AI models, applications, developer tools, hardware, and related resources. Canonical links only.",
  alternates: { canonical: "/directory" },
};

export default function DirectoryPage() {
  return (
    <>
      <section className="border-b border-forge-700">
        <Container className="py-14">
          <h1 className="text-4xl text-bone-50">AI Directory</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ash-300">
            Models, applications, developer tools, creative tools, hardware,
            and more. Search and filters arrive with the first entries — the
            catalogue is being stocked now.
          </p>
          <div className="mt-8 max-w-xl">
            <SearchForm
              action="/directory"
              label="Search the AI directory"
              placeholder="Search the directory…"
            />
          </div>
        </Container>
      </section>
      <section aria-labelledby="catalogue-heading">
        <Container className="py-14">
          <h2 id="catalogue-heading" className="sr-only">
            Catalogue
          </h2>
          <div className="border border-forge-700 bg-forge-900 p-8 text-center">
            <p className="font-display text-sm font-semibold tracking-widest text-iron-400 uppercase">
              Catalogue empty
            </p>
            <p className="mt-2 text-sm text-ash-300">
              No entries have been published yet. Once the first entries are
              forged, they will be browsable, searchable, and filterable here.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
