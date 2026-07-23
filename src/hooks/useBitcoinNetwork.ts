import { useCallback, useEffect, useState } from "react";
import type { ChainStats } from "@/lib/types";
import { useInterval } from "./useInterval";

type UseBitcoinNetworkResult = {
  stats: ChainStats | null;
  isLoading: boolean;
  error: string | null;
};

/** Polls live Bitcoin network stats (block height, fees, mempool) from mempool.space. */
export function useBitcoinNetwork(pollMs: number = 60_000): UseBitcoinNetworkResult {
  const [stats, setStats] = useState<ChainStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/bitcoin/network", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      setStats(json as ChainStats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    fetchStats();
  }, [fetchStats]);

  useInterval(fetchStats, pollMs);

  return { stats, isLoading, error };
}
