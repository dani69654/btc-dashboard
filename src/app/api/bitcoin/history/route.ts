import { NextRequest, NextResponse } from "next/server";
import { getBitcoinHistory } from "@/lib/historyStore";

export async function GET(request: NextRequest) {
  try {
    const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";
    const history = await getBitcoinHistory(forceRefresh);
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}
