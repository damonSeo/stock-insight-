import type { DiagnosisItem, Market, MarketIndex } from "@/lib/mockData";
import {
  bollinger,
  deriveSignal,
  macdSignal,
  rsi,
  volumeRatio,
} from "@/lib/indicators";
import { KR_UNIVERSE } from "@/lib/krUniverse";

/**
 * Yahoo Finance 무료 엔드포인트 기반 실시간 시세 조회.
 *
 * 인증(crumb/쿠키)이 필요한 /v7/finance/quote 대신, 인증 없이 동작하는
 * /v8/finance/chart 엔드포인트만 사용한다. 이 엔드포인트의 meta에서 현재가와
 * 전일 종가를 얻을 수 있고, timestamp/close 배열로 미니차트도 만든다.
 *
 * 주의: 비공식 엔드포인트이므로 트래픽이 커지면 정식 라이선스 데이터로 교체 필요.
 */

const BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

// 60초 캐시 — 무료 티어 보호 + 과도한 재조회 방지
const REVALIDATE_SECONDS = 60;

export interface IndexConfig {
  name: string;
  symbol: string;
  market: Market;
}

// 원하시는 구성: 국내·해외 인덱스 + 원/달러 환율
export const INDEX_CONFIGS: IndexConfig[] = [
  { name: "S&P 500", symbol: "^GSPC", market: "US" },
  { name: "NASDAQ", symbol: "^IXIC", market: "US" },
  { name: "DOW JONES", symbol: "^DJI", market: "US" },
  { name: "KOSPI", symbol: "^KS11", market: "KR" },
  { name: "KOSDAQ", symbol: "^KQ11", market: "KR" },
  { name: "원/달러", symbol: "KRW=X", market: "KR" },
];

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
}

export interface SeriesPoint {
  date: string;
  value: number;
}

interface YahooChartResult {
  meta: {
    regularMarketPrice?: number;
    chartPreviousClose?: number;
    previousClose?: number;
  };
  timestamp?: number[];
  indicators?: {
    quote?: {
      open?: (number | null)[];
      high?: (number | null)[];
      low?: (number | null)[];
      close?: (number | null)[];
      volume?: (number | null)[];
    }[];
  };
}

async function fetchChartRaw(
  symbol: string,
  range = "1d", // 기본 1일: meta.chartPreviousClose = 전일 종가 → 일간 등락 정확
  interval = "1d",
): Promise<YahooChartResult | null> {
  const url = `${BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.chart?.result?.[0] ?? null;
  } catch {
    return null;
  }
}

function toQuote(symbol: string, data: YahooChartResult | null): Quote {
  const price = data?.meta.regularMarketPrice ?? 0;
  const prev =
    data?.meta.chartPreviousClose ?? data?.meta.previousClose ?? price;
  const change = price - prev;
  const changePct = prev ? (change / prev) * 100 : 0;
  return { symbol, price, change, changePct };
}

/** 주요 지수/환율 실시간 시세 (홈 대시보드·티커용) */
export async function fetchIndices(): Promise<MarketIndex[]> {
  const results = await Promise.all(
    INDEX_CONFIGS.map(async (cfg) => {
      const data = await fetchChartRaw(cfg.symbol);
      const q = toQuote(cfg.symbol, data);
      return {
        name: cfg.name,
        value: q.price,
        change: q.change,
        changePct: q.changePct,
        market: cfg.market,
      } satisfies MarketIndex;
    }),
  );
  return results;
}

/** 개별 종목 현재가 배치 조회 (관심종목·미래가치 카드용) */
export async function fetchQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const entries = await Promise.all(
    symbols.map(async (symbol) => {
      const data = await fetchChartRaw(symbol);
      return [symbol, toQuote(symbol, data)] as const;
    }),
  );
  return Object.fromEntries(entries);
}

/** 30일 종가 시계열 (미니차트용) */
export async function fetchSeries(symbol: string): Promise<SeriesPoint[]> {
  const data = await fetchChartRaw(symbol, "1mo", "1d");
  const timestamps = data?.timestamp ?? [];
  const closes = data?.indicators?.quote?.[0]?.close ?? [];
  const points: SeriesPoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const value = closes[i];
    if (value == null) continue;
    const d = new Date(timestamps[i] * 1000);
    points.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, value });
  }
  return points;
}

/**
 * 한국 종목 심볼 변환: 6자리 코드 -> Yahoo 심볼(.KS/.KQ).
 * KOSPI는 .KS, KOSDAQ은 .KQ. 여기서는 기본을 .KS로 두고,
 * 필요 시 종목별로 명시적으로 지정한다.
 */
export function krSymbol(code: string, board: "KS" | "KQ" = "KS"): string {
  return `${code}.${board}`;
}

// ---------------------------------------------------------------------------
// 종목 상세 (캔들차트 + 지표) & 검색
// ---------------------------------------------------------------------------

export interface Candle {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** OHLCV 캔들 시계열 (캔들차트용) */
export async function fetchCandles(symbol: string, range = "6mo"): Promise<Candle[]> {
  const data = await fetchChartRaw(symbol, range, "1d");
  const ts = data?.timestamp ?? [];
  const q = data?.indicators?.quote?.[0];
  const candles: Candle[] = [];
  for (let i = 0; i < ts.length; i++) {
    const o = q?.open?.[i];
    const h = q?.high?.[i];
    const l = q?.low?.[i];
    const c = q?.close?.[i];
    if (o == null || h == null || l == null || c == null) continue;
    candles.push({
      time: new Date(ts[i] * 1000).toISOString().slice(0, 10),
      open: o,
      high: h,
      low: l,
      close: c,
      volume: q?.volume?.[i] ?? 0,
    });
  }
  return candles;
}

/** 종목 메타(이름/통화/시장) — 상세 페이지 헤더용 */
export async function fetchQuoteMeta(symbol: string): Promise<{
  price: number;
  change: number;
  changePct: number;
  currency: string;
  name: string;
} | null> {
  const data = await fetchChartRaw(symbol, "1d", "1d");
  if (!data) return null;
  const q = toQuote(symbol, data);
  const meta = (data as unknown as {
    meta?: { currency?: string; longName?: string; shortName?: string };
  })?.meta;
  return {
    price: q.price,
    change: q.change,
    changePct: q.changePct,
    currency: meta?.currency ?? "USD",
    name: meta?.longName ?? meta?.shortName ?? symbol,
  };
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface YahooSearchQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  exchDisp?: string;
  quoteType?: string;
}

/** 종목 검색 (Yahoo search) — 관심종목 추가용 */
export async function searchSymbols(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const quotes: YahooSearchQuote[] = json?.quotes ?? [];
    return quotes
      .filter((x) => x.symbol && (x.shortname || x.longname))
      .filter((x) => ["EQUITY", "ETF", "INDEX", "CURRENCY"].includes(x.quoteType ?? ""))
      .map((x) => ({
        symbol: x.symbol as string,
        name: (x.shortname || x.longname) as string,
        exchange: x.exchDisp ?? "",
        type: x.quoteType ?? "",
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 급등/급락 진단 (실제 시세 + 계산 지표)
// ---------------------------------------------------------------------------

const SCREENER =
  "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved";

interface ScreenerQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
}

/** Yahoo 예약 스크리너에서 종목 심볼 목록 조회 (미국 시장) */
async function fetchScreenerSymbols(
  scrId: "day_gainers" | "day_losers" | "most_actives",
  count: number,
): Promise<{ symbol: string; name: string }[]> {
  const url = `${SCREENER}?scrIds=${scrId}&count=${count}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const quotes: ScreenerQuote[] =
      json?.finance?.result?.[0]?.quotes ?? [];
    return quotes.map((q) => ({
      symbol: q.symbol,
      name: q.shortName ?? q.longName ?? q.symbol,
    }));
  } catch {
    return [];
  }
}

/** 종목 1개의 시세+지표를 계산해 진단 카드 데이터 생성 */
export async function fetchDiagnosis(
  symbol: string,
  name: string,
  market: Market,
): Promise<DiagnosisItem | null> {
  const data = await fetchChartRaw(symbol, "3mo", "1d");
  if (!data) return null;

  const closesRaw = data.indicators?.quote?.[0]?.close ?? [];
  const volumesRaw = data.indicators?.quote?.[0]?.volume ?? [];
  const closes = closesRaw.filter((c): c is number => c != null);
  const volumes = volumesRaw.filter((v): v is number => v != null);
  if (closes.length < 15) return null;

  // 일간 등락 = 현재가 vs 전일 종가(시계열의 직전 일봉 종가)
  const price = data.meta.regularMarketPrice ?? closes[closes.length - 1];
  const prevClose =
    closes.length >= 2 ? closes[closes.length - 2] : data.meta.chartPreviousClose ?? price;
  const change = price - prevClose;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;
  const type: "급등" | "급락" = changePct >= 0 ? "급등" : "급락";

  const rsiVal = Math.round(rsi(closes) ?? 50);
  const macd = macdSignal(closes);
  const bb = bollinger(closes);
  const volRatio = volumeRatio(volumes);
  const signal = deriveSignal(type, rsiVal, macd);

  const rsiWord = rsiVal >= 70 ? "과매수" : rsiVal <= 30 ? "과매도" : "중립";
  const reason = `RSI ${rsiVal}(${rsiWord}) · MACD ${macd} 신호 · 볼린저 ${bb} 밴드 · 거래량 평균 대비 ${volRatio}배`;

  return {
    symbol: symbol.replace(/\.(KS|KQ)$/, ""),
    ySymbol: symbol,
    name,
    market,
    price,
    change,
    changePct,
    volume: volumes[volumes.length - 1] ?? 0,
    volumeRatio: volRatio,
    rsi: rsiVal,
    macd,
    bollinger: bb,
    signal,
    reason,
    type,
  };
}

function isNonNull<T>(v: T | null): v is T {
  return v != null;
}

/** 미국 급등 또는 급락 종목 (스크리너 + 지표 계산) */
export async function fetchUsMovers(
  kind: "gainers" | "losers",
  count = 5,
): Promise<DiagnosisItem[]> {
  const scrId = kind === "gainers" ? "day_gainers" : "day_losers";
  const list = await fetchScreenerSymbols(scrId, count);
  const items = await Promise.all(
    list.map((s) => fetchDiagnosis(s.symbol, s.name, "US")),
  );
  return items.filter(isNonNull);
}

/** 국내 급등/급락 (대형주 바스켓을 등락률로 정렬) */
export async function fetchKrMovers(
  count = 5,
): Promise<{ gainers: DiagnosisItem[]; losers: DiagnosisItem[] }> {
  const items = await Promise.all(
    KR_UNIVERSE.map((s) =>
      fetchDiagnosis(krSymbol(s.code, s.board), s.name, "KR"),
    ),
  );
  const valid = items.filter(isNonNull).sort((a, b) => b.changePct - a.changePct);
  return {
    gainers: valid
      .filter((i) => i.changePct >= 0)
      .slice(0, count)
      .map((i) => ({ ...i, type: "급등" as const })),
    losers: valid
      .filter((i) => i.changePct < 0)
      .slice(-count)
      .reverse()
      .map((i) => ({ ...i, type: "급락" as const })),
  };
}

/** 홈/movers 페이지용: 미국+한국 급등/급락 통합 */
export async function fetchAllMovers(count = 5): Promise<{
  gainers: DiagnosisItem[];
  losers: DiagnosisItem[];
}> {
  const [usG, usL, kr] = await Promise.all([
    fetchUsMovers("gainers", count),
    fetchUsMovers("losers", count),
    fetchKrMovers(count),
  ]);
  const gainers = [...usG, ...kr.gainers].sort(
    (a, b) => b.changePct - a.changePct,
  );
  const losers = [...usL, ...kr.losers].sort(
    (a, b) => a.changePct - b.changePct,
  );
  return { gainers, losers };
}
