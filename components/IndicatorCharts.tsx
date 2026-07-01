"use client";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

export interface IndicatorPoint {
  date: string;
  rsi: number | null;
  hist: number;
}

const tooltipStyle = {
  contentStyle: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "#94a3b8" },
};

/** 지표 미니차트 — 캔들 아래 RSI / MACD를 적당한 크기로 */
export default function IndicatorCharts({ data }: { data: IndicatorPoint[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-700/50 bg-slate-900 p-4">
        <p className="mb-2 text-sm font-semibold text-slate-300">
          RSI (14) <span className="text-xs text-slate-500">· 70↑ 과매수 / 30↓ 과매도</span>
        </p>
        <ResponsiveContainer width="100%" height={110}>
          <LineChart data={data} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis
              domain={[0, 100]}
              ticks={[30, 70]}
              tick={{ fontSize: 10, fill: "#64748b" }}
              width={26}
            />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
            <Tooltip
              {...tooltipStyle}
              formatter={(v) => [Number(v).toFixed(1), "RSI"]}
            />
            <Line
              dataKey="rsi"
              stroke="#eab308"
              dot={false}
              strokeWidth={1.6}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-900 p-4">
        <p className="mb-2 text-sm font-semibold text-slate-300">
          MACD <span className="text-xs text-slate-500">· 히스토그램 (매수/매도 모멘텀)</span>
        </p>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={data} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} width={26} />
            <ReferenceLine y={0} stroke="#334155" />
            <Tooltip
              {...tooltipStyle}
              formatter={(v) => [Number(v).toFixed(3), "MACD Hist"]}
            />
            <Bar dataKey="hist" isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.hist >= 0 ? "#10b98199" : "#ef444499"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
