'use client';

import { useState, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import { calculateSavingsInfo } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import type { AppMode, SavingsType } from '@/types';

interface ScannedSavings {
  type: '예금' | '적금';
  name: string;
  amount: number;
  rate: number;
  term: number;
  startDate: string;
}

interface EditableSavings extends ScannedSavings {
  checked: boolean;
}

interface SavingsScanResultModalProps {
  scannedSavings: ScannedSavings[];
  mode: AppMode;
  onSave: (items: ScannedSavings[]) => Promise<void>;
  onClose: () => void;
}

export function SavingsScanResultModal({
  scannedSavings,
  mode,
  onSave,
  onClose,
}: SavingsScanResultModalProps) {
  const isGraduate = mode === 'graduate';
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState<EditableSavings[]>(() =>
    scannedSavings.map((s) => ({ ...s, checked: true }))
  );

  const checkedCount = useMemo(
    () => items.filter((i) => i.checked).length,
    [items]
  );

  const updateItem = (index: number, updates: Partial<EditableSavings>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const handleSave = async () => {
    const selected = items
      .filter((i) => i.checked && i.name && i.amount > 0 && i.rate > 0 && i.term > 0)
      .map(({ checked, ...rest }) => rest);
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await onSave(selected);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'px-2 py-1 rounded border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 transition-colors';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full md:w-[38rem] rounded-t-2xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            예적금 스크린샷 결과
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          AI가 추출한 정보를 확인하고 저장 전에 수정할 수 있어요.
        </p>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const preview =
              item.amount > 0 && item.rate > 0 && item.term > 0
                ? calculateSavingsInfo(
                    item.type as SavingsType,
                    item.amount,
                    item.rate,
                    item.term
                  )
                : null;

            return (
              <div
                key={idx}
                className={cn(
                  'rounded-xl border p-3 transition-colors',
                  item.checked
                    ? 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => updateItem(idx, { checked: e.target.checked })}
                    className="rounded border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-xs text-slate-500">#{idx + 1}</span>
                  <select
                    value={item.type}
                    onChange={(e) =>
                      updateItem(idx, { type: e.target.value as '예금' | '적금' })
                    }
                    className={cn(inputClass, 'ml-auto text-xs')}
                    disabled={!item.checked}
                  >
                    <option value="예금">예금</option>
                    <option value="적금">적금</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] text-slate-500 mb-0.5">상품명</label>
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(idx, { name: e.target.value })}
                      className={cn(inputClass, 'w-full')}
                      disabled={!item.checked}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">
                      {item.type === '예금' ? '거치금' : '월납입'}
                    </label>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        updateItem(idx, { amount: Number(e.target.value) })
                      }
                      className={cn(inputClass, 'w-full')}
                      disabled={!item.checked}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">이율(%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(idx, { rate: Number(e.target.value) })
                      }
                      className={cn(inputClass, 'w-full')}
                      disabled={!item.checked}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">개월</label>
                    <input
                      type="number"
                      value={item.term}
                      onChange={(e) =>
                        updateItem(idx, { term: Number(e.target.value) })
                      }
                      className={cn(inputClass, 'w-full')}
                      disabled={!item.checked}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">가입일</label>
                    <input
                      type="date"
                      value={item.startDate}
                      onChange={(e) => updateItem(idx, { startDate: e.target.value })}
                      className={cn(inputClass, 'w-full cursor-pointer')}
                      disabled={!item.checked}
                    />
                  </div>
                  {preview && (
                    <div className="col-span-2 md:col-span-2 flex items-center bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-2 py-1">
                      <span className="text-[10px] text-indigo-500 dark:text-indigo-300 mr-1">
                        예상 만기:
                      </span>
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        {formatKRW(Math.round(preview.maturityAmount))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={checkedCount === 0 || saving}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40',
              isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
            )}
          >
            <Check className="w-4 h-4" />
            {saving ? '저장 중...' : `선택 항목 저장 (${checkedCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
