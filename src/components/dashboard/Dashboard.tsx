"use client";

import { useBitcoinPrice } from "@/hooks/useBitcoinPrice";
import { useBitcoinHistory } from "@/hooks/useBitcoinHistory";
import { Header } from "./Header";
import { PriceCard } from "./PriceCard";
import { StatsGrid } from "./StatsGrid";
import { TimeframeStats } from "./TimeframeStats";
import { MomentumCard } from "./MomentumCard";
import { HistoryStatusCard } from "./HistoryStatusCard";
import { PriceChart } from "./PriceChart";
import { formatTime } from "@/lib/format";

export function Dashboard() {
  const { quote, isLoading: isPriceLoading, error: priceError, lastFetchedAt } = useBitcoinPrice();
  const {
    history,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useBitcoinHistory();

  return (
    <div className="flex min-h-screen flex-col bg-plane">
      <Header
        isLive={!priceError}
        lastUpdatedLabel={lastFetchedAt ? formatTime(lastFetchedAt.toISOString()) : undefined}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-4 py-4 sm:px-6">
        <PriceCard quote={quote} isLoading={isPriceLoading} error={priceError} />

        <StatsGrid quote={quote} history={history} />

        <TimeframeStats history={history} />

        <MomentumCard history={history} />

        <PriceChart history={history} isLoading={isHistoryLoading} />

        <HistoryStatusCard
          history={history}
          isLoading={isHistoryLoading}
          error={historyError}
        />
      </main>
    </div>
  );
}
