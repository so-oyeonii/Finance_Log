'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { formatKRW, formatPercent } from '@/lib/format';
import type { Account } from '@/types';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const isCreditCard = account.type === '신용카드';
  const showReturnRate = account.type === 'IRP/연금' || account.type === '주식예수금';
  const returnRate = showReturnRate && account.principal > 0
    ? ((account.balance - account.principal) / account.principal) * 100
    : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow animate-slide-up">
      <div className="flex items-start justify-between">
        {/* Account Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
              {account.type}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{account.name}</p>
          <p className={cn(
            'text-lg font-bold mt-1',
            isCreditCard ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'
          )}>
            {isCreditCard && account.balance > 0 ? '-' : ''}
            {formatKRW(Math.abs(account.balance))}
          </p>

          {/* Return rate for IRP / Stock deposit */}
          {showReturnRate && account.principal > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 dark:text-slate-500">원금 {formatKRW(account.principal)}</span>
              <span className={cn(
                'text-xs font-medium',
                returnRate >= 0 ? 'text-emerald-500' : 'text-red-500'
              )}>
                {formatPercent(returnRate)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => onEdit(account)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="수정"
          >
            <Pencil className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </button>
          <button
            onClick={() => onDelete(account)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="삭제"
          >
            <Trash2 className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
