import type { ReactNode } from "react";

type StatTileProps = {
  label: string;
  value: ReactNode;
  sublabel?: ReactNode;
  tone?: "good" | "critical" | "neutral";
  tooltip?: string;
};

const TONE_TEXT: Record<NonNullable<StatTileProps["tone"]>, string> = {
  good: "text-good",
  critical: "text-critical",
  neutral: "text-ink",
};

export function StatTile({ label, value, sublabel, tone = "neutral", tooltip }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 px-3.5 py-2.5">
      <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
        {label}
        {tooltip && (
          <span
            tabIndex={0}
            className="group relative inline-flex h-3 w-3 shrink-0 cursor-help items-center justify-center rounded-full border border-ink-muted/50 text-[8px] normal-case leading-none text-ink-muted outline-none focus-visible:border-accent focus-visible:text-accent"
          >
            i
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 w-max max-w-56 -translate-x-1/2 rounded-sm border border-hairline bg-surface-raised px-2 py-1.5 text-[10px] font-normal normal-case leading-snug text-ink-soft opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {tooltip}
            </span>
          </span>
        )}
      </span>
      <span className={`text-base font-semibold tabular-nums ${TONE_TEXT[tone]}`}>{value}</span>
      {sublabel && <span className="text-[10px] tabular-nums text-ink-muted">{sublabel}</span>}
    </div>
  );
}
