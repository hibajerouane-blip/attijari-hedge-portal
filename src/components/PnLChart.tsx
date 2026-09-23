"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { INSTRUMENT_META } from "@/lib/constants";
import type { CurvePoint } from "@/lib/pricing";
import { formatMad, formatFx } from "@/lib/format";

const KEYS = [
  { key: "unhedged", ...INSTRUMENT_META.unhedged },
  { key: "forward", ...INSTRUMENT_META.forward },
  { key: "call", ...INSTRUMENT_META.call },
  { key: "tunnel", ...INSTRUMENT_META.tunnel },
  { key: "futures", ...INSTRUMENT_META.futures },
] as const;

export default function PnLChart({
  data,
  spotRef,
  visible,
}: {
  data: CurvePoint[];
  spotRef?: number;
  visible?: Partial<Record<string, boolean>>;
}) {
  return (
    <div className="h-80 w-full sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="ST"
            tickFormatter={(v) => formatFx(Number(v), 2)}
            tick={{ fontSize: 11 }}
            label={{
              value: "Spot futur",
              position: "insideBottom",
              offset: -2,
              fontSize: 11,
            }}
          />
          <YAxis
            tickFormatter={(v) =>
              new Intl.NumberFormat("fr-MA", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(Number(v))
            }
            tick={{ fontSize: 11 }}
            width={56}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #b3dde9",
            }}
            formatter={(value, name) => [
              formatMad(Number(value ?? 0)),
              String(name),
            ]}
            labelFormatter={(l) => `Spot ${formatFx(Number(l))}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {spotRef != null && (
            <ReferenceLine
              x={spotRef}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: "S0", fontSize: 10, fill: "#64748b" }}
            />
          )}
          <ReferenceLine y={0} stroke="#cbd5e1" />
          {KEYS.map((k) => {
            if (visible && visible[k.key] === false) return null;
            return (
              <Line
                key={k.key}
                type="monotone"
                dataKey={k.key}
                name={k.name}
                stroke={k.color}
                strokeWidth={k.key === "unhedged" ? 1.5 : 2}
                strokeDasharray={k.key === "unhedged" ? "6 4" : undefined}
                dot={false}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
