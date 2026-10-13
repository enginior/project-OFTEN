"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { slugify } from "@/lib/validation";
import { saveTagAction, type TaxonomyFormState } from "@/lib/actions/taxonomy";
import { FieldWrapper, TextInput } from "./form-field";

export type TagFormInitial = {
  id: string;
  name: string;
  slug: string;
};

export const EMPTY_TAG: TagFormInitial = {
  id: "",
  name: "",
  slug: "",
};

const initialState: TaxonomyFormState = {};

export function TagForm({ initial }: { initial: TagFormInitial }) {
  const [state, formAction, pending] = useActionState(saveTagAction, initialState);
  const [slugTouched, setSlugTouched] = useState(initial.slug !== "");
  const [slugValue, setSlugValue] = useState(initial.slug);
  const nameRef = useRef<HTMLInputElement>(null);
  const isEdit = initial.id !== "";

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="returnTo" value="/admin/tags" />

      {state.error ? (
        <p
          role="alert"
          className="border border-ember-700 bg-ember-500/10 px-4 py-3 text-sm text-ember-200"
        >
          {state.error}
        </p>
      ) : null}

      <FieldWrapper htmlFor="tag-name" label="Name *" error={state.errors?.name}>
        <TextInput
          id="tag-name"
          name="name"
          required
          maxLength={60}
          defaultValue={initial.name}
          ref={nameRef}
          onChange={() => {
            if (!slugTouched && nameRef.current) {
              setSlugValue(slugify(nameRef.current.value));
            }
          }}
        />
      </FieldWrapper>

      <FieldWrapper
        htmlFor="tag-slug"
        label="URL slug *"
        hint="Lowercase letters, numbers and hyphens. Used in tag filter links."
        error={state.errors?.slug}
      >
        <TextInput
          id="tag-slug"
          name="slug"
          required
          maxLength={60}
          value={slugValue}
          onChange={(event) => {
            setSlugTouched(true);
            setSlugValue(event.target.value);
          }}
        />
      </FieldWrapper>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : isEdit ? "Save tag" : "Create tag"}
        </button>
        {isEdit ? (
          <Link
            href="/admin/tags"
            className="text-sm text-ash-400 underline underline-offset-2 hover:text-bone"
          >
            Cancel edit
          </Link>
        ) : null}
      </div>
    </form>
  );
}
