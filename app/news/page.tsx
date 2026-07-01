import { fetchNews } from "@/lib/news";
import NewsClient from "@/components/NewsClient";

export const revalidate = 600;

export default async function NewsPage() {
  const [kr, us] = await Promise.all([fetchNews("KR"), fetchNews("US")]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">경제 뉴스 · 이슈</h1>
        <p className="mt-1 text-slate-400">
          한국 · 미국 경제 주요 뉴스 핵심 요약 · 10분마다 갱신
        </p>
      </div>

      <NewsClient kr={kr} us={us} />
    </main>
  );
}
