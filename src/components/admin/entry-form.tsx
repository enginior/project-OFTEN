"use client";

// Create/edit entry form. Single client form reused by both new and edit
// pages; the hidden `id` field switches the bound server action between
// create and update. Validation errors come from the shared Zod schema via
// the server action and render inline per field.

import { useActionState, useRef, useState } from "react";
import {
  ENTRY_STATUSES,
  ENTRY_TYPES,
  MODALITIES,
  RELEASE_STATUSES,
  RESOURCE_TYPES,
  SKILL_LEVELS,
  ACCESS_TYPES,
} from "@/lib/taxonomy";
import {
  accessLabel,
  entryStatusLabel,
  entryTypeLabel,
  modalityLabel,
  releaseStatusLabel,
  resourceTypeLabel,
  skillLevelLabel,
  type EntrySection,
} from "@/lib/labels";
import { slugify } from "@/lib/validation";
import type { EntryFormState } from "@/lib/actions/entries";
import type { EntryFormInitial } from "./entry-form-values";
import {
  CheckboxGroup,
  FieldWrapper,
  Select,
  SingleCheckbox,
  TextArea,
  TextInput,
} from "./form-field";

const initialState: EntryFormState = {};

const ACTION_ERROR_CLASS =
  "border border-ember-700 bg-ember-500/10 px-4 py-3 text-sm text-ember-200";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-2 border-b border-forge-700 pb-2 font-display text-sm font-bold tracking-widest text-ember-400 uppercase">
      {children}
    </h3>
  );
}

export function EntryForm({
  action,
  initial,
  categories,
  tags,
}: {
  action: (state: EntryFormState, formData: FormData) => Promise<EntryFormState>;
  initial: EntryFormInitial;
  categories: { id: string; name: string; section: EntrySection }[];
  tags: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [slugTouched, setSlugTouched] = useState(initial.slug !== "");
  const [slugValue, setSlugValue] = useState(initial.slug);
  const nameRef = useRef<HTMLInputElement>(null);
  const isEdit = initial.id !== "";

  const directoryCategories = categories.filter((c) => c.section === "directory");
  const learnCategories = categories.filter((c) => c.section === "learn");

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="returnTo" value={isEdit ? "edit" : "new"} />

      {state.error ? (
        <p role="alert" className={ACTION_ERROR_CLASS}>
          {state.error}
        </p>
      ) : null}

      <section className="flex flex-col gap-6 border border-forge-700 bg-forge-900 p-6">
        <SectionHeading>Identity</SectionHeading>

        <FieldWrapper
          htmlFor="entry-name"
          label="Name *"
          error={state.errors?.name}
        >
          <TextInput
            id="entry-name"
            name="name"
            required
            maxLength={200}
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
          htmlFor="entry-slug"
          label="URL slug *"
          hint="Lowercase letters, numbers, hyphens. Used in /directory/ and /learn/ URLs."
          error={state.errors?.slug}
        >
          <TextInput
            id="entry-slug"
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
          htmlFor="entry-summary"
          label="Summary *"
          hint="Short card description shown in listings (10–400 characters)."
          error={state.errors?.summary}
        >
          <TextArea
            id="entry-summary"
            name="summary"
            required
            rows={3}
            maxLength={400}
            defaultValue={initial.summary}
          />
        </FieldWrapper>

        <FieldWrapper
          htmlFor="entry-description"
          label="Description"
          hint="Optional longer editorial description."
          error={state.errors?.description}
        >
          <TextArea
            id="entry-description"
            name="description"
            rows={6}
            maxLength={5000}
            defaultValue={initial.description}
          />
        </FieldWrapper>

        <FieldWrapper
          htmlFor="entry-canonical-url"
          label="Canonical URL *"
          hint="Must be http(s). Point to the official source, never a mirror."
          error={state.errors?.canonicalUrl}
        >
          <TextInput
            id="entry-canonical-url"
            name="canonicalUrl"
            type="url"
            required
            maxLength={500}
            defaultValue={initial.canonicalUrl}
            placeholder="https://"
          />
        </FieldWrapper>
      </section>

      <section className="flex flex-col gap-6 border border-forge-700 bg-forge-900 p-6">
        <SectionHeading>Classification</SectionHeading>

        <FieldWrapper
          htmlFor="entry-type"
          label="Entry type *"
          error={state.errors?.entryType}
        >
          <Select id="entry-type" name="entryType" defaultValue={initial.entryType}>
            {ENTRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {entryTypeLabel(type)}
              </option>
            ))}
          </Select>
        </FieldWrapper>

        <FieldWrapper
          htmlFor="entry-category"
          label="Category"
          hint="Optional. Categories are grouped by section; a learning-resource type or learn-section category files the entry under Learn."
          error={state.errors?.categoryId}
        >
          <Select
            id="entry-category"
            name="categoryId"
            defaultValue={initial.categoryId}
          >
            <option value="">— None —</option>
            {directoryCategories.length ? (
              <optgroup label="AI Directory">
                {directoryCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {learnCategories.length ? (
              <optgroup label="Learn">
                {learnCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </Select>
        </FieldWrapper>

        <FieldWrapper
          label="Tags"
          hint="Optional. Create and manage tags under Admin → Tags."
          error={state.errors?.tagIds}
        >
          {tags.length ? (
            <CheckboxGroup
              options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
              selected={initial.tagIds}
              name="tagIds"
            />
          ) : (
            <p className="text-sm text-ash-400">No tags exist yet.</p>
          )}
        </FieldWrapper>
      </section>

      <section className="flex flex-col gap-6 border border-forge-700 bg-forge-900 p-6">
        <SectionHeading>Details & metadata</SectionHeading>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FieldWrapper htmlFor="entry-creator" label="Creator / maintainer">
            <TextInput
              id="entry-creator"
              name="creator"
              maxLength={200}
              defaultValue={initial.creator}
            />
          </FieldWrapper>
          <FieldWrapper htmlFor="entry-license" label="License">
            <TextInput
              id="entry-license"
              name="license"
              maxLength={200}
              defaultValue={initial.license}
            />
          </FieldWrapper>
        </div>

        <FieldWrapper htmlFor="entry-logo-url" label="Logo / image URL">
          <TextInput
            id="entry-logo-url"
            name="logoUrl"
            type="url"
            maxLength={500}
            defaultValue={initial.logoUrl}
            placeholder="https://"
          />
        </FieldWrapper>

        <FieldWrapper
          label="Access"
          hint="How the resource can be accessed. Leave empty when unknown."
          error={state.errors?.access}
        >
          <CheckboxGroup
            options={ACCESS_TYPES.filter((a) => a !== "unknown").map((a) => ({
              value: a,
              label: accessLabel(a),
            }))}
            selected={initial.access}
            name="access"
          />
        </FieldWrapper>

        <FieldWrapper
          label="Modality"
          hint="What the resource works with."
          error={state.errors?.modality}
        >
          <CheckboxGroup
            options={MODALITIES.map((m) => ({ value: m, label: modalityLabel(m) }))}
            selected={initial.modality}
            name="modality"
          />
        </FieldWrapper>
      </section>

      <section className="flex flex-col gap-6 border border-forge-700 bg-forge-900 p-6">
        <SectionHeading>Learning resources</SectionHeading>
        <p className="text-sm text-ash-400">
          Applies mainly to learning resources; leave blank when not relevant.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FieldWrapper htmlFor="entry-resource-type" label="Resource type">
            <Select
              id="entry-resource-type"
              name="resourceType"
              defaultValue={initial.resourceType}
            >
              <option value="">— Not set —</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {resourceTypeLabel(type)}
                </option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper htmlFor="entry-skill-level" label="Skill level">
            <Select
              id="entry-skill-level"
              name="skillLevel"
              defaultValue={initial.skillLevel}
            >
              <option value="">— Not set —</option>
              {SKILL_LEVELS.filter((s) => s !== "unknown").map((level) => (
                <option key={level} value={level}>
                  {skillLevelLabel(level)}
                </option>
              ))}
            </Select>
          </FieldWrapper>
        </div>

        <FieldWrapper
          htmlFor="entry-skill-areas"
          label="Skill areas"
          hint="Comma-separated, e.g. prompting, RAG, fine-tuning. Leave empty when unknown."
          error={state.errors?.skillAreas}
        >
          <TextInput
            id="entry-skill-areas"
            name="skillAreas"
            defaultValue={initial.skillAreas}
            placeholder="prompting, RAG"
          />
        </FieldWrapper>
      </section>

      <section className="flex flex-col gap-6 border border-forge-700 bg-forge-900 p-6">
        <SectionHeading>Editorial</SectionHeading>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FieldWrapper htmlFor="entry-status" label="Status *">
            <Select id="entry-status" name="status" defaultValue={initial.status}>
              {ENTRY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {entryStatusLabel(status)}
                </option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper htmlFor="entry-release-status" label="Release status">
            <Select
              id="entry-release-status"
              name="releaseStatus"
              defaultValue={initial.releaseStatus}
            >
              <option value="">— Not set —</option>
              {RELEASE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {releaseStatusLabel(status)}
                </option>
              ))}
            </Select>
          </FieldWrapper>
          <SingleCheckbox
            name="featured"
            label="Featured"
            hint="Show on the home page as an editor's pick."
            defaultChecked={initial.featured}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create entry"}
        </button>
        <p className="text-xs text-ash-400">
          Drafts and archived entries stay hidden from the public site until
          published.
        </p>
      </div>
    </form>
  );
}
