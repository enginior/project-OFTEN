import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  accessLabel,
  entryTypeLabel,
  type EntrySection,
} from "@/lib/labels";
import type { EntryListItem } from "@/lib/queries";
import { cn } from "@/lib/utils";

// Card for a public directory/learn entry. Links to the internal detail
// page; the external canonical link lives on the detail page only, so
// catalogue browsing stays on-site.
export function EntryCard({
  item,
  section,
  className,
}: {
  item: EntryListItem;
  section: EntrySection;
  className?: string;
}) {
  const { entry, categoryName } = item;
  return (
    <article
      className={cn(
        "flex flex-col border border-forge-700 bg-forge-900 transition-colors hover:border-ember-600",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-forge-700 px-4 py-3">
        <Badge tone="ember">{entryTypeLabel(entry.entryType)}</Badge>
        {entry.featured ? <Badge tone="brass">Featured</Badge> : null}
        {categoryName ? (
          <span className="ml-auto font-display text-xs font-medium tracking-widest text-iron-400 uppercase">
            {categoryName}
          </span>
        ) : null}
      </div>
      <div className="flex-1 px-4 py-4">
        <h3 className="text-lg leading-snug text-bone-50">
          <Link
            href={`/${section}/${entry.slug}`}
            className="no-underline transition-colors hover:text-ember-300"
          >
            {entry.name}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ash-300">
          {entry.summary}
        </p>
      </div>
      {entry.access?.length ? (
        <div className="flex flex-wrap gap-1.5 border-t border-forge-700 px-4 py-3">
          {entry.access.map((access) => (
            <Badge key={access}>{accessLabel(access)}</Badge>
          ))}
        </div>
      ) : null}
    </article>
  );
}
