import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  accessLabel,
  entryTypeLabel,
  modalityLabel,
  releaseStatusLabel,
  resourceTypeLabel,
  sectionFromEntry,
  skillLevelLabel,
} from "@/lib/labels";
import { formatShortDate, isHttpUrl } from "@/lib/utils";
import type { EntryDetail as EntryDetailData } from "@/lib/queries";

// Public detail view for one entry. Only links out when canonicalUrl is a
// verified http(s) URL. Learn resources get a resource-type line and a
// skill-level badge; directory entries get modality chips.
export function EntryDetail({ data }: { data: EntryDetailData }) {
  const { entry, category, entryTags } = data;
  const section = sectionFromEntry(entry);
  const safeUrl = isHttpUrl(entry.canonicalUrl) ? entry.canonicalUrl : null;

  const chips: { label: string; tone: "neutral" | "brass" }[] = [];
  if (entry.releaseStatus && entry.releaseStatus !== "unknown")
    chips.push({
      label: releaseStatusLabel(entry.releaseStatus),
      tone: "neutral",
    });
  if (entry.skillLevel && entry.skillLevel !== "unknown")
    chips.push({ label: skillLevelLabel(entry.skillLevel), tone: "brass" });

  return (
    <article className="border border-forge-700 bg-forge-900">
      <header className="border-b border-forge-700 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="ember">{entryTypeLabel(entry.entryType)}</Badge>
          {entry.featured ? <Badge tone="brass">Featured</Badge> : null}
          {category ? (
            <Link
              href={`/${section}?category=${category.slug}`}
              className="font-display text-xs font-medium tracking-widest text-iron-400 no-underline uppercase transition-colors hover:text-ember-300"
            >
              {category.name}
            </Link>
          ) : null}
          <span className="ml-auto font-display text-xs text-iron-400">
            Added {formatShortDate(entry.createdAt)}
          </span>
        </div>
        <h1 className="mt-3 text-2xl text-bone-50 sm:text-3xl">
          {entry.name}
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-ash-300">
          {entry.summary}
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b border-forge-700 px-5 py-4 sm:px-6">
        {safeUrl ? (
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary no-underline"
          >
            Visit source ↗
          </a>
        ) : null}
        {entry.access?.map((access) => (
          <Badge key={access}>{accessLabel(access)}</Badge>
        ))}
        {chips.map((chip) => (
          <Badge key={chip.label} tone={chip.tone}>
            {chip.label}
          </Badge>
        ))}
      </div>

      {entry.description ? (
        <section className="border-b border-forge-700 px-5 py-5 sm:px-6 sm:py-6">
          <h2 className="font-display text-sm font-semibold tracking-widest text-iron-400 uppercase">
            About
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-ash-200 whitespace-pre-line">
            {entry.description}
          </p>
        </section>
      ) : null}

      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 px-5 py-5 sm:grid-cols-2 sm:px-6 sm:py-6">
        {entry.creator ? (
          <div>
            <dt className="font-display text-xs font-semibold tracking-widest text-iron-400 uppercase">
              Creator / maintainer
            </dt>
            <dd className="mt-1 text-sm text-ash-200">{entry.creator}</dd>
          </div>
        ) : null}
        {entry.license ? (
          <div>
            <dt className="font-display text-xs font-semibold tracking-widest text-iron-400 uppercase">
              License
            </dt>
            <dd className="mt-1 text-sm text-ash-200">{entry.license}</dd>
          </div>
        ) : null}
        {section === "learn" ? (
          <div>
            <dt className="font-display text-xs font-semibold tracking-widest text-iron-400 uppercase">
              Resource type
            </dt>
            <dd className="mt-1 text-sm text-ash-200">
              {entry.resourceType ? resourceTypeLabel(entry.resourceType) : "Unspecified"}
            </dd>
          </div>
        ) : entry.modality?.length ? (
          <div>
            <dt className="font-display text-xs font-semibold tracking-widest text-iron-400 uppercase">
              Modalities
            </dt>
            <dd className="mt-1 text-sm text-ash-200">
              {entry.modality.map(modalityLabel).join(", ")}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="font-display text-xs font-semibold tracking-widest text-iron-400 uppercase">
            Last updated
          </dt>
          <dd className="mt-1 text-sm text-ash-200">
            {formatShortDate(entry.updatedAt)}
          </dd>
        </div>
      </dl>

      {entryTags.length ? (
        <div className="flex flex-wrap gap-1.5 border-t border-forge-700 px-5 py-4 sm:px-6">
          {entryTags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/${section}?tag=${encodeURIComponent(tag.slug)}`}
              className="no-underline"
            >
              <Badge tone="neutral">#{tag.name}</Badge>
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
