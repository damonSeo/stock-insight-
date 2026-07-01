"use client";
import { Star } from "lucide-react";
import { toggleWatch, useWatchlist, type WatchItem } from "@/lib/watchlist";

export default function WatchlistStar({
  item,
  size = 18,
}: {
  item: WatchItem;
  size?: number;
}) {
  const list = useWatchlist();
  const active = list.some((w) => w.symbol === item.symbol);

  return (
    <button
      type="button"
      aria-label={active ? "관심종목 제거" : "관심종목 추가"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWatch(item);
      }}
      className={`rounded-lg p-1.5 transition-colors ${
        active ? "text-yellow-400 hover:text-yellow-300" : "text-slate-500 hover:text-slate-300"
      }`}
    >
      <Star size={size} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
