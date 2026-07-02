import { fetchAllMovers } from "@/lib/yahoo";
import MoversClient from "@/components/MoversClient";
import LiveIndicator from "@/components/LiveIndicator";

export const revalidate = 60;

export default async function MoversPage() {
  const { gainers, losers } = await fetchAllMovers(8);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white">급등 · 급락 진단</h1>
          <p className="mt-1 text-slate-400">
            등락률은 <span className="text-slate-200">전일 종가 대비</span> 기준 · RSI · MACD · 볼린저 · 거래량
          </p>
        </div>
        <LiveIndicator />
      </div>

      <MoversClient gainers={gainers} losers={losers} />

      {/* 지표 설명 */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-900 p-6">
        <h3 className="mb-4 font-bold text-white">📊 진단 지표 설명</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-yellow-400">RSI (상대강도지수)</p>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              70 이상: 과매수 구간 (조정 위험)<br />
              30 이하: 과매도 구간 (반등 기대)<br />
              30~70: 중립 구간
            </p>
          </div>
          <div>
            <p className="font-semibold text-blue-400">MACD</p>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              MACD선이 시그널선 상향 돌파 시 매수<br />
              MACD선이 시그널선 하향 돌파 시 매도<br />
              골든/데드 크로스 포착
            </p>
          </div>
          <div>
            <p className="font-semibold text-purple-400">볼린저 밴드</p>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              상단 밴드 근처: 과매수, 저항선 주의<br />
              하단 밴드 근처: 과매도, 지지선 기대<br />
              중간 밴드: 추세 중립 구간
            </p>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-slate-600">
        ⚠️ 본 분석은 투자 참고용 정보이며 투자 권유가 아닙니다. 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.
      </p>
    </main>
  );
}
