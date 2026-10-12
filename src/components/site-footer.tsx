import Link from "next/link";

const FOOTER_NAV = [
  { href: "/directory", label: "AI Directory" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
];

const COPYRIGHT_YEAR = 2026;

export function SiteFooter() {
  return (
    <footer className="border-t border-forge-700 bg-forge-900">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-base font-bold tracking-wide text-bone-50 uppercase">
            Hephaestus&apos; Automaton
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ash-300">
            A curated, public library of AI models, tools, and learning
            resources. Directory metadata only — everything links back to its
            canonical source.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <p className="font-display text-sm font-semibold tracking-widest text-iron-400 uppercase">
            Navigate
          </p>
          <ul className="mt-3 space-y-2">
            {FOOTER_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-ash-300 no-underline transition-colors hover:text-ember-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-display text-sm font-semibold tracking-widest text-iron-400 uppercase">
            Colophon
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ash-300">
            <li>
              External resources are hosted by their respective owners.
            </li>
            <li>
              Curation is editorial and independent — listings are not
              endorsements unless stated.
            </li>
            <li>
              &copy; {COPYRIGHT_YEAR} enginior. MIT License.
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
