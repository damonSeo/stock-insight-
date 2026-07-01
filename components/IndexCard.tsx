import { MarketIndex } from "@/lib/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function IndexCard({ idx }: { idx: MarketIndex }) {
  const up = idx.changePct >= 0;
  return (
    <div className={`rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${
      up ? "border-emerald-800/50 bg-emerald-950/30" : "border-red-800/50 bg-red-950/30"
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400">{idx.market === "US" ? "🇺🇸" : "🇰🇷"} {idx.name}</p>
          <p className="mt-1 font-mono text-xl font-bold text-white">
            {idx.name === "원/달러"
              ? `₩${idx.value.toLocaleString("ko-KR", { minimumFractionDigits: 1 })}`
              : idx.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          up ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"
        }`}>
          {up ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
        </div>
      </div>
      <div className={`mt-2 flex items-center gap-2 text-sm ${up ? "text-emerald-400" : "text-red-400"}`}>
        <span>{up ? "▲" : "▼"} {Math.abs(idx.change).toFixed(2)}</span>
        <span className="font-semibold">({up ? "+" : ""}{idx.changePct.toFixed(2)}%)</span>
      </div>
    </div>
  );
}
