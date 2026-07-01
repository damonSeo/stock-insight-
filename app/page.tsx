import { futureValueStocks } from "@/lib/mockData";
import { fetchIndices, fetchSeries, fetchAllMovers } from "@/lib/yahoo";
import IndexCard from "@/components/IndexCard";
import DiagnosisCard from "@/components/DiagnosisCard";
import FutureValueCard from "@/components/FutureValueCard";
import MiniChart from "@/components/MiniChart";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";

export default async function Dashboard() {
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  // 실시간 데이터 (Yahoo Finance, 60초 캐시)
  const [marketIndices, kospiSeries, spSeries, movers] = await Promise.all([
    fetchIndices(),
    fetchSeries("^KS11"),
    fetchSeries("^GSPC"),
    fetchAllMovers(5),
  ]);
  const topGainers = movers.gainers.slice(0, 5);
  const topLosers = movers.losers.slice(0, 5);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">시장 대시보드</h1>
          <p className="mt-1 text-slate-400">{today} · 미국 & 한국 주식 종합 분석</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-400">
          <RefreshCw size={12} className="animate-spin" />
          실시간 데이터 업데이트 중
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-200">주요 지수</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {marketIndices.map((idx) => (
            <IndexCard key={idx.name} idx={idx} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900 p-4">
          <p className="mb-1 text-sm font-semibold text-slate-300">🇰🇷 KOSPI 30일 추이</p>
          <MiniChart data={kospiSeries} color="#10b981" />
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-900 p-4">
          <p className="mb-1 text-sm font-semibold text-slate-300">🇺🇸 S&P 500 30일 추이</p>
          <MiniChart data={spSeries} color="#3b82f6" />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">🚀 오늘의 급등주</h2>
            <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-400">AI 진단 분석</span>
          </div>
          <Link href="/movers" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
            전체 보기 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {topGainers.map((item) => (
            <DiagnosisCard key={item.symbol} item={item} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">📉 오늘의 급락주</h2>
            <span className="rounded-full bg-red-900/50 px-2 py-0.5 text-xs text-red-400">위험 신호 감지</span>
          </div>
          <Link href="/movers" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
            전체 보기 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {topLosers.map((item) => (
            <DiagnosisCard key={item.symbol} item={item} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">⭐ 미래 가치 투자 추천</h2>
            <span className="rounded-full bg-purple-900/50 px-2 py-0.5 text-xs text-purple-300">장기 분석</span>
          </div>
          <Link href="/future" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
            전체 보기 <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {futureValueStocks.slice(0, 3).map((s) => (
            <FutureValueCard key={s.symbol} stock={s} />
          ))}
        </div>
      </section>
    </main>
  );
}
