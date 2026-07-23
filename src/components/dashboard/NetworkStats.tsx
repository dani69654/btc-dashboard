import { StatTile } from "./StatTile";
import { formatBlockHeight } from "@/lib/format";
import type { ChainStats } from "@/lib/types";

type NetworkStatsProps = {
  stats: ChainStats | null;
  isLoading: boolean;
  error: string | null;
};

function formatFee(satsPerVb: number): string {
  return `${satsPerVb} sat/vB`;
}

function formatVsize(vsize: number): string {
  if (vsize >= 1_000_000) return `${(vsize / 1_000_000).toFixed(1)} MvB`;
  if (vsize >= 1_000) return `${(vsize / 1_000).toFixed(0)} kvB`;
  return `${vsize} vB`;
}

export function NetworkStats({ stats, isLoading, error }: NetworkStatsProps) {
  if (error && !stats) {
    return (
      <div className="rounded-sm border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-xs text-critical">
        Network data unavailable: {error}
      </div>
    );
  }

  if (isLoading && !stats) {
    return <div className="h-20 w-full animate-pulse rounded-sm bg-surface-raised" />;
  }

  if (!stats) return null;

  const difficultySign = stats.difficulty.changePercent > 0 ? "+" : "";

  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-hairline rounded-sm border border-hairline bg-surface sm:grid-cols-4 sm:divide-y-0">
      <StatTile
        label="Block Height"
        value={formatBlockHeight(stats.blockHeight)}
        tooltip="Height of the latest confirmed block on the Bitcoin blockchain."
      />
      <StatTile
        label="Mempool"
        value={stats.mempoolTxCount.toLocaleString("en-US")}
        sublabel={formatVsize(stats.mempoolVsize)}
        tooltip="Unconfirmed transactions waiting to be included in a block, plus total virtual size."
      />
      <StatTile
        label="Next Block Fee"
        value={formatFee(stats.fees.fastest)}
        sublabel={`1h ${formatFee(stats.fees.hour)} · eco ${formatFee(stats.fees.economy)}`}
        tooltip="Recommended fee rates from mempool.space: next-block priority, ~1 hour, and economy."
      />
      <StatTile
        label="Difficulty"
        value={`${stats.difficulty.progressPercent.toFixed(1)}%`}
        sublabel={`${difficultySign}${stats.difficulty.changePercent.toFixed(2)}% · ${stats.difficulty.remainingBlocks.toLocaleString("en-US")} left`}
        tooltip="Progress through the current difficulty epoch, expected adjustment, and blocks remaining until retarget."
      />
    </div>
  );
}
