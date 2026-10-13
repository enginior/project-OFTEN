import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="border-b border-forge-700">
      <Container className="py-20">
        <p className="font-display text-sm font-semibold tracking-widest text-ember-400 uppercase">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl text-bone-50">Page not found</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ash-300">
          The page you requested does not exist, has been unpublished, or has
          moved. All linked resources in this directory point to their owners;
          if you followed a broken link, the entry may have been retired.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/directory"
            className="border border-forge-600 bg-forge-900 px-6 py-3 font-display text-sm font-semibold tracking-wide text-bone-50 uppercase transition-colors hover:border-ember-500 hover:text-ember-400"
          >
            Browse the directory
          </Link>
          <Link
            href="/learn"
            className="border border-forge-600 bg-forge-900 px-6 py-3 font-display text-sm font-semibold tracking-wide text-bone-50 uppercase transition-colors hover:border-ember-500 hover:text-ember-400"
          >
            Browse learning resources
          </Link>
        </div>
      </Container>
    </section>
  );
}
