import { useCallback, useEffect, useState } from "react";
import type { BitcoinHistory } from "@/lib/types";

type UseBitcoinHistoryResult = {
  history: BitcoinHistory | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

/**
 * Loads the full local BTC-USD history (downloaded and cached server-side
 * from Yahoo Finance on first request). `refresh()` forces a re-download.
 */
export function useBitcoinHistory(): UseBitcoinHistoryResult {
  const [history, setHistory] = useState<BitcoinHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (forceRefresh: boolean) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const url = forceRefresh ? "/api/bitcoin/history?refresh=1" : "/api/bitcoin/history";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as BitcoinHistory;
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { history, isLoading, isRefreshing, error, refresh };
}
