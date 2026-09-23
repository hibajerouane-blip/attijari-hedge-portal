/**
 * Forward de change — parité des taux d'intérêt (IRP).
 *
 * Formule (taux continus) :
 *   F = S * exp((r_dom - r_for) * T)
 *
 * où :
 *   S     = spot (MAD par unité de devise étrangère)
 *   r_dom = taux domestique (MAD)
 *   r_for = taux de la devise étrangère (EUR ou USD)
 *   T     = maturité en années
 *
 * Pour un importateur (achète devise étrangère) : le forward fixe le coût d'achat.
 * Pour un exportateur (vend devise étrangère) : le forward fixe le prix de vente.
 */

export interface ForwardParams {
  spot: number;
  rDom: number;
  rFor: number;
  T: number; // années
}

/** Prix forward théorique (IRP). */
export function forwardPrice({ spot, rDom, rFor, T }: ForwardParams): number {
  if (spot <= 0 || T < 0) return NaN;
  return spot * Math.exp((rDom - rFor) * T);
}

/**
 * P&L cash d'un forward à maturité vs spot futur S_T.
 * side = "importer" : on achète la devise étrangère (paye F, reçoit valeur S_T)
 * side = "exporter" : on vend la devise étrangère (reçoit F, "perd" S_T)
 *
 * notionalFx = montant en devise étrangère (EUR ou USD).
 * P&L en MAD = notionalFx * (S_T - F) pour importateur? Attention au signe.
 *
 * Convention commerciale :
 * - Importateur couvert : achète FX à F. Sans couverture il paierait S_T.
 *   Gain de couverture (vs non couvert) = notionalFx * (S_T - F) si S_T > F... 
 *   En fait coût net importateur couvert = notionalFx * F
 *   Coût non couvert = notionalFx * S_T
 *   P&L relatif (couvert - non couvert) = notionalFx * (S_T - F)  → positif si S_T > F
 *
 * Pour le simulateur on montre le P&L ABSOLU en MAD de la position couverte
 * vs un cashflow de référence au spot initial (mark économique) :
 *   Importateur : P&L = notionalFx * (S0 - effectiveRate)
 *   Exportateur : P&L = notionalFx * (effectiveRate - S0)
 * où effectiveRate est le taux effectivement obtenu via l'instrument.
 */
export function forwardEffectiveRate(F: number): number {
  return F;
}
