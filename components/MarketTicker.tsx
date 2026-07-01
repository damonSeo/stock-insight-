"use client";
import type { MarketIndex } from "@/lib/mockData";

export default function MarketTicker({ indices }: { indices: MarketIndex[] }) {
  const doubled = [...indices, ...indices];

  return (
    <div className="overflow-hidden border-b border-slate-800 bg-slate-900/50 py-2">
      <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap">
        {doubled.map((idx, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-sm">
            <span className="font-medium text-slate-300">{idx.name}</span>
            <span className="font-mono font-semibold text-white">
              {idx.name === "원/달러"
                ? idx.value.toLocaleString("ko-KR", { minimumFractionDigits: 1 })
                : idx.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className={idx.changePct >= 0 ? "text-emerald-400" : "text-red-400"}>
              {idx.changePct >= 0 ? "▲" : "▼"} {Math.abs(idx.changePct).toFixed(2)}%
            </span>
            <span className="text-slate-600">|</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
