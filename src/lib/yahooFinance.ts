import type { BitcoinQuote, HistoryPoint } from "./types";

const CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";
const SYMBOL = "BTC-USD";

type YahooChartResponse = {
  chart: {
    result: Array<{
      meta: {
        currency: string;
        symbol: string;
        regularMarketPrice: number;
        previousClose?: number;
        chartPreviousClose?: number;
        regularMarketTime: number;
        regularMarketDayHigh?: number;
        regularMarketDayLow?: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: (number | null)[];
          high: (number | null)[];
          low: (number | null)[];
          close: (number | null)[];
          volume: (number | null)[];
        }>;
      };
    }> | null;
    error: { code: string; description: string } | null;
  };
};

async function fetchYahooChart(params: Record<string, string>): Promise<YahooChartResponse> {
  const query = new URLSearchParams(params).toString();
  const url = `${CHART_BASE}/${SYMBOL}?${query}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as YahooChartResponse;
  if (json.chart.error) {
    throw new Error(`Yahoo Finance error: ${json.chart.error.description}`);
  }
  if (!json.chart.result || json.chart.result.length === 0) {
    throw new Error("Yahoo Finance returned no data");
  }
  return json;
}

/** Full daily history, from BTC-USD inception to now. */
export async function fetchBitcoinHistory(): Promise<HistoryPoint[]> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const json = await fetchYahooChart({
    // period1=0 + interval=1d forces full daily granularity; range=max
    // silently degrades to monthly candles for a history this long.
    period1: "0",
    period2: String(nowSeconds),
    interval: "1d",
  });
  const result = json.chart.result![0];
  const { timestamp } = result;
  const quote = result.indicators.quote[0];

  const points: HistoryPoint[] = [];
  for (let i = 0; i < timestamp.length; i++) {
    const close = quote.close[i];
    const open = quote.open[i];
    const high = quote.high[i];
    const low = quote.low[i];
    if (close == null || open == null || high == null || low == null) continue;

    points.push({
      timestamp: timestamp[i],
      date: new Date(timestamp[i] * 1000).toISOString().slice(0, 10),
      open,
      high,
      low,
      close,
      volume: quote.volume[i] ?? 0,
    });
  }
  return points;
}

/** Live/most-recent quote snapshot. */
export async function fetchBitcoinQuote(): Promise<BitcoinQuote> {
  const json = await fetchYahooChart({ range: "1d", interval: "5m" });
  const result = json.chart.result![0];
  const { meta } = result;

  const price = meta.regularMarketPrice;
  const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
  const change = price - previousClose;
  const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

  return {
    symbol: meta.symbol,
    currency: meta.currency,
    price,
    previousClose,
    change,
    changePercent,
    dayHigh: meta.regularMarketDayHigh ?? price,
    dayLow: meta.regularMarketDayLow ?? price,
    marketTime: new Date(meta.regularMarketTime * 1000).toISOString(),
  };
}
