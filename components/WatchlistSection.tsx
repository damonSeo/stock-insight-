"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, Star, TrendingUp, TrendingDown } from "lucide-react";
import {
  useWatchlist,
  toggleWatch,
  removeWatch,
  type WatchItem,
} from "@/lib/watchlist";
import type { Quote } from "@/lib/yahoo";
import type { SearchResult } from "@/lib/yahoo";

function marketOf(symbol: string): "KR" | "US" {
  return /\.(KS|KQ)$/.test(symbol) ? "KR" : "US";
}

export default function WatchlistSection() {
  const watchlist = useWatchlist();
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // 관심종목 시세 폴링 (60초)
  useEffect(() => {
    if (watchlist.length === 0) {
      setQuotes({});
      return;
    }
    let alive = true;
    const load = async () => {
      const symbols = watchlist.map((w) => w.symbol).join(",");
      try {
        const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbols)}`);
        const data = await res.json();
        if (alive) setQuotes(data);
      } catch {
        /* 무시 */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [watchlist]);

  // 검색 (디바운스)
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(await res.json());
        setOpen(true);
      } catch {
        /* 무시 */
      }
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  // 바깥 클릭 시 검색결과 닫기
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Star size={18} className="text-yellow-400" />
          <h2 className="text-lg font-bold text-white">내 관심종목</h2>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
            {watchlist.length}
          </span>
        </div>

        {/* 검색 */}
        <div ref={boxRef} className="relative w-full sm:w-72">
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
            <Search size={15} className="text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length && setOpen(true)}
              placeholder="종목 검색 (예: 삼성전자, AAPL)"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-slate-500 hover:text-slate-300">
                <X size={14} />
              </button>
            )}
          </div>

          {open && results.length > 0 && (
            <div className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
              {results.map((r) => {
                const market = marketOf(r.symbol);
                const added = watchlist.some((w) => w.symbol === r.symbol);
                return (
                  <button
                    key={r.symbol}
                    onClick={() => {
                      toggleWatch({ symbol: r.symbol, name: r.name, market });
                    }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-slate-800"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">
                        {market === "KR" ? "🇰🇷" : "🇺🇸"} {r.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.symbol} · {r.exchange}
                      </p>
                    </div>
                    <Star
                      size={16}
                      className={added ? "text-yellow-400" : "text-slate-600"}
                      fill={added ? "currentColor" : "none"}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 py-10 text-center text-sm text-slate-500">
          위 검색창에서 종목을 찾아 ⭐를 누르면 여기에 추가됩니다.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {watchlist.map((w) => {
            const q = quotes[w.symbol];
            const up = (q?.changePct ?? 0) >= 0;
            return (
              <Link
                key={w.symbol}
                href={`/stock/${encodeURIComponent(w.symbol)}`}
                className="group rounded-xl border border-slate-700/50 bg-slate-900/80 p-4 transition-all hover:-translate-y-0.5 hover:border-blue-700/50"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {w.market === "KR" ? "🇰🇷" : "🇺🇸"} {w.name}
                    </p>
                    <p className="font-mono text-xs text-slate-500">{w.symbol}</p>
                  </div>
                  <button
                    aria-label="관심종목 제거"
                    onClick={(e) => {
                      e.preventDefault();
                      removeWatch(w.symbol);
                    }}
                    className="text-slate-600 hover:text-red-400"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <p className="font-mono text-lg font-bold text-white">
                    {q
                      ? w.market === "KR"
                        ? `₩${q.price.toLocaleString("ko-KR")}`
                        : `$${q.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                      : "…"}
                  </p>
                  {q && (
                    <span
                      className={`flex items-center gap-1 text-sm ${
                        up ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {up ? "+" : ""}
                      {q.changePct.toFixed(2)}%
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
