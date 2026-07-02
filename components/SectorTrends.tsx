import Link from "next/link";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import type { SectorTrend } from "@/lib/sectorAnalysis";

const outlookStyle: Record<string, string> = {
  긍정: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
  중립: "bg-slate-800 text-slate-300 border-slate-700",
  부정: "bg-red-900/50 text-red-300 border-red-800",
};

export default function SectorTrends({
  sectors,
  updatedAt,
}: {
  sectors: SectorTrend[];
  updatedAt?: string | null;
}) {
  const anyAi = sectors.some((s) => s.ai);
  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-white">🔥 미래 먹거리 섹터 트렌드</h2>
        {anyAi && (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-900/50 px-2 py-0.5 text-xs font-semibold text-purple-300">
            <Sparkles size={11} /> AI 분석 · 주간
          </span>
        )}
        <span className="text-xs text-slate-500">· 실시간 섹터 모멘텀 순</span>
        {updatedLabel && (
          <span className="text-xs text-slate-500">· AI 분석 업데이트: {updatedLabel}</span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sectors.map((s, i) => {
          const up = s.avgChangePct >= 0;
          return (
            <div
              key={s.id}
              className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-black text-yellow-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-white">
                      {s.emoji} {s.name}
                    </p>
                    <p className="text-xs text-slate-500">{s.theme}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`flex items-center justify-end gap-1 font-mono font-bold ${
                      up ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {up ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                    {up ? "+" : ""}
                    {s.avgChangePct.toFixed(2)}%
                  </span>
                  <span
                    className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs ${outlookStyle[s.outlook]}`}
                  >
                    전망 {s.outlook}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-300">{s.trend}</p>

              {s.drivers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.drivers.map((d, k) => (
                    <span
                      key={k}
                      className="rounded-full border border-blue-800/60 bg-blue-900/30 px-2 py-0.5 text-xs text-blue-300"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-3">
                {s.stocks.map((st) => {
                  const su = st.changePct >= 0;
                  return (
                    <Link
                      key={st.symbol}
                      href={`/stock/${encodeURIComponent(st.symbol)}`}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-800/70 px-2.5 py-1 text-xs transition-colors hover:bg-slate-700"
                    >
                      <span className="text-slate-200">
                        {st.market === "KR" ? "🇰🇷" : "🇺🇸"} {st.name}
                      </span>
                      {st.price > 0 && (
                        <span className={su ? "text-emerald-400" : "text-red-400"}>
                          {su ? "+" : ""}
                          {st.changePct.toFixed(1)}%
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
