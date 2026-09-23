import type { FxPair } from "@/lib/constants";
import {
  countBars,
  getBars,
  getMeta,
  latestBarDate,
  upsertBars,
  upsertMeta,
} from "./db";
import {
  defaultHistoryRange,
  fetchBamHistory,
  fetchBamLatestSpot,
  fetchYahooSpot,
} from "./fetchers";
import { SOURCE_BAM, SOURCE_YAHOO } from "./types";

const PAIRS: FxPair[] = ["EURMAD", "USDMAD"];
const SPOT_MAX_AGE_MS = 60_000;
const HISTORY_MAX_AGE_DAYS = 1;

/** Évite les syncs concurrentes sur le même process. */
const locks = new Map<string, Promise<void>>();

async function withLock(key: string, fn: () => Promise<void>): Promise<void> {
  const prev = locks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });
  const chained = prev.then(() => gate);
  locks.set(key, chained);
  await prev;
  try {
    await fn();
  } finally {
    release();
    if (locks.get(key) === chained) locks.delete(key);
  }
}

function daysBetween(isoA: string, isoB: string): number {
  const a = Date.parse(isoA + "T12:00:00Z");
  const b = Date.parse(isoB + "T12:00:00Z");
  return Math.abs(b - a) / 86_400_000;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Fetch ~2 ans Frankfurter BAM, upsert bars (OHLC = rate journalier). */
export async function syncHistoryFromBam(pair: FxPair): Promise<number> {
  const { from, to } = defaultHistoryRange();
  const bars = await fetchBamHistory(pair, from, to);
  const n = upsertBars(pair, bars, SOURCE_BAM);

  // Si pas encore de meta, initialiser avec le dernier close BAM
  const meta = getMeta(pair);
  if (!meta && bars.length > 0) {
    const last = bars[bars.length - 1];
    upsertMeta(pair, last.close, last.date, SOURCE_BAM, nowIso());
  }
  return n;
}

/**
 * Spot : Yahoo en priorité ; sinon dernier close BAM en DB
 * (ou fetch BAM du jour si DB vide).
 */
export async function refreshSpot(pair: FxPair): Promise<{
  spot: number;
  asOf: string;
  source: string;
}> {
  const yahoo = await fetchYahooSpot(pair);
  if (yahoo) {
    upsertMeta(pair, yahoo.spot, yahoo.asOf, SOURCE_YAHOO, nowIso());
    return { ...yahoo, source: SOURCE_YAHOO };
  }

  const bars = getBars(pair);
  if (bars.length > 0) {
    const last = bars[bars.length - 1];
    upsertMeta(pair, last.close, last.date, SOURCE_BAM, nowIso());
    return { spot: last.close, asOf: last.date, source: SOURCE_BAM };
  }

  const bam = await fetchBamLatestSpot(pair);
  if (bam) {
    upsertMeta(pair, bam.spot, bam.asOf, SOURCE_BAM, nowIso());
    return { ...bam, source: SOURCE_BAM };
  }

  throw new Error(`Impossible de rafraîchir le spot ${pair}`);
}

function needsHistorySync(pair: FxPair): boolean {
  if (countBars(pair) === 0) return true;
  const latest = latestBarDate(pair);
  if (!latest) return true;
  return daysBetween(latest, todayIso()) > HISTORY_MAX_AGE_DAYS;
}

function needsSpotRefresh(pair: FxPair): boolean {
  const meta = getMeta(pair);
  if (!meta) return true;
  const age = Date.now() - Date.parse(meta.updated_at);
  return !Number.isFinite(age) || age > SPOT_MAX_AGE_MS;
}

/** Lazy sync : historique BAM si vide/vieux, spot Yahoo si >60s. */
export async function ensureMarketData(pair?: FxPair): Promise<void> {
  const targets = pair ? [pair] : PAIRS;
  await withLock(targets.join(","), async () => {
    for (const p of targets) {
      if (needsHistorySync(p)) {
        try {
          await syncHistoryFromBam(p);
        } catch (e) {
          console.error(`[market] syncHistoryFromBam ${p}`, e);
          if (countBars(p) === 0) throw e;
        }
      }
      if (needsSpotRefresh(p)) {
        try {
          await refreshSpot(p);
        } catch (e) {
          console.error(`[market] refreshSpot ${p}`, e);
          if (!getMeta(p)) throw e;
        }
      }
    }
  });
}

/** Pré-remplit les deux paires (script npm / CI). */
export async function syncAllMarketData(): Promise<{
  EURMAD: number;
  USDMAD: number;
}> {
  const result = { EURMAD: 0, USDMAD: 0 };
  for (const p of PAIRS) {
    result[p] = await syncHistoryFromBam(p);
    await refreshSpot(p);
  }
  return result;
}
