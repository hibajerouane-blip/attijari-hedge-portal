/**
 * Générateur de données de marché synthétiques (2 ans, OHLC-ish).
 * Label : « données de démo / référence BAM-like ».
 *
 * Optionnel : si BAM_API_KEY est défini, un stub tente un fetch public ;
 * en l'absence de clé ou en cas d'échec, on reste 100 % synthétique.
 */

import {
  SPOT_SEEDS,
  type FxPair,
  DEFAULT_RATES,
  foreignRate,
  defaultVol,
} from "./constants";

export interface Bar {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MarketSnapshot {
  pair: FxPair;
  label: string;
  spot: number;
  change1d: number;
  change1dPct: number;
  asOf: string;
  source: string;
  rDom: number;
  rFor: number;
  vol: number;
  history: Bar[];
}

/** PRNG déterministe (mulberry32) pour reproduire la même série. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pairSeed(pair: FxPair): number {
  return pair === "EURMAD" ? 0x4555524d : 0x5553444d; // 'EURM' / 'USDM'
}

/** Génère ~2 ans de bars journaliers (jours ouvrés simplifiés = tous les jours calendaires). */
export function generateHistory(pair: FxPair, days = 730): Bar[] {
  const rnd = mulberry32(pairSeed(pair));
  let price = SPOT_SEEDS[pair];
  const volDaily = defaultVol(pair) / Math.sqrt(252);
  // Légère dérive : EURMAD un peu baissière, USDMAD légère hausse
  const drift = pair === "EURMAD" ? -0.00002 : 0.00003;
  const bars: Bar[] = [];
  const end = new Date();
  end.setHours(12, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const z = boxMuller(rnd);
    const ret = drift + volDaily * z;
    const open = price;
    const close = price * Math.exp(ret);
    const wick = Math.abs(volDaily * boxMuller(rnd)) * price * 0.5;
    const high = Math.max(open, close) + wick;
    const low = Math.min(open, close) - wick;
    bars.push({
      date: d.toISOString().slice(0, 10),
      open: round4(open),
      high: round4(high),
      low: round4(Math.max(low, 0.01)),
      close: round4(close),
    });
    price = close;
  }
  return bars;
}

function boxMuller(rnd: () => number): number {
  const u = Math.max(rnd(), 1e-12);
  const v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

const cache: Partial<Record<FxPair, Bar[]>> = {};

export function getHistory(pair: FxPair): Bar[] {
  if (!cache[pair]) cache[pair] = generateHistory(pair);
  return cache[pair]!;
}

export function getSnapshot(pair: FxPair): MarketSnapshot {
  const history = getHistory(pair);
  const last = history[history.length - 1];
  const prev = history[history.length - 2] ?? last;
  const change1d = last.close - prev.close;
  return {
    pair,
    label: pair === "EURMAD" ? "EUR/MAD" : "USD/MAD",
    spot: last.close,
    change1d: round4(change1d),
    change1dPct: round4((change1d / prev.close) * 100),
    asOf: last.date,
    source: "données de démo / référence BAM-like",
    rDom: DEFAULT_RATES.rMad,
    rFor: foreignRate(pair),
    vol: defaultVol(pair),
    history,
  };
}

/**
 * Stub BAM : si BAM_API_KEY est présent, on pourrait appeler une API publique.
 * Sans clé (cas par défaut), retourne null et le caller utilise le synthétique.
 */
export async function tryFetchBamOfficial(
  pair: FxPair
): Promise<number | null> {
  const key = process.env.BAM_API_KEY;
  if (!key) return null;
  // Stub documenté — pas d'endpoint réel branché pour éviter dépendances externes.
  // Exemple futur : fetch(`https://api.example-bam.ma/rates?key=${key}&pair=${pair}`)
  void pair;
  return null;
}
