import { useCallback, useEffect, useState } from "react";
import type { BitcoinQuote } from "@/lib/types";
import { useInterval } from "./useInterval";

type UseBitcoinPriceResult = {
  quote: BitcoinQuote | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
};

/** Polls the live BTC-USD quote at a fixed interval (default 30s). */
export function useBitcoinPrice(pollMs: number = 30_000): UseBitcoinPriceResult {
  const [quote, setQuote] = useState<BitcoinQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const fetchQuote = useCallback(async () => {
    try {
      const res = await fetch("/api/bitcoin/price", { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as BitcoinQuote;
      setQuote(data);
      setError(null);
      setLastFetchedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    fetchQuote();
  }, [fetchQuote]);

  useInterval(fetchQuote, pollMs);

  return { quote, isLoading, error, lastFetchedAt };
}
