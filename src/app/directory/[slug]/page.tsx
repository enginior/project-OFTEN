import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { connection } from "next/server";
import { EntryDetail } from "@/components/entry-detail";
import { getPublicEntryBySlug } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

// instant = false opts this route out of instant-navigation validation so it
// may block; connection() then forces per-request rendering: headers are sent
// only after the render completes, so a draft/unknown slug returns a real 404
// (a streamed shell would leak a 200 before notFound() resolves). An admin
// publish/unpublish is also visible immediately.
export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const detail = await getPublicEntryBySlug(slug);
  if (!detail) return { title: "Entry not found" };
  const { entry } = detail;
  return {
    title: entry.name,
    description: entry.summary,
    alternates: { canonical: `/directory/${entry.slug}` },
    openGraph: {
      title: entry.name,
      description: entry.summary,
      url: `/directory/${entry.slug}`,
      type: "website",
    },
  };
}

export default async function DirectoryEntryPage({ params }: Props) {
  await connection();
  const { slug } = await params;
  const detail = await getPublicEntryBySlug(slug);
  if (!detail) notFound();
  if (detail.entry.slug !== slug) permanentRedirect(`/directory/${detail.entry.slug}`);
  return <EntryDetail data={detail} />;
}
