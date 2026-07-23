"use client";

import { useMemo, useState } from "react";
import { StatTile } from "./StatTile";
import { formatCompactUsd, formatPercent, formatUsd } from "@/lib/format";
import { computeTimeframeStats, selectPointsForDays } from "@/lib/stats";
import type { BitcoinHistory } from "@/lib/types";

type TimeframeStatsProps = {
  history: BitcoinHistory | null;
};

type Period = { label: string; days: number | null };

const PERIODS: Period[] = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: null },
];

export function TimeframeStats({ history }: TimeframeStatsProps) {
  const [periodIndex, setPeriodIndex] = useState(1);

  const stats = useMemo(() => {
    const points = selectPointsForDays(history?.points ?? [], PERIODS[periodIndex].days);
    return computeTimeframeStats(points);
  }, [history, periodIndex]);

  const changeTone = stats && stats.changePercent >= 0 ? "good" : "critical";

  return (
    <div className="flex flex-col gap-2.5 rounded-sm border border-hairline bg-surface p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          BTC-USD · PERIOD STATS
        </span>

        <div className="flex items-center gap-1">
          {PERIODS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPeriodIndex(i)}
              className={`rounded-sm border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide transition-colors ${
                i === periodIndex
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-hairline text-ink-muted hover:text-ink-soft"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-hairline rounded-sm border border-hairline sm:grid-cols-4 sm:divide-y-0 sm:[&>*:nth-child(4n+1)]:border-l-0">
        <StatTile
          label="Average Price"
          value={stats ? formatUsd(stats.average) : "—"}
          tooltip="Mean of daily closing prices over the selected period: sum of closes ÷ number of days."
        />
        <StatTile
          label="Median Price"
          value={stats ? formatUsd(stats.median) : "—"}
          tooltip="Middle daily closing price over the selected period when all closes are sorted — less skewed by outlier days than the average."
        />
        <StatTile
          label="Period High"
          value={stats ? formatUsd(stats.high) : "—"}
          tone="good"
          tooltip="Highest daily 'high' price reached within the selected period."
        />
        <StatTile
          label="Period Low"
          value={stats ? formatUsd(stats.low) : "—"}
          tone="critical"
          tooltip="Lowest daily 'low' price reached within the selected period."
        />

        <StatTile
          label="Period Change"
          value={stats ? formatPercent(stats.changePercent) : "—"}
          tone={stats ? changeTone : "neutral"}
          tooltip="Percentage change from the first to the last closing price in the selected period: (last − first) ÷ first × 100."
        />
        <StatTile
          label="Max Drawdown"
          value={stats ? formatPercent(stats.maxDrawdownPercent) : "—"}
          tone="critical"
          tooltip="Largest peak-to-trough decline in closing price within the period — the worst drop an investor would have seen if they bought at the prior high."
        />
        <StatTile
          label="Best Day"
          value={stats ? formatPercent(stats.bestDayPercent) : "—"}
          tone="good"
          tooltip="Largest single-day percentage gain in closing price within the selected period."
        />
        <StatTile
          label="Worst Day"
          value={stats ? formatPercent(stats.worstDayPercent) : "—"}
          tone="critical"
          tooltip="Largest single-day percentage loss in closing price within the selected period."
        />

        <StatTile
          label="Volatility (daily)"
          value={stats ? `${stats.volatilityPercent.toFixed(2)}%` : "—"}
          sublabel={stats ? `${stats.annualizedVolatilityPercent.toFixed(0)}% annualized` : undefined}
          tooltip="Standard deviation of daily percentage returns — how much the price typically swings day to day. Annualized figure multiplies by √365 for comparison across timeframes."
        />
        <StatTile
          label="Up Days"
          value={stats ? `${stats.upDaysPercent.toFixed(0)}%` : "—"}
          tooltip="Share of days in the period that closed higher than the previous day's close."
        />
        <StatTile
          label="Avg Volume"
          value={stats ? formatCompactUsd(stats.averageVolume) : "—"}
          tooltip="Average daily trading volume (in USD) over the selected period."
        />
        <StatTile
          label="Candles"
          value={stats ? stats.pointCount.toLocaleString("en-US") : "—"}
          tooltip="Number of daily candles included in the selected period."
        />
      </div>
    </div>
  );
}
