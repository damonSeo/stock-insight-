"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, BarChart2, Star, Activity, Newspaper } from "lucide-react";

const navItems = [
  { href: "/", label: "대시보드", icon: Activity },
  { href: "/movers", label: "급등/급락 분석", icon: TrendingUp },
  { href: "/future", label: "미래 가치 투자", icon: Star },
  { href: "/news", label: "경제 뉴스", icon: Newspaper },
  { href: "/market", label: "시장 현황", icon: BarChart2 },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">StockInsight</span>
            <span className="ml-1 rounded bg-blue-900/60 px-1.5 py-0.5 text-xs text-blue-300">KR·US</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname === href
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="animate-pulse h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs text-slate-400">실시간 업데이트</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
