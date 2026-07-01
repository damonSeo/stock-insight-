import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import MarketTicker from "@/components/MarketTicker";
import ServiceWorker from "@/components/ServiceWorker";
import { fetchIndices } from "@/lib/yahoo";

export const metadata: Metadata = {
  title: "StockInsight KR·US — 미국 한국 주식 분석",
  description: "미국·한국 주식·환율·지수 실시간 시세와 급등/급락 진단, 미래 가치 투자 분석",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StockInsight",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const indices = await fetchIndices();

  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0e1a] text-slate-100 pb-16 md:pb-0">
        <Navbar />
        <MarketTicker indices={indices} />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
          © 2026 StockInsight · 본 사이트의 정보는 투자 참고용이며 투자 권유가 아닙니다.
        </footer>
        <BottomNav />
        <ServiceWorker />
      </body>
    </html>
  );
}
