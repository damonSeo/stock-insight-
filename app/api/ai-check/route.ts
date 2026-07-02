// 임시 진단: 섹터 트렌드 요청(enum 포함 schema)의 원시 응답 확인
export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ gemini_key: false });
  const model = "gemini-2.5-flash";
  const body = {
    systemInstruction: { parts: [{ text: "증권 섹터 애널리스트." }] },
    contents: [{ parts: [{ text: "AI반도체 섹터 트렌드를 trend/drivers/outlook(긍정,중립,부정)로. id는 ai-chip." }] }],
    generationConfig: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
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
      },
      maxOutputTokens: 4000,
    },
  };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    );
    const text = await res.text();
    return Response.json({ status: res.status, ok: res.ok, body: text.slice(0, 1400) });
  } catch (e) {
    return Response.json({ error: String(e).slice(0, 400) });
  }
}
