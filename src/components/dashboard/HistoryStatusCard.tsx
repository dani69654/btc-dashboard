import { formatDate, formatTime } from "@/lib/format";
import type { BitcoinHistory } from "@/lib/types";

type HistoryStatusCardProps = {
  history: BitcoinHistory | null;
  isLoading: boolean;
  error: string | null;
};

export function HistoryStatusCard({
  history,
  isLoading,
  error,
}: HistoryStatusCardProps) {
  const points = history?.points ?? [];
  const first = points[0];
  const last = points.at(-1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-hairline bg-surface px-3.5 py-2 text-[11px] text-ink-muted">
      {error && <p className="text-critical">Download error: {error}</p>}

      {isLoading && !history && (
        <div className="h-3 w-48 animate-pulse rounded-sm bg-surface-raised" />
      )}

      {history && (
        <p className="tabular-nums">
          <span className="font-medium text-ink-soft">{points.length.toLocaleString("en-US")}</span>{" "}
          candles
          {first && last && (
            <>
              {" "}
              · <span className="text-ink-soft">{formatDate(first.date)}</span> →{" "}
              <span className="text-ink-soft">{formatDate(last.date)}</span>
            </>
          )}
          {" "}
          · sync {formatDate(history.updatedAt)} {formatTime(history.updatedAt)}
        </p>
      )}
    </div>
  );
}
