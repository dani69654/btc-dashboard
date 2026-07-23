import { NextResponse } from "next/server";
import { isValidBitcoinAddress } from "@/lib/bitcoinAddress";
import { fetchAddressOverview } from "@/lib/mempool";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;

  if (!isValidBitcoinAddress(address)) {
    return NextResponse.json({ error: "Invalid Bitcoin address" }, { status: 400 });
  }

  try {
    const overview = await fetchAddressOverview(address);
    return NextResponse.json(overview);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}
