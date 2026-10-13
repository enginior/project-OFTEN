"use client";

// Row-level admin actions (publish/unpublish, feature, delete). Rendered as
// a form whose action is a server action bound server-side to its arguments;
// the button lives in a small client component so we get a pending state and
// an optional confirmation dialog for destructive actions.

import { useFormStatus } from "react-dom";

function PendingButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel?: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={className}
    >
      {pending && pendingLabel ? pendingLabel : label}
    </button>
  );
}

export type AdminRowAction = () => Promise<void>;

const DANGER_CLASS =
  "border border-emberred-500 bg-transparent px-3 py-1.5 font-display text-xs font-semibold tracking-widest text-emberred-500 uppercase transition-colors hover:bg-emberred-500 hover:text-forge-950 disabled:cursor-not-allowed disabled:opacity-60";

const QUIET_CLASS =
  "border border-iron-600 bg-transparent px-3 py-1.5 font-display text-xs font-semibold tracking-widest text-ash-200 uppercase transition-colors hover:border-ember-500 hover:text-ember-400 disabled:cursor-not-allowed disabled:opacity-60";

export function ConfirmRowAction({
  action,
  label,
  confirmTitle,
  confirmBody,
  confirmLabel = "Delete",
}: {
  action: AdminRowAction;
  label: string;
  confirmTitle: string;
  confirmBody: string;
  confirmLabel?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `${confirmTitle}\n\n${confirmBody}\n\n${confirmLabel.toUpperCase()} — are you sure?`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <PendingButton
        label={label}
        pendingLabel="Working…"
        className={DANGER_CLASS}
      />
    </form>
  );
}

export function QuietRowAction({ action, label }: { action: AdminRowAction; label: string }) {
  return (
    <form action={action}>
      <PendingButton label={label} pendingLabel="Working…" className={QUIET_CLASS} />
    </form>
  );
}
