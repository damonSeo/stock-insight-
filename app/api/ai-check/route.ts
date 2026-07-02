import { geminiJSON } from "@/lib/gemini";

// 임시 진단: 실제 geminiJSON 헬퍼 + 원시 flash-lite 상태를 함께 확인
export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ gemini_key: false });

  // 1) 지금 flash-lite 원시 상태 (429인지)
  let rawStatus = 0;
  let rawSnippet = "";
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] }),
      },
    );
    rawStatus = r.status;
    rawSnippet = (await r.text()).slice(0, 200);
  } catch (e) {
    rawSnippet = String(e).slice(0, 120);
  }

  // 2) 실제 헬퍼 호출 (섹터 스키마)
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
            outlook: { type: "STRING" },
          },
          required: ["id", "trend", "drivers", "outlook"],
        },
      },
    },
    required: ["trends"],
  };
  const helper = await geminiJSON<{ trends: unknown[] }>(
    "증권 섹터 애널리스트.",
    "AI반도체(id:ai-chip) 섹터 트렌드를 trend/drivers/outlook로 JSON.",
    schema,
    4000,
  );

  return Response.json({
    rawStatus,
    rawSnippet,
    helper_null: helper === null,
    helper_count: helper?.trends?.length ?? 0,
  });
}
