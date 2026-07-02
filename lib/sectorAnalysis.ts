import { unstable_cache } from "next/cache";
import { fetchQuotes } from "@/lib/yahoo";
import { HOT_SECTORS } from "@/lib/sectors";
import { aiJSON, aiEnabled } from "@/lib/ai";

export interface SectorStockQuote {
  symbol: string;
  name: string;
  market: "KR" | "US";
  price: number;
  changePct: number;
}

export interface SectorTrend {
  id: string;
  name: string;
  emoji: string;
  theme: string;
  avgChangePct: number; // 섹터 모멘텀 (구성종목 평균 등락률)
  outlook: "긍정" | "중립" | "부정";
  trend: string; // AI 트렌드 분석 (없으면 기본 문구)
  drivers: string[]; // 핵심 성장 동력
  ai: boolean; // AI 분석 여부
  stocks: SectorStockQuote[];
}

interface AiTrend {
  id: string;
  trend: string;
  drivers: string[];
  outlook: "긍정" | "중립" | "부정";
}

const AI_SYSTEM =
  "당신은 한국의 증권 섹터 애널리스트입니다. 각 미래 성장 섹터의 최근 트렌드를 담백하게 분석합니다. 과장·투자권유 없이 구조적 성장 동력과 최근 흐름 중심으로. 각 항목의 id를 그대로 사용하세요.";

interface AiTrendsResult {
  trends: AiTrend[];
  updatedAt: string; // 분석 생성 시각 (주간 캐시)
}

async function callAiTrends(
  input: { id: string; name: string; theme: string; avg: number; stocks: string }[],
): Promise<AiTrendsResult | null> {
  if (!aiEnabled() || input.length === 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  const list = input
    .map(
      (s) =>
        `- id:${s.id} | 섹터:${s.name} | 테마:${s.theme} | 최근 평균등락:${s.avg.toFixed(1)}% | 구성종목:${s.stocks}`,
    )
    .join("\n");
  const user = `오늘(${today}) 기준 아래 미래 먹거리 성장 섹터들의 현재 트렌드를 분석해줘. 각 섹터마다 trend(2~3문장, 지금 왜 주목받는지/최근 흐름), drivers(핵심 성장 동력 2~3개, 각 8자 내외로 짧게), outlook(긍정/중립/부정 중 하나).

반드시 아래 JSON 형식으로만, 키 이름 그대로 응답해(각 섹터의 id를 그대로 사용):
{"trends":[{"id":"섹터id","trend":"문장","drivers":["짧게","짧게"],"outlook":"긍정"}]}

${list}`;
  const schema = {
    type: "OBJECT",
    properties: {
      trends: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            trend: { type: "STRING" },
            drivers: { type: "ARRAY", items: { type: "STRING" } },
            outlook: { type: "STRING" }, // 긍정/중립/부정 (코드에서 검증)
          },
          required: ["id", "trend", "drivers", "outlook"],
        },
      },
    },
    required: ["trends"],
  };
  const out = await aiJSON<{ trends: AiTrend[] }>(AI_SYSTEM, user, schema, 4000);
  if (!out?.trends) return null;
  return { trends: out.trends, updatedAt: new Date().toISOString() };
}

// AI 트렌드는 주 1회 갱신 (미래 먹거리 트렌드는 분/일 단위로 안 바뀜)
function getCachedAiTrends(
  input: { id: string; name: string; theme: string; avg: number; stocks: string }[],
) {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)); // 7일 버킷
  return unstable_cache(() => callAiTrends(input), ["sector-ai-trends-v7", String(week)], {
    revalidate: 7 * 24 * 60 * 60,
  })();
}

export interface SectorTrendsResult {
  sectors: SectorTrend[];
  updatedAt: string | null; // AI 분석 업데이트 시각 (주간)
}

/** 섹터별 실시세 모멘텀 + AI 트렌드 → 핫한 순으로 정렬 */
export async function fetchSectorTrends(): Promise<SectorTrendsResult> {
  const symbols = HOT_SECTORS.flatMap((s) => s.stocks.map((x) => x.symbol));
  const quotes = await fetchQuotes(symbols); // fetchQuotes 자체 60초 캐시

  const base = HOT_SECTORS.map((sec) => {
    const stocks: SectorStockQuote[] = sec.stocks.map((x) => ({
      symbol: x.symbol,
      name: x.name,
      market: x.market,
      price: quotes[x.symbol]?.price ?? 0,
      changePct: quotes[x.symbol]?.changePct ?? 0,
    }));
    const valid = stocks.filter((s) => s.price > 0);
    const avg = valid.length
      ? valid.reduce((a, b) => a + b.changePct, 0) / valid.length
      : 0;
    return { sec, stocks, avg };
  });

  const aiRes = await getCachedAiTrends(
    base.map((b) => ({
      id: b.sec.id,
      name: b.sec.name,
      theme: b.sec.theme,
      avg: b.avg,
      stocks: b.stocks
        .map((s) => `${s.name}(${s.changePct >= 0 ? "+" : ""}${s.changePct.toFixed(1)}%)`)
        .join(", "),
    })),
  );
  const aiMap = new Map((aiRes?.trends ?? []).map((a) => [a.id, a]));

  const heuristic = (avg: number): "긍정" | "중립" | "부정" =>
    avg >= 1 ? "긍정" : avg <= -1 ? "부정" : "중립";
  const validOutlooks = ["긍정", "중립", "부정"];

  const result: SectorTrend[] = base.map((b) => {
    const a = aiMap.get(b.sec.id);
    const outlook =
      a && validOutlooks.includes(a.outlook)
        ? (a.outlook as "긍정" | "중립" | "부정")
        : heuristic(b.avg);
    return {
      id: b.sec.id,
      name: b.sec.name,
      emoji: b.sec.emoji,
      theme: b.sec.theme,
      avgChangePct: b.avg,
      outlook,
      trend: a?.trend ?? `${b.sec.theme} 중심의 미래 성장 섹터입니다.`,
      drivers: a?.drivers ?? [],
      ai: Boolean(a),
      stocks: b.stocks,
    };
  });

  // 핫한 순위 = 섹터 평균 등락률 내림차순
  result.sort((x, y) => y.avgChangePct - x.avgChangePct);
  return { sectors: result, updatedAt: aiRes?.updatedAt ?? null };
}
