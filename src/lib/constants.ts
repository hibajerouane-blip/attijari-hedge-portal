/** Constantes portail — taux/vols pricing + seeds UI init. */

export const DEMO_USER = {
  username: "client@demo.ma",
  password: "Demo2026!",
  displayName: "Client Corporate",
  company: "Groupe Client SA",
} as const;

export const SESSION_COOKIE = "hedgedesk_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8h

export type FxPair = "EURMAD" | "USDMAD";

export const PAIR_LABELS: Record<FxPair, string> = {
  EURMAD: "EUR/MAD",
  USDMAD: "USD/MAD",
};

/** Spots init UI (simulateur) avant chargement API ; le marché live vient de SQLite. */
export const SPOT_SEEDS: Record<FxPair, number> = {
  EURMAD: 10.92,
  USDMAD: 9.48,
};

/** Taux annuels continus de référence. */
export const DEFAULT_RATES = {
  rMad: 0.0275,
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
    short: "Change à terme OTC",
    color: "#2E2C38",
  },
  call: {
    id: "call" as const,
    name: "Option vanilla",
    short: "Call (import) / Put (export)",
    color: "#EE5B47",
  },
  tunnel: {
    id: "tunnel" as const,
    name: "Tunnel",
    short: "Collar zéro-coût",
    color: "#FFB900",
  },
  futures: {
    id: "futures" as const,
    name: "Futures",
    short: "Contrat listé + marge",
    color: "#7c3aed",
  },
};

export type InstrumentId = keyof typeof INSTRUMENT_META;

/** Mention courte affichable en pied de page / espace client. */
export const DEMO_DISCLAIMER =
  "Accès réservé — usages internes. Les informations présentées ne constituent ni un conseil en investissement ni une offre bancaire.";
