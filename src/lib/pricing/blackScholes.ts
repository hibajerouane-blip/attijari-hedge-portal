/**
 * Garman-Kohlhagen (Black-Scholes FX) — call / put européens sur change.
 *
 * Call (droit d'acheter 1 unité de devise étrangère contre MAD) :
 *   C = S * e^(-r_for * T) * N(d1) - K * e^(-r_dom * T) * N(d2)
 *
 * Put :
 *   P = K * e^(-r_dom * T) * N(-d2) - S * e^(-r_for * T) * N(-d1)
 *
 *   d1 = [ln(S/K) + (r_dom - r_for + σ²/2) * T] / (σ √T)
 *   d2 = d1 - σ √T
 *
 * N(.) = CDF de la loi normale standard.
 */

/** CDF normale standard (approximation Abramowitz & Stegun). */
export function normCdf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * z);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  return 0.5 * (1 + sign * y);
}

export interface GkParams {
  spot: number;
  strike: number;
  T: number;
  rDom: number;
  rFor: number;
  vol: number;
}

function d1d2(p: GkParams): { d1: number; d2: number } {
  const { spot, strike, T, rDom, rFor, vol } = p;
  if (T <= 0 || vol <= 0) {
    const intrinsicCall = Math.max(spot - strike, 0);
    return { d1: intrinsicCall > 0 ? 100 : -100, d2: intrinsicCall > 0 ? 100 : -100 };
  }
  const sqrtT = Math.sqrt(T);
  const d1 =
    (Math.log(spot / strike) + (rDom - rFor + 0.5 * vol * vol) * T) /
    (vol * sqrtT);
  const d2 = d1 - vol * sqrtT;
  return { d1, d2 };
}

/** Prix d'un call FX européen (Garman-Kohlhagen), en MAD par unité FX. */
export function gkCall(p: GkParams): number {
  const { spot, strike, T, rDom, rFor } = p;
  if (T <= 0) return Math.max(spot - strike, 0);
  const { d1, d2 } = d1d2(p);
  return (
    spot * Math.exp(-rFor * T) * normCdf(d1) -
    strike * Math.exp(-rDom * T) * normCdf(d2)
  );
}

/** Prix d'un put FX européen (Garman-Kohlhagen), en MAD par unité FX. */
export function gkPut(p: GkParams): number {
  const { spot, strike, T, rDom, rFor } = p;
  if (T <= 0) return Math.max(strike - spot, 0);
  const { d1, d2 } = d1d2(p);
  return (
    strike * Math.exp(-rDom * T) * normCdf(-d2) -
    spot * Math.exp(-rFor * T) * normCdf(-d1)
  );
}

/** Payoff à maturité d'un call (avant prime). */
export function callPayoff(ST: number, K: number): number {
  return Math.max(ST - K, 0);
}

/** Payoff à maturité d'un put (avant prime). */
export function putPayoff(ST: number, K: number): number {
  return Math.max(K - ST, 0);
}
