import Link from "next/link";
import { SORT_OPTIONS } from "@/lib/labels";
import { cn } from "@/lib/utils";

export type FacetGroup = {
  key: string;
  label: string;
  options: { value: string; label: string; count?: number }[];
  selected: string[];
};

// Server-rendered filter form. Submits GET so every filter combination is
// a shareable, indexable URL and works without client JavaScript.
// Category is rendered separately as links by the pages, since it is
// single-select ("all categories" must be reachable without JS).
export function FilterForm({
  action,
  idPrefix,
  query,
  groups,
  sort,
  hiddenFields = [],
  className,
}: {
  action: string;
  idPrefix: string;
  query: string;
  groups: FacetGroup[];
  sort: string;
  hiddenFields?: { name: string; value: string }[];
  className?: string;
}) {
  return (
    <form
      action={action}
      method="get"
      aria-label="Filter results"
      className={cn("space-y-5", className)}
    >
      {hiddenFields.map((field) => (
        <input key={field.name + field.value} type="hidden" name={field.name} value={field.value} />
      ))}
      <div>
        <label
          htmlFor={`${idPrefix}-q`}
          className="font-display text-xs font-semibold tracking-widest text-iron-400 uppercase"
        >
          Search
        </label>
        <input
          id={`${idPrefix}-q`}
          type="search"
          name="q"
          defaultValue={query}
          maxLength={200}
          className="field mt-2"
        />
      </div>

      {groups.map((group) => (
        <fieldset
          key={group.key}
          className="border border-forge-700 bg-forge-900 px-4 py-3"
        >
          <legend className="px-1 font-display text-xs font-semibold tracking-widest text-iron-400 uppercase">
            {group.label}
          </legend>
          <ul className="mt-2 space-y-1.5">
            {group.options.map((option) => {
              const id = `${idPrefix}-${group.key}-${option.value}`;
              return (
                <li key={option.value}>
                  <label
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-ash-200 hover:text-bone-100"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      name={group.key}
                      value={option.value}
                      defaultChecked={group.selected.includes(option.value)}
                      className="size-4 shrink-0 accent-ember-500"
                    />
                    <span className="flex-1">{option.label}</span>
                    {option.count !== undefined ? (
                      <span className="text-xs text-iron-400">
                        {option.count}
                      </span>
                    ) : null}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}

      <div>
        <label
          htmlFor={`${idPrefix}-sort`}
          className="font-display text-xs font-semibold tracking-widest text-iron-400 uppercase"
        >
          Sort
        </label>
        <select
          id={`${idPrefix}-sort`}
          name="sort"
          defaultValue={sort}
          className="field mt-2"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">
          Apply filters
        </button>
        <Link href={action} className="btn-secondary no-underline">
          Reset
        </Link>
      </div>
    </form>
  );
}
