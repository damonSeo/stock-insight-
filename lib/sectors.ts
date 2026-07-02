/**
 * 미래 먹거리 · 핫한 성장 섹터 분류 + 대표 종목 (Yahoo 심볼).
 * 섹터별 실시세로 모멘텀을 계산하고 AI 트렌드 분석을 붙인다.
 */
export interface SectorStock {
  symbol: string;
  name: string;
  market: "KR" | "US";
}

export interface HotSector {
  id: string;
  name: string;
  emoji: string;
  theme: string;
  stocks: SectorStock[];
}

export const HOT_SECTORS: HotSector[] = [
  {
    id: "ai-chip",
    name: "AI 반도체",
    emoji: "🤖",
    theme: "AI 인프라 · GPU · HBM",
    stocks: [
      { symbol: "NVDA", name: "엔비디아", market: "US" },
      { symbol: "AVGO", name: "브로드컴", market: "US" },
      { symbol: "005930.KS", name: "삼성전자", market: "KR" },
      { symbol: "000660.KS", name: "SK하이닉스", market: "KR" },
    ],
  },
  {
    id: "cloud-sw",
    name: "클라우드 · SW",
    emoji: "☁️",
    theme: "클라우드 · 엔터프라이즈 AI",
    stocks: [
      { symbol: "MSFT", name: "마이크로소프트", market: "US" },
      { symbol: "AMZN", name: "아마존", market: "US" },
      { symbol: "GOOGL", name: "알파벳", market: "US" },
      { symbol: "035420.KS", name: "NAVER", market: "KR" },
    ],
  },
  {
    id: "battery",
    name: "2차전지 · 에너지",
    emoji: "🔋",
    theme: "전기차 배터리 · ESS",
    stocks: [
      { symbol: "373220.KS", name: "LG에너지솔루션", market: "KR" },
      { symbol: "247540.KQ", name: "에코프로비엠", market: "KR" },
      { symbol: "006400.KS", name: "삼성SDI", market: "KR" },
    ],
  },
  {
    id: "robot-ev",
    name: "로봇 · 자율주행",
    emoji: "🚗",
    theme: "자율주행 · 휴머노이드 로봇",
    stocks: [
      { symbol: "TSLA", name: "테슬라", market: "US" },
      { symbol: "012330.KS", name: "현대모비스", market: "KR" },
    ],
  },
  {
    id: "bio",
    name: "바이오 · 헬스케어",
    emoji: "🧬",
    theme: "비만치료제 · 신약 · 바이오시밀러",
    stocks: [
      { symbol: "LLY", name: "일라이릴리", market: "US" },
      { symbol: "207940.KS", name: "삼성바이오로직스", market: "KR" },
      { symbol: "196170.KQ", name: "알테오젠", market: "KR" },
    ],
  },
  {
    id: "defense",
    name: "방산 · 우주",
    emoji: "🛰️",
    theme: "방위산업 · 우주항공",
    stocks: [
      { symbol: "012450.KS", name: "한화에어로스페이스", market: "KR" },
      { symbol: "LMT", name: "록히드마틴", market: "US" },
    ],
  },
];
