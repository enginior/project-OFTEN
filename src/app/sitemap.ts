import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getSitemapEntries } from "@/lib/queries";

// Public site URL: NEXT_PUBLIC_SITE_URL in production, dev default locally.
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

// Generated per-request so new/removed entries are reflected without a
// redeploy, and so builds never require database access.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/directory`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/learn`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const entries = await getSitemapEntries();
  const entryRoutes: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: `${SITE_URL}/${entry.section}/${entry.slug}`,
    lastModified: entry.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...entryRoutes];
}
