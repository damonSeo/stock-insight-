// 임시 진단용: Gemini 키/모델이 실제로 동작하는지 확인 (키 값은 노출하지 않음)
export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  if (!key) {
    return Response.json({ ok: false, gemini_key: false, anthropic_key: hasAnthropic });
  }
  const model = "gemini-2.0-flash";
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "한 문장으로 인사해줘." }] }],
        }),
      },
    );
    const body = await res.text();
    return Response.json({
      ok: res.ok,
      status: res.status,
      model,
      gemini_key: true,
      body: body.slice(0, 700),
    });
  } catch (e) {
    return Response.json({ ok: false, gemini_key: true, error: String(e).slice(0, 400) });
  }
}
