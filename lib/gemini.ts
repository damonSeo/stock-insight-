/**
 * Google Gemini 무료 티어 공용 헬퍼 (뉴스 요약 / 섹터 트렌드 등에서 공유).
 * gemini-2.5-flash 사용 (2.0-flash 계열은 일부 무료키에서 429, 1.5-flash는 404 단종).
 */

export const GEMINI_MODEL = "gemini-2.5-flash";

export function geminiEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** 시스템+유저 프롬프트로 구조화(JSON) 응답을 받아 파싱. 실패 시 null. */
export async function geminiJSON<T>(
  system: string,
  user: string,
  schema: object,
  maxOutputTokens = 8000,
): Promise<T | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ parts: [{ text: user }] }],
          generationConfig: {
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 0 }, // 요약/분석엔 thinking 불필요
            responseSchema: schema,
            maxOutputTokens,
          },
        }),
      },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const text: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
