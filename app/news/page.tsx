import { fetchNews } from "@/lib/news";
import { summarizeNews } from "@/lib/summarize";
import { fetchEconBrief } from "@/lib/econBrief";
import NewsClient from "@/components/NewsClient";
import EconBriefCard from "@/components/EconBrief";

export const revalidate = 600;

export default async function NewsPage() {
  // 표시용(카드) 24건 + 브리핑 종합용 원문 풀(한국 최대 60, 미국 최대 40)은 별도로 가져온다.
  // 브리핑은 소수 기사가 아니라 여러 매체·다수 기사에 걸쳐 반복되는 주제를 종합해야 하므로
  // 훨씬 넓은 원문 뉴스 풀을 AI에게 넘긴다.
  const [krRaw, usRaw, krBriefPool, usBriefPool] = await Promise.all([
    fetchNews("KR"),
    fetchNews("US"),
    fetchNews("KR", 60),
    fetchNews("US", 40),
  ]);
  const [kr, us] = await Promise.all([
    summarizeNews(krRaw, "KR"),
    summarizeNews(usRaw, "US"),
  ]);
  const brief = await fetchEconBrief(krBriefPool, usBriefPool);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-black text-white">경제 뉴스 · 이슈</h1>
        <p className="mt-1 text-slate-400">
          오늘의 한·미 경제 키포인트와 결합 시너지 분석 · 관련 원문 뉴스
        </p>
      </div>

      {brief && <EconBriefCard brief={brief} />}

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">📰 관련 원문 뉴스</h2>
        <NewsClient kr={kr} us={us} />
      </section>
    </main>
  );
}
