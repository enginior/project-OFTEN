// Presentational admin form primitives. Server-usable (no client hooks) so
// both server pages and client forms can render them. They build on the
// shared component classes in globals.css (.field, .btn-*) so styling stays
// consistent across the app. ref/onChange are accepted because controlled
// suggestions (e.g. slug-from-name) live in client forms.

const LABEL_CLASS =
  "font-display text-xs font-medium tracking-widest text-ash-200 uppercase";

const HINT_CLASS = "mt-1 text-xs text-ash-400";

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={LABEL_CLASS}>
      {children}
    </label>
  );
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className={HINT_CLASS}>{children}</p>;
}

export function FieldError({ children }: { children: string }) {
  return (
    <p role="alert" className="mt-1 text-xs text-ember-300">
      {children}
    </p>
  );
}

export function FieldWrapper({
  htmlFor,
  label,
  hint,
  error,
  children,
}: {
  htmlFor?: string;
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && htmlFor ? (
        <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      ) : null}
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      {children}
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

export function TextInput(props: React.ComponentProps<"input">) {
  return <input {...props} className="field" />;
}

export function TextArea(props: React.ComponentProps<"textarea">) {
  return <textarea {...props} className="field resize-y" />;
}

export function Select(props: {
  id: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <select
      id={props.id}
      name={props.name}
      defaultValue={props.defaultValue}
      className="field"
    >
      {props.children}
    </select>
  );
}

export function CheckboxRow(props: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 border border-iron-600 bg-forge-900 px-3 py-2 text-sm text-ash-200 transition-colors hover:border-iron-500">
      <input
        type="checkbox"
        name={props.name}
        value={props.value}
        defaultChecked={props.defaultChecked}
        className="size-4 accent-ember-500"
      />
      {props.label}
    </label>
  );
}

export function SingleCheckbox(props: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          name={props.name}
          defaultChecked={props.defaultChecked}
          className="size-4 accent-ember-500"
        />
        <span className={LABEL_CLASS}>{props.label}</span>
      </label>
      {props.hint ? <FieldHint>{props.hint}</FieldHint> : null}
    </div>
  );
}

export function CheckboxGroup({
  options,
  selected,
  name,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  name: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <CheckboxRow
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          defaultChecked={selected.includes(option.value)}
        />
      ))}
    </div>
  );
}
