/**
 * Module P&L — calcule les courbes de résultat en MAD pour chaque stratégie.
 *
 * Convention économique (référence = spot initial S0) :
 * - Exportateur vend notionalFx d'EUR/USD :
 *     P&L = notionalFx * (taux_effectif - S0) - primes_nettes_capitalisées
 * - Importateur achète notionalFx :
 *     P&L = notionalFx * (S0 - taux_effectif) - primes_nettes_capitalisées
 *
 * Ainsi le "non couvert" a un P&L linéaire vs ST, et les couvertures
 * montrent clairement la protection / le coût d'opportunité.
 */

import { forwardPrice } from "./forward";
import { gkCall, gkPut, callPayoff, putPayoff } from "./blackScholes";
import { buildZeroCostTunnel, tunnelEffectiveRate, type Side } from "./tunnel";
import { futuresPrice, futuresMarginCost } from "./futures";
import type { FxPair } from "../constants";

export interface SimInput {
  pair: FxPair;
  side: Side;
  notionalFx: number;
  days: number;
  spot: number;
  rDom: number;
  rFor: number;
  vol: number;
  /** Strike du call/put vanilla (défaut = ATM forward). */
  callStrike?: number;
}

export interface StrategyPoint {
  id: string;
  name: string;
  effectiveRate: number;
  premiumPaid: number;
  pnl: number;
}

export interface CurvePoint {
  ST: number;
  unhedged: number;
  forward: number;
  call: number;
  tunnel: number;
  futures: number;
}

function years(days: number): number {
  return Math.max(days, 1) / 365;
}

function sidePnl(
  side: Side,
  notionalFx: number,
  S0: number,
  effective: number,
  premiumPerUnit: number,
  T: number,
  rDom: number
): number {
  const premCost = premiumPerUnit * Math.exp(rDom * T) * notionalFx;
  const fxPnl =
    side === "exporter"
      ? notionalFx * (effective - S0)
      : notionalFx * (S0 - effective);
  return fxPnl - premCost;
}

export function priceAllStrategies(input: SimInput) {
  const T = years(input.days);
  const F = forwardPrice({
    spot: input.spot,
    rDom: input.rDom,
    rFor: input.rFor,
    T,
  });
  const K = input.callStrike ?? F;
  const callPrem = gkCall({
    spot: input.spot,
    strike: K,
    T,
    rDom: input.rDom,
    rFor: input.rFor,
    vol: input.vol,
  });
  const putPrem = gkPut({
    spot: input.spot,
    strike: K,
    T,
    rDom: input.rDom,
    rFor: input.rFor,
    vol: input.vol,
  });
  const tunnel = buildZeroCostTunnel({
    spot: input.spot,
    T,
    rDom: input.rDom,
    rFor: input.rFor,
    vol: input.vol,
    side: input.side,
  });
  const fut = futuresPrice({
    spot: input.spot,
    rDom: input.rDom,
    rFor: input.rFor,
    T,
  });
  const futMarginMad = futuresMarginCost({
    notionalFx: input.notionalFx,
    spot: input.spot,
    T,
    rDom: input.rDom,
  });

  return { T, F, K, callPrem, putPrem, tunnel, fut, futMarginMad };
}

/** P&L de chaque stratégie à un spot futur donné. */
export function pnlAtSpot(input: SimInput, ST: number): StrategyPoint[] {
  const { T, F, K, callPrem, putPrem, tunnel, fut, futMarginMad } =
    priceAllStrategies(input);
  const { side, notionalFx, spot: S0, rDom } = input;

  const unhedged = sidePnl(side, notionalFx, S0, ST, 0, T, rDom);
  const fwd = sidePnl(side, notionalFx, S0, F, 0, T, rDom);

  // Importateur : long call → taux effectif = ST - max(ST-K,0) = min(ST,K)
  // Exportateur : long put  → taux effectif = ST + max(K-ST,0) = max(ST,K)
  let optEffective: number;
  let optPremium: number;
  let optName: string;
  if (side === "importer") {
    optEffective = ST - callPayoff(ST, K);
    optPremium = callPrem;
    optName = "Call vanilla";
  } else {
    optEffective = ST + putPayoff(ST, K);
    optPremium = putPrem;
    optName = "Put vanilla";
  }
  const optPnL = sidePnl(
    side,
    notionalFx,
    S0,
    optEffective,
    optPremium,
    T,
    rDom
  );

  const tunEff = tunnelEffectiveRate(ST, tunnel.kPut, tunnel.kCall);
  const tunPnL = sidePnl(
    side,
    notionalFx,
    S0,
    tunEff,
    tunnel.netPremium,
    T,
    rDom
  );

  // Futures : taux listé (basis) + coût de marge / unit FX
  const futPremPerUnit = futMarginMad / Math.max(notionalFx, 1);
  const futPnL = sidePnl(side, notionalFx, S0, fut, futPremPerUnit, T, rDom);

  return [
    {
      id: "unhedged",
      name: "Non couvert",
      effectiveRate: ST,
      premiumPaid: 0,
      pnl: unhedged,
    },
    {
      id: "forward",
      name: "Forward",
      effectiveRate: F,
      premiumPaid: 0,
      pnl: fwd,
    },
    {
      id: "call",
      name: optName,
      effectiveRate: optEffective,
      premiumPaid: optPremium,
      pnl: optPnL,
    },
    {
      id: "tunnel",
      name: "Tunnel",
      effectiveRate: tunEff,
      premiumPaid: tunnel.netPremium,
      pnl: tunPnL,
    },
    {
      id: "futures",
      name: "Futures",
      effectiveRate: fut,
      premiumPaid: futPremPerUnit,
      pnl: futPnL,
    },
  ];
}

/** Génère une courbe P&L vs spot futur. */
export function buildPnLCurve(
  input: SimInput,
  rangePct = 0.12,
  steps = 61
): CurvePoint[] {
  const lo = input.spot * (1 - rangePct);
  const hi = input.spot * (1 + rangePct);
  const points: CurvePoint[] = [];
  for (let i = 0; i < steps; i++) {
    const ST = lo + ((hi - lo) * i) / (steps - 1);
    const rows = pnlAtSpot(input, ST);
    const map = Object.fromEntries(rows.map((r) => [r.id, r.pnl]));
    points.push({
      ST: Math.round(ST * 10000) / 10000,
      unhedged: map.unhedged,
      forward: map.forward,
      call: map.call,
      tunnel: map.tunnel,
      futures: map.futures,
    });
  }
  return points;
}

/** Texte de recommandation — langage client. */
export function recommend(
  input: SimInput,
  scenarioST: number
): { bestId: string; text: string } {
  const all = pnlAtSpot(input, scenarioST);
  const rows = all.filter((r) => r.id !== "unhedged");
  const best = rows.reduce((a, b) => (a.pnl >= b.pnl ? a : b));
  const unhedged = all.find((r) => r.id === "unhedged")!;
  const opt = all.find((r) => r.id === "call")!;
  const shock = ((scenarioST - input.spot) / input.spot) * 100;
  const pairLabel = input.pair === "EURMAD" ? "EUR/MAD" : "USD/MAD";
  const amount = new Intl.NumberFormat("fr-MA").format(input.notionalFx);
  const fx = input.pair === "EURMAD" ? "EUR" : "USD";
  const adverse =
    (input.side === "importer" && shock > 1.5) ||
    (input.side === "exporter" && shock < -1.5);
  const favorable =
    (input.side === "importer" && shock < -1.5) ||
    (input.side === "exporter" && shock > 1.5);

  const deltaVsUnhedged = best.pnl - unhedged.pnl;

  let text = `Pour ${amount} ${fx} dans ${input.days} jours (${pairLabel}), `;
  text += `si le cours passe à ${scenarioST.toFixed(4)} (${shock >= 0 ? "+" : ""}${shock.toFixed(1)} %), `;
  text += `la solution la plus favorable dans ce scénario est « ${best.name} » `;
  text += `(${formatMad(best.pnl)}), soit ${deltaVsUnhedged >= 0 ? "+" : ""}${formatMad(deltaVsUnhedged)} `;
  text += `par rapport à ne rien couvrir (${formatMad(unhedged.pnl)}). `;

  if (adverse) {
    text +=
      input.side === "importer"
        ? "Sans couverture, vous paieriez plus cher votre devise. "
        : "Sans couverture, vous encaisseriez moins en dirhams. ";
    if (best.id === "forward" || best.id === "futures") {
      text +=
        "Un cours fixé à l’avance (change à terme ou futures) sécurise votre budget. ";
    } else if (best.id === "call") {
      text +=
        "L’option vous protège contre le mauvais scénario tout en gardant le bénéfice si le marché s’améliore. ";
    } else {
      text +=
        "Le tunnel encadre votre cours entre deux bornes, souvent sans payer de prime nette. ";
    }
  } else if (favorable) {
    text +=
      "Dans ce scénario, ne pas se couvrir serait plus avantageux — c’est le « coût » classique d’une assurance. ";
    text += `L’option (${opt.name}) limite ce regret en gardant une partie du gain possible. `;
  } else {
    text +=
      "Scénario calme : si votre facture est ferme, le change à terme donne de la certitude ; ";
    text +=
      "sinon un tunnel peut encadrer le budget sans prime, ou une option si vous acceptez de payer pour rester flexible. ";
  }

  text += "Indication du desk — à discuter avec votre chargé de clientèle.";

  return { bestId: best.id, text };
}

function formatMad(n: number): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(n);
}
