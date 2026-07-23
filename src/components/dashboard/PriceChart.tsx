"use client";

import { useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { formatCompactUsd, formatDate, formatUsd } from "@/lib/format";
import type { BitcoinHistory, HistoryPoint } from "@/lib/types";

type PriceChartProps = {
  history: BitcoinHistory | null;
  isLoading: boolean;
};

type Range = { label: string; days: number | null };

const RANGES: Range[] = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: null },
];

const PAD_TOP = 10;
const PAD_BOTTOM = 14;

function selectPoints(points: HistoryPoint[], days: number | null): HistoryPoint[] {
  if (days == null || points.length === 0) return points;
  const last = points.at(-1)!;
  const cutoff = new Date(last.date).getTime() - days * 24 * 60 * 60 * 1000;
  const sliced = points.filter((p) => new Date(p.date).getTime() >= cutoff);
  return sliced.length > 1 ? sliced : points;
}

export function PriceChart({ history, isLoading }: PriceChartProps) {
  const [rangeIndex, setRangeIndex] = useState(3);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const points = useMemo(
    () => selectPoints(history?.points ?? [], RANGES[rangeIndex].days),
    [history, rangeIndex],
  );

  const { linePath, areaPath, min, max, coords } = useMemo(() => {
    if (points.length === 0) {
      return { linePath: "", areaPath: "", min: 0, max: 0, coords: [] as { x: number; y: number }[] };
    }
    const closes = points.map((p) => p.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const usableHeight = 100 - PAD_TOP - PAD_BOTTOM;
    const coords = points.map((p, i) => ({
      x: points.length > 1 ? (i / (points.length - 1)) * 100 : 0,
      y: PAD_TOP + usableHeight - ((p.close - min) / range) * usableHeight,
    }));
    const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
    const area = `${line} L${coords.at(-1)!.x},100 L0,100 Z`;
    return { linePath: line, areaPath: area, min, max, coords };
  }, [points]);

  const first = points[0];
  const last = points.at(-1);
  const isUp = first && last ? last.close >= first.close : true;
  const trendColor = isUp ? "var(--color-good)" : "var(--color-critical)";
  const periodChangePct = first && last && first.close !== 0 ? ((last.close - first.close) / first.close) * 100 : 0;

  const hovered = hoverIdx != null ? points[hoverIdx] : null;
  const hoverCoord = hoverIdx != null ? coords[hoverIdx] : null;

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(fraction * (points.length - 1));
    setHoverIdx(idx);
  }

  const gridLines = [0, 1, 2, 3].map((i) => {
    const y = PAD_TOP + (i / 3) * (100 - PAD_TOP - PAD_BOTTOM);
    const price = max - (i / 3) * (max - min);
    return { y, price };
  });

  return (
    <div className="flex flex-col gap-2.5 rounded-sm border border-hairline bg-surface p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            BTC-USD · HISTORY
          </span>
          {points.length > 1 && (
            <span
              className="text-xs font-semibold tabular-nums"
              style={{ color: trendColor }}
            >
              {isUp ? "+" : ""}
              {periodChangePct.toFixed(2)}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setRangeIndex(i)}
              className={`rounded-sm border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide transition-colors ${
                i === rangeIndex
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-hairline text-ink-muted hover:text-ink-soft"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && points.length === 0 && (
        <div className="h-56 w-full animate-pulse rounded-sm bg-surface-raised" />
      )}

      {!isLoading && points.length === 0 && (
        <div className="flex h-56 items-center justify-center text-xs text-ink-muted">
          No historical data available.
        </div>
      )}

      {points.length > 0 && (
        <div
          className="relative h-56 w-full touch-none select-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIdx(null)}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id="price-area-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={trendColor} stopOpacity="0.16" />
                <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {gridLines.map((g) => (
              <line
                key={g.y}
                x1="0"
                y1={g.y}
                x2="100"
                y2={g.y}
                stroke="var(--color-grid)"
                strokeWidth="0.4"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <path d={areaPath} fill="url(#price-area-fill)" stroke="none" />
            <path
              d={linePath}
              fill="none"
              stroke={trendColor}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />

            {coords.length > 0 && (
              <>
                <circle
                  cx={coords.at(-1)!.x}
                  cy={coords.at(-1)!.y}
                  r="3"
                  fill={trendColor}
                  stroke="var(--color-surface)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
                {hoverCoord && (
                  <line
                    x1={hoverCoord.x}
                    y1="0"
                    x2={hoverCoord.x}
                    y2="100"
                    stroke="var(--color-hairline)"
                    strokeWidth="0.4"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </>
            )}
          </svg>

          {gridLines.map((g) => (
            <span
              key={g.y}
              className="pointer-events-none absolute left-0 -translate-y-1/2 text-[10px] tabular-nums text-ink-muted"
              style={{ top: `${g.y}%` }}
            >
              {formatCompactUsd(g.price)}
            </span>
          ))}

          {last && (
            <span
              className="pointer-events-none absolute right-0 -translate-y-1/2 rounded-sm bg-surface px-1 text-[10px] font-semibold tabular-nums text-ink"
              style={{ top: `${coords.at(-1)!.y}%` }}
            >
              {formatUsd(last.close)}
            </span>
          )}

          {hovered && hoverCoord && (
            <div
              className="pointer-events-none absolute top-0 flex -translate-y-1 flex-col gap-0.5 rounded-sm border border-hairline bg-surface-raised px-2 py-1 text-[11px] shadow-lg"
              style={{
                left: `${hoverCoord.x}%`,
                transform: `translateX(${hoverCoord.x > 80 ? "-100%" : hoverCoord.x < 5 ? "0%" : "-50%"})`,
              }}
            >
              <span className="text-ink-muted">{formatDate(hovered.date)}</span>
              <span className="font-semibold tabular-nums text-ink">{formatUsd(hovered.close)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
