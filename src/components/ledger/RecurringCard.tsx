'use client';

import { Pause, Play, Trash2 } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { RecurringTransaction } from '@/types';
import { cn } from '@/lib/utils';

interface RecurringCardProps {
  recurring: RecurringTransaction;
  onToggle: (id: number) => void;
  onDelete: (recurring: RecurringTransaction) => void;
}

const FREQ_LABEL: Record<string, string> = {
  monthly: '매월',
  weekly: '매주',
  yearly: '매년',
};

export function RecurringCard({ recurring, onToggle, onDelete }: RecurringCardProps) {
  const { type, category, amount, frequency, nextDate, memo, isActive } = recurring;

  const typeLabel = type === 'income' ? '수입' : type === 'expense' ? '지출' : '이체';
  const typeColor = type === 'income'
    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    : type === 'expense'
      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';

  const amountColor = type === 'income' ? 'text-blue-600' : type === 'expense' ? 'text-red-500' : 'text-amber-600';

  return (
    <div className={cn(
      'bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 transition-opacity',
      !isActive && 'opacity-50'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0', typeColor)}>
            {typeLabel}
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{category}</span>
          {memo && <span className="text-xs text-slate-400 dark:text-slate-500 truncate">· {memo}</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <span className={cn('text-sm font-bold', amountColor)}>{formatKRW(amount)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
          <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{FREQ_LABEL[frequency]}</span>
          <span>다음: {nextDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(recurring.id!)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={isActive ? '일시정지' : '재개'}
          >
            {isActive
              ? <Pause className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              : <Play className="w-3.5 h-3.5 text-emerald-500" />}
          </button>
          <button
            onClick={() => onDelete(recurring)}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="삭제"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
