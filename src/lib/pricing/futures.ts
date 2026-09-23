/**
 * Futures FX — pour la démo cash P&L, traité comme un forward
 * avec mark-to-market linéaire vs le prix de règlement.
 *
 * Payoff à la liquidation / maturité :
 *   Importateur long futures : notionalFx * (ST - F0)
 *   Exportateur short futures : notionalFx * (F0 - ST)
 *
 * En pratique le MTM quotidien converge vers le même P&L cumulé
 * qu'un forward cash-settled (hors marges / funding).
 */

import { forwardPrice, type ForwardParams } from "./forward";

export function futuresPrice(p: ForwardParams): number {
  return forwardPrice(p);
}

export function futuresEffectiveRate(F0: number): number {
  // Settlement fixe le taux comme un forward
  return F0;
}
