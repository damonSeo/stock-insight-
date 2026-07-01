import { futureValueStocks } from "@/lib/mockData";
import { fetchQuotes, krSymbol } from "@/lib/yahoo";
import FutureClient from "@/components/FutureClient";

export const revalidate = 60;

export default async function FuturePage() {
  // 실시간 현재가로 상승 여력 재계산 (목표가·분석 텍스트는 편집 데이터 유지)
  const symbols = futureValueStocks.map((s) =>
    s.market === "KR" ? krSymbol(s.symbol) : s.symbol,
  );
  const quotes = await fetchQuotes(symbols);

  const stocks = futureValueStocks.map((s) => {
    const sym = s.market === "KR" ? krSymbol(s.symbol) : s.symbol;
    const price = quotes[sym]?.price || s.price;
    const upside = price > 0 ? ((s.targetPrice - price) / price) * 100 : s.upside;
    return { ...s, price, upside };
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">미래 가치 투자 분석</h1>
        <p className="mt-1 text-slate-400">
          섹터·테마별 장기 성장 유망 종목 · 실시간 현재가 기준 상승 여력 · 투자 점수
        </p>
      </div>

      <FutureClient stocks={stocks} />
    </main>
  );
}
