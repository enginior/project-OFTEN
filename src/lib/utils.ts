export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatShortDate(date: Date | string): string {
  return SHORT_DATE.format(new Date(date));
}

// Only http(s) URLs are ever rendered as outbound links. This guards against
// javascript:, data:, and other unsafe schemes reaching the DOM.
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
