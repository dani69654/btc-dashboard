"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isValidBitcoinAddress } from "@/lib/bitcoinAddress";

export function AddressSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!isValidBitcoinAddress(trimmed)) {
      setError("Invalid address");
      return;
    }
    setError(null);
    router.push(`/address/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-1.5">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        placeholder="Search BTC address…"
        spellCheck={false}
        autoComplete="off"
        className={`w-32 rounded-sm border bg-surface-raised px-2 py-1 font-mono text-[11px] text-ink placeholder:font-sans placeholder:text-ink-muted focus:outline-none focus:ring-1 sm:w-56 ${
          error ? "border-critical focus:ring-critical/40" : "border-hairline focus:ring-accent/40"
        }`}
      />
      <button
        type="submit"
        className="rounded-sm border border-hairline px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted transition-colors hover:text-ink-soft"
      >
        Go
      </button>
      {error && (
        <span className="absolute left-0 top-full mt-1 whitespace-nowrap text-[10px] text-critical">
          {error}
        </span>
      )}
    </form>
  );
}
