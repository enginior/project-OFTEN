import Image from "next/image";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "AI Directory" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-forge-700 bg-forge-900">
      <div className="h-1 bg-ember-500" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 no-underline focus-visible:outline-2"
        >
          <Image
            src="/logo.png"
            alt=""
            width={36}
            height={36}
            priority
            className="size-9 shrink-0 border border-ember-600"
          />
          <span className="font-display text-lg font-bold tracking-wide text-bone-50 uppercase">
            Hephaestus&apos; Automaton
          </span>
        </Link>
        <nav aria-label="Main navigation" className="ml-auto">
          <ul className="flex items-center gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-3 py-2 font-display text-sm font-medium tracking-widest text-ash-200 uppercase no-underline transition-colors hover:text-ember-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
