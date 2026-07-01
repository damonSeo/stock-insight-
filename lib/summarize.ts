import Anthropic from "@anthropic-ai/sdk";
import { unstable_cache } from "next/cache";
import type { NewsItem } from "@/lib/news";

/**
 * 경제 뉴스 AI 요약 (Claude).
 * - ANTHROPIC_API_KEY가 없으면 원본 RSS 리드문을 그대로 반환(무비용 폴백).
 * - 기사들을 한 번의 요청으로 배치 요약(호출 1회) → 비용/지연 최소화.
 * - unstable_cache로 30분 캐시 → 페이지 재검증마다 호출되지 않음.
 */

const MODEL = "claude-opus-4-8";
const SUMMARIZE_COUNT = 15; // 상위 N개만 AI 요약 (나머지는 리드문 유지)

interface SummaryOut {
  summaries: { index: number; summary: string }[];
}

async function callClaude(items: NewsItem[]): Promise<NewsItem[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return items;

  const targets = items.slice(0, SUMMARIZE_COUNT);
  const client = new Anthropic({ apiKey });

  const articles = targets
    .map((it, i) => `[${i}]\n제목: ${it.title}\n리드: ${it.summary || "(본문 요약 없음)"}`)
    .join("\n\n");

  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system:
        "당신은 한국의 경제 뉴스 요약 전문가입니다. 각 기사를 한국어 3~5문장(5줄 이내)의 핵심 요약으로 정리합니다. 제목과 리드에 있는 사실만 사용하고 새로운 사실을 지어내지 마세요. 과장·투자 권유·감탄사 없이 담백하게. 각 항목의 index를 그대로 사용하세요.",
      messages: [
        {
          role: "user",
          content: `다음 경제 뉴스들을 각각 핵심만 담아 한국어로 요약해줘.\n\n${articles}`,
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              summaries: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    index: { type: "integer" },
                    summary: { type: "string" },
                  },
                  required: ["index", "summary"],
                  additionalProperties: false,
                },
              },
            },
            required: ["summaries"],
            additionalProperties: false,
          },
        },
      },
    });

    const textBlock = resp.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return items;
    const parsed = JSON.parse(textBlock.text) as SummaryOut;
    const map = new Map(parsed.summaries.map((s) => [s.index, s.summary]));
    return items.map((it, i) => {
      const s = map.get(i);
      return s ? { ...it, summary: s } : it;
    });
  } catch {
    return items; // 실패 시 원본 유지
  }
}

/** 시장별 뉴스 AI 요약 (30분 캐시, 키 없으면 원본 반환) */
export async function summarizeNews(
  items: NewsItem[],
  market: string,
): Promise<NewsItem[]> {
  if (!process.env.ANTHROPIC_API_KEY || items.length === 0) return items;
  const cacheKey = items.map((i) => i.link).join("|");
  const cached = unstable_cache(() => callClaude(items), ["news-summary", market, cacheKey], {
    revalidate: 1800,
  });
  return cached();
}

export function aiSummariesEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
