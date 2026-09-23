import { NextResponse } from "next/server";
import { getSnapshot, tryFetchBamOfficial } from "@/lib/market";
import type { FxPair } from "@/lib/constants";

export async function GET(
  _req: Request,
  ctx: { params: { pair: string } }
) {
  const key = ctx.params.pair.toUpperCase().replace("/", "") as FxPair;
  if (key !== "EURMAD" && key !== "USDMAD") {
    return NextResponse.json(
      { error: "Paire non supportée. Utilisez EURMAD ou USDMAD." },
      { status: 400 }
    );
  }

  const snap = getSnapshot(key);
  const bamSpot = await tryFetchBamOfficial(key);
  if (bamSpot != null) {
    snap.spot = bamSpot;
    snap.source = "BAM (via BAM_API_KEY)";
  }

  return NextResponse.json(snap);
}
