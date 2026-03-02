'use client';

import { Pencil, Trash2, ArrowRightLeft } from 'lucide-react';
import { formatKRW, formatDate } from '@/lib/format';
import type { Transaction, Account } from '@/types';
import { cn } from '@/lib/utils';

interface TransactionCardProps {
  transaction: Transaction;
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionCard({ transaction, accounts, onEdit, onDelete }: TransactionCardProps) {
  const { type, category, amount, memo, date, accountId, toAccountId } = transaction;

  const account = accounts.find((a) => a.id === accountId);
  const toAccount = toAccountId ? accounts.find((a) => a.id === toAccountId) : null;

  const typeLabel = type === 'income' ? '수입' : type === 'expense' ? '지출' : '이체';
  const typeColor = type === 'income'
    ? 'bg-blue-100 text-blue-600'
    : type === 'expense'
      ? 'bg-red-100 text-red-600'
      : 'bg-amber-100 text-amber-600';

  const amountColor = type === 'income' ? 'text-blue-600' : type === 'expense' ? 'text-red-500' : 'text-amber-600';
  const amountPrefix = type === 'income' ? '+' : type === 'expense' ? '-' : '';

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', typeColor)}>
              {typeLabel}
            </span>
            <span className="text-xs text-slate-400">{formatDate(date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-700">{category}</p>
            {memo && <p className="text-xs text-slate-400 truncate">· {memo}</p>}
          </div>

          <div className="flex items-center gap-1 mt-1">
            <p className={cn('text-lg font-bold', amountColor)}>
              {amountPrefix}{formatKRW(amount)}
            </p>
          </div>

          {/* Account info */}
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
            <span>{account?.name || '삭제된 계좌'}</span>
            {type === 'transfer' && toAccount && (
              <>
                <ArrowRightLeft className="w-3 h-3" />
                <span>{toAccount.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="수정"
          >
            <Pencil className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => onDelete(transaction)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            title="삭제"
          >
            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
