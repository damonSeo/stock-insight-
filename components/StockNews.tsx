import { ExternalLink } from "lucide-react";
import type { NewsItem } from "@/lib/news";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function StockNews({ news }: { news: NewsItem[] }) {
  if (news.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-900 p-4">
        <p className="mb-1 text-sm font-semibold text-slate-300">관련 뉴스</p>
        <p className="py-6 text-center text-sm text-slate-500">관련 뉴스를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-300">📰 관련 뉴스</p>
      <ul className="divide-y divide-slate-800">
        {news.map((n) => (
          <li key={n.link}>
            <a
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm text-slate-200 group-hover:text-blue-300">
                  {n.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {n.source} · {timeAgo(n.pubDate)}
                </p>
              </div>
              <ExternalLink size={13} className="mt-0.5 shrink-0 text-slate-600 group-hover:text-blue-400" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
