import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { BitcoinHistory } from "./types";
import { fetchBitcoinHistory } from "./yahooFinance";

const DATA_DIR = path.join(process.cwd(), ".data");
const HISTORY_FILE = path.join(DATA_DIR, "btc-history.json");

/** Refetch if the cached file is older than this. */
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours

async function readCache(): Promise<BitcoinHistory | null> {
  try {
    const raw = await readFile(HISTORY_FILE, "utf-8");
    return JSON.parse(raw) as BitcoinHistory;
  } catch {
    return null;
  }
}

async function writeCache(history: BitcoinHistory): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
}

function isStale(history: BitcoinHistory): boolean {
  const age = Date.now() - new Date(history.updatedAt).getTime();
  return age > MAX_AGE_MS;
}

/**
 * Returns the full local history, downloading it from Yahoo Finance on first
 * run or whenever the local cache goes stale, and persisting it to disk.
 */
export async function getBitcoinHistory(forceRefresh = false): Promise<BitcoinHistory> {
  const cached = await readCache();
  if (cached && !isStale(cached) && !forceRefresh) {
    return cached;
  }

  const points = await fetchBitcoinHistory();
  const history: BitcoinHistory = {
    symbol: "BTC-USD",
    currency: "USD",
    points,
    updatedAt: new Date().toISOString(),
  };

  await writeCache(history);
  return history;
}
