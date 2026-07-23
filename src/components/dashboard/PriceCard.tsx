import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPercent, formatTime, formatUsd } from "@/lib/format";
import type { BitcoinQuote } from "@/lib/types";

type PriceCardProps = {
  quote: BitcoinQuote | null;
  isLoading: boolean;
  error: string | null;
};

export function PriceCard({ quote, isLoading, error }: PriceCardProps) {
  if (error) {
    return (
      <Card>
        <p className="text-sm text-critical">Failed to load price: {error}</p>
      </Card>
    );
  }

  if (isLoading || !quote) {
    return (
      <Card>
        <div className="flex items-baseline gap-3">
          <div className="h-9 w-48 animate-pulse rounded-sm bg-surface-raised" />
          <div className="h-4 w-16 animate-pulse rounded-sm bg-surface-raised" />
        </div>
      </Card>
    );
  }

  const isUp = quote.change >= 0;

  return (
    <Card className="flex flex-wrap items-baseline justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-semibold tabular-nums tracking-tight text-ink">
          {formatUsd(quote.price)}
        </span>
        <Badge tone={isUp ? "good" : "critical"} icon={isUp ? "▲" : "▼"}>
          {formatPercent(quote.changePercent)}
        </Badge>
        <span className={`text-xs font-medium tabular-nums ${isUp ? "text-good" : "text-critical"}`}>
          {isUp ? "+" : ""}
          {formatUsd(quote.change)}
        </span>
      </div>

      <dl className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] tabular-nums text-ink-muted">
        <div className="flex items-center gap-1.5">
          <dt className="uppercase tracking-wide">Prev.</dt>
          <dd className="font-medium text-ink-soft">{formatUsd(quote.previousClose)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="uppercase tracking-wide">Max 24h</dt>
          <dd className="font-medium text-good">{formatUsd(quote.dayHigh)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="uppercase tracking-wide">Min 24h</dt>
          <dd className="font-medium text-critical">{formatUsd(quote.dayLow)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="uppercase tracking-wide">Time</dt>
          <dd className="font-medium text-ink-soft">{formatTime(quote.marketTime)}</dd>
        </div>
      </dl>
    </Card>
  );
}
