import { StatTile } from "./StatTile";
import { formatUsd } from "@/lib/format";
import { computeRsi, computeSma } from "@/lib/stats";
import type { BitcoinHistory } from "@/lib/types";

type MomentumCardProps = {
  history: BitcoinHistory | null;
};

const SMA_PERIODS = [20, 50, 100, 200];

function rsiTone(rsi: number | null): "good" | "critical" | "neutral" {
  if (rsi == null) return "neutral";
  if (rsi >= 70) return "critical"; // overbought
  if (rsi <= 30) return "good"; // oversold
  return "neutral";
}

function rsiLabel(rsi: number | null): string | undefined {
  if (rsi == null) return undefined;
  if (rsi >= 70) return "overbought";
  if (rsi <= 30) return "oversold";
  return "neutral";
}

export function MomentumCard({ history }: MomentumCardProps) {
  const points = history?.points ?? [];
  const rsi = computeRsi(points, 14);
  const sma50 = computeSma(points, 50);
  const sma200 = computeSma(points, 200);
  const goldenCross = sma50 && sma200 ? sma50.value >= sma200.value : null;

  return (
    <div className="flex flex-col gap-2.5 rounded-sm border border-hairline bg-surface p-3.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        BTC-USD · MOVING AVERAGES &amp; MOMENTUM
      </span>

      <div className="grid grid-cols-2 divide-x divide-y divide-hairline rounded-sm border border-hairline sm:grid-cols-4 sm:divide-y-0">
        {SMA_PERIODS.map((period) => {
          const sma = computeSma(points, period);
          return (
            <StatTile
              key={period}
              label={`SMA ${period}`}
              value={sma ? formatUsd(sma.value) : "—"}
              tone={sma ? (sma.priceAboveMa ? "good" : "critical") : "neutral"}
              sublabel={sma ? (sma.priceAboveMa ? "price above" : "price below") : undefined}
              tooltip={`Simple moving average of the last ${period} daily closes: sum of those closes ÷ ${period}. Price above the line suggests an uptrend, below suggests a downtrend.`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 divide-x divide-hairline rounded-sm border border-hairline">
        <StatTile
          label="RSI (14)"
          value={rsi != null ? rsi.toFixed(1) : "—"}
          tone={rsiTone(rsi)}
          sublabel={rsiLabel(rsi)}
          tooltip="Relative Strength Index over 14 days: ratio of average recent gains to average recent losses, scaled 0–100. Above 70 is typically read as overbought, below 30 as oversold."
        />
        <StatTile
          label="SMA 50 / 200"
          value={goldenCross == null ? "—" : goldenCross ? "Golden cross" : "Death cross"}
          tone={goldenCross == null ? "neutral" : goldenCross ? "good" : "critical"}
          tooltip="Compares the 50-day and 200-day simple moving averages. 'Golden cross' (50-day ≥ 200-day) is a bullish signal; 'death cross' (50-day < 200-day) is bearish."
        />
      </div>
    </div>
  );
}
