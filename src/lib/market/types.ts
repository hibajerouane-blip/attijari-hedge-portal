import type { FxPair } from "@/lib/constants";

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
  historySource: string;
  rDom: number;
  rFor: number;
  vol: number;
  history: Bar[];
}

export const SOURCE_BAM = "Bank Al-Maghrib";
export const SOURCE_YAHOO = "Yahoo Finance";

export const YAHOO_SYMBOLS: Record<FxPair, string> = {
  EURMAD: "EURMAD=X",
  USDMAD: "USDMAD=X",
};

export const FRANKFURTER_BASE: Record<FxPair, string> = {
  EURMAD: "eur",
  USDMAD: "usd",
};
