'use client';

import { useMemo } from 'react';
import { Coins, BarChart3 } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { AppMode, DividendStat } from '@/types';

interface DividendSectionProps {
  dividendStats: {
    monthlyData: DividendStat[];
    totalYearlyDiv: number;
    avgMonthlyDiv: number;
  };
  mode: AppMode;
}

export function DividendSection({ dividendStats, mode }: DividendSectionProps) {
  const { monthlyData, totalYearlyDiv, avgMonthlyDiv } = dividendStats;

  const maxDiv = useMemo(
    () => Math.max(...monthlyData.map((m) => m.totalDividend), 1),
    [monthlyData]
  );

  const activeMonths = monthlyData.filter((m) => m.totalDividend > 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-400">연간 배당금</span>
          </div>
          <p className="text-sm font-bold text-amber-600">{formatKRW(totalYearlyDiv)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-400">월 평균</span>
          </div>
          <p className="text-sm font-bold text-amber-600">{formatKRW(avgMonthlyDiv)}</p>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      {activeMonths.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-700">월별 배당금</h3>
          </div>

          <div className="space-y-2">
            {monthlyData.map((stat) => {
              if (stat.totalDividend === 0) return null;
              const width = (stat.totalDividend / maxDiv) * 100;

              return (
                <div key={stat.month} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-8 text-right shrink-0">{stat.label}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <div
                        className="h-4 bg-amber-400 rounded-sm transition-all duration-300"
                        style={{ width: `${Math.max(width, 2)}%` }}
                      />
                      <span className="text-xs text-slate-400 shrink-0">{formatKRW(stat.totalDividend)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      {activeMonths.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 animate-slide-up">
          <h3 className="text-sm font-bold text-slate-700 mb-3">종목별 배당 내역</h3>
          <div className="space-y-3">
            {activeMonths.map((stat) => (
              <div key={stat.month}>
                <p className="text-xs text-slate-400 font-medium mb-1">{stat.label}</p>
                <div className="space-y-1">
                  {stat.breakdown.map((b) => (
                    <div key={b.ticker} className="flex items-center justify-between text-xs pl-2">
                      <span className="text-slate-600">{b.ticker}</span>
                      <span className="text-amber-600 font-medium">{formatKRW(b.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeMonths.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Coins className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">배당 내역이 없습니다</p>
          <p className="text-xs mt-1">배당 거래를 추가해보세요</p>
        </div>
      )}
    </div>
  );
}
