"use client";
import { useState } from "react";
import type { DiagnosisItem } from "@/lib/mockData";
import DiagnosisCard from "@/components/DiagnosisCard";
import { TrendingUp, TrendingDown, Globe, Filter } from "lucide-react";

type Tab = "all" | "gainers" | "losers";
type MarketFilter = "ALL" | "US" | "KR";

export default function MoversClient({
  gainers,
  losers,
}: {
  gainers: DiagnosisItem[];
  losers: DiagnosisItem[];
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [market, setMarket] = useState<MarketFilter>("ALL");

  const allItems: DiagnosisItem[] = [...gainers, ...losers];

  let items = tab === "gainers" ? gainers : tab === "losers" ? losers : allItems;
  if (market !== "ALL") items = items.filter((i) => i.market === market);

  return (
    <>
      {/* 상단 요약 배너 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/30 p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">{gainers.length}</p>
          <p className="text-xs text-slate-400">급등 종목</p>
        </div>
        <div className="rounded-xl border border-red-800/40 bg-red-950/30 p-4 text-center">
          <p className="text-2xl font-black text-red-400">{losers.length}</p>
          <p className="text-xs text-slate-400">급락 종목</p>
        </div>
        <div className="rounded-xl border border-blue-800/40 bg-blue-950/30 p-4 text-center">
          <p className="text-2xl font-black text-blue-400">
            {allItems.filter((i) => i.market === "US").length}
          </p>
          <p className="text-xs text-slate-400">🇺🇸 미국 종목</p>
        </div>
        <div className="rounded-xl border border-purple-800/40 bg-purple-950/30 p-4 text-center">
          <p className="text-2xl font-black text-purple-400">
            {allItems.filter((i) => i.market === "KR").length}
          </p>
          <p className="text-xs text-slate-400">🇰🇷 한국 종목</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-1">
          {(["all", "gainers", "losers"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {t === "all" && <Filter size={13} />}
              {t === "gainers" && <TrendingUp size={13} className="text-emerald-400" />}
              {t === "losers" && <TrendingDown size={13} className="text-red-400" />}
              {t === "all" ? "전체" : t === "gainers" ? "급등주" : "급락주"}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-1">
          {(["ALL", "US", "KR"] as MarketFilter[]).map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                market === m ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {m === "ALL" ? (
                <><Globe size={13} /> 전체</>
              ) : m === "US" ? (
                <>🇺🇸 미국</>
              ) : (
                <>🇰🇷 한국</>
              )}
            </button>
          ))}
        </div>

        <span className="text-sm text-slate-500">{items.length}개 종목</span>
      </div>

      {/* 진단 카드 그리드 */}
      {items.length === 0 ? (
        <div className="py-20 text-center text-slate-500">해당 조건의 종목이 없습니다.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <DiagnosisCard key={`${item.symbol}-${item.type}`} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
