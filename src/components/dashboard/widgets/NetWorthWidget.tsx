'use client';

import { TrendingUp, Landmark, BarChart3 } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { AppMode } from '@/types';

interface NetWorthWidgetProps {
  netWorth: number;
  bankAssets: number;
  investAssets: number;
  mode: AppMode;
}

export function NetWorthWidget({ netWorth, bankAssets, investAssets, mode }: NetWorthWidgetProps) {
  const isGraduate = mode === 'graduate';
  const bgGradient = isGraduate
    ? 'from-indigo-500 to-indigo-700'
    : 'from-emerald-500 to-emerald-700';

  return (
    <div className={`bg-gradient-to-r ${bgGradient} rounded-xl p-5 text-white shadow-lg animate-fade-in`}>
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 opacity-80" />
        <span className="text-sm opacity-80">총 순자산</span>
      </div>
      <p className="text-2xl font-bold tracking-tight mb-4">{formatKRW(netWorth)}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/15 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Landmark className="w-3.5 h-3.5 opacity-70" />
            <span className="text-xs opacity-70">은행 자산</span>
          </div>
          <p className="text-sm font-semibold">{formatKRW(bankAssets)}</p>
        </div>
        <div className="bg-white/15 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <BarChart3 className="w-3.5 h-3.5 opacity-70" />
            <span className="text-xs opacity-70">투자 자산</span>
          </div>
          <p className="text-sm font-semibold">{formatKRW(investAssets)}</p>
        </div>
      </div>
    </div>
  );
}
