import { cn } from "@/lib/utils";

/**
 * Server-rendered search form. Submits GET to the given target path so
 * results are shareable, indexable, and work without client JavaScript.
 */
export function SearchForm({
  action,
  placeholder,
  name = "q",
  label,
  className,
}: {
  action: string;
  placeholder: string;
  name?: string;
  label: string;
  className?: string;
}) {
  return (
    <form action={action} method="get" role="search" className={cn("flex", className)}>
      <label htmlFor={`search-${name}-${action.replace(/\W/g, "")}`} className="sr-only">
        {label}
      </label>
      <input
        id={`search-${name}-${action.replace(/\W/g, "")}`}
        type="search"
        name={name}
        placeholder={placeholder}
        className="field flex-1"
      />
      <button type="submit" className="btn-primary shrink-0">
        Search
      </button>
    </form>
  );
}
