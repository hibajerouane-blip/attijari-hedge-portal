"use client";

import { useMemo, useState } from "react";
import { pnlAtSpot, type SimInput, type StrategyPoint } from "@/lib/pricing";
import { formatFx, formatMad } from "@/lib/format";
import { PAIR_LABELS } from "@/lib/constants";

const AMP_MIN = 3;
const AMP_MAX = 12;
const AMP_DEFAULT = 8;
/** Seuil sous lequel on parle de résultat « proche de zéro ». */
const NEAR_ZERO = 500;

function outcomePhrase(pnl: number): string {
  if (Math.abs(pnl) < NEAR_ZERO) return "Résultat proche de zéro";
  if (pnl >= 0) return `Vous gagnez ${formatMad(pnl)}`;
  return `Vous perdez ${formatMad(Math.abs(pnl))}`;
}

function vsUnhedgedPhrase(pnl: number, unhedgedPnl: number): string | null {
  const delta = pnl - unhedgedPnl;
  if (Math.abs(delta) < NEAR_ZERO) return null;
  if (delta > 0) return `${formatMad(delta)} de plus que sans couverture`;
  return `${formatMad(Math.abs(delta))} de moins que sans couverture`;
}

function displayName(row: StrategyPoint): string {
  if (row.id === "unhedged") return "Sans couverture";
  if (row.id === "forward") return "Change à terme";
  return row.name;
}

type ScenarioCol = {
  key: "down" | "flat" | "up";
  title: string;
  pctLabel: string;
  ST: number;
  rows: StrategyPoint[];
  bestId: string;
};

export default function ScenarioExplorer({
  input,
  className = "",
}: {
  input: SimInput;
  className?: string;
}) {
  const [amplitude, setAmplitude] = useState(AMP_DEFAULT);

  const pairLabel = PAIR_LABELS[input.pair];
  const fxUnit = input.pair === "EURMAD" ? "EUR" : "USD";

  const columns = useMemo<ScenarioCol[]>(() => {
    const amp = amplitude / 100;
    const defs: Array<{
      key: ScenarioCol["key"];
      title: string;
      shock: number;
    }> = [
      { key: "down", title: "Cours baisse", shock: -amp },
      { key: "flat", title: "Cours stable", shock: 0 },
      { key: "up", title: "Cours monte", shock: amp },
    ];

    return defs.map((d) => {
      const ST = input.spot * (1 + d.shock);
      const rows = pnlAtSpot(input, ST);
      // Meilleure solution = meilleur P&L (y compris sans couverture)
      const best = rows.reduce((a, b) => (a.pnl >= b.pnl ? a : b));
      const pct =
        d.shock === 0
          ? "0 %"
          : `${d.shock > 0 ? "+" : "−"}${(Math.abs(d.shock) * 100).toFixed(0)} %`;
      return {
        key: d.key,
        title: d.title,
        pctLabel: pct,
        ST,
        rows,
        bestId: best.id,
      };
    });
  }, [input, amplitude]);

  return (
    <div className={`card p-5 ${className}`.trim()}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-bank-900 sm:text-lg">
            Et si le cours évolue ?
          </h2>
          <p className="mt-1 max-w-xl text-sm text-bank-500">
            Vous ne connaissez pas l’avenir — comparez trois hypothèses.
          </p>
        </div>
        <div className="w-full sm:max-w-xs">
          <label className="label normal-case tracking-normal">
            Amplitude du scénario : ± {amplitude} %
          </label>
          <input
            type="range"
            min={AMP_MIN}
            max={AMP_MAX}
            step={1}
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
            className="w-full accent-brand-orange"
            aria-label="Amplitude du scénario"
          />
          <div className="mt-0.5 flex justify-between text-[10px] text-bank-400">
            <span>± {AMP_MIN} %</span>
            <span>± {AMP_MAX} %</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {columns.map((col) => {
          const unhedged = col.rows.find((r) => r.id === "unhedged");
          return (
            <div
              key={col.key}
              className={`flex flex-col rounded-xl border p-4 ${
                col.key === "flat"
                  ? "border-bank-200 bg-bank-50/60"
                  : col.key === "down"
                    ? "border-rose-100 bg-rose-50/40"
                    : "border-emerald-100 bg-emerald-50/40"
              }`}
            >
              <div className="mb-3 border-b border-bank-100/80 pb-3">
                <div className="text-sm font-semibold text-bank-900">
                  {col.title}
                </div>
                <div className="mt-0.5 text-xs text-bank-500">
                  {col.pctLabel}
                  {" · "}
                  <span className="font-mono text-bank-700">
                    {formatFx(col.ST)}
                  </span>{" "}
                  MAD / {fxUnit}
                </div>
              </div>

              <ul className="flex flex-1 flex-col gap-2.5">
                {col.rows.map((row) => {
                  const isBest = row.id === col.bestId;
                  const vs =
                    row.id !== "unhedged" && unhedged
                      ? vsUnhedgedPhrase(row.pnl, unhedged.pnl)
                      : null;
                  return (
                    <li
                      key={row.id}
                      className={`rounded-lg px-2.5 py-2 ${
                        isBest
                          ? "bg-white shadow-sm ring-1 ring-brand-orange/50"
                          : "bg-white/70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-semibold text-bank-800">
                              {displayName(row)}
                            </span>
                            {isBest && (
                              <span className="rounded-full bg-brand-orange px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-bar">
                                Meilleure
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-snug text-bank-500">
                            {outcomePhrase(row.pnl)}
                          </p>
                          {vs && (
                            <p className="mt-0.5 text-[10px] leading-snug text-bank-400">
                              {vs}
                            </p>
                          )}
                        </div>
                        <div
                          className={`shrink-0 text-right text-sm font-semibold tabular-nums ${
                            row.pnl >= 0 ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {formatMad(row.pnl)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-5 border-t border-bank-100 pt-4 text-[11px] leading-relaxed text-bank-500">
        Le résultat indique ce que vous gagnez ou perdez en dirhams par rapport
        à un échange au cours d’aujourd’hui ({formatFx(input.spot)}{" "}
        {pairLabel}). C’est une lecture simple pour comparer les solutions —
        pas une prévision du marché.
      </p>
    </div>
  );
}
