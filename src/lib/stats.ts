import type { HistoryPoint } from "./types";

export type TimeframeStats = {
  average: number;
  median: number;
  high: number;
  low: number;
  changePercent: number;
  volatilityPercent: number;
  annualizedVolatilityPercent: number;
  maxDrawdownPercent: number;
  bestDayPercent: number;
  worstDayPercent: number;
  upDaysPercent: number;
  averageVolume: number;
  pointCount: number;
};

export type MovingAverage = {
  period: number;
  value: number;
  priceAboveMa: boolean;
};

export function selectPointsForDays(points: HistoryPoint[], days: number | null): HistoryPoint[] {
  if (days == null || points.length === 0) return points;
  const last = points.at(-1)!;
  const cutoff = new Date(last.date).getTime() - days * 24 * 60 * 60 * 1000;
  const sliced = points.filter((p) => new Date(p.date).getTime() >= cutoff);
  return sliced.length > 1 ? sliced : points;
}

/**
 * Computes summary stats for a slice of history: central tendency (mean/median),
 * range (high/low), momentum (change), risk (volatility/drawdown), and breadth
 * (up-day ratio, average volume).
 */
export function computeTimeframeStats(points: HistoryPoint[]): TimeframeStats | null {
  if (points.length === 0) return null;

  const closes = points.map((p) => p.close);
  const average = closes.reduce((sum, c) => sum + c, 0) / closes.length;

  const sortedCloses = [...closes].sort((a, b) => a - b);
  const mid = Math.floor(sortedCloses.length / 2);
  const median =
    sortedCloses.length % 2 !== 0
      ? sortedCloses[mid]
      : (sortedCloses[mid - 1] + sortedCloses[mid]) / 2;

  const high = Math.max(...points.map((p) => p.high));
  const low = Math.min(...points.map((p) => p.low));

  const first = closes[0];
  const last = closes.at(-1)!;
  const changePercent = first !== 0 ? ((last - first) / first) * 100 : 0;

  const dailyChanges: number[] = [];
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] !== 0) {
      const dailyReturn = (closes[i] - closes[i - 1]) / closes[i - 1];
      returns.push(dailyReturn);
      dailyChanges.push(dailyReturn * 100);
    }
  }
  const meanReturn = returns.length ? returns.reduce((s, r) => s + r, 0) / returns.length : 0;
  const variance = returns.length
    ? returns.reduce((s, r) => s + (r - meanReturn) ** 2, 0) / returns.length
    : 0;
  const volatilityPercent = Math.sqrt(variance) * 100;
  const annualizedVolatilityPercent = volatilityPercent * Math.sqrt(365);

  const bestDayPercent = dailyChanges.length ? Math.max(...dailyChanges) : 0;
  const worstDayPercent = dailyChanges.length ? Math.min(...dailyChanges) : 0;
  const upDaysPercent = dailyChanges.length
    ? (dailyChanges.filter((c) => c > 0).length / dailyChanges.length) * 100
    : 0;

  let peak = closes[0];
  let maxDrawdownPercent = 0;
  for (const c of closes) {
    if (c > peak) peak = c;
    const drawdown = peak !== 0 ? ((c - peak) / peak) * 100 : 0;
    if (drawdown < maxDrawdownPercent) maxDrawdownPercent = drawdown;
  }

  const averageVolume = points.reduce((sum, p) => sum + p.volume, 0) / points.length;

  return {
    average,
    median,
    high,
    low,
    changePercent,
    volatilityPercent,
    annualizedVolatilityPercent,
    maxDrawdownPercent,
    bestDayPercent,
    worstDayPercent,
    upDaysPercent,
    averageVolume,
    pointCount: points.length,
  };
}

/** Simple moving average of closing price over the trailing `period` candles. */
export function computeSma(points: HistoryPoint[], period: number): MovingAverage | null {
  if (points.length < period) return null;
  const window = points.slice(-period);
  const value = window.reduce((sum, p) => sum + p.close, 0) / period;
  const lastClose = points.at(-1)!.close;
  return { period, value, priceAboveMa: lastClose >= value };
}

/**
 * Wilder's RSI (Relative Strength Index) over the trailing `period` candles.
 * Returns null when there isn't enough history to compute it.
 */
export function computeRsi(points: HistoryPoint[], period = 14): number | null {
  if (points.length < period + 1) return null;
  const closes = points.map((p) => p.close);

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const delta = closes[i] - closes[i - 1];
    if (delta >= 0) avgGain += delta;
    else avgLoss += -delta;
  }
  avgGain /= period;
  avgLoss /= period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}
