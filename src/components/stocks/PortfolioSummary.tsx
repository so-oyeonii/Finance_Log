'use client';

import { TrendingUp, TrendingDown, Coins, BarChart3 } from 'lucide-react';
import { formatKRW, formatPercent } from '@/lib/format';
import type { AppMode, PortfolioSummary as PortfolioSummaryType } from '@/types';
import { cn } from '@/lib/utils';

interface PortfolioSummaryProps {
  portfolio: PortfolioSummaryType;
  mode: AppMode;
}

export function PortfolioSummary({ portfolio, mode }: PortfolioSummaryProps) {
  const isGraduate = mode === 'graduate';
  const gradientClass = isGraduate
    ? 'from-indigo-500 to-indigo-700'
    : 'from-emerald-500 to-emerald-700';

  const { totalValuation, activeHoldings, totalUnrealizedGain, totalRealizedGain, totalDividends, totalDivYield } = portfolio;

  return (
    <div className={cn('rounded-2xl bg-gradient-to-br text-white p-5 shadow-lg animate-fade-in', gradientClass)}>
      {/* Main */}
      <div className="mb-4">
        <p className="text-xs text-white/70 mb-1">총 평가금액</p>
        <p className="text-2xl font-bold tracking-tight">{formatKRW(totalValuation)}</p>
        <p className="text-xs text-white/60 mt-1">보유 {activeHoldings.length}종목</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/15 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            {totalUnrealizedGain >= 0
              ? <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              : <TrendingDown className="w-3.5 h-3.5 text-red-300" />}
            <span className="text-[10px] text-white/70">평가손익</span>
          </div>
          <p className={cn('text-sm font-bold', totalUnrealizedGain >= 0 ? 'text-emerald-300' : 'text-red-300')}>
            {formatKRW(totalUnrealizedGain)}
          </p>
        </div>

        <div className="bg-white/15 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-white/70" />
            <span className="text-[10px] text-white/70">실현손익</span>
          </div>
          <p className={cn('text-sm font-bold', totalRealizedGain >= 0 ? 'text-emerald-300' : 'text-red-300')}>
            {formatKRW(totalRealizedGain)}
          </p>
        </div>

        <div className="bg-white/15 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[10px] text-white/70">총 배당금</span>
          </div>
          <p className="text-sm font-bold text-amber-300">{formatKRW(totalDividends)}</p>
        </div>

        <div className="bg-white/15 rounded-xl p-3">
          <div className="flex items-center gap-1 mb-1">
            <Coins className="w-3.5 h-3.5 text-white/70" />
            <span className="text-[10px] text-white/70">배당수익률</span>
          </div>
          <p className="text-sm font-bold">{formatPercent(totalDivYield)}</p>
        </div>
      </div>
    </div>
  );
}
