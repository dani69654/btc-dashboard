import type { ReactNode } from "react";

type BadgeTone = "good" | "critical" | "neutral" | "accent";

const TONE_CLASSES: Record<BadgeTone, string> = {
  good: "bg-good/15 text-good",
  critical: "bg-critical/15 text-critical",
  neutral: "bg-ink-muted/15 text-ink-soft",
  accent: "bg-accent/15 text-accent",
};

type BadgeProps = {
  tone: BadgeTone;
  children: ReactNode;
  icon?: ReactNode;
};

export function Badge({ tone, children, icon }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium tabular-nums ${TONE_CLASSES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
