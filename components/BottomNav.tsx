"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, BarChart2, Star, Activity, Newspaper } from "lucide-react";

const navItems = [
  { href: "/", label: "대시보드", icon: Activity },
  { href: "/movers", label: "급등/급락", icon: TrendingUp },
  { href: "/future", label: "미래가치", icon: Star },
  { href: "/news", label: "뉴스", icon: Newspaper },
  { href: "/market", label: "시장현황", icon: BarChart2 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-blue-400" : "text-slate-500"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
