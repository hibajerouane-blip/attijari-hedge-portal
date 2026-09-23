/**
 * Pré-remplit data/market.db (historique BAM + spot Yahoo).
 * Usage : npm run sync:market
 */
import {
  syncAllMarketData,
  getSnapshot,
  getDbPath,
} from "../src/lib/market";

async function main() {
  console.log("Sync marché →", getDbPath());
  const counts = await syncAllMarketData();
  console.log("Bars upsertées:", counts);
  for (const pair of ["EURMAD", "USDMAD"] as const) {
    const s = getSnapshot(pair);
    console.log(
      `${s.label}: spot=${s.spot} (${s.source}) · asOf=${s.asOf} · history=${s.history.length} bars (${s.historySource})`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
