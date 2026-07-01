"use client";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { SeriesPoint } from "@/lib/yahoo";

export default function MiniChart({
  data,
  color,
}: {
  data: SeriesPoint[];
  color: string;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center text-xs text-slate-600">
        데이터를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={data}>
        <XAxis dataKey="date" hide />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#94a3b8" }}
          itemStyle={{ color }}
          formatter={(v) => [Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 }), "종가"]}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
