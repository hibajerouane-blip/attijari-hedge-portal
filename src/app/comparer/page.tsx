"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PnLChart from "@/components/PnLChart";
import ScenarioExplorer from "@/components/ScenarioExplorer";
import { buildPnLCurve, type SimInput } from "@/lib/pricing";
import type { FxPair } from "@/lib/constants";
import {
  INSTRUMENT_META,
  DEFAULT_RATES,
  foreignRate,
  defaultVol,
} from "@/lib/constants";
import type { Side } from "@/lib/pricing/tunnel";
import { formatFx, formatNumber } from "@/lib/format";

const TOGGLE_KEYS = [
  "unhedged",
  "forward",
  "call",
  "tunnel",
  "futures",
] as const;

export default function ComparerPage() {
  const [pair, setPair] = useState<FxPair>("EURMAD");
  const [side, setSide] = useState<Side>("importer");
  const [notionalFx, setNotionalFx] = useState(1_000_000);
  const [days, setDays] = useState(90);
  const [spot, setSpot] = useState(10.92);
  const [rDom, setRDom] = useState<number>(DEFAULT_RATES.rMad);
  const [rFor, setRFor] = useState<number>(DEFAULT_RATES.rEur);
  const [vol, setVol] = useState<number>(DEFAULT_RATES.volEur);
  const [visible, setVisible] = useState<Record<string, boolean>>({
    unhedged: true,
    forward: true,
    call: true,
    tunnel: true,
    futures: true,
  });

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
  }, []);

  useEffect(() => {
    setRFor(foreignRate(pair));
    setVol(defaultVol(pair));
    loadMarket(pair);
  }, [pair, loadMarket]);

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

  const curve = useMemo(() => buildPnLCurve(input, 0.15), [input]);
  const fxLabel = pair === "EURMAD" ? "EUR" : "USD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-bank-900">
          Comparer les solutions
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-bank-500">
          Comparez les solutions sous plusieurs hypothèses de marché — ce que
          vous gagnez ou perdez si le cours monte, baisse, ou reste stable.
        </p>
      </div>

      <div className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
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
                ["importer", "J’importe"],
                ["exporter", "J’exporte"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setSide(v)}
                className={`rounded-lg border px-2 py-2 text-center text-xs font-medium transition ${
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
          <label className="label">Montant en {fxLabel}</label>
          <input
            className="field font-mono"
            type="number"
            min={1000}
            step={10000}
            value={notionalFx}
            onChange={(e) => setNotionalFx(Number(e.target.value))}
          />
          <p className="mt-1 text-[11px] text-bank-400">
            Ex. {formatNumber(1_000_000)} {fxLabel}
          </p>
        </div>

        <div>
          <label className="label">Échéance (jours)</label>
          <input
            className="field"
            type="number"
            min={1}
            max={730}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
          <p className="mt-1 text-[11px] text-bank-400">
            Cours actuel :{" "}
            <span className="font-mono text-bank-600">{formatFx(spot)}</span>{" "}
            MAD / {fxLabel}
          </p>
        </div>
      </div>

      <ScenarioExplorer input={input} />

      <div className="card p-5">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-bank-800">
              Vue d’ensemble selon le cours futur
            </h2>
            <p className="mt-0.5 text-[11px] text-bank-500">
              Chaque courbe montre le résultat en MAD si le cours évolue —
              cochez les solutions à afficher.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOGGLE_KEYS.map((k) => (
              <label
                key={k}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-bank-200 bg-white px-3 py-1.5 text-xs"
              >
                <input
                  type="checkbox"
                  checked={visible[k]}
                  onChange={(e) =>
                    setVisible((v) => ({ ...v, [k]: e.target.checked }))
                  }
                  className="accent-brand-orange"
                />
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: INSTRUMENT_META[k].color }}
                />
                {k === "unhedged"
                  ? "Sans couverture"
                  : k === "forward"
                    ? "Change à terme"
                    : INSTRUMENT_META[k].name}
              </label>
            ))}
          </div>
        </div>
        <PnLChart data={curve} spotRef={spot} visible={visible} />
      </div>
    </div>
  );
}
