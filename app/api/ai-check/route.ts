import { aiJSON } from "@/lib/ai";

// 임시 진단: 브리핑류 aiJSON 호출 + 원시 Groq 상태
export async function GET() {
  const groq = Boolean(process.env.GROQ_API_KEY);
  const gemini = Boolean(process.env.GEMINI_API_KEY);

  // 원시 Groq 상태
  let rawStatus = 0;
  let rawSnippet = "";
  if (process.env.GROQ_API_KEY) {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: 'reply as json {"ok":true}' }],
          response_format: { type: "json_object" },
          max_tokens: 100,
        }),
      });
      rawStatus = r.status;
      rawSnippet = (await r.text()).slice(0, 300);
    } catch (e) {
      rawSnippet = String(e).slice(0, 150);
    }
  }

  // 실제 헬퍼로 브리핑류 호출
  const schema = {
    type: "OBJECT",
    properties: {
      us: { type: "ARRAY", items: { type: "STRING" } },
      kr: { type: "ARRAY", items: { type: "STRING" } },
      verdict: { type: "STRING" },
    },
    required: ["us", "kr", "verdict"],
  };
  const helper = await aiJSON<{ us: string[]; kr: string[]; verdict: string }>(
    "매크로 애널리스트.",
    '미국(us) 키포인트 2개, 한국(kr) 키포인트 2개, verdict("시너지"/"혼조"/"리스크")를 JSON으로. 예: 미국 금리 동결, 한국 수출 증가.',
    schema,
    1000,
  );

  return Response.json({
    groq_key: groq,
    gemini_key: gemini,
    raw_groq_status: rawStatus,
    raw_groq_snippet: rawSnippet,
    helper_null: helper === null,
    helper: helper,
  });
}
