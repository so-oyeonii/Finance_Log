'use client';

import { AlertTriangle, Target, CheckCircle2 } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { MonthlyStat } from '@/types';
import type { IncomeInsights } from '@/lib/incomeStats';

interface SpendLimitWidgetProps {
  monthlyStats: MonthlyStat[];
  insights: IncomeInsights;
}

// 이번달 지출 vs 추천 한도 비교.
// 추천 한도는 incomeStats.suggestedSpendLimit 사용.
// 80% 이상 → 노랑 주의, 100% 이상 → 빨강 경고.
export function SpendLimitWidget({ monthlyStats, insights }: SpendLimitWidgetProps) {
  const currentMonthIdx = new Date().getMonth();
  const thisMonth = monthlyStats[currentMonthIdx];
  const spent = thisMonth?.totalExpense ?? 0;
  const limit = insights.suggestedSpendLimit;

  if (limit === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">이번달 예산</h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 py-2">
          {insights.suggestedRationale}
        </p>
      </div>
    );
  }

  const ratio = (spent / limit) * 100;
  const remaining = Math.max(0, limit - spent);
  const over = spent > limit;
  const warning = !over && ratio >= 80;
  const safe = !over && !warning;

  // 이번달 경과 일수 기준 페이스 계산
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dayOfMonth = today.getDate();
  const expectedRatio = (dayOfMonth / daysInMonth) * 100;
  const paceVsExpected = ratio - expectedRatio;

  return (
    <div
      className={cn(
        'rounded-xl shadow-sm p-4 animate-fade-in border',
        over
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : warning
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            : 'bg-white dark:bg-slate-800 border-transparent'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {over ? (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          ) : warning ? (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">이번달 예산</h3>
        </div>
        <span
          className={cn(
            'text-[10px] font-medium px-2 py-0.5 rounded-full',
            over
              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
              : warning
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
          )}
        >
          {over ? '초과' : warning ? '주의' : '안전'}
        </span>
      </div>

      {/* 지출/한도 */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">지금까지 썼어요</p>
          <p
            className={cn(
              'text-xl font-bold tabular-nums',
              over ? 'text-red-600 dark:text-red-300' : 'text-slate-800 dark:text-slate-100'
            )}
          >
            {formatKRW(spent)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">추천 한도</p>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
            {formatKRW(limit)}
          </p>
        </div>
      </div>

      {/* Progress bar with expected-pace marker */}
      <div className="relative h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-2">
        <div
          className={cn(
            'absolute left-0 top-0 h-full transition-all',
            over ? 'bg-red-500' : warning ? 'bg-amber-500' : 'bg-emerald-500'
          )}
          style={{ width: `${Math.min(ratio, 100)}%` }}
        />
        {/* 예상 페이스 마커 */}
        <div
          className="absolute top-0 h-full w-0.5 bg-slate-800 dark:bg-white"
          style={{ left: `${Math.min(expectedRatio, 100)}%` }}
          title={`이 시점 기대 페이스 ${expectedRatio.toFixed(0)}%`}
        />
      </div>

      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
        <span>{ratio.toFixed(0)}% 소진</span>
        <span>
          {over
            ? `₩${formatKRW(spent - limit)} 초과`
            : `${formatKRW(remaining)} 남음`}
        </span>
      </div>

      {/* 페이스 해석 */}
      <p
        className={cn(
          'text-[11px] mt-2 leading-snug',
          paceVsExpected > 10
            ? 'text-red-600 dark:text-red-300'
            : paceVsExpected < -10
              ? 'text-emerald-600 dark:text-emerald-300'
              : 'text-slate-500 dark:text-slate-400'
        )}
      >
        {paceVsExpected > 10
          ? `평소보다 빠른 속도예요 (예상 대비 +${paceVsExpected.toFixed(0)}%p). 속도 조절하세요.`
          : paceVsExpected < -10
            ? `여유롭게 쓰고 있어요 (예상 대비 ${paceVsExpected.toFixed(0)}%p)`
            : `예상 페이스와 비슷해요 (${dayOfMonth}/${daysInMonth}일 경과)`}
      </p>
    </div>
  );
}
