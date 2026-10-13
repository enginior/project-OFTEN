import Link from "next/link";
import { cn } from "@/lib/utils";

// Numbered pagination as links so pages remain shareable and indexable.
// The window is 3 wide: current page plus one neighbour each side.
// `action` is the base path plus the current filter query (without page).
export function Pagination({
  action,
  page,
  pageCount,
  className,
}: {
  action: string;
  page: number;
  pageCount: number;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  const first = Math.max(1, page - 1);
  const last = Math.min(pageCount, page + 1);
  const pages: number[] = [];
  for (let p = first; p <= last; p += 1) pages.push(p);

  const href = (p: number) => {
    if (p === 1) return action;
    return action.includes("?")
      ? `${action}&page=${p}`
      : `${action}?page=${p}`;
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="btn-secondary no-underline"
          rel="prev"
        >
          Prev
        </Link>
      ) : null}
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "flex size-9 items-center justify-center border font-display text-sm no-underline",
            p === page
              ? "border-ember-500 bg-ember-500 text-forge-950"
              : "border-forge-700 bg-forge-900 text-ash-200 hover:border-ember-600 hover:text-bone-100",
          )}
        >
          {p}
        </Link>
      ))}
      {page < pageCount ? (
        <Link
          href={href(page + 1)}
          className="btn-secondary no-underline"
          rel="next"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}
