import { futureValueStocks } from "@/lib/mockData";
import { fetchQuotes, krSymbol } from "@/lib/yahoo";
import { fetchSectorTrends } from "@/lib/sectorAnalysis";
import FutureClient from "@/components/FutureClient";
import SectorTrends from "@/components/SectorTrends";

export const revalidate = 60;

export default async function FuturePage() {
  // 섹터 트렌드(실시세 모멘텀 + AI) & 편집 종목 실시간 현재가
  const symbols = futureValueStocks.map((s) =>
    s.market === "KR" ? krSymbol(s.symbol) : s.symbol,
  );
  const [sectorData, quotes] = await Promise.all([
    fetchSectorTrends(),
    fetchQuotes(symbols),
  ]);

  const stocks = futureValueStocks.map((s) => {
    const sym = s.market === "KR" ? krSymbol(s.symbol) : s.symbol;
    const price = quotes[sym]?.price || s.price;
    const upside = price > 0 ? ((s.targetPrice - price) / price) * 100 : s.upside;
    return { ...s, price, upside };
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-black text-white">미래 가치 투자 분석</h1>
        <p className="mt-1 text-slate-400">
          미래 먹거리 핫섹터 트렌드(AI 분석) · 섹터별 장기 성장 유망 종목
        </p>
      </div>

      <SectorTrends sectors={sectorData.sectors} updatedAt={sectorData.updatedAt} />

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">📌 종목별 심층 분석</h2>
        <FutureClient stocks={stocks} />
      </section>
    </main>
  );
}
