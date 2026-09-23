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
    <div className="h-80 w-full sm:h-[26rem]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 12, right: 16, left: 4, bottom: 12 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#d9eef5" vertical={false} />
          <XAxis
            dataKey="ST"
            tickFormatter={(v) => formatFx(Number(v), 2)}
            tick={{ fontSize: 11, fill: "#1e566d" }}
            axisLine={{ stroke: "#b3dde9" }}
            tickLine={false}
            label={{
              value: "Spot futur (MAD / FX)",
              position: "insideBottom",
              offset: -4,
              fontSize: 11,
              fill: "#64748b",
            }}
          />
          <YAxis
            tickFormatter={(v) =>
              new Intl.NumberFormat("fr-MA", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(Number(v))
            }
            tick={{ fontSize: 11, fill: "#1e566d" }}
            axisLine={false}
            tickLine={false}
            width={58}
            label={{
              value: "P&L MAD",
              angle: -90,
              position: "insideLeft",
              offset: 8,
              fontSize: 11,
              fill: "#64748b",
            }}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: "1px solid #b3dde9",
              boxShadow: "0 8px 24px rgba(15,39,52,0.1)",
              background: "#fff",
            }}
            formatter={(value, name) => [
              formatMad(Number(value ?? 0)),
              String(name),
            ]}
            labelFormatter={(l) => `Spot ${formatFx(Number(l))}`}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            iconType="plainline"
          />
          {spotRef != null && (
            <ReferenceLine
              x={spotRef}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: "S₀", fontSize: 10, fill: "#64748b" }}
            />
          )}
          <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
          {KEYS.map((k) => {
            if (visible && visible[k.key] === false) return null;
            return (
              <Line
                key={k.key}
                type="monotone"
                dataKey={k.key}
                name={k.name}
                stroke={k.color}
                strokeWidth={k.key === "unhedged" ? 1.5 : 2.25}
                strokeDasharray={
                  k.key === "unhedged"
                    ? "6 4"
                    : k.key === "futures"
                      ? "2 3"
                      : undefined
                }
                dot={false}
                activeDot={{ r: 3 }}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
