import { FutureValueStock } from "@/lib/mockData";
import { Target, TrendingUp, Clock, Shield } from "lucide-react";

const riskColor: Record<string, string> = {
  낮음: "bg-emerald-900/50 text-emerald-400 border-emerald-800",
  중간: "bg-yellow-900/50 text-yellow-400 border-yellow-800",
  높음: "bg-red-900/50 text-red-400 border-red-800",
};

export default function FutureValueCard({ stock }: { stock: FutureValueStock }) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-5 transition-all hover:-translate-y-1 hover:border-blue-700/50 hover:shadow-xl hover:shadow-blue-900/20">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{stock.market === "US" ? "🇺🇸" : "🇰🇷"}</span>
          <div>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-400">{stock.symbol}</span>
            <p className="mt-0.5 font-bold text-white">{stock.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1">
            <span className={`text-2xl font-black ${stock.upside >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {stock.upside >= 0 ? "+" : ""}{stock.upside.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-500">{stock.upside >= 0 ? "상승 여력" : "목표가 하회"}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        <span className="rounded-full border border-blue-800 bg-blue-900/40 px-2 py-0.5 text-xs text-blue-300">
          {stock.sector}
        </span>
        <span className="rounded-full border border-purple-800 bg-purple-900/40 px-2 py-0.5 text-xs text-purple-300">
          {stock.theme}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>현재가</span>
            <span>목표가</span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
              style={{ width: `${Math.min((100 / (1 + stock.upside / 100)) * 100, 100)}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between font-mono text-xs font-semibold">
            <span className="text-white">
              {stock.market === "KR"
                ? `₩${stock.price.toLocaleString("ko-KR")}`
                : `$${stock.price.toFixed(2)}`}
            </span>
            <span className="text-emerald-400">
              {stock.market === "KR"
                ? `₩${stock.targetPrice.toLocaleString("ko-KR")}`
                : `$${stock.targetPrice.toFixed(0)}`}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">{stock.summary}</p>

      <ul className="mt-3 space-y-1">
        {stock.reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
            <span className="mt-0.5 text-blue-400">•</span>
            {r}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${riskColor[stock.risk]}`}>
            <Shield size={10} /> {stock.risk} 위험
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={10} /> {stock.horizon}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">투자 점수</span>
          <span className="font-mono text-sm font-black text-yellow-400">{stock.score}</span>
          <span className="text-xs text-slate-600">/100</span>
        </div>
      </div>

      <p className="mt-2 text-right text-xs text-slate-600">업데이트: {stock.updatedAt}</p>
    </div>
  );
}
