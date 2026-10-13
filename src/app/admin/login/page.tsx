import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  description: "Restricted area.",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-forge-950">
      <div className="h-1 bg-ember-500" aria-hidden="true" />
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center border border-ember-600 bg-ember-500 font-display text-lg font-bold text-forge-950"
            >
              H
            </span>
            <div>
              <p className="font-display text-lg font-bold tracking-wide text-bone-50 uppercase">
                Hephaestus&apos; Automaton
              </p>
              <p className="font-display text-xs tracking-widest text-ash-400 uppercase">
                Admin workshop
              </p>
            </div>
          </div>
          <div className="border border-forge-700 bg-forge-900 p-6 sm:p-8">
            <h1 className="mb-6 font-display text-xl font-bold tracking-wide text-bone-50 uppercase">
              Sign in
            </h1>
            <LoginForm />
          </div>
          <p className="mt-6 text-center">
            <Link
              href="/"
              className="font-display text-xs tracking-widest text-ash-400 uppercase no-underline transition-colors hover:text-ember-400"
            >
              Back to the forge
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
