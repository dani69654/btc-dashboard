import { useEffect, useState } from "react";
import type { AddressOverview } from "@/lib/types";

type UseBitcoinAddressResult = {
  data: AddressOverview | null;
  isLoading: boolean;
  error: string | null;
};

/** Loads balance and recent transactions for a Bitcoin address from our address API route. */
export function useBitcoinAddress(address: string): UseBitcoinAddressResult {
  const [data, setData] = useState<AddressOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bitcoin/address/${encodeURIComponent(address)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
        if (!cancelled) setData(json as AddressOverview);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [address]);

  return { data, isLoading, error };
}
