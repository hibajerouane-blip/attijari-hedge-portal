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
import { formatFx, formatMad, formatPct } from "@/lib/format";

export default function SimulateurPage() {
  const [pair, setPair] = useState<FxPair>("EURMAD");
  const [side, setSide] = useState<Side>("importer");
  const [notionalFx, setNotionalFx] = useState(1_000_000);
  const [days, setDays] = useState(90);
  const [spot, setSpot] = useState(10.92);
  const [rDom, setRDom] = useState(DEFAULT_RATES.rMad * 100);
  const [rFor, setRFor] = useState(DEFAULT_RATES.rEur * 100);
  const [vol, setVol] = useState(DEFAULT_RATES.volEur * 100);
  const [shockPct, setShockPct] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const loadMarket = useCallback(async (p: FxPair) => {
    const res = await fetch(`/api/market/${p}`);
    const data = await res.json();
    if (!data.error) {
      setSpot(data.spot);
      setRDom(data.rDom * 100);
      setRFor(data.rFor * 100);
      setVol(data.vol * 100);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadMarket(pair);
    setRFor(foreignRate(pair) * 100);
    setVol(defaultVol(pair) * 100);
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
      rDom: rDom / 100,
      rFor: rFor / 100,
      vol: vol / 100,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-bank-900">
          Simulateur P&amp;L
        </h1>
        <p className="mt-1 text-sm text-bank-500">
          Comparez Forward, option vanilla, tunnel, futures et l&apos;exposition
          non couverte sous un scénario de spot futur.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="card space-y-4 p-5 lg:col-span-4">
          <h2 className="text-sm font-semibold text-bank-800">Paramètres</h2>

          <div>
            <label className="label">Paire</label>
            <select
              className="field"
              value={pair}
              onChange={(e) => setPair(e.target.value as FxPair)}
            >
              <option value="EURMAD">EUR/MAD</option>
              <option value="USDMAD">USD/MAD</option>
            </select>
          </div>

          <div>
            <label className="label">Profil</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["importer", "Importateur"],
                  ["exporter", "Exportateur"],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSide(v)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
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
            <label className="label">Notionnel (devise étrangère)</label>
            <input
              className="field font-mono"
              type="number"
              min={1000}
              step={10000}
              value={notionalFx}
              onChange={(e) => setNotionalFx(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="label">Horizon (jours)</label>
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
            <label className="label">Spot actuel</label>
            <input
              className="field font-mono"
              type="number"
              step={0.0001}
              value={spot}
              onChange={(e) => setSpot(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="label">r MAD %</label>
              <input
                className="field"
                type="number"
                step={0.05}
                value={rDom}
                onChange={(e) => setRDom(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">r FX %</label>
              <input
                className="field"
                type="number"
                step={0.05}
                value={rFor}
                onChange={(e) => setRFor(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Vol %</label>
              <input
                className="field"
                type="number"
                step={0.1}
                value={vol}
                onChange={(e) => setVol(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="label">
              Choc de spot : {formatPct(shockPct)} → {formatFx(scenarioST)}
            </label>
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
          </div>

          {loaded && (
            <div className="rounded-lg bg-bank-50 p-3 text-[11px] leading-relaxed text-bank-600">
              Forward IRP :{" "}
              <strong className="font-mono">{formatFx(priced.F)}</strong>
              <br />
              Futures (basis) :{" "}
              <strong className="font-mono">{formatFx(priced.fut)}</strong>
              {" · "}marge ≈{" "}
              <strong className="font-mono">
                {formatMad(priced.futMarginMad)}
              </strong>
              <br />
              Strike option ATM :{" "}
              <strong className="font-mono">{formatFx(priced.K)}</strong>
              <br />
              Tunnel [{formatFx(priced.tunnel.kPut)} ;{" "}
              {formatFx(priced.tunnel.kCall)}] · prime nette{" "}
              {formatFx(priced.tunnel.netPremium, 6)} MAD/unité
            </div>
          )}
        </aside>

        <section className="space-y-5 lg:col-span-8">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-bank-800">
              Courbes P&amp;L vs spot futur
            </h2>
            <PnLChart data={curve} spotRef={spot} />
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-bank-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-bank-800">
                Classement au scénario ({formatFx(scenarioST)})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bank-50 text-xs uppercase text-bank-500">
                  <tr>
                    <th className="px-5 py-2.5">#</th>
                    <th className="px-5 py-2.5">Instrument</th>
                    <th className="px-5 py-2.5">Taux effectif</th>
                    <th className="px-5 py-2.5">Prime / u.</th>
                    <th className="px-5 py-2.5 text-right">P&amp;L MAD</th>
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
              Recommandation desk
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
