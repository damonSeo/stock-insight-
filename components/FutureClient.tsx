"use client";
import { useState } from "react";
import type { FutureValueStock } from "@/lib/mockData";
import FutureValueCard from "@/components/FutureValueCard";
import { Star, SortAsc } from "lucide-react";

type SortKey = "score" | "upside";
type MarketFilter = "ALL" | "US" | "KR";

export default function FutureClient({ stocks }: { stocks: FutureValueStock[] }) {
  const [market, setMarket] = useState<MarketFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("score");

  const filtered = stocks
    .filter((s) => market === "ALL" || s.market === market)
    .sort((a, b) => b[sort] - a[sort]);

  const avgUpside = filtered.length
    ? (filtered.reduce((s, i) => s + i.upside, 0) / filtered.length).toFixed(1)
    : "0";
  const avgScore = filtered.length
    ? (filtered.reduce((s, i) => s + i.score, 0) / filtered.length).toFixed(0)
    : "0";

  return (
    <>
      {/* 요약 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900 p-4 text-center">
          <p className="text-2xl font-black text-white">{filtered.length}</p>
          <p className="text-xs text-slate-400">분석 종목</p>
        </div>
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">+{avgUpside}%</p>
          <p className="text-xs text-slate-400">평균 상승 여력</p>
        </div>
        <div className="rounded-xl border border-yellow-800/40 bg-yellow-950/20 p-4 text-center">
          <p className="text-2xl font-black text-yellow-400">{avgScore}</p>
          <p className="text-xs text-slate-400">평균 투자 점수</p>
        </div>
        <div className="rounded-xl border border-blue-800/40 bg-blue-950/20 p-4 text-center">
          <p className="text-2xl font-black text-blue-400">실시간가</p>
          <p className="text-xs text-slate-400">현재가 기준</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-1">
          {(["ALL", "US", "KR"] as MarketFilter[]).map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                market === m ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {m === "ALL" ? "전체" : m === "US" ? "🇺🇸 미국" : "🇰🇷 한국"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-1">
          <SortAsc size={14} className="ml-2 text-slate-500" />
          {(["score", "upside"] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                sort === s ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {s === "score" ? "투자 점수순" : "상승 여력순"}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((stock, i) => (
          <div key={stock.symbol} className="relative">
            {i < 3 && (
              <div className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 text-xs font-black text-black">
                {i + 1}
              </div>
            )}
            <FutureValueCard stock={stock} />
          </div>
        ))}
      </div>

      {/* 투자 철학 섹션 */}
      <section className="rounded-xl border border-blue-800/30 bg-blue-950/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-yellow-400" />
          <h3 className="font-bold text-white">미래 가치 투자 선정 기준</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "성장성", desc: "향후 3~5년 매출 CAGR 20% 이상 예상 종목" },
            { title: "해자(Moat)", desc: "기술·특허·네트워크 효과로 경쟁 우위 확보" },
            { title: "밸류에이션", desc: "현재 주가 대비 내재 가치 30% 이상 할인" },
            { title: "테마 적합성", desc: "AI·반도체·2차전지·바이오 메가트렌드 수혜" },
          ].map(({ title, desc }) => (
            <div key={title} className="rounded-lg bg-slate-900/60 p-3">
              <p className="text-sm font-semibold text-blue-300">{title}</p>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-slate-600">
        ⚠️ 본 분석은 투자 참고용 정보이며 투자 권유가 아닙니다. 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.
      </p>
    </>
  );
}
