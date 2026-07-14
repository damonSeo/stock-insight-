export type Market = "US" | "KR";

export interface Stock {
  symbol: string;
  name: string;
  market: Market;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  marketCap: string;
  sector: string;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePct: number;
  market: Market;
}

export interface FutureValueStock {
  symbol: string;
  name: string;
  market: Market;
  price: number;
  targetPrice: number;
  upside: number;
  sector: string;
  theme: string;
  score: number;
  summary: string;
  reasons: string[];
  risk: "낮음" | "중간" | "높음";
  horizon: string;
  updatedAt: string;
}

export interface DiagnosisItem {
  symbol: string;
  ySymbol?: string; // 상세페이지 라우팅용 Yahoo 심볼(.KS/.KQ 포함) — 표시용 symbol과 다를 수 있음
  name: string;
  market: Market;
  price: number;
  change?: number; // 전일 대비 증감액 (Yahoo 포맷)
  changePct: number;
  volume: number;
  volumeRatio: number;
  rsi: number;
  macd: "매수" | "매도" | "중립";
  bollinger: "상단" | "중간" | "하단";
  signal: "강력매수" | "매수" | "관망" | "매도" | "강력매도";
  reason: string;
  type: "급등" | "급락";
}

export const marketIndices: MarketIndex[] = [
  { name: "S&P 500", value: 5287.14, change: 42.3, changePct: 0.81, market: "US" },
  { name: "NASDAQ", value: 18724.55, change: 198.7, changePct: 1.07, market: "US" },
  { name: "DOW JONES", value: 39512.84, change: -87.2, changePct: -0.22, market: "US" },
  { name: "KOSPI", value: 2748.32, change: 18.45, changePct: 0.68, market: "KR" },
  { name: "KOSDAQ", value: 912.67, change: -5.23, changePct: -0.57, market: "KR" },
  { name: "원/달러", value: 1352.5, change: -3.2, changePct: -0.24, market: "KR" },
];

export const topGainers: DiagnosisItem[] = [
  {
    symbol: "NVDA",
    name: "엔비디아",
    market: "US",
    price: 943.7,
    changePct: 8.42,
    volume: 52_340_000,
    volumeRatio: 3.2,
    rsi: 74,
    macd: "매수",
    bollinger: "상단",
    signal: "매수",
    reason: "AI 데이터센터 수요 급증, 블랙웰 출하 예상 상향",
    type: "급등",
  },
  {
    symbol: "META",
    name: "메타 플랫폼스",
    market: "US",
    price: 512.3,
    changePct: 6.18,
    volume: 28_710_000,
    volumeRatio: 2.7,
    rsi: 68,
    macd: "매수",
    bollinger: "상단",
    signal: "매수",
    reason: "AI 광고 매출 예상치 대폭 상회, 메타버스 비용 감축 발표",
    type: "급등",
  },
  {
    symbol: "005930",
    name: "삼성전자",
    market: "KR",
    price: 84200,
    changePct: 5.63,
    volume: 31_200_000,
    volumeRatio: 4.1,
    rsi: 71,
    macd: "매수",
    bollinger: "상단",
    signal: "강력매수",
    reason: "HBM3E 퀄컴 공급 계약 체결, 반도체 업황 반등 기대감",
    type: "급등",
  },
  {
    symbol: "TSLA",
    name: "테슬라",
    market: "US",
    price: 187.45,
    changePct: 4.87,
    volume: 91_230_000,
    volumeRatio: 2.1,
    rsi: 62,
    macd: "매수",
    bollinger: "중간",
    signal: "매수",
    reason: "FSD v13 출시 임박, 로보택시 규제 완화 기대",
    type: "급등",
  },
  {
    symbol: "035420",
    name: "NAVER",
    market: "KR",
    price: 198500,
    changePct: 4.21,
    volume: 2_340_000,
    volumeRatio: 2.8,
    rsi: 65,
    macd: "매수",
    bollinger: "상단",
    signal: "매수",
    reason: "하이퍼클로바X 기업 도입 확대, 커머스 성장 지속",
    type: "급등",
  },
];

export const topLosers: DiagnosisItem[] = [
  {
    symbol: "INTC",
    name: "인텔",
    market: "US",
    price: 28.34,
    changePct: -9.21,
    volume: 83_450_000,
    volumeRatio: 5.3,
    rsi: 28,
    macd: "매도",
    bollinger: "하단",
    signal: "매도",
    reason: "파운드리 사업 적자 확대, CEO 실적 가이던스 하향 조정",
    type: "급락",
  },
  {
    symbol: "BIDU",
    name: "바이두",
    market: "US",
    price: 91.2,
    changePct: -7.34,
    volume: 14_680_000,
    volumeRatio: 3.8,
    rsi: 32,
    macd: "매도",
    bollinger: "하단",
    signal: "강력매도",
    reason: "중국 AI 규제 강화, 광고 매출 감소 지속",
    type: "급락",
  },
  {
    symbol: "259960",
    name: "크래프톤",
    market: "KR",
    price: 287000,
    changePct: -6.45,
    volume: 1_230_000,
    volumeRatio: 4.2,
    rsi: 31,
    macd: "매도",
    bollinger: "하단",
    signal: "매도",
    reason: "인도 신작 출시 지연, 배그 MAU 하락 우려",
    type: "급락",
  },
  {
    symbol: "SNAP",
    name: "스냅",
    market: "US",
    price: 11.87,
    changePct: -5.92,
    volume: 38_920_000,
    volumeRatio: 2.9,
    rsi: 34,
    macd: "매도",
    bollinger: "하단",
    signal: "관망",
    reason: "광고 수익 모델 전환 불확실성, DAU 성장 정체",
    type: "급락",
  },
  {
    symbol: "035720",
    name: "카카오",
    market: "KR",
    price: 42500,
    changePct: -5.11,
    volume: 8_740_000,
    volumeRatio: 3.1,
    rsi: 29,
    macd: "매도",
    bollinger: "하단",
    signal: "매도",
    reason: "카카오모빌리티 매각 협상 결렬, 규제 리스크 확대",
    type: "급락",
  },
];

export const futureValueStocks: FutureValueStock[] = [
  {
    symbol: "NVDA",
    name: "엔비디아",
    market: "US",
    price: 943.7,
    targetPrice: 1400,
    upside: 48.4,
    sector: "반도체",
    theme: "AI 인프라",
    score: 95,
    summary: "AI 가속기 시장의 절대 지배자. 데이터센터 GPU 수요는 2027년까지 연평균 40% 이상 성장 전망.",
    reasons: [
      "H100/H200/블랙웰 GPU 공급 부족 지속",
      "CUDA 생태계 락인 효과로 경쟁사 전환 비용 극히 높음",
      "소프트웨어(CUDA, NIM) 매출 비중 확대로 마진 개선",
      "자율주행·로보틱스 신규 시장 진출",
    ],
    risk: "중간",
    horizon: "12~24개월",
    updatedAt: "2026-05-14",
  },
  {
    symbol: "MSFT",
    name: "마이크로소프트",
    market: "US",
    price: 418.2,
    targetPrice: 560,
    upside: 33.9,
    sector: "클라우드/AI",
    theme: "AI 엔터프라이즈",
    score: 92,
    summary: "Azure + Copilot 조합으로 기업용 AI 전환 수혜. 안정적인 구독 수익과 높은 해자.",
    reasons: [
      "Azure AI 서비스 분기 50% 이상 성장 지속",
      "M365 Copilot 기업 채택률 빠른 확산",
      "OpenAI 지분 투자로 AI 기술 최전선 확보",
      "게임(Xbox + Activision) 포트폴리오 다각화",
    ],
    risk: "낮음",
    horizon: "18~36개월",
    updatedAt: "2026-05-14",
  },
  {
    symbol: "005930",
    name: "삼성전자",
    market: "KR",
    price: 84200,
    targetPrice: 110000,
    upside: 30.6,
    sector: "반도체",
    theme: "HBM / AI 메모리",
    score: 85,
    summary: "HBM3E 양산 확대와 파운드리 2나노 공정 안정화가 2026년 실적 턴어라운드의 핵심 촉매.",
    reasons: [
      "HBM3E 엔비디아 공급 비중 확대 전망",
      "2nm GAA 공정 수율 개선으로 파운드리 흑자 전환 기대",
      "낮은 PBR(1.2배)로 가치 대비 현저히 저평가",
      "배당 확대 정책 및 자사주 매입 지속",
    ],
    risk: "중간",
    horizon: "12~18개월",
    updatedAt: "2026-05-14",
  },
  {
    symbol: "TSLA",
    name: "테슬라",
    market: "US",
    price: 187.45,
    targetPrice: 320,
    upside: 70.7,
    sector: "전기차/AI",
    theme: "자율주행 / 로보택시",
    score: 78,
    summary: "FSD와 로보택시 사업이 전기차 제조업체에서 AI 모빌리티 플랫폼으로의 전환 핵심. 장기 성장 스토리 유효.",
    reasons: [
      "FSD v13 완전자율주행 실현 시 소프트웨어 마진 급등",
      "사이버캡 로보택시 2026년 상용화 목표",
      "에너지 저장(Megapack) 사업 고성장",
      "오토파일럿 데이터 자산 경쟁사 대비 압도적",
    ],
    risk: "높음",
    horizon: "24~48개월",
    updatedAt: "2026-05-14",
  },
  {
    symbol: "373220",
    name: "LG에너지솔루션",
    market: "KR",
    price: 387000,
    targetPrice: 520000,
    upside: 34.4,
    sector: "2차전지",
    theme: "전고체 배터리",
    score: 82,
    summary: "전고체 배터리 양산 로드맵 보유, 북미 IRA 보조금 수혜 극대화. 배터리 사업 글로벌 2위 확고.",
    reasons: [
      "GM, 혼다, 스텔란티스와 장기 공급 계약 확보",
      "IRA 세액공제 연 1조원 이상 수혜",
      "전고체 배터리 2028년 양산 로드맵 구체화",
      "에너지저장장치(ESS) 수익 비중 확대",
    ],
    risk: "중간",
    horizon: "18~30개월",
    updatedAt: "2026-05-14",
  },
  {
    symbol: "AMZN",
    name: "아마존",
    market: "US",
    price: 193.8,
    targetPrice: 260,
    upside: 34.2,
    sector: "클라우드/커머스",
    theme: "AI 클라우드",
    score: 90,
    summary: "AWS 마진 개선 + 광고 사업 고성장 + 베드록 AI 플랫폼으로 복합 성장. 시가총액 대비 잠재력 크다.",
    reasons: [
      "AWS AI/ML 서비스 채택 가속화",
      "아마존 광고 분기 매출 15% 이상 성장",
      "트레이니엄2 자체 AI 칩으로 비용 경쟁력 확보",
      "물류 자동화로 이커머스 마진 구조 개선",
    ],
    risk: "낮음",
    horizon: "12~24개월",
    updatedAt: "2026-05-14",
  },
];

export const chartData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 3, 14 + i);
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    KOSPI: 2680 + Math.sin(i * 0.3) * 80 + i * 2.5 + Math.random() * 30,
    SP500: 5100 + Math.sin(i * 0.25) * 120 + i * 6 + Math.random() * 50,
  };
});
