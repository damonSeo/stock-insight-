import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchCandles, fetchQuoteMeta } from "@/lib/yahoo";
import { rsiSeries, macdSeries } from "@/lib/indicators";
import CandleChart from "@/components/CandleChart";
import IndicatorCharts, { type IndicatorPoint } from "@/components/IndicatorCharts";
import WatchlistStar from "@/components/WatchlistStar";

export const revalidate = 60;

export default async function StockPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol);
  const market: "KR" | "US" = /\.(KS|KQ)$/.test(symbol) ? "KR" : "US";

  const [candles, meta] = await Promise.all([
    fetchCandles(symbol, "6mo"),
    fetchQuoteMeta(symbol),
  ]);

  const closes = candles.map((c) => c.close);
  const rsi = rsiSeries(closes);
  const macd = macdSeries(closes);
  const N = Math.min(60, candles.length);
  const start = candles.length - N;
  const indData: IndicatorPoint[] = candles.slice(start).map((c, i) => ({
    date: c.time,
    rsi: rsi[start + i],
    hist: macd[start + i]?.hist ?? 0,
  }));

  const price = meta?.price ?? closes[closes.length - 1] ?? 0;
  const up = (meta?.changePct ?? 0) >= 0;
  const priceStr =
    market === "KR"
      ? `₩${price.toLocaleString("ko-KR")}`
      : `$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={15} /> 대시보드
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-400">
              {market === "KR" ? "🇰🇷" : "🇺🇸"} {symbol}
            </span>
          </div>
          {candles.length > 0 ? (
            <p className="mt-2 font-mono text-3xl font-black text-white">
              {priceStr}
              {meta && (
                <span className={`ml-3 text-lg ${up ? "text-emerald-400" : "text-red-400"}`}>
                  {up ? "▲" : "▼"} {Math.abs(meta.change).toLocaleString("en-US", { maximumFractionDigits: 2 })} ({up ? "+" : ""}
                  {meta.changePct.toFixed(2)}%)
                </span>
              )}
            </p>
          ) : (
            <p className="mt-2 text-slate-400">시세 데이터를 불러올 수 없습니다.</p>
          )}
        </div>
        <WatchlistStar item={{ symbol, name: symbol, market }} size={24} />
      </div>

      {candles.length > 0 && (
        <>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-300">6개월 캔들차트 · 거래량</p>
            <CandleChart candles={candles} />
          </div>

          <IndicatorCharts data={indData} />
        </>
      )}

      <p className="text-center text-xs text-slate-600">
        ⚠️ 본 정보는 투자 참고용이며 투자 권유가 아닙니다.
      </p>
    </main>
  );
}
