'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { HoldingCard } from './HoldingCard';
import type { Holding } from '@/types';

type SortKey = 'valuation' | 'returnRate' | 'ticker';

interface HoldingsListProps {
  holdings: Holding[];
  onPriceUpdate: (holding: Holding) => void;
}

export function HoldingsList({ holdings, onPriceUpdate }: HoldingsListProps) {
  const [sortBy, setSortBy] = useState<SortKey>('valuation');

  const sorted = [...holdings].sort((a, b) => {
    if (sortBy === 'valuation') return b.valuation - a.valuation;
    if (sortBy === 'returnRate') return b.returnRate - a.returnRate;
    return a.ticker.localeCompare(b.ticker);
  });

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'valuation', label: '평가액순' },
    { key: 'returnRate', label: '수익률순' },
    { key: 'ticker', label: '이름순' },
  ];

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 dark:text-slate-500">
        <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">보유 종목이 없습니다</p>
        <p className="text-xs mt-1">거래를 추가해보세요</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex gap-1 mb-3">
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
              sortBy === opt.key
                ? 'bg-slate-700 dark:bg-slate-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {sorted.map((h) => (
          <HoldingCard
            key={`${h.accountId}_${h.market}_${h.ticker}`}
            holding={h}
            onPriceUpdate={onPriceUpdate}
          />
        ))}
      </div>
    </div>
  );
}
