'use client';

import { useState, useMemo } from 'react';
import { Filter, ArrowRightLeft, Plus, Wallet } from 'lucide-react';
import { TransactionCard } from './TransactionCard';
import type { Transaction, TransactionType, Account } from '@/types';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onAdd: () => void;
  onAddAccount: () => void;
}

type FilterType = 'all' | TransactionType;

export function TransactionList({ transactions, accounts, onEdit, onDelete, onAdd, onAddAccount }: TransactionListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach((t) => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'income', label: '수입' },
    { key: 'expense', label: '지출' },
    { key: 'transfer', label: '이체' },
  ];

  return (
    <div className="animate-slide-up">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full transition-colors',
              filter === f.key
                ? 'bg-slate-700 dark:bg-slate-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction List by Date */}
      {grouped.length > 0 ? (
        <div className="space-y-4">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2 px-1">{date}</p>
              <div className="space-y-2">
                {txs.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    accounts={accounts}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 text-center">
          <ArrowRightLeft className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">아직 거래 내역이 없습니다</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">계좌 하나와 첫 거래만 있으면 월별 흐름이 보이기 시작합니다</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <Plus className="h-3.5 w-3.5" />
              첫 거래 기록
            </button>
            <button
              type="button"
              onClick={onAddAccount}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <Wallet className="h-3.5 w-3.5" />
              계좌 먼저 추가
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
