export function formatUsd(value: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatCompactUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "medium",
  }).format(new Date(iso));
}

export function formatBtc(sats: number): string {
  return `${(sats / 1e8).toFixed(8)} BTC`;
}

export function formatSignedBtc(sats: number): string {
  const sign = sats > 0 ? "+" : sats < 0 ? "−" : "";
  return `${sign}${Math.abs(sats / 1e8).toFixed(8)} BTC`;
}

export function truncateMiddle(value: string, chars = 8): string {
  if (value.length <= chars * 2 + 1) return value;
  return `${value.slice(0, chars)}…${value.slice(-chars)}`;
}
