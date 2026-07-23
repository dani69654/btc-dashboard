"use client";

import Link from "next/link";
import { useBitcoinAddress } from "@/hooks/useBitcoinAddress";
import { Badge } from "@/components/ui/Badge";
import { StatTile } from "@/components/dashboard/StatTile";
import { formatBtc, formatDate, formatSignedBtc, formatTime, truncateMiddle } from "@/lib/format";

type AddressViewProps = {
  address: string;
};

export function AddressView({ address }: AddressViewProps) {
  const { data, isLoading, error } = useBitcoinAddress(address);

  return (
    <div className="flex min-h-screen flex-col bg-plane">
      <header className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-2 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent/15 text-sm font-semibold text-accent"
          >
            ₿
          </Link>
          <h1 className="text-xs font-semibold uppercase tracking-widest text-ink">
            Address<span className="text-ink-muted"> Lookup</span>
          </h1>
        </div>
        <Link href="/" className="text-[11px] font-medium text-ink-muted hover:text-ink-soft">
          ← Back to dashboard
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-1 rounded-sm border border-hairline bg-surface p-3.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Address
          </span>
          <span className="break-all font-mono text-sm text-ink">{address}</span>
        </div>

        {error && (
          <div className="rounded-sm border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-xs text-critical">
            {error}
          </div>
        )}

        {isLoading && !data && (
          <div className="h-32 w-full animate-pulse rounded-sm bg-surface-raised" />
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 divide-x divide-y divide-hairline rounded-sm border border-hairline bg-surface sm:grid-cols-4 sm:divide-y-0">
              <StatTile
                label="Balance"
                value={formatBtc(data.balanceSats)}
                tone={data.balanceSats > 0 ? "good" : "neutral"}
                tooltip="Confirmed on-chain balance: total received minus total sent. Excludes unconfirmed mempool activity."
              />
              <StatTile
                label="Unconfirmed"
                value={formatSignedBtc(data.unconfirmedBalanceSats)}
                tone={
                  data.unconfirmedBalanceSats === 0
                    ? "neutral"
                    : data.unconfirmedBalanceSats > 0
                      ? "good"
                      : "critical"
                }
                tooltip="Net balance change from transactions currently sitting in the mempool, not yet confirmed in a block."
              />
              <StatTile
                label="Total Received"
                value={formatBtc(data.totalReceivedSats)}
                tone="good"
                tooltip="Sum of every confirmed amount this address has ever received."
              />
              <StatTile
                label="Total Sent"
                value={formatBtc(data.totalSentSats)}
                tone="critical"
                tooltip="Sum of every confirmed amount this address has ever spent."
              />
            </div>

            <div className="flex flex-col gap-2 rounded-sm border border-hairline bg-surface p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  Transactions
                  <span className="text-ink"> ({data.txCount.toLocaleString("en-US")})</span>
                </span>
                <a
                  href={`https://mempool.space/address/${address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-medium text-accent hover:underline"
                >
                  View full history ↗
                </a>
              </div>

              {data.transactions.length === 0 && (
                <p className="py-4 text-center text-xs text-ink-muted">
                  No transactions found for this address.
                </p>
              )}

              <div className="flex flex-col divide-y divide-hairline">
                {data.transactions.map((tx) => (
                  <a
                    key={tx.txid}
                    href={`https://mempool.space/tx/${tx.txid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 py-2 text-xs transition-colors hover:bg-surface-raised"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-ink-soft">{truncateMiddle(tx.txid)}</span>
                      <span className="text-[10px] text-ink-muted">
                        {tx.blockTime
                          ? `${formatDate(tx.blockTime)} ${formatTime(tx.blockTime)}`
                          : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={tx.confirmed ? "neutral" : "accent"}>
                        {tx.confirmed ? "Confirmed" : "Pending"}
                      </Badge>
                      <span
                        className={`font-semibold tabular-nums ${
                          tx.netSats >= 0 ? "text-good" : "text-critical"
                        }`}
                      >
                        {formatSignedBtc(tx.netSats)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
