import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StockInsight — 한국·미국 주식 분석",
    short_name: "StockInsight",
    description:
      "국내·해외 주식, 원/달러 환율, 주요 지수 실시간 시세와 투자 분석",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0e1a",
    theme_color: "#0a0e1a",
    orientation: "portrait",
    lang: "ko",
    categories: ["finance", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
