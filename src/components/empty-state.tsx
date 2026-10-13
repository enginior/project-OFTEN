import { cn } from "@/lib/utils";

// Shared empty state for listings, shelves, and facet results.
export function EmptyState({
  title,
  hint,
  className,
}: {
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("border border-forge-700 bg-forge-900 p-8 text-center", className)}>
      <p className="font-display text-sm font-semibold tracking-widest text-iron-400 uppercase">
        {title}
      </p>
      {hint ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ash-300">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
