'use client';

import { TrendingUp, Lightbulb } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { IncomeInsights } from '@/lib/incomeStats';
import { cn } from '@/lib/utils';

interface IncomeInsightWidgetProps {
  insights: IncomeInsights;
}

// "이번 달 얼마까지 써도 돼?"에 3초 만에 답하는 대시보드 최상단 카드.
// 대학원생처럼 수입이 불규칙한 사용자를 위해 설계됨.
export function IncomeInsightWidget({ insights }: IncomeInsightWidgetProps) {
  const {
    activeMonths,
    activeAvg,
    latestMonthIncome,
    stabilityLabel,
    forecast,
    suggestedSpendLimit,
    suggestedRationale,
    fixedMonthlyEstimate,
    lumpYearlyTotal,
    oneLineSummary,
  } = insights;

  if (activeMonths === 0) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/30 dark:to-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">수입 분석</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
          아직 수입 내역이 없어요. 거래 2~3개월치를 쌓으면 월평균·예측을 알려드릴게요.
        </p>
      </div>
    );
  }

  // 이번달 vs 활성평균 비교
  const diffVsAvg = latestMonthIncome - activeAvg;
  const diffPercent = activeAvg > 0 ? (diffVsAvg / activeAvg) * 100 : 0;
  const diffLabel =
    latestMonthIncome === 0
      ? '이번달 아직 수입 없음'
      : diffVsAvg >= 0
        ? `평균 대비 +${diffPercent.toFixed(0)}%`
        : `평균 대비 ${diffPercent.toFixed(0)}%`;

  const stabilityColor: Record<string, string> = {
    '안정': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    '변동': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    '고변동': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-white dark:from-indigo-900/40 dark:via-slate-800 dark:to-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">수입 분석</h3>
        </div>
        <span
          className={cn(
            'text-[10px] font-medium px-2 py-0.5 rounded-full',
            stabilityColor[stabilityLabel]
          )}
        >
          {stabilityLabel}
        </span>
      </div>

      {/* Hero: 이번달 / 활성평균 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">이번 달 수입</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            {formatKRW(latestMonthIncome)}
          </p>
          <p
            className={cn(
              'text-[10px] font-medium',
              latestMonthIncome === 0
                ? 'text-slate-400'
                : diffVsAvg >= 0
                  ? 'text-emerald-500'
                  : 'text-red-500'
            )}
          >
            {diffLabel}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">활성월 평균</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            {formatKRW(activeAvg)}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            최근 {activeMonths}개월 기준
          </p>
        </div>
      </div>

      {/* 다음달 예측 범위 */}
      <div className="mb-3 p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">다음달 예상 범위</p>
        <ForecastBar low={forecast.low} mid={forecast.mid} high={forecast.high} />
        <div className="flex justify-between mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
          <span>낮 {formatKRW(forecast.low)}</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">보통 {formatKRW(forecast.mid)}</span>
          <span>높 {formatKRW(forecast.high)}</span>
        </div>
      </div>

      {/* 추천 지출 한도 */}
      {suggestedSpendLimit > 0 && (
        <div className="flex gap-2 p-3 rounded-lg bg-indigo-100/60 dark:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800/50">
          <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-300 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mb-0.5">
              이번 달 추천 지출 한도
            </p>
            <p className="text-base font-bold text-indigo-800 dark:text-indigo-200 tabular-nums">
              {formatKRW(suggestedSpendLimit)}
            </p>
            <p className="text-[10px] text-indigo-600/70 dark:text-indigo-300/70 mt-0.5 leading-snug">
              {suggestedRationale}
            </p>
          </div>
        </div>
      )}

      {/* 고정 + 목돈 요약 */}
      {(fixedMonthlyEstimate > 0 || lumpYearlyTotal > 0) && (
        <div className="flex gap-2 mt-2 text-[10px]">
          {fixedMonthlyEstimate > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
              고정 월 {formatKRW(fixedMonthlyEstimate)}
            </span>
          )}
          {lumpYearlyTotal > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              목돈 연 {formatKRW(lumpYearlyTotal)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// 예측 범위 바
function ForecastBar({ low, mid, high }: { low: number; mid: number; high: number }) {
  if (high === 0) {
    return <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700" />;
  }
  const range = high - low || 1;
  const midPos = ((mid - low) / range) * 100;

  return (
    <div className="relative h-2 rounded-full bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 dark:from-indigo-900/60 dark:via-indigo-500 dark:to-indigo-900/60">
      <div
        className="absolute top-1/2 -translate-y-1/2 w-2 h-4 rounded-full bg-indigo-700 dark:bg-indigo-200 shadow"
        style={{ left: `calc(${midPos}% - 4px)` }}
      />
    </div>
  );
}
