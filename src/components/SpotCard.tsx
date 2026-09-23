"use client";

import { formatFx, formatPct } from "@/lib/format";

interface Props {
  label: string;
  spot: number;
  change1dPct: number;
  source: string;
  asOf: string;
}

export default function SpotCard({
  label,
  spot,
  change1dPct,
  source,
  asOf,
}: Props) {
  const up = change1dPct >= 0;
  return (
    <div className="rounded-xl border border-bank-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-bank-500">
            {label}
          </div>
          <div className="mt-1 font-mono text-3xl font-semibold text-bank-900">
            {formatFx(spot)}
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            up
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {formatPct(change1dPct)}
        </span>
      </div>
      <div className="mt-3 text-[11px] text-bank-400">
        {source} · au {asOf}
      </div>
    </div>
  );
}
