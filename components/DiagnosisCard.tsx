import { DiagnosisItem } from "@/lib/mockData";
import { Activity, BarChart2, Zap } from "lucide-react";

const signalColor: Record<string, string> = {
  강력매수: "bg-emerald-500 text-white",
  매수: "bg-emerald-700/70 text-emerald-300",
  관망: "bg-slate-700 text-slate-300",
  매도: "bg-red-700/70 text-red-300",
  강력매도: "bg-red-500 text-white",
};

const macdColor: Record<string, string> = {
  매수: "text-emerald-400",
  매도: "text-red-400",
  중립: "text-slate-400",
};

export default function DiagnosisCard({ item }: { item: DiagnosisItem }) {
  const up = item.type === "급등";
  return (
    <div className={`rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
      up ? "border-emerald-800/40 bg-slate-900/80" : "border-red-800/40 bg-slate-900/80"
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-400">
              {item.market === "US" ? "🇺🇸" : "🇰🇷"} {item.symbol}
            </span>
            <span className={`rounded px-2 py-0.5 text-xs font-bold ${signalColor[item.signal]}`}>
              {item.signal}
            </span>
          </div>
          <p className="mt-1 font-semibold text-white">{item.name}</p>
          <p className="font-mono text-lg font-bold text-white">
            {item.market === "KR"
              ? `₩${item.price.toLocaleString("ko-KR")}`
              : `$${item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            <span className={`ml-2 text-sm ${up ? "text-emerald-400" : "text-red-400"}`}>
              {up ? "▲" : "▼"} {Math.abs(item.changePct).toFixed(2)}%
            </span>
          </p>
        </div>
        <div className={`rounded-lg p-2 ${up ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>
          {up ? <Zap size={20} /> : <Activity size={20} />}
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">{item.reason}</p>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3">
        <div className="text-center">
          <p className="text-xs text-slate-500">RSI</p>
          <p className={`text-sm font-bold ${
            item.rsi > 70 ? "text-red-400" : item.rsi < 30 ? "text-emerald-400" : "text-yellow-400"
          }`}>{item.rsi}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">MACD</p>
          <p className={`text-sm font-bold ${macdColor[item.macd]}`}>{item.macd}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">볼린저</p>
          <p className={`text-sm font-bold ${
            item.bollinger === "상단" ? "text-red-400" : item.bollinger === "하단" ? "text-emerald-400" : "text-slate-300"
          }`}>{item.bollinger}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
        <BarChart2 size={12} />
        거래량 평균 대비 <span className="font-semibold text-yellow-400">{item.volumeRatio}배</span>
      </div>
    </div>
  );
}
