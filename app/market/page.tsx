"use client";
import { marketIndices, chartData } from "@/lib/mockData";
import IndexCard from "@/components/IndexCard";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";

const sectorData = [
  { sector: "반도체", us: 12.4, kr: 8.7 },
  { sector: "AI·클라우드", us: 18.2, kr: 3.1 },
  { sector: "2차전지", us: -2.1, kr: 6.3 },
  { sector: "바이오", us: 5.8, kr: -1.4 },
  { sector: "금융", us: 3.2, kr: 2.8 },
  { sector: "에너지", us: -1.5, kr: 0.9 },
];

const fearGreedData = [
  { date: "5/1", value: 42 }, { date: "5/5", value: 51 }, { date: "5/8", value: 58 },
  { date: "5/12", value: 65 }, { date: "5/14", value: 71 },
];

export default function MarketPage() {
  const fearValue = fearGreedData[fearGreedData.length - 1].value;
  const fearLabel = fearValue >= 70 ? "탐욕" : fearValue >= 55 ? "중립·탐욕" : fearValue >= 45 ? "중립" : "공포";
  const fearColor = fearValue >= 70 ? "text-red-400" : fearValue >= 55 ? "text-yellow-400" : "text-emerald-400";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-black text-white">시장 현황</h1>
        <p className="mt-1 text-slate-400">미국 & 한국 시장 심층 분석 · 공포&탐욕 지수 · 섹터 성과</p>
      </div>

      {/* 지수 */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-200">주요 지수</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {marketIndices.map((idx) => (
            <IndexCard key={idx.name} idx={idx} />
          ))}
        </div>
      </section>

      {/* 차트 + 공포탐욕 */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-slate-700/50 bg-slate-900 p-5">
          <p className="mb-4 font-semibold text-slate-200">미국 vs 한국 지수 비교 (30일)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 11 }} domain={["auto", "auto"]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Line yAxisId="right" type="monotone" dataKey="KOSPI" stroke="#10b981" strokeWidth={2} dot={false} name="KOSPI" />
              <Line yAxisId="left" type="monotone" dataKey="SP500" stroke="#3b82f6" strokeWidth={2} dot={false} name="S&P 500" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-700/50 bg-slate-900 p-5">
          <p className="mb-2 font-semibold text-slate-200">공포·탐욕 지수</p>
          <div className="mb-4 text-center">
            <p className={`text-5xl font-black ${fearColor}`}>{fearValue}</p>
            <p className={`text-lg font-bold ${fearColor}`}>{fearLabel}</p>
            <p className="mt-1 text-xs text-slate-500">CNN Fear & Greed Index</p>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={fearGreedData}>
              <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#78350f" strokeWidth={2} />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-1 text-xs text-slate-500">
            <span>0 = 극도 공포</span><span className="text-right">100 = 극도 탐욕</span>
          </div>
        </div>
      </section>

      {/* 섹터 성과 */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-900 p-5">
        <h2 className="mb-4 font-bold text-slate-200">섹터별 주간 성과 (%)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2 text-left">섹터</th>
                <th className="pb-2 text-right">🇺🇸 미국</th>
                <th className="pb-2 text-right">🇰🇷 한국</th>
                <th className="pb-2 text-left pl-4">성과 비교</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {sectorData.map(({ sector, us, kr }) => (
                <tr key={sector} className="hover:bg-slate-800/30">
                  <td className="py-2.5 font-medium text-white">{sector}</td>
                  <td className={`py-2.5 text-right font-mono ${us >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {us >= 0 ? "+" : ""}{us.toFixed(1)}%
                  </td>
                  <td className={`py-2.5 text-right font-mono ${kr >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {kr >= 0 ? "+" : ""}{kr.toFixed(1)}%
                  </td>
                  <td className="py-2.5 pl-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-slate-800">
                        <div
                          className={`h-1.5 rounded-full ${us >= 0 ? "bg-blue-500" : "bg-red-700"}`}
                          style={{ width: `${Math.min(Math.abs(us) * 5, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">US</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-slate-800">
                        <div
                          className={`h-1.5 rounded-full ${kr >= 0 ? "bg-emerald-500" : "bg-red-700"}`}
                          style={{ width: `${Math.min(Math.abs(kr) * 5, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">KR</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
