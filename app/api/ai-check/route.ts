// 임시 진단: 실제 요약 요청(responseSchema+thinking)의 원시 응답 확인
export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ gemini_key: false });
  const model = "gemini-2.5-flash";
  const body = {
    systemInstruction: { parts: [{ text: "각 기사를 한국어 3문장으로 요약." }] },
    contents: [
      {
        parts: [
          {
            text: '다음을 {"summaries":[{"index":0,"summary":"..."}]} JSON으로 요약해줘.\n\n[0]\n제목: 코스피 급락\n리드: 반도체주 약세로 코스피가 하락했다.',
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
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
  };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    );
    const text = await res.text();
    return Response.json({ status: res.status, ok: res.ok, body: text.slice(0, 1200) });
  } catch (e) {
    return Response.json({ error: String(e).slice(0, 400) });
  }
}
