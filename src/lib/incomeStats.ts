import type { MonthlyStat, AppMode } from '@/types';
import { INCOME_STABILITY } from '@/config/modes';

// ============================================
// 수입 분석 엔진 (finance-domain-expert 설계)
// ============================================
//
// 대학원생 수입의 불규칙성(BK는 매달, 장학금은 연 1~2회)을 올바르게 집계하기 위한
// 순수함수 모듈. 모든 계산은 MonthlyStat[] 12개월 기준.
//
// 핵심 지표:
// - activeAvg    : 수입 발생 달만의 평균 (0원 달 제외)
// - median       : 활성 월 중앙값 (이상치 완화)
// - cv           : 변동계수 σ/μ (0.3↓ 안정 / 0.3~0.6 보통 / 0.6↑ 고변동)
// - byCategory   : 원천별 평균·변동성·안정성 태그·12개월 sparkline
// - forecast     : 다음달 예상 low/mid/high (최근 3~6개월 기반)
// - suggestedLimit: 보수 예산 = min(최근최저, 고정수입합계) × 0.85

export type Stability = 'fixed' | 'semi' | 'lump';

export interface CategoryStat {
  category: string;
  stability: Stability;
  total: number;             // 연 총액
  activeMonths: number;      // 발생한 월 수
  avg: number;               // 활성월 평균 (발생한 달만)
  cv: number;                // 변동계수
  sparkline: number[];       // 12개 월별 값
  lastMonth: number;         // 가장 최근 수령 월 금액
}

export interface IncomeInsights {
  // 전체
  totalYearly: number;
  activeMonths: number;
  activeAvg: number;         // 활성월 평균
  median: number;            // 활성월 중앙값
  cv: number;                // 전체 월별 수입 변동계수
  latestMonthIncome: number; // 가장 최근 활성월의 수입

  // 원천별
  byCategory: CategoryStat[];

  // 고정 vs 변동
  fixedMonthlyEstimate: number;   // fixed 카테고리 activeAvg 합산
  semiMonthlyEstimate: number;
  lumpYearlyTotal: number;        // lump 카테고리 연 총액 (월할하지 않음)

  // 다음달 예측 (활성월 최근 6개 기준)
  forecast: {
    low: number;
    mid: number;
    high: number;
    basis: string;            // 설명: "최근 n개월 활성 기준"
  };

  // 추천 월 지출 한도
  suggestedSpendLimit: number;
  suggestedRationale: string;

  // 해석 문구 (UX용)
  stabilityLabel: '안정' | '변동' | '고변동';
  oneLineSummary: string;
}

// ============================================
// 유틸
// ============================================

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const variance = xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length;
  return Math.sqrt(variance);
}

function coefficientOfVariation(xs: number[]): number {
  const m = mean(xs);
  if (m === 0) return 0;
  return stdev(xs) / m;
}

function stabilityLabel(cv: number): '안정' | '변동' | '고변동' {
  if (cv < 0.3) return '안정';
  if (cv < 0.6) return '변동';
  return '고변동';
}

// ============================================
// 메인 계산 함수
// ============================================

export function computeIncomeInsights(
  monthlyStats: MonthlyStat[],
  mode: AppMode,
  opts: { isCurrentYear?: boolean; currentMonthIdx?: number } = {}
): IncomeInsights {
  const stabilityMap = INCOME_STABILITY[mode];
  const isCurrentYear = opts.isCurrentYear ?? false;
  const currentMonthIdx =
    opts.currentMonthIdx ?? (isCurrentYear ? new Date().getMonth() : 11);

  // 연 내 "이미 지난 달"까지만 집계 (미래 0은 평균 왜곡)
  const closedMonths = isCurrentYear
    ? monthlyStats.slice(0, currentMonthIdx + 1)
    : monthlyStats;

  // 전체
  const totalYearly = closedMonths.reduce((s, m) => s + m.income, 0);
  const activeValues = closedMonths.filter((m) => m.income > 0).map((m) => m.income);
  const activeMonths = activeValues.length;
  const activeAvg = activeMonths > 0 ? Math.round(mean(activeValues)) : 0;
  const medianVal = Math.round(median(activeValues));
  const cv = coefficientOfVariation(closedMonths.map((m) => m.income));

  // 가장 최근 수입이 있었던 달
  let latestMonthIncome = 0;
  for (let i = closedMonths.length - 1; i >= 0; i--) {
    if (closedMonths[i].income > 0) {
      latestMonthIncome = closedMonths[i].income;
      break;
    }
  }

  // 원천별 집계
  const categoryTotals: Record<string, number[]> = {}; // 12개월 배열
  monthlyStats.forEach((m, idx) => {
    m.incomeBreakdown.forEach((b) => {
      if (!categoryTotals[b.category]) {
        categoryTotals[b.category] = Array(12).fill(0);
      }
      categoryTotals[b.category][idx] += b.amount;
    });
  });

  const byCategory: CategoryStat[] = Object.entries(categoryTotals).map(
    ([category, sparkline]) => {
      const closedSpark = isCurrentYear
        ? sparkline.slice(0, currentMonthIdx + 1)
        : sparkline;
      const activeVals = closedSpark.filter((v) => v > 0);
      const total = closedSpark.reduce((s, v) => s + v, 0);
      const avg = activeVals.length > 0 ? Math.round(mean(activeVals)) : 0;
      const catCv = coefficientOfVariation(closedSpark);
      const stability = (stabilityMap[category] ?? 'semi') as Stability;
      let lastMonth = 0;
      for (let i = closedSpark.length - 1; i >= 0; i--) {
        if (closedSpark[i] > 0) {
          lastMonth = closedSpark[i];
          break;
        }
      }
      return {
        category,
        stability,
        total,
        activeMonths: activeVals.length,
        avg,
        cv: catCv,
        sparkline,
        lastMonth,
      };
    }
  );
  byCategory.sort((a, b) => b.total - a.total);

  // fixed/semi/lump 분해
  const fixedMonthlyEstimate = byCategory
    .filter((c) => c.stability === 'fixed')
    .reduce((s, c) => s + c.avg, 0);
  const semiMonthlyEstimate = byCategory
    .filter((c) => c.stability === 'semi')
    .reduce((s, c) => s + c.avg, 0);
  const lumpYearlyTotal = byCategory
    .filter((c) => c.stability === 'lump')
    .reduce((s, c) => s + c.total, 0);

  // 예측: 활성월 최근 6개
  const recentActive = activeValues.slice(-6);
  const forecastLow = recentActive.length > 0 ? Math.min(...recentActive) : 0;
  const forecastHigh = recentActive.length > 0 ? Math.max(...recentActive) : 0;
  const forecastMid =
    recentActive.length > 0 ? Math.round(median(recentActive)) : 0;

  // 추천 지출 한도
  // 보수적: 고정수입 평균과 최근 최저 수입 중 작은 값의 85%
  // fixed가 0이면 활성평균의 70%로 대체
  let suggestedSpendLimit: number;
  let suggestedRationale: string;
  if (fixedMonthlyEstimate > 0) {
    const base = Math.min(fixedMonthlyEstimate, forecastLow || fixedMonthlyEstimate);
    suggestedSpendLimit = Math.round(base * 0.85);
    suggestedRationale = `고정 수입 ${Math.round(fixedMonthlyEstimate / 10000)}만원 기준 85% · 목돈(장학금 등)은 버퍼로 분리`;
  } else if (activeAvg > 0) {
    suggestedSpendLimit = Math.round(activeAvg * 0.7);
    suggestedRationale = `고정 수입이 없어 활성월 평균의 70%로 보수적 추정`;
  } else {
    suggestedSpendLimit = 0;
    suggestedRationale = '수입 데이터가 부족해요. 2~3개월 더 쌓이면 추천해드릴게요';
  }

  const stabilityText = stabilityLabel(cv);
  const oneLineSummary =
    activeMonths === 0
      ? '올해 아직 수입 내역이 없어요'
      : `최근 ${activeMonths}개월 평균 ${Math.round(activeAvg / 10000)}만원 · ${stabilityText} (다음달 예상 ${Math.round(forecastLow / 10000)}~${Math.round(forecastHigh / 10000)}만원)`;

  return {
    totalYearly,
    activeMonths,
    activeAvg,
    median: medianVal,
    cv,
    latestMonthIncome,
    byCategory,
    fixedMonthlyEstimate,
    semiMonthlyEstimate,
    lumpYearlyTotal,
    forecast: {
      low: forecastLow,
      mid: forecastMid,
      high: forecastHigh,
      basis: `최근 ${recentActive.length}개 활성월 기준`,
    },
    suggestedSpendLimit,
    suggestedRationale,
    stabilityLabel: stabilityText,
    oneLineSummary,
  };
}
