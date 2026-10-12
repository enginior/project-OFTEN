import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "ember" | "brass";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "border-iron-600 text-ash-300",
  ember: "border-ember-600 text-ember-400",
  brass: "border-brass-600 text-brass-400",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 font-display text-xs font-medium tracking-widest uppercase",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
