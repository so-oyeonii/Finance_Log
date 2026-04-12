'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { MonthlyStat } from '@/types';
import type { IncomeInsights } from '@/lib/incomeStats';

interface IncomeChartWidgetProps {
  monthlyStats: MonthlyStat[];
  incomeInsights?: IncomeInsights;
}

// 카테고리별 색상 팔레트 (색맹 고려 hue 분산)
const CATEGORY_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
];

// 수입 원천별 스택 막대 + 활성평균 기준선.
// "어떤 돈으로 얼마를 받았는지"를 한 화면에서 보여준다.
export function IncomeChartWidget({ monthlyStats, incomeInsights }: IncomeChartWidgetProps) {
  // 모든 등장한 카테고리 수집 (총액 기준 정렬)
  const categories = useMemo(() => {
    const totals: Record<string, number> = {};
    monthlyStats.forEach((m) => {
      m.incomeBreakdown.forEach((b) => {
        totals[b.category] = (totals[b.category] || 0) + b.amount;
      });
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [monthlyStats]);

  // 월별 레코드: { name, [cat1]: amount, [cat2]: amount, ... }
  const chartData = useMemo(() => {
    return monthlyStats.map((m) => {
      const row: Record<string, any> = { name: m.label };
      categories.forEach((c) => {
        row[c] = 0;
      });
      m.incomeBreakdown.forEach((b) => {
        row[b.category] = b.amount;
      });
      return row;
    });
  }, [monthlyStats, categories]);

  const hasData = categories.length > 0;
  const avgLine = incomeInsights?.activeAvg ?? 0;

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">월별 수입 (원천별)</h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
          수입 내역이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">월별 수입 (원천별)</h3>
        </div>
        {avgLine > 0 && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            평균선: {formatKRW(avgLine)}
          </span>
        )}
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v === 0 ? '0' : `${(v / 10000).toFixed(0)}만`)}
            />
            <Tooltip
              formatter={(value: number) => formatKRW(value)}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
            {avgLine > 0 && (
              <ReferenceLine
                y={avgLine}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}
            {categories.map((c, idx) => (
              <Bar
                key={c}
                dataKey={c}
                stackId="income"
                fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                radius={idx === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                maxBarSize={28}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
