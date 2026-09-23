/** Constantes de démo — seeds réalistes BAM-like (non officiels). */

export const DEMO_USER = {
  username: "client@demo.ma",
  password: "Demo2026!",
  displayName: "Client Démo Corporate",
  company: "Société Démo SA",
} as const;

export const SESSION_COOKIE = "hedgedesk_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8h

export type FxPair = "EURMAD" | "USDMAD";

export const PAIR_LABELS: Record<FxPair, string> = {
  EURMAD: "EUR/MAD",
  USDMAD: "USD/MAD",
};

/** Spots de départ réalistes (ordre de grandeur BAM). */
export const SPOT_SEEDS: Record<FxPair, number> = {
  EURMAD: 10.92,
  USDMAD: 9.48,
};

/** Taux annuels continus de référence (démo). */
export const DEFAULT_RATES = {
  rMad: 0.0275, // BAM-like
  rEur: 0.035,
  rUsd: 0.045,
  volEur: 0.1,
  volUsd: 0.11,
} as const;

export function foreignRate(pair: FxPair): number {
  return pair === "EURMAD" ? DEFAULT_RATES.rEur : DEFAULT_RATES.rUsd;
}

export function defaultVol(pair: FxPair): number {
  return pair === "EURMAD" ? DEFAULT_RATES.volEur : DEFAULT_RATES.volUsd;
}

export const INSTRUMENT_META = {
  unhedged: {
    id: "unhedged" as const,
    name: "Non couvert",
    short: "Exposition naturelle",
    color: "#94a3b8",
  },
  forward: {
    id: "forward" as const,
    name: "Forward",
    short: "Change à terme",
    color: "#1e566d",
  },
  call: {
    id: "call" as const,
    name: "Call vanilla",
    short: "Option d'achat EUR/USD",
    color: "#0d9488",
  },
  tunnel: {
    id: "tunnel" as const,
    name: "Tunnel",
    short: "Collar zéro-coût",
    color: "#c9a227",
  },
  futures: {
    id: "futures" as const,
    name: "Futures",
    short: "Contrat à terme MTM",
    color: "#7c3aed",
  },
};

export type InstrumentId = keyof typeof INSTRUMENT_META;
