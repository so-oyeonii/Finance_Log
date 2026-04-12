'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Coins, Calendar } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { DividendStat, Stock } from '@/types';

interface DividendChartWidgetProps {
  dividendStats: {
    monthlyData: DividendStat[];
    totalYearlyDiv: number;
    avgMonthlyDiv: number;
  };
  selectedYear?: string;
  allStocks?: Stock[];
}

// 배당 캘린더: 이미 받은 달(실수령)과 아직 안 온 달(예상)을 함께 보여준다.
// 예상 = 같은 해에 이미 받은 배당의 월평균 (간단 추정, 정확한 예측은 아님)
export function DividendChartWidget({ dividendStats, selectedYear, allStocks }: DividendChartWidgetProps) {
  const { monthlyData, totalYearlyDiv } = dividendStats;

  const now = new Date();
  const currentYear = String(now.getFullYear());
  const currentMonth = now.getMonth(); // 0-indexed

  // 선택년이 올해와 같을 때만 미래달에 예상을 표시
  const isCurrentYear = (selectedYear ?? currentYear) === currentYear;

  const { chartData, realizedTotal, projectedTotal } = useMemo(() => {
    const realizedMonths = monthlyData.filter((m) => m.totalDividend > 0);
    const realizedSum = realizedMonths.reduce((s, m) => s + m.totalDividend, 0);
    // 이미 받은 월들의 평균을 향후 예상으로 사용
    const avg = realizedMonths.length > 0 ? realizedSum / realizedMonths.length : 0;

    let projected = 0;
    const data = monthlyData.map((m, idx) => {
      const isFuture = isCurrentYear && idx > currentMonth;
      const expected = isFuture && avg > 0 ? Math.round(avg) : 0;
      if (expected > 0) projected += expected;
      return {
        name: m.label,
        realized: m.totalDividend,
        expected,
      };
    });

    return { chartData: data, realizedTotal: realizedSum, projectedTotal: projected };
  }, [monthlyData, isCurrentYear, currentMonth]);

  const annualProjection = realizedTotal + projectedTotal;
  const hasData = totalYearlyDiv > 0;

  // 이번달 예정 배당 추정: 작년 같은 달에 배당을 준 종목 리스트
  const upcomingThisMonth = useMemo(() => {
    if (!allStocks || !isCurrentYear) return [];
    const lastYear = String(now.getFullYear() - 1);
    const thisMonthStr = String(currentMonth + 1).padStart(2, '0');
    const lastYearSameMonth = allStocks.filter(
      (s) =>
        s.type === 'dividend' &&
        s.date.startsWith(`${lastYear}-${thisMonthStr}`)
    );
    // 종목별로 집계
    const map: Record<string, number> = {};
    lastYearSameMonth.forEach((s) => {
      map[s.ticker] = (map[s.ticker] || 0) + s.price;
    });
    // 이미 이번달에 받은 건 제외
    const thisYearThisMonth = allStocks.filter(
      (s) =>
        s.type === 'dividend' &&
        s.date.startsWith(`${now.getFullYear()}-${thisMonthStr}`)
    );
    thisYearThisMonth.forEach((s) => {
      delete map[s.ticker];
    });
    return Object.entries(map)
      .map(([ticker, amount]) => ({ ticker, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [allStocks, isCurrentYear, currentMonth, now]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Coins className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">배당 캘린더</h3>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">실수령</p>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
            {formatKRW(realizedTotal)}
          </p>
        </div>
        <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-lg p-2 text-center border border-dashed border-amber-200 dark:border-amber-800">
          <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">예상 추가</p>
          <p className="text-xs font-bold text-amber-700/80 dark:text-amber-300/80">
            {formatKRW(projectedTotal)}
          </p>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/40 rounded-lg p-2 text-center">
          <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">연 전망</p>
          <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
            {formatKRW(annualProjection)}
          </p>
        </div>
      </div>

      {hasData ? (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v === 0 ? '0' : `${(v / 10000).toFixed(0)}만`)}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatKRW(value),
                  name === 'realized' ? '실수령' : '예상',
                ]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
                formatter={(v) => (v === 'realized' ? '실수령' : '예상')}
              />
              <Bar dataKey="realized" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expected" stackId="a" fill="#fcd34d" fillOpacity={0.55} radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
          배당 내역이 없습니다
        </p>
      )}

      {/* 이번달 예정 배당 (작년 같은 달 기준 추정) */}
      {upcomingThisMonth.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              이번달 예정 배당 (작년 기준)
            </p>
          </div>
          <div className="space-y-1">
            {upcomingThisMonth.map((u) => (
              <div
                key={u.ticker}
                className="flex justify-between text-[11px]"
              >
                <span className="text-slate-600 dark:text-slate-300">{u.ticker}</span>
                <span className="text-amber-600 dark:text-amber-300 font-medium tabular-nums">
                  ~{formatKRW(u.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
