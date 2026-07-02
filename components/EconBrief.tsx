import { Sparkles, ArrowRightLeft, CheckCircle2, Flame } from "lucide-react";
import type { EconBrief, Verdict } from "@/lib/econBrief";

const verdictStyle: Record<Verdict, { box: string; badge: string; label: string }> = {
  시너지: {
    box: "border-emerald-700/50 bg-emerald-950/30",
    badge: "bg-emerald-500 text-white",
    label: "🟢 시너지 기대",
  },
  혼조: {
    box: "border-amber-700/50 bg-amber-950/30",
    badge: "bg-amber-500 text-black",
    label: "🟡 혼조 · 관망",
  },
  리스크: {
    box: "border-red-700/50 bg-red-950/30",
    badge: "bg-red-500 text-white",
    label: "🔴 리스크 주의",
  },
};

function KeyPoints({
  flag,
  title,
  points,
}: {
  flag: string;
  title: string;
  points: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-4">
      <p className="mb-3 font-bold text-white">
        {flag} {title} <span className="text-xs text-slate-500">핵심 5</span>
      </p>
      <ol className="space-y-3">
        {points.map((p, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-blue-400">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-slate-300">{p}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function EconBriefCard({ brief }: { brief: EconBrief }) {
  const v = verdictStyle[brief.verdict];
  const updated = new Date(brief.updatedAt).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-white">🌏 오늘의 한·미 경제 브리핑</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-900/50 px-2 py-0.5 text-xs font-semibold text-purple-300">
          <Sparkles size={11} /> AI 분석
        </span>
        <span className="text-xs text-slate-500">· {updated} 기준</span>
      </div>

      {/* 미국 / 한국 키포인트 */}
      <div className="grid gap-4 md:grid-cols-2">
        <KeyPoints flag="🇺🇸" title="미국 경제" points={brief.us} />
        <KeyPoints flag="🇰🇷" title="한국 경제" points={brief.kr} />
      </div>

      {/* 한국 가십·핫이슈 */}
      {brief.krHotIssues.length > 0 && (
        <div className="rounded-xl border border-orange-800/40 bg-orange-950/20 p-4">
          <p className="mb-3 flex items-center gap-1.5 font-bold text-white">
            <Flame size={16} className="text-orange-400" />
            🇰🇷 한국 경제 가십 · 핫이슈
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {brief.krHotIssues.map((issue, i) => (
              <div
                key={i}
                className="flex gap-2 rounded-lg bg-slate-900/60 p-3 text-sm text-slate-300"
              >
                <span className="text-orange-400">🔥</span>
                <span className="leading-relaxed">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 결합 분석 (시너지/리스크) */}
      <div className={`rounded-xl border p-5 ${v.box}`}>
        <div className="flex flex-wrap items-center gap-2">
          <ArrowRightLeft size={16} className="text-slate-300" />
          <span className="font-bold text-white">한·미 결합 시너지 분석</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${v.badge}`}>
            {v.label}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-200">{brief.analysis}</p>

        {brief.watchPoints.length > 0 && (
          <div className="mt-4 border-t border-slate-700/50 pt-3">
            <p className="mb-2 text-xs font-semibold text-slate-400">🔎 검증 · 주의 포인트</p>
            <ul className="space-y-1.5">
              {brief.watchPoints.map((w, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-slate-500" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600">
        ✦ AI가 오늘 한·미 경제 뉴스를 종합해 생성한 분석입니다 · 투자 참고용이며 투자 권유가 아닙니다.
      </p>
    </section>
  );
}
