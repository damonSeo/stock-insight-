import { unstable_cache } from "next/cache";
import type { NewsItem } from "@/lib/news";

/**
 * 경제 뉴스 AI 요약 — 무료 우선.
 * 우선순위: GEMINI_API_KEY(무료 티어) → ANTHROPIC_API_KEY(유료) → RSS 리드문 폴백.
 * - 기사들을 한 번의 요청으로 배치 요약(호출 1회) → 무료 한도 절약.
 * - unstable_cache로 30분 캐시 → 페이지 재검증마다 호출되지 않음.
 */

const SUMMARIZE_COUNT = 24; // 전체 기사 AI 요약 (무료 티어로 충분)
const GEMINI_MODEL = "gemini-2.5-flash"; // 무료 티어 (2.0-flash는 일부 키에서 무료 한도 0)
const CLAUDE_MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT =
  "당신은 한국의 경제 뉴스 요약 전문가입니다. 각 기사를 한국어 3~5문장(5줄 이내)의 핵심 요약으로 정리합니다. 제목과 리드에 있는 사실만 사용하고 새로운 사실을 지어내지 마세요. 과장·투자 권유·감탄사 없이 담백하게. 각 항목의 index를 그대로 사용하세요.";

interface SummaryItem {
  index: number;
  summary: string;
}

function buildPrompt(items: NewsItem[]): string {
  const articles = items
    .map((it, i) => `[${i}]\n제목: ${it.title}\n리드: ${it.summary || "(본문 요약 없음)"}`)
    .join("\n\n");
  return `다음 경제 뉴스들을 각각 핵심만 담아 한국어로 요약해줘. 결과는 {"summaries":[{"index":번호,"summary":"요약문"}...]} 형태의 JSON으로만 응답해.\n\n${articles}`;
}

function applySummaries(items: NewsItem[], summaries: SummaryItem[]): NewsItem[] {
  const map = new Map(summaries.map((s) => [s.index, s.summary]));
  return items.map((it, i) => {
    const s = map.get(i);
    return s ? { ...it, summary: s, ai: true } : it;
  });
}

// ---- Google Gemini (무료) ----
async function callGemini(items: NewsItem[]): Promise<NewsItem[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return items;
  const targets = items.slice(0, SUMMARIZE_COUNT);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: buildPrompt(targets) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }, // 요약엔 thinking 불필요 → 끔(속도/안정성)
          responseSchema: {
            type: "OBJECT",
            properties: {
              summaries: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    index: { type: "INTEGER" },
                    summary: { type: "STRING" },
                  },
                  required: ["index", "summary"],
                },
              },
            },
            required: ["summaries"],
          },
          maxOutputTokens: 8000,
        },
      }),
    });
    if (!res.ok) return items;
    const json = await res.json();
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return items;
    const parsed = JSON.parse(text) as { summaries: SummaryItem[] };
    return applySummaries(items, parsed.summaries ?? []);
  } catch {
    return items;
  }
}

// ---- Anthropic Claude (유료, 선택) ----
async function callClaude(items: NewsItem[]): Promise<NewsItem[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return items;
  const targets = items.slice(0, SUMMARIZE_COUNT);
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const resp = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(targets) }],
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
    const parsed = JSON.parse(textBlock.text) as { summaries: SummaryItem[] };
    return applySummaries(items, parsed.summaries ?? []);
  } catch {
    return items;
  }
}

async function summarize(items: NewsItem[]): Promise<NewsItem[]> {
  if (process.env.GEMINI_API_KEY) return callGemini(items);
  if (process.env.ANTHROPIC_API_KEY) return callClaude(items);
  return items;
}

/** 시장별 뉴스 AI 요약 (30분 캐시, 키 없으면 원본 반환) */
export async function summarizeNews(
  items: NewsItem[],
  market: string,
): Promise<NewsItem[]> {
  if (!aiSummariesEnabled() || items.length === 0) return items;
  const cacheKey = items.map((i) => i.link).join("|");
  // 버전 접두어 — 모델/프롬프트 변경 시 값만 올리면 기존 캐시 즉시 무효화
  const cached = unstable_cache(() => summarize(items), ["news-summary-v3", market, cacheKey], {
    revalidate: 1800,
  });
  return cached();
}

export function aiSummariesEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY);
}
