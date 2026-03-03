'use client';

import { useState, useMemo } from 'react';
import { Trash2, Package } from 'lucide-react';
import { formatKRW, formatDate, formatNumber } from '@/lib/format';
import type { Stock, Account, StockTradeType } from '@/types';
import { cn } from '@/lib/utils';

type FilterType = 'all' | StockTradeType;

const TYPE_BADGES: Record<StockTradeType, { label: string; color: string }> = {
  buy: { label: '매수', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  sell: { label: '매도', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  dividend: { label: '배당', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
};

interface StockTransactionListProps {
  stocks: Stock[];
  accounts: Account[];
  onDelete: (stock: Stock) => void;
}

export function StockTransactionList({ stocks, accounts, onDelete }: StockTransactionListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    const list = filter === 'all' ? stocks : stocks.filter((s) => s.type === filter);
    return [...list].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [stocks, filter]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Stock[]>();
    filtered.forEach((s) => {
      const existing = map.get(s.date) || [];
      existing.push(s);
      map.set(s.date, existing);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const getAccountName = (id: number) => {
    const acc = accounts.find((a) => a.id === id);
    return acc ? `${acc.bank} - ${acc.name}` : '삭제된 계좌';
  };

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'buy', label: '매수' },
    { key: 'sell', label: '매도' },
    { key: 'dividend', label: '배당' },
  ];

  if (stocks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 dark:text-slate-500">
        <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">거래 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-1 mb-4">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={cn(
              'text-[10px] px-2.5 py-1 rounded-full transition-colors',
              filter === opt.key
                ? 'bg-slate-700 dark:bg-slate-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grouped List */}
      <div className="space-y-4">
        {grouped.map(([date, items]) => (
          <div key={date}>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mb-2">{formatDate(date)}</p>
            <div className="space-y-2">
              {items.map((s) => {
                const badge = TYPE_BADGES[s.type];
                const amount = s.type === 'dividend' ? s.price : s.price * s.quantity;

                return (
                  <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0', badge.color)}>
                        {badge.label}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {s.ticker}
                          {s.type !== 'dividend' && (
                            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">x{formatNumber(s.quantity)}</span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {getAccountName(s.accountId)}
                          {s.memo && ` · ${s.memo}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn(
                        'text-sm font-bold',
                        s.type === 'buy' ? 'text-blue-600' : s.type === 'sell' ? 'text-red-500' : 'text-amber-600'
                      )}>
                        {s.type === 'buy' ? '-' : '+'}{formatKRW(amount)}
                      </span>
                      <button
                        onClick={() => onDelete(s)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
