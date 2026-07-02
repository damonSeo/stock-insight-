/**
 * 무료 AI 프로바이더 공용 헬퍼 (뉴스 요약 / 섹터 트렌드 공유).
 * 우선순위: GROQ_API_KEY(무료, 하루 ~14,400건) → GEMINI_API_KEY(무료지만 키에 따라 한도 낮음).
 * 둘 다 JSON 구조화 출력. 실패 시 null → 호출부가 폴백.
 */

const GROQ_MODEL = "llama-3.3-70b-versatile"; // 무료, 한국어 양호
const GEMINI_MODEL = "gemini-2.5-flash-lite"; // 무료(단, 일부 키는 하루 한도 매우 낮음)

export function aiEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY);
}

// ---- Groq (OpenAI 호환, JSON mode) ----
async function groqJSON<T>(system: string, user: string, maxTokens: number): Promise<T | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text: string | undefined = json?.choices?.[0]?.message?.content;
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// ---- Google Gemini (responseSchema JSON) ----
async function geminiJSON<T>(
  system: string,
  user: string,
  schema: object,
  maxTokens: number,
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
            thinkingConfig: { thinkingBudget: 0 },
            responseSchema: schema,
            maxOutputTokens: maxTokens,
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

/**
 * 구조화 JSON 응답. Groq 우선, 실패 시 Gemini.
 * `geminiSchema`는 Gemini responseSchema용(Groq는 프롬프트로 형태 지정).
 */
export async function aiJSON<T>(
  system: string,
  user: string,
  geminiSchema: object,
  maxTokens = 8000,
): Promise<T | null> {
  if (process.env.GROQ_API_KEY) {
    const r = await groqJSON<T>(system, user, maxTokens);
    if (r) return r;
  }
  if (process.env.GEMINI_API_KEY) {
    return geminiJSON<T>(system, user, geminiSchema, maxTokens);
  }
  return null;
}
