'use client';

import { RefreshCw, Coins } from 'lucide-react';
import { formatKRW, formatPercent, formatNumber } from '@/lib/format';
import type { Holding, StockMarket } from '@/types';
import { cn } from '@/lib/utils';

const MARKET_COLORS: Record<StockMarket, string> = {
  '국내': 'bg-blue-100 text-blue-700',
  '미국': 'bg-emerald-100 text-emerald-700',
  '중국': 'bg-red-100 text-red-700',
  'ETF': 'bg-purple-100 text-purple-700',
  '코인': 'bg-amber-100 text-amber-700',
  '기타': 'bg-slate-100 text-slate-600',
};

interface HoldingCardProps {
  holding: Holding;
  onPriceUpdate: (holding: Holding) => void;
}

export function HoldingCard({ holding, onPriceUpdate }: HoldingCardProps) {
  const {
    market, ticker, qty, avgPrice, currentPrice,
    valuation, unrealizedGain, returnRate, totalDiv, divYield, accName,
  } = holding;

  const isPositive = unrealizedGain >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', MARKET_COLORS[market])}>
            {market}
          </span>
          <span className="text-sm font-bold text-slate-800">{ticker}</span>
        </div>
        <button
          onClick={() => onPriceUpdate(holding)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          title="현재가 업데이트"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-slate-400">수량</span>
          <span className="text-slate-700 font-medium">{formatNumber(qty)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">평균단가</span>
          <span className="text-slate-700 font-medium">{formatKRW(avgPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">현재가</span>
          <span className="text-slate-700 font-medium">{formatKRW(currentPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">평가금액</span>
          <span className="text-slate-700 font-bold">{formatKRW(valuation)}</span>
        </div>
      </div>

      {/* Bottom: P&L + Dividend */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 mr-1">평가손익</span>
          <span className={cn('text-xs font-bold', isPositive ? 'text-emerald-500' : 'text-red-500')}>
            {formatKRW(unrealizedGain)} ({formatPercent(returnRate)})
          </span>
        </div>
        {totalDiv > 0 && (
          <div className="flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] text-amber-600 font-medium">
              {formatKRW(totalDiv)} ({formatPercent(divYield)})
            </span>
          </div>
        )}
      </div>

      {/* Account Name */}
      <p className="text-[10px] text-slate-300 mt-1">{accName}</p>
    </div>
  );
}
