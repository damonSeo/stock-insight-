import { searchSymbols } from "@/lib/yahoo";

// GET /api/search?q=samsung
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchSymbols(q);
  return Response.json(results);
}
