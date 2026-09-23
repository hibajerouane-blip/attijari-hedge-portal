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

/** Texte de recommandation commerciale. */
export function recommend(
  input: SimInput,
  scenarioST: number
): { bestId: string; text: string } {
  const all = pnlAtSpot(input, scenarioST);
  const rows = all.filter((r) => r.id !== "unhedged");
  const best = rows.reduce((a, b) => (a.pnl >= b.pnl ? a : b));
  const unhedged = all.find((r) => r.id === "unhedged")!;
  const fwd = all.find((r) => r.id === "forward")!;
  const opt = all.find((r) => r.id === "call")!;
  const tun = all.find((r) => r.id === "tunnel")!;
  const fut = all.find((r) => r.id === "futures")!;
  const shock = ((scenarioST - input.spot) / input.spot) * 100;
  const sideFr = input.side === "importer" ? "importateur" : "exportateur";
  const pairLabel = input.pair === "EURMAD" ? "EUR/MAD" : "USD/MAD";
  const adverse =
    (input.side === "importer" && shock > 1.5) ||
    (input.side === "exporter" && shock < -1.5);
  const favorable =
    (input.side === "importer" && shock < -1.5) ||
    (input.side === "exporter" && shock > 1.5);

  const deltaVsUnhedged = best.pnl - unhedged.pnl;

  let text = `Scénario ${shock >= 0 ? "+" : ""}${shock.toFixed(1)} % sur ${pairLabel} `;
  text += `(spot futur ${scenarioST.toFixed(4)} MAD). Profil ${sideFr}, `;
  text += `notionnel ${new Intl.NumberFormat("fr-MA").format(input.notionalFx)} FX · ${input.days} j. `;
  text += `Meilleur P&L couvert : « ${best.name} » (${formatMad(best.pnl)}), `;
  text += `soit ${deltaVsUnhedged >= 0 ? "+" : ""}${formatMad(deltaVsUnhedged)} vs non couvert (${formatMad(unhedged.pnl)}). `;

  if (adverse) {
    text +=
      input.side === "importer"
        ? "La devise s'apprécie : le non couvert paie plus cher. "
        : "La devise s'affaiblit : le non couvert encaisse moins. ";
    if (best.id === "forward" || best.id === "futures") {
      text +=
        "Un taux fixe (forward OTC ou futures listé) verrouille le budget — " +
        "le futures intègre un léger basis + coût de marge. ";
    } else if (best.id === "call") {
      text +=
        "L'option de protection plafonne le pire cas tout en laissant un upside si le spot revient. ";
    } else {
      text +=
        "Le tunnel borne le taux dans un corridor sans décaissement de prime nette (upside partiellement cédé). ";
    }
  } else if (favorable) {
    text +=
      "Scénario favorable au client non couvert : la couverture « coûte » en coût d'opportunité. ";
    text += `L'option (${opt.name}) limite ce regret en gardant une partie de l'upside ; `;
    text += `forward (${formatMad(fwd.pnl)}) et futures (${formatMad(fut.pnl)}) restent plats. `;
    text += `Tunnel : ${formatMad(tun.pnl)}. `;
  } else {
    text +=
      "Scénario calme : privilégier la certitude budgétaire (forward) si la facture est ferme ; ";
    text +=
      "sinon tunnel zéro-coût pour un compromis commercial, ou option si la volatilité est élevée et le client accepte la prime. ";
  }

  text +=
    "Rappel : indication desk — ne constitue pas un conseil en investissement.";

  return { bestId: best.id, text };
}

function formatMad(n: number): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(n);
}
