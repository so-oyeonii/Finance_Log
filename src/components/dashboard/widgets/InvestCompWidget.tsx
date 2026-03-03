'use client';

import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { formatKRW, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Holding } from '@/types';

interface InvestCompWidgetProps {
  holdings: Holding[];
}

export function InvestCompWidget({ holdings }: InvestCompWidgetProps) {
  const top5 = useMemo(
    () => [...holdings].sort((a, b) => b.valuation - a.valuation).slice(0, 5),
    [holdings]
  );

  if (top5.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">보유 종목 Top 5</h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">보유 종목이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-purple-500" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">보유 종목 Top 5</h3>
      </div>

      <div className="space-y-2">
        {top5.map((h, idx) => (
          <div key={`${h.market}_${h.ticker}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500 w-4 text-right">{idx + 1}</span>
              <div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{h.ticker}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{h.market}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{formatKRW(h.valuation)}</p>
              <p className={cn(
                'text-[10px] font-medium',
                h.returnRate >= 0 ? 'text-red-500' : 'text-blue-500'
              )}>
                {formatPercent(h.returnRate)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
