"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  Tooltip,
} from "recharts";

interface Point {
  date: string;
  close: number;
}

export default function MiniChart({
  data,
  color = "#1e566d",
  gradId = "mini",
}: {
  data: Point[];
  color?: string;
  /** Identifiant unique de gradient (évite les collisions / ids invalides). */
  gradId?: string;
}) {
  const sliced = data.slice(-90);
  const gid = `g-${gradId}`;
  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sliced} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #b3dde9",
              boxShadow: "0 8px 24px rgba(15,39,52,0.08)",
            }}
            formatter={(v) => [
              typeof v === "number" ? v.toFixed(4) : String(v ?? ""),
              "Cours",
            ]}
            labelFormatter={(l) => String(l)}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            fill={`url(#${gid})`}
            strokeWidth={1.75}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
