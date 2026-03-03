'use client';

import { Flame } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { AppMode } from '@/types';

const BAR_COLORS = ['bg-red-400', 'bg-orange-400', 'bg-amber-400'];

interface ExpenseTop3WidgetProps {
  data: { name: string; value: number }[];
  mode: AppMode;
}

export function ExpenseTop3Widget({ data, mode }: ExpenseTop3WidgetProps) {
  const top3 = data.slice(0, 3);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const maxValue = top3.length > 0 ? top3[0].value : 1;

  if (top3.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">지출 Top 3</h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">지출 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-red-500" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">지출 Top 3</h3>
      </div>

      <div className="space-y-3">
        {top3.map((item, idx) => {
          const width = (item.value / maxValue) * 100;
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';

          return (
            <div key={item.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500">{pct}%</span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{formatKRW(item.value)}</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${BAR_COLORS[idx]} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(width, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
