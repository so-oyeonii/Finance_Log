'use client';

import { useState, useMemo } from 'react';
import { Filter, ArrowRightLeft } from 'lucide-react';
import { TransactionCard } from './TransactionCard';
import type { Transaction, TransactionType, Account } from '@/types';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

type FilterType = 'all' | TransactionType;

export function TransactionList({ transactions, accounts, onEdit, onDelete }: TransactionListProps) {
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
          <p className="text-sm text-slate-400 dark:text-slate-500">거래 내역이 없습니다</p>
          <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">위의 추가 버튼을 눌러 거래를 기록해보세요</p>
        </div>
      )}
    </div>
  );
}
