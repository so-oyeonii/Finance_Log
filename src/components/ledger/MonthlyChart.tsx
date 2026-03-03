'use client';

import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { MonthlyStat, AppMode } from '@/types';
import { cn } from '@/lib/utils';

interface MonthlyChartProps {
  monthlyStats: MonthlyStat[];
  mode: AppMode;
}

export function MonthlyChart({ monthlyStats, mode }: MonthlyChartProps) {
  const isGraduate = mode === 'graduate';

  const maxValue = useMemo(() => {
    return Math.max(
      ...monthlyStats.map((s) => Math.max(s.income, s.totalExpense)),
      1
    );
  }, [monthlyStats]);

  const activeMonths = monthlyStats.filter((s) => s.income > 0 || s.totalExpense > 0);

  if (activeMonths.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">월별 수입/지출</h3>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-400" />
          <span className="text-slate-500 dark:text-slate-400">수입</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red-400" />
          <span className="text-slate-500 dark:text-slate-400">지출</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-2">
        {monthlyStats.map((stat) => {
          if (stat.income === 0 && stat.totalExpense === 0) return null;
          const incomeWidth = (stat.income / maxValue) * 100;
          const expenseWidth = (stat.totalExpense / maxValue) * 100;

          return (
            <div key={stat.month} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500 w-8 text-right shrink-0">{stat.label}</span>
              <div className="flex-1 space-y-1">
                {stat.income > 0 && (
                  <div className="flex items-center gap-1">
                    <div
                      className="h-4 bg-blue-400 rounded-sm transition-all duration-300"
                      style={{ width: `${Math.max(incomeWidth, 2)}%` }}
                    />
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{formatKRW(stat.income)}</span>
                  </div>
                )}
                {stat.totalExpense > 0 && (
                  <div className="flex items-center gap-1">
                    <div
                      className="h-4 bg-red-400 rounded-sm transition-all duration-300"
                      style={{ width: `${Math.max(expenseWidth, 2)}%` }}
                    />
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{formatKRW(stat.totalExpense)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
