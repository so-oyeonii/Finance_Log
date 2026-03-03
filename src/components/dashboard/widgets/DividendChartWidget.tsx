'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Coins } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { DividendStat } from '@/types';

interface DividendChartWidgetProps {
  dividendStats: {
    monthlyData: DividendStat[];
    totalYearlyDiv: number;
    avgMonthlyDiv: number;
  };
}

export function DividendChartWidget({ dividendStats }: DividendChartWidgetProps) {
  const { monthlyData, totalYearlyDiv, avgMonthlyDiv } = dividendStats;

  const chartData = useMemo(
    () => monthlyData.map((m) => ({ name: m.label, value: m.totalDividend })),
    [monthlyData]
  );

  const hasData = totalYearlyDiv > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Coins className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-bold text-slate-700">배당금</h3>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-amber-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-amber-600/70">연간 배당</p>
          <p className="text-xs font-bold text-amber-700">{formatKRW(totalYearlyDiv)}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-amber-600/70">월 평균</p>
          <p className="text-xs font-bold text-amber-700">{formatKRW(avgMonthlyDiv)}</p>
        </div>
      </div>

      {hasData ? (
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => v === 0 ? '0' : `${(v / 10000).toFixed(0)}만`} />
              <Tooltip
                formatter={(value: number) => [formatKRW(value), '배당금']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-4">배당 내역이 없습니다</p>
      )}
    </div>
  );
}
