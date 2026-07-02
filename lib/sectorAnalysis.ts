import { unstable_cache } from "next/cache";
import { fetchQuotes } from "@/lib/yahoo";
import { HOT_SECTORS } from "@/lib/sectors";
import { geminiJSON, geminiEnabled } from "@/lib/gemini";

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

async function callAiTrends(
  input: { id: string; name: string; theme: string; avg: number; stocks: string }[],
): Promise<AiTrend[] | null> {
  if (!geminiEnabled() || input.length === 0) return null;
  const today = new Date().toISOString().slice(0, 10);
  const list = input
    .map(
      (s) =>
        `- id:${s.id} | 섹터:${s.name} | 테마:${s.theme} | 최근 평균등락:${s.avg.toFixed(1)}% | 구성종목:${s.stocks}`,
    )
    .join("\n");
  const user = `오늘(${today}) 기준 아래 미래 먹거리 성장 섹터들의 현재 트렌드를 분석해줘. 각 섹터마다 trend(2~3문장, 지금 왜 주목받는지/최근 흐름), drivers(핵심 성장 동력 2~3개, 각 8자 내외로 짧게), outlook(긍정/중립/부정 중 하나)을 JSON으로.\n\n${list}`;
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
            outlook: { type: "STRING", enum: ["긍정", "중립", "부정"] },
          },
          required: ["id", "trend", "drivers", "outlook"],
        },
      },
    },
    required: ["trends"],
  };
  const out = await geminiJSON<{ trends: AiTrend[] }>(AI_SYSTEM, user, schema, 4000);
  return out?.trends ?? null;
}

// AI 트렌드는 하루 1회만 갱신 (섹터 트렌드는 분 단위로 안 바뀜)
function getCachedAiTrends(
  input: { id: string; name: string; theme: string; avg: number; stocks: string }[],
) {
  const day = new Date().toISOString().slice(0, 10);
  return unstable_cache(() => callAiTrends(input), ["sector-ai-trends-v1", day], {
    revalidate: 21600,
  })();
}

/** 섹터별 실시세 모멘텀 + AI 트렌드 → 핫한 순으로 정렬 */
export async function fetchSectorTrends(): Promise<SectorTrend[]> {
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

  const ai = await getCachedAiTrends(
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
  const aiMap = new Map((ai ?? []).map((a) => [a.id, a]));

  const result: SectorTrend[] = base.map((b) => {
    const a = aiMap.get(b.sec.id);
    return {
      id: b.sec.id,
      name: b.sec.name,
      emoji: b.sec.emoji,
      theme: b.sec.theme,
      avgChangePct: b.avg,
      outlook: a?.outlook ?? (b.avg >= 1 ? "긍정" : b.avg <= -1 ? "부정" : "중립"),
      trend: a?.trend ?? `${b.sec.theme} 중심의 미래 성장 섹터입니다.`,
      drivers: a?.drivers ?? [],
      ai: Boolean(a),
      stocks: b.stocks,
    };
  });

  // 핫한 순위 = 섹터 평균 등락률 내림차순
  result.sort((x, y) => y.avgChangePct - x.avgChangePct);
  return result;
}
