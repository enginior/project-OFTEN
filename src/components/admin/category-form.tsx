"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { slugify } from "@/lib/validation";
import {
  saveCategoryAction,
  type TaxonomyFormState,
} from "@/lib/actions/taxonomy";
import { FieldWrapper, Select, TextArea, TextInput } from "./form-field";

export type CategoryFormInitial = {
  id: string;
  name: string;
  slug: string;
  description: string;
  section: string;
};

export const EMPTY_CATEGORY: CategoryFormInitial = {
  id: "",
  name: "",
  slug: "",
  description: "",
  section: "directory",
};

const initialState: TaxonomyFormState = {};

export function CategoryForm({ initial }: { initial: CategoryFormInitial }) {
  const [state, formAction, pending] = useActionState(
    saveCategoryAction,
    initialState,
  );
  const [slugTouched, setSlugTouched] = useState(initial.slug !== "");
  const [slugValue, setSlugValue] = useState(initial.slug);
  const nameRef = useRef<HTMLInputElement>(null);
  const isEdit = initial.id !== "";

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-6">
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="returnTo" value="/admin/categories" />

      {state.error ? (
        <p
          role="alert"
          className="border border-ember-700 bg-ember-500/10 px-4 py-3 text-sm text-ember-200"
        >
          {state.error}
        </p>
      ) : null}

      <FieldWrapper
        htmlFor="category-name"
        label="Name *"
        error={state.errors?.name}
      >
        <TextInput
          id="category-name"
          name="name"
          required
          maxLength={100}
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
        htmlFor="category-slug"
        label="URL slug *"
        hint="Lowercase letters, numbers and hyphens. Used in category filter links."
        error={state.errors?.slug}
      >
        <TextInput
          id="category-slug"
          name="slug"
          required
          maxLength={100}
          value={slugValue}
          onChange={(event) => {
            setSlugTouched(true);
            setSlugValue(event.target.value);
          }}
        />
      </FieldWrapper>

      <FieldWrapper
        htmlFor="category-section"
        label="Section *"
        hint="Where this category's listings appear on the public site."
        error={state.errors?.section}
      >
        <Select
          id="category-section"
          name="section"
          defaultValue={initial.section}
        >
          <option value="directory">AI Directory</option>
          <option value="learn">Learn / Upskill</option>
        </Select>
      </FieldWrapper>

      <FieldWrapper
        htmlFor="category-description"
        label="Description"
        hint="Optional. Editorial guidance for how the category is used."
        error={state.errors?.description}
      >
        <TextArea
          id="category-description"
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={initial.description}
        />
      </FieldWrapper>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : isEdit ? "Save category" : "Create category"}
        </button>
        {isEdit ? (
          <Link
            href="/admin/categories"
            className="text-sm text-ash-400 underline underline-offset-2 hover:text-bone"
          >
            Cancel edit
          </Link>
        ) : null}
      </div>
    </form>
  );
}
