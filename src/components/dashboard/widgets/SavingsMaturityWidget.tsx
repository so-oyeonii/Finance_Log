'use client';

import { useMemo } from 'react';
import { PiggyBank, AlertCircle } from 'lucide-react';
import { useSavings } from '@/hooks/useSavings';
import { calculateSavingsInfo } from '@/lib/calculations';
import { formatKRW } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Savings } from '@/types';

// 만기 임박 예적금 위젯: 30일 이내 만기 상품 + 전체 만기 타임라인 요약
export function SavingsMaturityWidget() {
  const { savings } = useSavings();

  const items = useMemo(() => {
    const now = new Date();
    return savings
      .map((s) => {
        const start = new Date(s.startDate);
        const maturity = new Date(start);
        maturity.setMonth(maturity.getMonth() + s.term);
        const daysLeft = Math.ceil((maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const totalDays = s.term * 30; // 대략치: 정확한 계산은 days diff로 대체 가능
        const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));
        const info = calculateSavingsInfo(s.type, s.amount, s.rate, s.term);
        return { savings: s, maturity, daysLeft, progress, info };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [savings]);

  const imminent = items.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 30);
  const upcoming = items.filter((i) => i.daysLeft > 30);
  const top3 = [...imminent, ...upcoming].slice(0, 3);

  // 이번 해 만기 총액
  const thisYear = new Date().getFullYear();
  const maturingThisYear = items.filter((i) => i.maturity.getFullYear() === thisYear && i.daysLeft >= 0);
  const thisYearTotal = maturingThisYear.reduce((sum, i) => sum + i.info.maturityAmount, 0);

  if (savings.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <PiggyBank className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">예적금 만기</h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
          등록된 예적금이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">예적금 만기</h3>
        </div>
        {imminent.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            30일 이내 {imminent.length}건
          </span>
        )}
      </div>

      {/* 올해 만기 총액 요약 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-indigo-500/70 dark:text-indigo-300/70">올해 만기</p>
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
            {maturingThisYear.length}건
          </p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-indigo-500/70 dark:text-indigo-300/70">예상 수령액</p>
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
            {formatKRW(Math.round(thisYearTotal))}
          </p>
        </div>
      </div>

      {/* 임박 / 다가오는 Top 3 */}
      <div className="space-y-2">
        {top3.map(({ savings: s, daysLeft, progress, info }) => (
          <MaturityRow
            key={s.id}
            name={s.name}
            type={s.type}
            daysLeft={daysLeft}
            progress={progress}
            maturityAmount={info.maturityAmount}
          />
        ))}
      </div>

      {items.length > 3 && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-3">
          + {items.length - 3}건 더
        </p>
      )}
    </div>
  );
}

function MaturityRow({
  name,
  type,
  daysLeft,
  progress,
  maturityAmount,
}: {
  name: string;
  type: '예금' | '적금';
  daysLeft: number;
  progress: number;
  maturityAmount: number;
}) {
  const isImminent = daysLeft >= 0 && daysLeft <= 30;
  const isMatured = daysLeft < 0;

  const statusLabel = isMatured
    ? '만기 도래'
    : daysLeft === 0
      ? '오늘 만기'
      : `${daysLeft}일 남음`;

  const statusColor = isMatured
    ? 'text-slate-400'
    : isImminent
      ? 'text-red-500'
      : 'text-indigo-500';

  return (
    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span
            className={cn(
              'text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0',
              type === '예금'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
            )}
          >
            {type}
          </span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
            {name}
          </span>
        </div>
        <span className={cn('text-[10px] font-semibold flex-shrink-0 ml-2', statusColor)}>
          {statusLabel}
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
        <div
          className={cn(
            'h-full transition-all',
            isImminent ? 'bg-red-400' : 'bg-indigo-400'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
        <span>진행 {progress.toFixed(0)}%</span>
        <span>예상 {formatKRW(Math.round(maturityAmount))}</span>
      </div>
    </div>
  );
}
