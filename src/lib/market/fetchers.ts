import type { FxPair } from "@/lib/constants";
import type { Bar } from "./types";
import { FRANKFURTER_BASE, YAHOO_SYMBOLS } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Historique quotidien BAM via Frankfurter (cours de référence). */
export async function fetchBamHistory(
  pair: FxPair,
  from: string,
  to: string
): Promise<Bar[]> {
  const base = FRANKFURTER_BASE[pair];
  const url = `https://api.frankfurter.dev/v2/rates?base=${base}&quotes=mad&from=${from}&to=${to}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`Frankfurter BAM history ${pair}: HTTP ${res.status}`);
  }
  const rows = (await res.json()) as Array<{
    date: string;
    base: string;
    quote: string;
    rate: number;
  }>;
  if (!Array.isArray(rows)) {
    throw new Error(`Frankfurter BAM history ${pair}: réponse invalide`);
  }
  return rows
    .filter((r) => r.quote?.toUpperCase() === "MAD" && Number.isFinite(r.rate))
    .map((r) => {
      const rate = round4(r.rate);
      return {
        date: r.date,
        open: rate,
        high: rate,
        low: rate,
        close: rate,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Derniers cours BAM du jour (base EUR). Pour USD/MAD : croisement EUR/MAD ÷ EUR/USD. */
export async function fetchBamLatestSpot(pair: FxPair): Promise<{
  spot: number;
  asOf: string;
} | null> {
  const url = "https://api.frankfurter.dev/v2/providers/bam/rates";
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<{
    date: string;
    base: string;
    quote: string;
    rate: number;
  }>;
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const asOf = rows[0].date;
  const eurMad = rows.find(
    (r) => r.base === "EUR" && r.quote === "MAD"
  )?.rate;
  if (pair === "EURMAD") {
    if (eurMad == null) return null;
    return { spot: round4(eurMad), asOf };
  }

  const usdMadDirect = rows.find(
    (r) => r.base === "USD" && r.quote === "MAD"
  )?.rate;
  if (usdMadDirect != null) {
    return { spot: round4(usdMadDirect), asOf };
  }

  const eurUsd = rows.find(
    (r) => r.base === "EUR" && r.quote === "USD"
  )?.rate;
  if (eurMad != null && eurUsd != null && eurUsd !== 0) {
    return { spot: round4(eurMad / eurUsd), asOf };
  }
  return null;
}

/** Spot intraday Yahoo Finance. */
export async function fetchYahooSpot(pair: FxPair): Promise<{
  spot: number;
  asOf: string;
} | null> {
  const symbol = YAHOO_SYMBOLS[pair];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      chart?: {
        result?: Array<{
          meta?: {
            regularMarketPrice?: number;
            regularMarketTime?: number;
          };
        }>;
      };
    };
    const meta = data.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    if (price == null || !Number.isFinite(price)) return null;
    const asOf = meta?.regularMarketTime
      ? isoDate(new Date(meta.regularMarketTime * 1000))
      : isoDate(new Date());
    return { spot: round4(price), asOf };
  } catch {
    return null;
  }
}

export function defaultHistoryRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 2);
  return { from: isoDate(from), to: isoDate(to) };
}
