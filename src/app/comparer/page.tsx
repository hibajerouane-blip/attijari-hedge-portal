"use client";

import { useEffect, useMemo, useState } from "react";
import PnLChart from "@/components/PnLChart";
import { buildPnLCurve, priceAllStrategies, type SimInput } from "@/lib/pricing";
import type { FxPair } from "@/lib/constants";
import { INSTRUMENT_META, DEFAULT_RATES, foreignRate, defaultVol } from "@/lib/constants";
import type { Side } from "@/lib/pricing/tunnel";
import { formatFx, formatMad } from "@/lib/format";

const TOGGLE_KEYS = ["unhedged", "forward", "call", "tunnel", "futures"] as const;

export default function ComparerPage() {
  const [pair, setPair] = useState<FxPair>("EURMAD");
  const [side, setSide] = useState<Side>("exporter");
  const [spot, setSpot] = useState(10.92);
  const [visible, setVisible] = useState<Record<string, boolean>>({
    unhedged: true,
    forward: true,
    call: true,
    tunnel: true,
    futures: true,
  });

  useEffect(() => {
    fetch(`/api/market/${pair}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setSpot(d.spot);
      });
  }, [pair]);

  const input: SimInput = useMemo(
    () => ({
      pair,
      side,
      notionalFx: 1_000_000,
      days: 90,
      spot,
      rDom: DEFAULT_RATES.rMad,
      rFor: foreignRate(pair),
      vol: defaultVol(pair),
    }),
    [pair, side, spot]
  );

  const curve = useMemo(() => buildPnLCurve(input, 0.15), [input]);
  const priced = useMemo(() => priceAllStrategies(input), [input]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-bank-900">
          Comparer les instruments
        </h1>
        <p className="mt-1 text-sm text-bank-500">
          Diagrammes de payoff (P&amp;L) côte à côte — notionnel 1 M de devise
          étrangère, horizon 90 jours.
        </p>
      </div>

      <div className="card flex flex-wrap items-end gap-4 p-5">
        <div>
          <label className="label">Paire</label>
          <select
            className="field w-40"
            value={pair}
            onChange={(e) => setPair(e.target.value as FxPair)}
          >
            <option value="EURMAD">EUR/MAD</option>
            <option value="USDMAD">USD/MAD</option>
          </select>
        </div>
        <div>
          <label className="label">Profil</label>
          <select
            className="field w-44"
            value={side}
            onChange={(e) => setSide(e.target.value as Side)}
          >
            <option value="importer">Importateur</option>
            <option value="exporter">Exportateur</option>
          </select>
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
              {INSTRUMENT_META[k].name}
            </label>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <PnLChart data={curve} spotRef={spot} visible={visible} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetaCard
          title="Forward OTC"
          body={`Prix IRP ${formatFx(priced.F)} — payoff plat, sans marge.`}
        />
        <MetaCard
          title="Futures listé"
          body={`F_fut ${formatFx(priced.fut)} · marge ≈ ${formatMad(priced.futMarginMad)} — plat, distinct du forward.`}
        />
        <MetaCard
          title="Option ATM"
          body={`Strike ${formatFx(priced.K)} · prime call ${formatFx(priced.callPrem, 4)} · put ${formatFx(priced.putPrem, 4)} MAD/u.`}
        />
        <MetaCard
          title="Tunnel"
          body={`Corridor [${formatFx(priced.tunnel.kPut)} ; ${formatFx(priced.tunnel.kCall)}] · net ${formatFx(priced.tunnel.netPremium, 6)}.`}
        />
        <MetaCard
          title="Non couvert"
          body="P&L linéaire vs spot futur — baseline de risque de change."
        />
      </div>
    </div>
  );
}

function MetaCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-bank-400">
        {title}
      </div>
      <p className="mt-1 text-sm text-bank-700">{body}</p>
    </div>
  );
}
