'use client';

import { Trash2 } from 'lucide-react';
import { formatKRW, formatDate } from '@/lib/format';
import { calculateSavingsInfo } from '@/lib/calculations';
import type { Savings } from '@/types';
import { cn } from '@/lib/utils';

interface SavingsCardProps {
  saving: Savings;
  onDelete: (saving: Savings) => void;
}

export function SavingsCard({ saving, onDelete }: SavingsCardProps) {
  const info = calculateSavingsInfo(saving.type, saving.amount, saving.rate, saving.term);
  const isDeposit = saving.type === '예금';

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              isDeposit ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
            )}>
              {saving.type}
            </span>
            <span className="text-xs text-slate-400">{saving.rate}% · {saving.term}개월</span>
          </div>
          <p className="text-sm font-medium text-slate-700">{saving.name}</p>
        </div>
        <button
          onClick={() => onDelete(saving)}
          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
          title="삭제"
        >
          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
        </button>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-slate-400 mb-0.5">{isDeposit ? '거치금' : '월 납입액'}</p>
          <p className="font-medium text-slate-700">{formatKRW(saving.amount)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-slate-400 mb-0.5">원금 합계</p>
          <p className="font-medium text-slate-700">{formatKRW(info.principal)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-slate-400 mb-0.5">세전이자</p>
          <p className="font-medium text-emerald-600">{formatKRW(Math.round(info.preTaxInterest))}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-slate-400 mb-0.5">세금 (15.4%)</p>
          <p className="font-medium text-red-500">-{formatKRW(Math.round(info.tax))}</p>
        </div>
      </div>

      {/* Maturity Amount */}
      <div className="mt-3 bg-indigo-50 rounded-lg p-3 text-center">
        <p className="text-xs text-indigo-400 mb-0.5">만기 수령액</p>
        <p className="text-lg font-bold text-indigo-700">{formatKRW(Math.round(info.maturityAmount))}</p>
        <p className="text-xs text-indigo-400 mt-0.5">
          세후이자 {formatKRW(Math.round(info.afterTaxInterest))}
        </p>
      </div>

      {/* Start Date */}
      <p className="text-xs text-slate-400 mt-2 text-right">
        가입일 {formatDate(saving.startDate)}
      </p>
    </div>
  );
}
