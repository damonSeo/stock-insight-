/**
 * 한국 급등/급락 산출용 대형주 바스켓.
 * Yahoo 예약 스크리너가 미국 전용이라, 이 바스켓의 등락률을 정렬해 국내 movers를 만든다.
 * (정식 전체시장 랭킹이 필요하면 KRX/한국투자증권 API로 교체)
 */
export interface KrStock {
  code: string;
  name: string;
  board: "KS" | "KQ"; // KOSPI / KOSDAQ
}

export const KR_UNIVERSE: KrStock[] = [
  { code: "005930", name: "삼성전자", board: "KS" },
  { code: "000660", name: "SK하이닉스", board: "KS" },
  { code: "373220", name: "LG에너지솔루션", board: "KS" },
  { code: "207940", name: "삼성바이오로직스", board: "KS" },
  { code: "005380", name: "현대차", board: "KS" },
  { code: "005490", name: "POSCO홀딩스", board: "KS" },
  { code: "035420", name: "NAVER", board: "KS" },
  { code: "035720", name: "카카오", board: "KS" },
  { code: "051910", name: "LG화학", board: "KS" },
  { code: "006400", name: "삼성SDI", board: "KS" },
  { code: "000270", name: "기아", board: "KS" },
  { code: "068270", name: "셀트리온", board: "KS" },
  { code: "105560", name: "KB금융", board: "KS" },
  { code: "028260", name: "삼성물산", board: "KS" },
  { code: "012330", name: "현대모비스", board: "KS" },
  { code: "247540", name: "에코프로비엠", board: "KQ" },
  { code: "086520", name: "에코프로", board: "KQ" },
  { code: "091990", name: "셀트리온헬스케어", board: "KQ" },
  { code: "196170", name: "알테오젠", board: "KQ" },
  { code: "066970", name: "엘앤에프", board: "KQ" },
];
