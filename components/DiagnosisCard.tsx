import Link from "next/link";
import { DiagnosisItem } from "@/lib/mockData";
import { Activity, Zap } from "lucide-react";

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
  const href = `/stock/${encodeURIComponent(item.ySymbol ?? item.symbol)}`;

  return (
    <Link
      href={href}
      className={`block rounded-lg border p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        up ? "border-emerald-800/40 bg-slate-900/80" : "border-red-800/40 bg-slate-900/80"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1">
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              {item.market === "US" ? "🇺🇸" : "🇰🇷"} {item.symbol}
            </span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${signalColor[item.signal]}`}>
              {item.signal}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm font-semibold text-white">{item.name}</p>
          <p className="font-mono text-base font-bold text-white">
            {item.market === "KR"
              ? `₩${item.price.toLocaleString("ko-KR")}`
              : `$${item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </p>
          <p className={`text-xs ${up ? "text-emerald-400" : "text-red-400"}`}>
            {up ? "▲" : "▼"}{" "}
            {item.change != null
              ? item.market === "KR"
                ? Math.abs(item.change).toLocaleString("ko-KR")
                : Math.abs(item.change).toLocaleString("en-US", { minimumFractionDigits: 2 })
              : ""}{" "}
            ({up ? "+" : "-"}
            {Math.abs(item.changePct).toFixed(2)}%)
          </p>
        </div>
        <div className={`shrink-0 rounded-md p-1.5 ${up ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>
          {up ? <Zap size={16} /> : <Activity size={16} />}
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-slate-400">{item.reason}</p>

      <div className="mt-2 flex items-center gap-3 border-t border-slate-800 pt-2 text-[11px]">
        <span className="text-slate-500">
          RSI{" "}
          <b className={item.rsi > 70 ? "text-red-400" : item.rsi < 30 ? "text-emerald-400" : "text-yellow-400"}>
            {item.rsi}
          </b>
        </span>
        <span className="text-slate-500">
          MACD <b className={macdColor[item.macd]}>{item.macd}</b>
        </span>
        <span className="text-slate-500">
          BB{" "}
          <b className={item.bollinger === "상단" ? "text-red-400" : item.bollinger === "하단" ? "text-emerald-400" : "text-slate-300"}>
            {item.bollinger}
          </b>
        </span>
        <span className="ml-auto text-slate-500">
          거래량 <b className="text-yellow-400">{item.volumeRatio}배</b>
        </span>
      </div>
    </Link>
  );
}
