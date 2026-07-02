import { unstable_cache } from "next/cache";
import { aiJSON, aiEnabled } from "@/lib/ai";
import type { NewsItem } from "@/lib/news";

/**
 * 오늘의 한·미 경제 브리핑.
 * 미국/한국 경제 핵심 관점(각 5가지·3문장)을 뉴스에서 추출하고, 한국은 가십·핫이슈까지,
 * 두 경제 흐름이 결합될 때 시너지/리스크인지 근거·검증 포인트를 제시한다. (하루 1회 캐시)
 */

export type Verdict = "시너지" | "혼조" | "리스크";

export interface EconBrief {
  date: string;
  us: string[]; // 미국 경제 핵심 관점 5개 (각 ~3문장)
  kr: string[]; // 한국 경제 핵심 관점 5개 (각 ~3문장)
  krHotIssues: string[]; // 한국 경제 가십·핫이슈
  verdict: Verdict; // 결합 시 종합 판단
  analysis: string; // 왜 그런지 (상호작용·전이 경로)
  watchPoints: string[]; // 검증·주의 포인트
  updatedAt: string;
}

const SYSTEM =
  "당신은 한국의 거시경제·글로벌 매크로 애널리스트입니다. 뉴스에서 오늘의 미국/한국 경제 핵심 관점을 깊이 있게 추려내고, 한국은 시장의 화제·가십·핫이슈까지 짚어줍니다. 두 경제 흐름이 결합될 때 시너지인지 리스크인지 상호작용·전이 경로(환율·금리·수출·증시)를 근거로 냉정하게 분석합니다. 과장·투자권유 없이, 뉴스에 없는 사실은 지어내지 마세요.";

// 브리핑은 소수 기사가 아니라 오늘 수집된 원문 뉴스 풀 전체를 훑어 종합한다.
// 번호를 매겨 "몇 건의 기사가 있었는지/어떤 주제가 반복되는지"를 모델이 파악하기 쉽게 한다.
function newsBlock(items: NewsItem[], cap: number): string {
  return items
    .slice(0, cap)
    .map((n, i) => `${i + 1}. [${n.source}] ${n.title}: ${n.summary || ""}`)
    .join("\n");
}

async function generate(kr: NewsItem[], us: NewsItem[]): Promise<EconBrief | null> {
  if (!aiEnabled()) return null;
  const today = new Date().toISOString().slice(0, 10);
  const usList = newsBlock(us, 40);
  const krList = newsBlock(kr, 60);
  const user = `너는 아래 오늘(${today})의 한국 경제 기사 ${Math.min(kr.length, 60)}건, 미국 경제 기사 ${Math.min(us.length, 40)}건 전체를 읽고 종합해야 한다. 한두 기사만 보고 뽑지 말고, 여러 기사에 걸쳐 반복되거나 비중 있게 다뤄지는 주제 위주로 뽑아라. 서로 다른 기사 여러 건이 같은 주제를 다루면 그게 오늘의 핵심 흐름일 가능성이 높다.

아래를 JSON으로 작성해줘.
- us: 미국 경제의 오늘 핵심 관점 5가지. 전체 기사 목록을 종합해 뽑을 것. 각 항목은 3문장 정도로 구체적으로(무슨 일/왜 중요/영향).
- kr: 한국 경제의 오늘 핵심 관점 5가지. 전체 기사 목록을 종합해 뽑을 것. 각 항목은 3문장 정도로 구체적으로.
- krHotIssues: 한국 경제 관련 가십·핫이슈 4~5가지. 전체 기사 목록 중 화제성 있는 이슈·논란·뒷이야기를 폭넓게 훑어서 뽑을 것(부동산·기업 뒷이야기·인물 등도 포함). 각 1~2문장.
- verdict: 두 경제 흐름이 결합될 때 종합 판단. 반드시 "시너지" | "혼조" | "리스크" 중 하나
- analysis: 왜 그렇게 판단했는지 3~5문장. 한·미 상호작용/전이 경로(환율·금리·수출·증시 등) 중심
- watchPoints: 앞으로 검증·주의해야 할 포인트 2~3개 (각 짧게)

반드시 아래 JSON 형식으로만, 키 이름 그대로 응답해(us·kr은 각 5개, 각 3문장):
{"us":["3문장","3문장","3문장","3문장","3문장"],"kr":["3문장","3문장","3문장","3문장","3문장"],"krHotIssues":["이슈","이슈","이슈","이슈"],"verdict":"시너지","analysis":"3~5문장","watchPoints":["짧게","짧게"]}

[미국 경제 기사 전체 목록 (${Math.min(us.length, 40)}건)]
${usList}

[한국 경제 기사 전체 목록 (${Math.min(kr.length, 60)}건)]
${krList}`;

  const strArr = { type: "ARRAY", items: { type: "STRING" } };
  const schema = {
    type: "OBJECT",
    properties: {
      us: strArr,
      kr: strArr,
      krHotIssues: strArr,
      verdict: { type: "STRING" },
      analysis: { type: "STRING" },
      watchPoints: strArr,
    },
    required: ["us", "kr", "krHotIssues", "verdict", "analysis", "watchPoints"],
  };

  const out = await aiJSON<Omit<EconBrief, "date" | "updatedAt">>(SYSTEM, user, schema, 8000);
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
    krHotIssues: out.krHotIssues ?? [],
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
  return unstable_cache(() => generate(kr, us), ["econ-brief-v5", day], {
    revalidate: 86400,
  })();
}
