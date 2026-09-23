"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatFx } from "@/lib/format";

interface Bar {
  date: string;
  close: number;
}

export default function HistoryChart({
  data,
  color = "#1e566d",
}: {
  data: Bar[];
  color?: string;
}) {
  return (
    <div className="h-80 w-full sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            minTickGap={40}
          />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(v) => formatFx(Number(v), 2)}
            tick={{ fontSize: 11 }}
            width={56}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #b3dde9",
            }}
            formatter={(v) => [
              formatFx(Number(v ?? 0)),
              "Clôture",
            ]}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            fill="url(#histFill)"
            strokeWidth={1.75}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
