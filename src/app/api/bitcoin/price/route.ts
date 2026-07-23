import { NextResponse } from "next/server";
import { fetchBitcoinQuote } from "@/lib/yahooFinance";

export async function GET() {
  try {
    const quote = await fetchBitcoinQuote();
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}
