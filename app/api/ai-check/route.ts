// 임시 진단용: 어떤 Gemini 모델이 이 무료 키로 동작하는지 확인
const CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ gemini_key: false });

  const results: Record<string, number | string> = {};
  for (const model of CANDIDATES) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] }),
        },
      );
      results[model] = res.status;
    } catch (e) {
      results[model] = String(e).slice(0, 80);
    }
  }
  return Response.json({ gemini_key: true, results });
}
