'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { MonthlyStat } from '@/types';

interface ExpenseChartWidgetProps {
  monthlyStats: MonthlyStat[];
}

export function ExpenseChartWidget({ monthlyStats }: ExpenseChartWidgetProps) {
  const chartData = useMemo(
    () => monthlyStats.map((s) => ({ name: s.label, value: s.totalExpense })),
    [monthlyStats]
  );

  const hasData = chartData.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">월별 지출</h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">지출 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown className="w-4 h-4 text-red-500" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">월별 지출</h3>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => v === 0 ? '0' : `${(v / 10000).toFixed(0)}만`} />
            <Tooltip
              formatter={(value: number) => [formatKRW(value), '지출']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="value" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
