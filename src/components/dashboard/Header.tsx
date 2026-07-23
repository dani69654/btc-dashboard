"use client";

import { useEffect, useState } from "react";

type HeaderProps = {
  isLive: boolean;
  lastUpdatedLabel?: string;
};

function useClock(): string | null {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setNow(
        new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date()),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

export function Header({ isLive, lastUpdatedLabel }: HeaderProps) {
  const clock = useClock();

  return (
    <header className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-2 sm:px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent/15 text-sm font-semibold text-accent">
          ₿
        </div>
        <h1 className="text-xs font-semibold uppercase tracking-widest text-ink">
          BTC<span className="text-ink-muted">/</span>USD
        </h1>
        <span className="hidden text-[11px] text-ink-muted sm:inline">Yahoo Finance</span>
      </div>

      <div className="flex items-center gap-3 text-[11px] tabular-nums text-ink-muted">
        {lastUpdatedLabel && (
          <span className="hidden sm:inline">upd. {lastUpdatedLabel}</span>
        )}
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-good animate-pulse" : "bg-critical"}`}
            aria-hidden
          />
          <span className="font-medium">{isLive ? "LIVE" : "OFFLINE"}</span>
        </span>
        {clock && <span className="hidden font-medium text-ink-soft sm:inline">{clock}</span>}
      </div>
    </header>
  );
}
