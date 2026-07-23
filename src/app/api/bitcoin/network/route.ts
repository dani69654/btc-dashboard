import { NextResponse } from "next/server";
import { fetchChainStats } from "@/lib/mempool";

export async function GET() {
  try {
    const stats = await fetchChainStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}
