import { NextResponse } from "next/server";
import { ensureMarketData, getSnapshot } from "@/lib/market";
import type { FxPair } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  try {
    await ensureMarketData(key);
    const snap = getSnapshot(key);
    return NextResponse.json(snap);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur marché";
    console.error("[api/market]", key, e);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
