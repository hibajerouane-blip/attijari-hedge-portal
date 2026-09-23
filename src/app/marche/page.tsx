"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import HistoryChart from "@/components/HistoryChart";
import SpotCard from "@/components/SpotCard";
import type { MarketSnapshot } from "@/lib/market";
import type { FxPair } from "@/lib/constants";
import { formatFx } from "@/lib/format";

const PERIODS = [
  { id: "1M", days: 30, label: "1M" },
  { id: "3M", days: 90, label: "3M" },
  { id: "6M", days: 180, label: "6M" },
  { id: "1Y", days: 365, label: "1Y" },
  { id: "2Y", days: 730, label: "2Y" },
] as const;

const SPOT_REFRESH_MS = 60_000;

export default function MarchePage() {
  const [pair, setPair] = useState<FxPair>("EURMAD");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["id"]>("6M");
  const [snap, setSnap] = useState<MarketSnapshot | null>(null);
  const [err, setErr] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (p: FxPair, quiet = false) => {
    if (!quiet) setErr("");
    if (!quiet) setRefreshing(true);
    try {
      const r = await fetch(`/api/market/${p}`, { cache: "no-store" });
      const d = await r.json();
      if (d.error) {
        if (!quiet) setErr(d.error);
      } else {
        setSnap(d);
        setErr("");
      }
    } catch {
      if (!quiet) setErr("Erreur de chargement");
    } finally {
      if (!quiet) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setSnap(null);
    load(pair);
  }, [pair, load]);

  // Auto-refresh spot toutes les 60 s (Yahoo peut bouger entre deux publications BAM)
  useEffect(() => {
    const id = setInterval(() => load(pair, true), SPOT_REFRESH_MS);
    return () => clearInterval(id);
  }, [pair, load]);

  const filtered = useMemo(() => {
    if (!snap) return [];
    const days = PERIODS.find((p) => p.id === period)?.days ?? 180;
    return snap.history.slice(-days);
  }, [snap, period]);

  const stats = useMemo(() => {
    if (filtered.length < 2) return null;
    const closes = filtered.map((b) => b.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const first = closes[0];
    const last = closes[closes.length - 1];
    const perf = ((last - first) / first) * 100;
    return { min, max, perf };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-bank-900">Marché FX</h1>
          <p className="mt-1 text-sm text-bank-500">
            Cotations réelles EUR/MAD &amp; USD/MAD — historique Bank Al-Maghrib,
            spot Yahoo Finance.
            {refreshing ? (
              <span className="ml-2 text-bank-400">Actualisation…</span>
            ) : null}
          </p>
        </div>
        <div className="flex gap-2">
          {(["EURMAD", "USDMAD"] as FxPair[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPair(p)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                pair === p
                  ? "bg-bank-800 text-white"
                  : "border border-bank-200 bg-white text-bank-700"
              }`}
            >
              {p === "EURMAD" ? "EUR/MAD" : "USD/MAD"}
            </button>
          ))}
        </div>
      </div>

      {err && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {err}
        </div>
      )}

      {snap && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <SpotCard
              label={snap.label}
              spot={snap.spot}
              change1dPct={snap.change1dPct}
              source={snap.source}
              asOf={snap.asOf}
            />
            {stats && (
              <>
                <div className="card p-5">
                  <div className="text-xs uppercase text-bank-400">
                    Min / Max ({period})
                  </div>
                  <div className="mt-2 font-mono text-lg text-bank-900">
                    {formatFx(stats.min)} — {formatFx(stats.max)}
                  </div>
                </div>
                <div className="card p-5">
                  <div className="text-xs uppercase text-bank-400">
                    Performance ({period})
                  </div>
                  <div
                    className={`mt-2 text-lg font-semibold ${
                      stats.perf >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {stats.perf >= 0 ? "+" : ""}
                    {stats.perf.toFixed(2)} %
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="card p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                    period === p.id
                      ? "bg-brand-orange text-brand-bar"
                      : "bg-bank-100 text-bank-700 hover:bg-bank-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <HistoryChart
              data={filtered}
              color={pair === "EURMAD" ? "#2E2C38" : "#EE5B47"}
            />
          </div>

          <p className="text-[11px] text-bank-400">
            Historique : {snap.historySource} (cours de référence quotidien via
            Frankfurter) · Spot : {snap.source}
            {snap.source === "Yahoo Finance"
              ? " (rafraîchi toutes les 60 s)"
              : ""}{" "}
            · cotation indicative à usage interne.
          </p>
        </>
      )}
    </div>
  );
}
