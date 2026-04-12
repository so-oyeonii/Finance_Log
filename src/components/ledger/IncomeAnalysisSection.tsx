'use client';

import { Wallet } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { IncomeInsights, CategoryStat, Stability } from '@/lib/incomeStats';

interface IncomeAnalysisSectionProps {
  insights: IncomeInsights;
}

const STABILITY_META: Record<Stability, { label: string; color: string; desc: string }> = {
  fixed: {
    label: '안정',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    desc: '매달 들어오는 수입 — 예산의 기반으로 활용하세요',
  },
  semi: {
    label: '변동',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    desc: '들쭉날쭉한 수입 — 있는 달에만 쓰는 보너스로 취급하세요',
  },
  lump: {
    label: '목돈',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    desc: '가끔 큰 금액 — 버퍼/저축으로 따로 관리 추천',
  },
};

// 수입 원천별 분석 카드 — "어떤 돈으로 얼마씩 받았는지" 카테고리별 분해
export function IncomeAnalysisSection({ insights }: IncomeAnalysisSectionProps) {
  const { byCategory } = insights;

  if (byCategory.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">수입 원천별 분석</h2>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          총 {byCategory.length}개 원천
        </span>
      </div>

      <div className="space-y-2">
        {byCategory.map((c) => (
          <CategoryRow key={c.category} stat={c} />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({ stat }: { stat: CategoryStat }) {
  const meta = STABILITY_META[stat.stability];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 animate-slide-up">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Wallet className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {stat.category}
          </span>
          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', meta.color)}>
            {meta.label}
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            {formatKRW(stat.total)}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">연 총액</p>
        </div>
      </div>

      {/* 수치 요약 */}
      <div className="grid grid-cols-3 gap-1 mb-2 text-center">
        <div className="py-1 px-1 rounded bg-slate-50 dark:bg-slate-900/40">
          <p className="text-[9px] text-slate-400 dark:text-slate-500">활성월 평균</p>
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
            {formatKRW(stat.avg)}
          </p>
        </div>
        <div className="py-1 px-1 rounded bg-slate-50 dark:bg-slate-900/40">
          <p className="text-[9px] text-slate-400 dark:text-slate-500">수령 횟수</p>
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            {stat.activeMonths}개월
          </p>
        </div>
        <div className="py-1 px-1 rounded bg-slate-50 dark:bg-slate-900/40">
          <p className="text-[9px] text-slate-400 dark:text-slate-500">최근 수령</p>
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
            {stat.lastMonth > 0 ? formatKRW(stat.lastMonth) : '-'}
          </p>
        </div>
      </div>

      {/* Sparkline: 12개월 추이 */}
      <Sparkline data={stat.sparkline} />

      {/* 안정성 설명 */}
      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
        {meta.desc}
      </p>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => {
        const h = (v / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-stretch justify-end">
            <div
              className={cn(
                'w-full rounded-sm transition-all',
                v > 0 ? 'bg-indigo-300 dark:bg-indigo-500/60' : 'bg-slate-100 dark:bg-slate-700/50'
              )}
              style={{ height: `${Math.max(h, v > 0 ? 10 : 4)}%` }}
              title={`${i + 1}월`}
            />
          </div>
        );
      })}
    </div>
  );
}
