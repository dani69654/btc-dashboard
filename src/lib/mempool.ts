import type { AddressOverview, AddressTransaction, ChainStats } from "./types";

const MEMPOOL_API = "https://mempool.space/api";

type MempoolFees = {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
};

type MempoolInfo = {
  count: number;
  vsize: number;
};

type MempoolDifficulty = {
  progressPercent: number;
  difficultyChange: number;
  remainingBlocks: number;
};

type MempoolAddressInfo = {
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_sum: number;
    spent_txo_sum: number;
  };
};

type MempoolTx = {
  txid: string;
  fee: number;
  vin: Array<{ prevout: { scriptpubkey_address?: string; value: number } | null }>;
  vout: Array<{ scriptpubkey_address?: string; value: number }>;
  status: { confirmed: boolean; block_height?: number; block_time?: number };
};

async function mempoolFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${MEMPOOL_API}${path}`, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 400) throw new Error("Invalid Bitcoin address");
    throw new Error(`mempool.space request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/** Fetches tip height, mempool size, fee estimates, and difficulty progress. */
export async function fetchChainStats(): Promise<ChainStats> {
  const [blockHeight, fees, mempool, difficulty] = await Promise.all([
    mempoolFetch<number>("/blocks/tip/height"),
    mempoolFetch<MempoolFees>("/v1/fees/recommended"),
    mempoolFetch<MempoolInfo>("/mempool"),
    mempoolFetch<MempoolDifficulty>("/v1/difficulty-adjustment"),
  ]);

  return {
    blockHeight,
    mempoolTxCount: mempool.count,
    mempoolVsize: mempool.vsize,
    fees: {
      fastest: fees.fastestFee,
      halfHour: fees.halfHourFee,
      hour: fees.hourFee,
      economy: fees.economyFee,
    },
    difficulty: {
      progressPercent: difficulty.progressPercent,
      changePercent: difficulty.difficultyChange,
      remainingBlocks: difficulty.remainingBlocks,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Fetches balance and recent transactions for a Bitcoin address from the free
 * mempool.space public API (no key required). Only the most recent page of
 * confirmed transactions is returned (mempool.space caps this at ~50/request).
 */
export async function fetchAddressOverview(address: string): Promise<AddressOverview> {
  const [info, txs] = await Promise.all([
    mempoolFetch<MempoolAddressInfo>(`/address/${address}`),
    mempoolFetch<MempoolTx[]>(`/address/${address}/txs`),
  ]);

  const totalReceivedSats = info.chain_stats.funded_txo_sum;
  const totalSentSats = info.chain_stats.spent_txo_sum;
  const balanceSats = totalReceivedSats - totalSentSats;
  const unconfirmedBalanceSats =
    info.mempool_stats.funded_txo_sum - info.mempool_stats.spent_txo_sum;

  const transactions: AddressTransaction[] = txs.map((tx) => {
    const received = tx.vout
      .filter((out) => out.scriptpubkey_address === address)
      .reduce((sum, out) => sum + out.value, 0);
    const sent = tx.vin
      .filter((input) => input.prevout?.scriptpubkey_address === address)
      .reduce((sum, input) => sum + (input.prevout?.value ?? 0), 0);

    return {
      txid: tx.txid,
      confirmed: tx.status.confirmed,
      blockHeight: tx.status.block_height ?? null,
      blockTime: tx.status.block_time ? new Date(tx.status.block_time * 1000).toISOString() : null,
      feeSats: tx.fee,
      netSats: received - sent,
      inputCount: tx.vin.length,
      outputCount: tx.vout.length,
    };
  });

  return {
    address,
    balanceSats,
    unconfirmedBalanceSats,
    totalReceivedSats,
    totalSentSats,
    txCount: info.chain_stats.tx_count,
    fundedTxoCount: info.chain_stats.funded_txo_count,
    spentTxoCount: info.chain_stats.spent_txo_count,
    transactions,
  };
}
