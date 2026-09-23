"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PnLChart from "@/components/PnLChart";
import {
  buildPnLCurve,
  pnlAtSpot,
  priceAllStrategies,
  recommend,
  type SimInput,
} from "@/lib/pricing";
import type { FxPair } from "@/lib/constants";
import { DEFAULT_RATES, foreignRate, defaultVol } from "@/lib/constants";
import type { Side } from "@/lib/pricing/tunnel";
import { formatFx, formatMad, formatPct, formatNumber } from "@/lib/format";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function SimulateurPage() {
  const [pair, setPair] = useState<FxPair>("EURMAD");
  const [side, setSide] = useState<Side>("importer");
  const [notionalFx, setNotionalFx] = useState(1_000_000);
  const [days, setDays] = useState(90);
  const [spot, setSpot] = useState(10.92);
  // Desk params — kept in background, not shown as client fields
  const [rDom, setRDom] = useState<number>(DEFAULT_RATES.rMad);
  const [rFor, setRFor] = useState<number>(DEFAULT_RATES.rEur);
  const [vol, setVol] = useState<number>(DEFAULT_RATES.volEur);
  const [shockPct, setShockPct] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const loadMarket = useCallback(async (p: FxPair) => {
    const res = await fetch(`/api/market/${p}`);
    const data = await res.json();
    if (!data.error) {
      setSpot(Number(data.spot));
      if (typeof data.rDom === "number") setRDom(data.rDom);
      if (typeof data.rFor === "number") setRFor(data.rFor);
      if (typeof data.vol === "number") setVol(data.vol);
    } else {
      setRFor(foreignRate(p));
      setVol(defaultVol(p));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    setRFor(foreignRate(pair));
    setVol(defaultVol(pair));
    loadMarket(pair);
  }, [pair, loadMarket]);

  const scenarioST = useMemo(
    () => spot * (1 + shockPct / 100),
    [spot, shockPct]
  );

  const input: SimInput = useMemo(
    () => ({
      pair,
      side,
      notionalFx,
      days,
      spot,
      rDom,
      rFor,
      vol,
    }),
    [pair, side, notionalFx, days, spot, rDom, rFor, vol]
  );

  const curve = useMemo(() => buildPnLCurve(input), [input]);
  const priced = useMemo(() => priceAllStrategies(input), [input]);
  const ranking = useMemo(
    () =>
      [...pnlAtSpot(input, scenarioST)].sort((a, b) => b.pnl - a.pnl),
    [input, scenarioST]
  );
  const reco = useMemo(
    () => recommend(input, scenarioST),
    [input, scenarioST]
  );

  const fxLabel = pair === "EURMAD" ? "EUR" : "USD";
  const shockHint =
    shockPct === 0
      ? "Cours inchangé par rapport à aujourd’hui"
      : shockPct > 0
        ? side === "importer"
          ? "La devise étrangère devient plus chère en MAD (défavorable à l’importateur)"
          : "La devise étrangère devient plus chère en MAD (favorable à l’exportateur)"
        : side === "importer"
          ? "La devise étrangère devient moins chère en MAD (favorable à l’importateur)"
          : "La devise étrangère devient moins chère en MAD (défavorable à l’exportateur)";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-bank-900">
          Simulateur
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-bank-500">
          Décrivez votre besoin en devises, choisissez un scénario de cours, et
          comparez ce que chaque solution de couverture vous apporterait — face
          au cas sans couverture.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="card space-y-4 p-5 lg:col-span-4">
          <h2 className="text-sm font-semibold text-bank-800">
            Votre besoin
          </h2>

          <div>
            <label className="label">Devise</label>
            <select
              className="field"
              value={pair}
              onChange={(e) => setPair(e.target.value as FxPair)}
            >
              <option value="EURMAD">Euro (EUR / MAD)</option>
              <option value="USDMAD">Dollar (USD / MAD)</option>
            </select>
          </div>

          <div>
            <label className="label">Votre situation</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["importer", "J’importe (j’achète la devise)"],
                  ["exporter", "J’exporte (je vends la devise)"],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSide(v)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium leading-snug transition sm:text-sm ${
                    side === v
                      ? "border-bank-800 bg-bank-800 text-white"
                      : "border-bank-200 bg-white text-bank-700 hover:bg-bank-50"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">
              Montant en {fxLabel}
            </label>
            <input
              className="field font-mono"
              type="number"
              min={1000}
              step={10000}
              value={notionalFx}
              onChange={(e) => setNotionalFx(Number(e.target.value))}
            />
            <p className="mt-1 text-[11px] text-bank-400">
              Ex. {formatNumber(1_000_000)} {fxLabel} à couvrir
            </p>
          </div>

          <div>
            <label className="label">Échéance (dans combien de jours ?)</label>
            <input
              className="field"
              type="number"
              min={1}
              max={730}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="label">Cours actuel du marché</label>
            <div className="field flex items-center justify-between bg-bank-50 font-mono text-bank-900">
              <span>{formatFx(spot)}</span>
              <span className="text-[10px] font-sans font-medium uppercase tracking-wide text-bank-400">
                MAD / {fxLabel}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-bank-400">
              Mis à jour depuis le marché (modifiable ci-dessous si besoin).
            </p>
            {showAdvanced && (
              <input
                className="field mt-2 font-mono"
                type="number"
                step={0.0001}
                value={spot}
                onChange={(e) => setSpot(Number(e.target.value))}
              />
            )}
          </div>

          <div>
            <label className="label">
              Et si le cours bouge de {formatPct(round2(shockPct))} ?
            </label>
            <p className="mb-2 text-[11px] leading-relaxed text-bank-500">
              Nouveau cours envisagé :{" "}
              <strong className="font-mono text-bank-800">
                {formatFx(scenarioST)}
              </strong>{" "}
              MAD / {fxLabel}
            </p>
            <input
              type="range"
              min={-12}
              max={12}
              step={0.25}
              value={shockPct}
              onChange={(e) => setShockPct(Number(e.target.value))}
              className="w-full accent-brand-orange"
            />
            <div className="mt-1 flex justify-between text-[10px] text-bank-400">
              <span>−12 %</span>
              <span>0</span>
              <span>+12 %</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-bank-500">
              {shockHint}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-left text-[11px] font-medium text-bank-500 underline-offset-2 hover:text-bank-800 hover:underline"
          >
            {showAdvanced
              ? "Masquer les réglages avancés"
              : "Réglages avancés (desk)"}
          </button>

          {showAdvanced && (
            <div className="space-y-3 rounded-lg border border-bank-100 bg-bank-50/80 p-3">
              <p className="text-[11px] text-bank-500">
                Paramètres utilisés en coulisse pour le calcul. Un client n’a
                en général pas besoin de les modifier.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label">Taux MAD %</label>
                  <input
                    className="field"
                    type="number"
                    step={0.05}
                    value={round2(rDom * 100)}
                    onChange={(e) =>
                      setRDom(round2(Number(e.target.value)) / 100)
                    }
                  />
                </div>
                <div>
                  <label className="label">Taux {fxLabel} %</label>
                  <input
                    className="field"
                    type="number"
                    step={0.05}
                    value={round2(rFor * 100)}
                    onChange={(e) =>
                      setRFor(round2(Number(e.target.value)) / 100)
                    }
                  />
                </div>
                <div>
                  <label className="label">Volatilité %</label>
                  <input
                    className="field"
                    type="number"
                    step={0.1}
                    value={round2(vol * 100)}
                    onChange={(e) =>
                      setVol(round2(Number(e.target.value)) / 100)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {loaded && (
            <div className="rounded-lg bg-bank-50 p-3 text-[11px] leading-relaxed text-bank-600">
              <div className="font-semibold text-bank-700">
                En résumé pour votre besoin
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4">
                <li>
                  Cours à terme indicatif :{" "}
                  <strong className="font-mono">{formatFx(priced.F)}</strong>
                </li>
                <li>
                  Protection option (cours de référence) :{" "}
                  <strong className="font-mono">{formatFx(priced.K)}</strong>
                </li>
                <li>
                  Tunnel entre{" "}
                  <strong className="font-mono">
                    {formatFx(priced.tunnel.kPut)}
                  </strong>{" "}
                  et{" "}
                  <strong className="font-mono">
                    {formatFx(priced.tunnel.kCall)}
                  </strong>
                </li>
              </ul>
            </div>
          )}
        </aside>

        <section className="space-y-5 lg:col-span-8">
          <div className="card p-5">
            <h2 className="mb-1 text-sm font-semibold text-bank-800">
              Résultat selon le cours futur
            </h2>
            <p className="mb-3 text-[11px] text-bank-500">
              Chaque courbe montre le gain ou la perte en MAD par rapport à ne
              rien couvrir, selon le cours le jour J.
            </p>
            <PnLChart data={curve} spotRef={spot} />
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-bank-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-bank-800">
                Comparaison au scénario ({formatFx(scenarioST)} MAD / {fxLabel})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bank-50 text-xs uppercase text-bank-500">
                  <tr>
                    <th className="px-5 py-2.5">#</th>
                    <th className="px-5 py-2.5">Solution</th>
                    <th className="px-5 py-2.5">Cours effectif</th>
                    <th className="px-5 py-2.5">Coût de protection</th>
                    <th className="px-5 py-2.5 text-right">Résultat (MAD)</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-t border-bank-100 ${
                        r.id === reco.bestId ? "bg-brand-orange-soft/70" : ""
                      }`}
                    >
                      <td className="px-5 py-2.5 text-bank-400">{i + 1}</td>
                      <td className="px-5 py-2.5 font-medium text-bank-900">
                        {r.name}
                      </td>
                      <td className="px-5 py-2.5 font-mono text-xs">
                        {formatFx(r.effectiveRate)}
                      </td>
                      <td className="px-5 py-2.5 font-mono text-xs">
                        {formatFx(r.premiumPaid, 6)}
                      </td>
                      <td
                        className={`px-5 py-2.5 text-right font-semibold ${
                          r.pnl >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {formatMad(r.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-brand-orange/40 bg-gradient-to-r from-brand-bar to-brand-ink p-5 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-orange">
              Ce que le desk vous recommande
            </div>
            <p className="mt-2 text-sm leading-relaxed text-brand-light/90">
              {reco.text}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
