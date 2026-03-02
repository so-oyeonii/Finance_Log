'use client';

import { PiggyBank, Plus } from 'lucide-react';
import { SavingsCard } from './SavingsCard';
import type { Savings, AppMode } from '@/types';
import { cn } from '@/lib/utils';

interface SavingsListProps {
  savings: Savings[];
  mode: AppMode;
  onAdd: () => void;
  onDelete: (saving: Savings) => void;
}

export function SavingsList({ savings, mode, onAdd, onDelete }: SavingsListProps) {
  const isGraduate = mode === 'graduate';

  return (
    <div className="animate-slide-up">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700">예적금 관리</h3>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {savings.length}
          </span>
        </div>
        <button
          onClick={onAdd}
          className={cn(
            'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white transition-colors',
            isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          추가
        </button>
      </div>

      {/* Savings Cards */}
      {savings.length > 0 ? (
        <div className="space-y-3">
          {savings.map((saving) => (
            <SavingsCard key={saving.id} saving={saving} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <PiggyBank className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">등록된 예적금이 없습니다</p>
          <p className="text-xs text-slate-300 mt-1">위의 추가 버튼을 눌러 등록해보세요</p>
        </div>
      )}
    </div>
  );
}
