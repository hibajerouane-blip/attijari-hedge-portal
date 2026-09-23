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
    <div className="h-80 w-full sm:h-[26rem]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 16, left: 4, bottom: 8 }}
        >
          <defs>
            <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#d9eef5" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#1e566d" }}
            minTickGap={48}
            axisLine={{ stroke: "#b3dde9" }}
            tickLine={false}
          />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(v) => formatFx(Number(v), 2)}
            tick={{ fontSize: 11, fill: "#1e566d" }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: "1px solid #b3dde9",
              boxShadow: "0 8px 24px rgba(15,39,52,0.1)",
            }}
            formatter={(v) => [formatFx(Number(v ?? 0)), "Clôture"]}
            labelFormatter={(l) => String(l)}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            fill="url(#histFill)"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
