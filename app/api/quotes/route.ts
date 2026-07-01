import { fetchQuotes } from "@/lib/yahoo";

// GET /api/quotes?symbols=AAPL,005930.KS
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("symbols") ?? "";
  const symbols = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
  if (symbols.length === 0) return Response.json({});
  const quotes = await fetchQuotes(symbols);
  return Response.json(quotes);
}
