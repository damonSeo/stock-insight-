import { fetchNews } from "@/lib/news";
import { summarizeNews } from "@/lib/summarize";
import { fetchEconBrief } from "@/lib/econBrief";
import NewsClient from "@/components/NewsClient";
import EconBriefCard from "@/components/EconBrief";

export const revalidate = 600;

export default async function NewsPage() {
  const [krRaw, usRaw] = await Promise.all([fetchNews("KR"), fetchNews("US")]);
  const [kr, us] = await Promise.all([
    summarizeNews(krRaw, "KR"),
    summarizeNews(usRaw, "US"),
  ]);
  const brief = await fetchEconBrief(kr, us);

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
