import { unstable_cache } from "next/cache";
import { aiJSON, aiEnabled } from "@/lib/ai";
import type { NewsItem } from "@/lib/news";

/**
 * 오늘의 한·미 경제 브리핑.
 * 미국/한국 경제 핵심 키포인트를 뉴스에서 추출하고, 두 경제 흐름이 결합될 때
 * 시너지인지 리스크인지 근거와 함께 분석·검증 포인트를 제시한다. (하루 1회 캐시)
 */

export type Verdict = "시너지" | "혼조" | "리스크";

export interface EconBrief {
  date: string;
  us: string[]; // 미국 경제 키포인트
  kr: string[]; // 한국 경제 키포인트
  verdict: Verdict; // 결합 시 종합 판단
  analysis: string; // 왜 그런지 (상호작용·전이 경로)
  watchPoints: string[]; // 검증·주의 포인트
  updatedAt: string;
}

const SYSTEM =
  "당신은 한국의 거시경제·글로벌 매크로 애널리스트입니다. 뉴스에서 오늘의 미국/한국 경제 핵심 키포인트를 추려내고, 두 경제 흐름이 결합될 때 시너지인지 리스크인지 상호작용·전이 경로(환율·금리·수출·증시)를 근거로 냉정하게 분석합니다. 과장·투자권유 없이, 뉴스에 없는 사실은 지어내지 마세요.";

function newsBlock(items: NewsItem[]): string {
  return items
    .slice(0, 15)
    .map((n) => `- ${n.title}: ${n.summary || ""}`)
    .join("\n");
}

async function generate(kr: NewsItem[], us: NewsItem[]): Promise<EconBrief | null> {
  if (!aiEnabled()) return null;
  const today = new Date().toISOString().slice(0, 10);
  const user = `오늘(${today})의 한국·미국 경제 뉴스를 바탕으로 아래를 JSON으로 작성해줘.
- us: 미국 경제의 오늘 핵심 키포인트 3개 (각 한 문장)
- kr: 한국 경제의 오늘 핵심 키포인트 3개 (각 한 문장)
- verdict: 두 경제 흐름이 결합될 때 종합 판단. 반드시 "시너지" | "혼조" | "리스크" 중 하나
- analysis: 왜 그렇게 판단했는지 2~4문장. 한·미 상호작용/전이 경로(환율·금리·수출·증시 등) 중심
- watchPoints: 앞으로 검증·주의해야 할 포인트 2~3개 (각 짧게)

[미국 경제 뉴스]
${newsBlock(us)}

[한국 경제 뉴스]
${newsBlock(kr)}`;

  const schema = {
    type: "OBJECT",
    properties: {
      us: { type: "ARRAY", items: { type: "STRING" } },
      kr: { type: "ARRAY", items: { type: "STRING" } },
      verdict: { type: "STRING" },
      analysis: { type: "STRING" },
      watchPoints: { type: "ARRAY", items: { type: "STRING" } },
    },
    required: ["us", "kr", "verdict", "analysis", "watchPoints"],
  };

  const out = await aiJSON<Omit<EconBrief, "date" | "updatedAt">>(SYSTEM, user, schema, 3000);
  if (!out) return null;
  const verdict: Verdict = (["시너지", "혼조", "리스크"] as const).includes(
    out.verdict as Verdict,
  )
    ? (out.verdict as Verdict)
    : "혼조";
  return {
    date: today,
    us: out.us ?? [],
    kr: out.kr ?? [],
    verdict,
    analysis: out.analysis ?? "",
    watchPoints: out.watchPoints ?? [],
    updatedAt: new Date().toISOString(),
  };
}

/** 오늘의 한·미 경제 브리핑 (하루 1회 캐시, AI 없으면 null) */
export async function fetchEconBrief(
  kr: NewsItem[],
  us: NewsItem[],
): Promise<EconBrief | null> {
  if (!aiEnabled() || (kr.length === 0 && us.length === 0)) return null;
  const day = new Date().toISOString().slice(0, 10);
  return unstable_cache(() => generate(kr, us), ["econ-brief-v2", day], {
    revalidate: 86400,
  })();
}
