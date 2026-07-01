"use client";
import { useEffect, useState } from "react";

/** 관심종목 — 로그인 없이 localStorage 기반 (추후 Supabase로 이전 가능) */
export interface WatchItem {
  symbol: string; // Yahoo 심볼 (예: AAPL, 005930.KS)
  name: string;
  market: "KR" | "US";
}

const KEY = "stockinsight:watchlist";
const EVENT = "watchlist-change";

export function getWatchlist(): WatchItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(list: WatchItem[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function isWatched(symbol: string): boolean {
  return getWatchlist().some((w) => w.symbol === symbol);
}

/** 추가/제거 토글 — 추가되면 true 반환 */
export function toggleWatch(item: WatchItem): boolean {
  const list = getWatchlist();
  const idx = list.findIndex((w) => w.symbol === item.symbol);
  if (idx >= 0) {
    list.splice(idx, 1);
    save(list);
    return false;
  }
  list.push(item);
  save(list);
  return true;
}

export function removeWatch(symbol: string) {
  save(getWatchlist().filter((w) => w.symbol !== symbol));
}

/** 관심종목 상태를 구독하는 훅 (다른 탭/컴포넌트 변경도 반영) */
export function useWatchlist(): WatchItem[] {
  const [list, setList] = useState<WatchItem[]>([]);
  useEffect(() => {
    const sync = () => setList(getWatchlist());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}
