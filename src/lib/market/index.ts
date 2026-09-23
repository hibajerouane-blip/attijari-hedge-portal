import {
  DEFAULT_RATES,
  foreignRate,
  defaultVol,
  PAIR_LABELS,
  type FxPair,
} from "@/lib/constants";
import { getBars, getMeta } from "./db";
import { SOURCE_BAM } from "./types";
import type { Bar, MarketSnapshot } from "./types";

export type { Bar, MarketSnapshot } from "./types";
export { SOURCE_BAM, SOURCE_YAHOO } from "./types";
export {
  syncHistoryFromBam,
  refreshSpot,
  ensureMarketData,
  syncAllMarketData,
} from "./sync";
export { getDbPath } from "./db";

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/** Lecture DB uniquement — historique BAM. */
export function getHistory(pair: FxPair): Bar[] {
  return getBars(pair);
}

/**
 * Lecture DB uniquement — snapshot pour l’UI / API.
 * Nécessite un ensureMarketData() avant (côté API).
 */
export function getSnapshot(pair: FxPair): MarketSnapshot {
  const history = getHistory(pair);
  const meta = getMeta(pair);

  if (history.length === 0 && !meta) {
    throw new Error(
      `Données marché absentes pour ${pair}. Lancez ensureMarketData ou npm run sync:market.`
    );
  }

  const lastBar = history[history.length - 1];
  const prevBar = history[history.length - 2] ?? lastBar;

  const spot = meta?.spot ?? lastBar.close;
  const asOf = meta?.as_of ?? lastBar.date;
  const source = meta?.source ?? SOURCE_BAM;

  // Variation J-1 : spot actuel vs close de l'avant-dernier bar BAM
  const refPrev = prevBar?.close ?? spot;
  const change1d = spot - refPrev;

  return {
    pair,
    label: PAIR_LABELS[pair],
    spot: round4(spot),
    change1d: round4(change1d),
    change1dPct: round4(refPrev !== 0 ? (change1d / refPrev) * 100 : 0),
    asOf,
    source,
    historySource: SOURCE_BAM,
    rDom: DEFAULT_RATES.rMad,
    rFor: foreignRate(pair),
    vol: defaultVol(pair),
    history,
  };
}
