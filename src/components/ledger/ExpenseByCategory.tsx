'use client';

import { PieChart } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { AppMode } from '@/types';

interface ExpenseByCategoryProps {
  data: { name: string; value: number }[];
  mode: AppMode;
}

const COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-yellow-400',
  'bg-lime-400', 'bg-emerald-400', 'bg-teal-400', 'bg-cyan-400', 'bg-slate-400',
];

export function ExpenseByCategory({ data, mode }: ExpenseByCategoryProps) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">카테고리별 지출</h3>
      </div>

      {/* Horizontal Bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4">
        {data.map((d, i) => (
          <div
            key={d.name}
            className={`${COLORS[i % COLORS.length]} transition-all duration-300`}
            style={{ width: `${(d.value / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {data.map((d, i) => {
          const percent = ((d.value / total) * 100).toFixed(1);
          return (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${COLORS[i % COLORS.length]}`} />
                <span className="text-sm text-slate-600 dark:text-slate-300">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 dark:text-slate-500">{percent}%</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{formatKRW(d.value)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
