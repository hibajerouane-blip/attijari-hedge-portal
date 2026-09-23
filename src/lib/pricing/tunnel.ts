/**
 * Tunnel (collar / zero-cost) — combinaison put + call.
 *
 * Exportateur (vend FX) : achète un put (protection baisse) + vend un call (cède le upside).
 * Importateur (achète FX) : achète un call (protection hausse) + vend un put.
 *
 * Strikes choisis pour que la prime nette ≈ 0 (zero-cost collar).
 * On fixe une aile (wing) sous/sur le forward et on cherche le strike opposé
 * par dichotomie jusqu'à égaliser les primes GK.
 *
 * Rappel FX : un put à strike bas est OTM (prime faible) ;
 * un call à strike haut est OTM (prime faible).
 */

import { gkCall, gkPut, type GkParams } from "./blackScholes";
import { forwardPrice } from "./forward";

export type Side = "importer" | "exporter";

export interface TunnelResult {
  kPut: number;
  kCall: number;
  premiumPut: number;
  premiumCall: number;
  netPremium: number; // coût net pour le client (positif = paie)
  forward: number;
}

function baseParams(
  spot: number,
  T: number,
  rDom: number,
  rFor: number,
  vol: number,
  strike: number
): GkParams {
  return { spot, strike, T, rDom, rFor, vol };
}

/**
 * Construit un tunnel zéro-coût approximatif.
 * putWing : écart relatif sous le forward pour le put (ex: 0.03 = 3 %).
 */
export function buildZeroCostTunnel(opts: {
  spot: number;
  T: number;
  rDom: number;
  rFor: number;
  vol: number;
  side: Side;
  putWing?: number;
}): TunnelResult {
  const { spot, T, rDom, rFor, vol, side } = opts;
  const putWing = opts.putWing ?? 0.03;
  const F = forwardPrice({ spot, rDom, rFor, T });

  let kPut = F * (1 - putWing);
  let kCall = F * (1 + putWing);

  if (side === "exporter") {
    // Long put @ kPut fixe, short call @ kCall à calibrer
    const putPrem = gkPut(baseParams(spot, T, rDom, rFor, vol, kPut));
    let lo = F;
    let hi = F * 1.2;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      const callPrem = gkCall(baseParams(spot, T, rDom, rFor, vol, mid));
      // putPrem > callPrem → call trop cher en strike (trop OTM) → baisser strike
      if (putPrem > callPrem) hi = mid;
      else lo = mid;
    }
    kCall = (lo + hi) / 2;
  } else {
    // Long call @ kCall fixe, short put @ kPut à calibrer
    const callPrem = gkCall(baseParams(spot, T, rDom, rFor, vol, kCall));
    let lo = F * 0.8;
    let hi = F;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      const putPrem = gkPut(baseParams(spot, T, rDom, rFor, vol, mid));
      // callPrem > putPrem → put trop OTM (strike trop bas) → monter strike
      if (callPrem > putPrem) lo = mid;
      else hi = mid;
    }
    kPut = (lo + hi) / 2;
  }

  const premiumPut = gkPut(baseParams(spot, T, rDom, rFor, vol, kPut));
  const premiumCall = gkCall(baseParams(spot, T, rDom, rFor, vol, kCall));
  const netPremium =
    side === "exporter"
      ? premiumPut - premiumCall
      : premiumCall - premiumPut;

  return { kPut, kCall, premiumPut, premiumCall, netPremium, forward: F };
}

/**
 * Taux effectif à maturité pour un tunnel (corridor).
 * Le client négocie / règle entre kPut et kCall.
 */
export function tunnelEffectiveRate(
  ST: number,
  kPut: number,
  kCall: number
): number {
  return Math.max(kPut, Math.min(ST, kCall));
}
