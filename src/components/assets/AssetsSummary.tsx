'use client';

import { Wallet } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { AppMode } from '@/types';

interface AssetsSummaryProps {
  totalBalance: number;
  accountCount: number;
  mode: AppMode;
}

export function AssetsSummary({ totalBalance, accountCount, mode }: AssetsSummaryProps) {
  const isGraduate = mode === 'graduate';
  const bgGradient = isGraduate
    ? 'from-indigo-500 to-indigo-700'
    : 'from-emerald-500 to-emerald-700';
  const iconBg = isGraduate ? 'bg-indigo-400/30' : 'bg-emerald-400/30';

  return (
    <div className={`bg-gradient-to-r ${bgGradient} rounded-xl p-5 text-white shadow-lg animate-fade-in`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80 mb-1">총 자산</p>
          <p className="text-2xl font-bold tracking-tight">{formatKRW(totalBalance)}</p>
          <p className="text-xs opacity-70 mt-1">계좌 {accountCount}개</p>
        </div>
        <div className={`${iconBg} p-3 rounded-full`}>
          <Wallet className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}
