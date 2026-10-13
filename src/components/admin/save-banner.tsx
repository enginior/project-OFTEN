// Feedback banner for list pages. Server actions redirect back with
// ?saved=... or ?error=...; this renders the banner from those params.

import type { ReactNode } from "react";

export type PageFeedback = {
  saved?: string;
  error?: string;
};

const SAVED_MESSAGES: Record<string, string> = {
  created: "Created.",
  updated: "Changes saved.",
  deleted: "Deleted.",
  featured: "Featured status updated.",
  "status-draft": "Entry set to draft.",
  "status-published": "Entry published.",
  "status-archived": "Entry archived.",
};

export function savedMessage(saved: string | undefined): string | null {
  if (!saved) return null;
  return SAVED_MESSAGES[saved] ?? "Saved.";
}

export function SaveBanner({ feedback }: { feedback: PageFeedback }) {
  if (!feedback.saved && !feedback.error) return null;
  return feedback.error ? (
    <p
      role="alert"
      className="border border-ember-700 bg-ember-500/10 px-4 py-3 text-sm text-ember-200"
    >
      {feedback.error}
    </p>
  ) : (
    <p
      role="status"
      className="border border-brass-600 bg-brass-500/10 px-4 py-3 text-sm text-brass-300"
    >
      {savedMessage(feedback.saved)}
    </p>
  );
}

// Extracts feedback params from a page's searchParams. Unknown params are
// dropped so only intentional messages ever render.
export function parseFeedback(
  params: Record<string, string | string[] | undefined>,
): PageFeedback {
  const single = (key: string): string | undefined => {
    const value = params[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };
  return {
    saved: single("saved"),
    error: single("error"),
  };
}

export function FeedbackSlot({ children }: { children: ReactNode }) {
  return <div aria-live="polite">{children}</div>;
}
