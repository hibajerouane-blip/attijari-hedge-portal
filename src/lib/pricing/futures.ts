/**
 * Futures FX — contrat listé vs forward OTC.
 *
 * En théorie (cash & carry), le futures converge vers le forward IRP.
 * On rend le futures **distinct** du forward :
 *   1. Petit basis de cotation (F_fut = F_IRP × (1 + basis_bps/10000))
 *   2. Coût d'opportunité des appels de marge (marge initiale × r_MAD × T)
 *
 * Payoff à maturité (hors marge) : taux effectif = F_fut (plat).
 * Le P&L total = P&L FX au taux F_fut − coût de marge.
 */

import { forwardPrice, type ForwardParams } from "./forward";

/** Basis listé vs OTC, en points de base du forward IRP. */
export const FUTURES_BASIS_BPS = 12;

/** Marge initiale (% du notionnel MAD) — simplifié. */
export const FUTURES_MARGIN_PCT = 0.04;

export function futuresPrice(p: ForwardParams): number {
  const F = forwardPrice(p);
  return F * (1 + FUTURES_BASIS_BPS / 10_000);
}

/** Coût de marge (MAD) sur l'horizon T — traité comme une prime nette. */
export function futuresMarginCost(opts: {
  notionalFx: number;
  spot: number;
  T: number;
  rDom: number;
  marginPct?: number;
}): number {
  const m = opts.marginPct ?? FUTURES_MARGIN_PCT;
  return opts.notionalFx * opts.spot * m * opts.rDom * opts.T;
}

export function futuresEffectiveRate(F0: number): number {
  return F0;
}
