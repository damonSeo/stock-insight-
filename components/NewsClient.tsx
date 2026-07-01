"use client";
import { useState } from "react";
import type { NewsItem } from "@/lib/news";
import { ExternalLink, Clock } from "lucide-react";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

const sourceColor: Record<string, string> = {
  연합뉴스: "bg-blue-900/50 text-blue-300",
  SBS: "bg-amber-900/50 text-amber-300",
  CNBC: "bg-purple-900/50 text-purple-300",
  MarketWatch: "bg-emerald-900/50 text-emerald-300",
};

function NewsCard({ item, flag, ai }: { item: NewsItem; flag: string; ai: boolean }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/80 transition-all hover:-translate-y-1 hover:border-blue-700/50 hover:shadow-xl hover:shadow-blue-900/20"
    >
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          className="h-40 w-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${sourceColor[item.source] ?? "bg-slate-800 text-slate-300"}`}>
            {flag} {item.source}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={11} /> {timeAgo(item.pubDate)}
          </span>
        </div>

        <h3 className="font-bold leading-snug text-white line-clamp-2 group-hover:text-blue-300">
          {item.title}
        </h3>

        {item.summary && (
          <div className="mt-2 flex-1">
            {ai && (
              <span className="mb-1 inline-block rounded bg-purple-900/50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300">
                ✦ AI 요약
              </span>
            )}
            <p className="text-sm leading-relaxed text-slate-400 line-clamp-5">
              {item.summary}
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-400">
          원문 보기 <ExternalLink size={12} />
        </div>
      </div>
    </a>
  );
}

export default function NewsClient({
  kr,
  us,
  aiEnabled = false,
}: {
  kr: NewsItem[];
  us: NewsItem[];
  aiEnabled?: boolean;
}) {
  const [tab, setTab] = useState<"KR" | "US">("KR");
  const items = tab === "KR" ? kr : us;
  const flag = tab === "KR" ? "🇰🇷" : "🇺🇸";

  return (
    <>
      <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-1">
        {(["KR", "US"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setTab(m)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
              tab === m ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {m === "KR" ? "🇰🇷 한국 경제" : "🇺🇸 미국 경제"}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.link} item={item} flag={flag} ai={aiEnabled} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-slate-600">
        뉴스 출처: 연합뉴스 · SBS · CNBC · MarketWatch RSS · 제목/요약을 누르면 원문으로 이동합니다.
      </p>
    </>
  );
}
