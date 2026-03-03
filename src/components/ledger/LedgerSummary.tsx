'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { AppMode } from '@/types';

interface LedgerSummaryProps {
  income: number;
  expense: number;
  balance: number;
  mode: AppMode;
}

export function LedgerSummary({ income, expense, balance, mode }: LedgerSummaryProps) {
  const isGraduate = mode === 'graduate';
  const accentColor = isGraduate ? 'text-indigo-600' : 'text-emerald-600';

  return (
    <div className="grid grid-cols-3 gap-3 animate-fade-in">
      {/* Income */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-slate-400 dark:text-slate-500">수입</span>
        </div>
        <p className="text-sm font-bold text-blue-600">{formatKRW(income)}</p>
      </div>

      {/* Expense */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <TrendingDown className="w-4 h-4 text-red-500" />
          <span className="text-xs text-slate-400 dark:text-slate-500">지출</span>
        </div>
        <p className="text-sm font-bold text-red-500">{formatKRW(expense)}</p>
      </div>

      {/* Balance */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Minus className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-xs text-slate-400 dark:text-slate-500">잔액</span>
        </div>
        <p className={`text-sm font-bold ${balance >= 0 ? accentColor : 'text-red-500'}`}>
          {formatKRW(balance)}
        </p>
      </div>
    </div>
  );
}
