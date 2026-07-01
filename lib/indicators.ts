/**
 * 기술적 지표 계산 — 실제 종가/거래량 시계열에서 RSI·MACD·볼린저·거래량비 산출.
 * MVP 수준의 정확도(간이 계산)이며, 정밀 백테스트용이 아니다.
 */

export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function rsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function ema(values: number[], period: number): number {
  const k = 2 / (period + 1);
  let e = values[0];
  for (let i = 1; i < values.length; i++) e = values[i] * k + e * (1 - k);
  return e;
}

export type MacdSignal = "매수" | "매도" | "중립";

export function macdSignal(closes: number[]): MacdSignal {
  if (closes.length < 26) return "중립";
  const line = ema(closes, 12) - ema(closes, 26);
  const scale = Math.abs(closes[closes.length - 1]) * 0.001; // 노이즈 임계치
  if (line > scale) return "매수";
  if (line < -scale) return "매도";
  return "중립";
}

export type BollingerBand = "상단" | "중간" | "하단";

export function bollinger(closes: number[], period = 20, mult = 2): BollingerBand {
  const mid = sma(closes, period);
  if (mid == null) return "중간";
  const slice = closes.slice(-period);
  const variance =
    slice.reduce((a, b) => a + (b - mid) ** 2, 0) / period;
  const std = Math.sqrt(variance);
  const last = closes[closes.length - 1];
  if (last >= mid + mult * std) return "상단";
  if (last <= mid - mult * std) return "하단";
  return "중간";
}

export function volumeRatio(volumes: number[], period = 20): number {
  const valid = volumes.filter((v) => v != null && v > 0);
  if (valid.length < 2) return 1;
  const last = valid[valid.length - 1];
  const avg = sma(valid.slice(0, -1), Math.min(period, valid.length - 1));
  if (!avg) return 1;
  return Math.round((last / avg) * 10) / 10;
}

export type Signal = "강력매수" | "매수" | "관망" | "매도" | "강력매도";

export function deriveSignal(
  type: "급등" | "급락",
  rsiVal: number,
  macd: MacdSignal,
): Signal {
  if (type === "급등") {
    if (rsiVal >= 80) return "관망"; // 과매수 → 추격매수 주의
    if (macd === "매수" && rsiVal < 70) return "강력매수";
    return "매수";
  }
  if (rsiVal <= 20) return "관망"; // 과매도 → 반등 가능성
  if (macd === "매도") return "강력매도";
  return "매도";
}
