import { StatTile } from "./StatTile";
import { formatUsd } from "@/lib/format";
import type { BitcoinHistory, BitcoinQuote } from "@/lib/types";

type StatsGridProps = {
  quote: BitcoinQuote | null;
  history: BitcoinHistory | null;
};

export function StatsGrid({ quote, history }: StatsGridProps) {
  const points = history?.points ?? [];
  const latest = points.at(-1);
  const allTimeHigh = points.reduce(
    (max, p) => (p.high > max ? p.high : max),
    points[0]?.high ?? 0,
  );

  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-hairline rounded-sm border border-hairline bg-surface sm:grid-cols-4 sm:divide-y-0">
      <StatTile
        label="24h High"
        value={quote ? formatUsd(quote.dayHigh) : "—"}
        tone="good"
        tooltip="Highest intraday price over the last 24 hours, as reported by the live quote feed."
      />
      <StatTile
        label="24h Low"
        value={quote ? formatUsd(quote.dayLow) : "—"}
        tone="critical"
        tooltip="Lowest intraday price over the last 24 hours, as reported by the live quote feed."
      />
      <StatTile
        label="All-Time High"
        value={allTimeHigh ? formatUsd(allTimeHigh) : "—"}
        sublabel={latest ? `close ${latest.date}` : undefined}
        tooltip="Highest daily 'high' price across the entire stored history."
      />
      <StatTile
        label="Candles Stored"
        value={points.length.toLocaleString("en-US")}
        sublabel={points[0] ? `since ${points[0].date}` : undefined}
        tooltip="Number of daily OHLCV candles cached locally, from the oldest stored day to the most recent."
      />
    </div>
  );
}
