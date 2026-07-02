"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/** 실시간 표시 + 주기적 자동 새로고침(서버 데이터 재검증) */
export default function LiveIndicator({ intervalMs = 60000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [updatedAt, setUpdatedAt] = useState(() => Date.now());
  const [, tick] = useState(0);

  useEffect(() => {
    const refresh = setInterval(() => {
      router.refresh();
      setUpdatedAt(Date.now());
    }, intervalMs);
    const relabel = setInterval(() => tick((x) => x + 1), 10000);
    return () => {
      clearInterval(refresh);
      clearInterval(relabel);
    };
  }, [router, intervalMs]);

  const secs = Math.floor((Date.now() - updatedAt) / 1000);
  const label = secs < 15 ? "방금" : secs < 60 ? `${secs}초 전` : `${Math.floor(secs / 60)}분 전`;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-400">
      <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
      실시간 · {label} 업데이트
      <RefreshCw size={11} />
    </span>
  );
}
