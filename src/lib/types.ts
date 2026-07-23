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
