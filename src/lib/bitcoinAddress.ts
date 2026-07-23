const LEGACY_OR_P2SH = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
const BECH32 = /^(bc1|tb1)[a-z0-9]{25,90}$/i;

/** Loose format check (legacy/P2SH/bech32/bech32m) — not a full checksum validation. */
export function isValidBitcoinAddress(address: string): boolean {
  const trimmed = address.trim();
  return LEGACY_OR_P2SH.test(trimmed) || BECH32.test(trimmed);
}
