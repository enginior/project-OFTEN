"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error ? (
        <p
          role="alert"
          className="border border-ember-700 bg-ember-500/10 px-4 py-3 text-sm text-ember-200"
        >
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="font-display text-xs font-medium tracking-widest text-ash-200 uppercase"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          className="border border-forge-600 bg-forge-950 px-3 py-2 text-bone-50 placeholder:text-ash-400 focus:border-ember-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ember-500"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="font-display text-xs font-medium tracking-widest text-ash-200 uppercase"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          className="border border-forge-600 bg-forge-950 px-3 py-2 text-bone-50 placeholder:text-ash-400 focus:border-ember-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ember-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 bg-ember-500 px-4 py-3 font-display text-sm font-bold tracking-widest text-forge-950 uppercase transition-colors hover:bg-ember-400 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-400"
      >
        {pending ? "Verifying…" : "Sign in"}
      </button>
    </form>
  );
}
