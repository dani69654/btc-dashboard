export type HistoryPoint = {
  date: string; // ISO date, e.g. "2026-07-23"
  timestamp: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type BitcoinHistory = {
  symbol: string;
  currency: string;
  points: HistoryPoint[];
  updatedAt: string; // ISO datetime of last sync
};

export type BitcoinQuote = {
  symbol: string;
  currency: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  marketTime: string; // ISO datetime
};

export type AddressTransaction = {
  txid: string;
  confirmed: boolean;
  blockHeight: number | null;
  blockTime: string | null; // ISO datetime, null while unconfirmed
  feeSats: number;
  /** Net effect of this transaction on the queried address, in satoshis (negative = sent). */
  netSats: number;
  inputCount: number;
  outputCount: number;
};

export type AddressOverview = {
  address: string;
  balanceSats: number;
  unconfirmedBalanceSats: number;
  totalReceivedSats: number;
  totalSentSats: number;
  txCount: number;
  fundedTxoCount: number;
  spentTxoCount: number;
  transactions: AddressTransaction[];
};

/** Live Bitcoin network snapshot from mempool.space. */
export type ChainStats = {
  blockHeight: number;
  mempoolTxCount: number;
  mempoolVsize: number;
  fees: {
    fastest: number; // sat/vB — next block
    halfHour: number;
    hour: number;
    economy: number;
  };
  difficulty: {
    progressPercent: number;
    changePercent: number;
    remainingBlocks: number;
  };
  updatedAt: string; // ISO datetime
};
