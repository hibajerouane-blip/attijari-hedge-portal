import { NextResponse } from "next/server";
import { syncAllMarketData, getSnapshot } from "@/lib/market";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Force un sync BAM + refresh Yahoo des deux paires. */
export async function POST() {
  try {
    const counts = await syncAllMarketData();
    return NextResponse.json({
      ok: true,
      bars: counts,
      snapshots: {
        EURMAD: getSnapshot("EURMAD"),
        USDMAD: getSnapshot("USDMAD"),
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync échouée";
    console.error("[api/market/sync]", e);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
