'use client';

import { useState, useMemo } from 'react';
import { X, Check, RefreshCw, Plus } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { ACCOUNT_TYPES } from '@/config/modes';
import { cn } from '@/lib/utils';
import type { Account, AccountType, AppMode } from '@/types';

interface ScannedAccount {
  bank: string;
  name: string;
  type: string;
  balance: number;
}

interface EditableItem extends ScannedAccount {
  checked: boolean;
  matchedAccountId: number | null;
}

interface AssetScanResultModalProps {
  scannedAccounts: ScannedAccount[];
  existingAccounts: Account[];
  mode: AppMode;
  onSave: (items: { account: ScannedAccount; matchedAccountId: number | null }[]) => void;
  onClose: () => void;
}

function findMatch(scanned: ScannedAccount, existing: Account[]): number | null {
  // Exact match on bank + name
  const exact = existing.find(
    (a) => a.bank === scanned.bank && a.name === scanned.name
  );
  if (exact?.id) return exact.id;

  // Partial match: bank matches and name partially overlaps
  const partial = existing.find(
    (a) =>
      a.bank === scanned.bank &&
      (a.name.includes(scanned.name) || scanned.name.includes(a.name))
  );
  if (partial?.id) return partial.id;

  return null;
}

export function AssetScanResultModal({
  scannedAccounts,
  existingAccounts,
  mode,
  onSave,
  onClose,
}: AssetScanResultModalProps) {
  const isGraduate = mode === 'graduate';

  const [items, setItems] = useState<EditableItem[]>(() =>
    scannedAccounts.map((acc) => ({
      ...acc,
      checked: true,
      matchedAccountId: findMatch(acc, existingAccounts),
    }))
  );

  const checkedCount = useMemo(() => items.filter((i) => i.checked).length, [items]);

  const updateItem = (index: number, updates: Partial<EditableItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  const handleSave = () => {
    const selected = items
      .filter((i) => i.checked)
      .map((i) => ({
        account: { bank: i.bank, name: i.name, type: i.type, balance: i.balance },
        matchedAccountId: i.matchedAccountId,
      }));
    onSave(selected);
  };

  const inputClass =
    'px-2 py-1 rounded border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 transition-colors';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full md:w-[36rem] rounded-t-2xl md:rounded-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            스크린샷 분석 결과
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
          >
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          각 필드를 클릭하여 수정할 수 있습니다. 체크된 항목만 저장됩니다.
        </p>

        {/* Account list */}
        <div className="space-y-3">
          {items.map((item, idx) => {
            const isMatched = item.matchedAccountId !== null;
            const matchedAccount = isMatched
              ? existingAccounts.find((a) => a.id === item.matchedAccountId)
              : null;

            return (
              <div
                key={idx}
                className={cn(
                  'rounded-xl border p-4 transition-colors',
                  item.checked
                    ? 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60'
                )}
              >
                {/* Top row: checkbox + match badge */}
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => updateItem(idx, { checked: e.target.checked })}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      #{idx + 1}
                    </span>
                  </label>
                  {isMatched ? (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <RefreshCw className="w-3 h-3" />
                      잔액 업데이트
                      {matchedAccount && (
                        <span className="text-blue-400 dark:text-blue-500 ml-1">
                          ({formatNumber(matchedAccount.balance)}원 →)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      <Plus className="w-3 h-3" />
                      새 계좌 추가
                    </span>
                  )}
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">은행</label>
                    <input
                      value={item.bank}
                      onChange={(e) => updateItem(idx, { bank: e.target.value })}
                      className={cn(inputClass, 'w-full')}
                      disabled={!item.checked}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">계좌명</label>
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(idx, { name: e.target.value })}
                      className={cn(inputClass, 'w-full')}
                      disabled={!item.checked}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">유형</label>
                    <select
                      value={item.type}
                      onChange={(e) => updateItem(idx, { type: e.target.value })}
                      className={cn(inputClass, 'w-full cursor-pointer')}
                      disabled={!item.checked}
                    >
                      {ACCOUNT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">잔액</label>
                    <input
                      type="number"
                      value={item.balance}
                      onChange={(e) => updateItem(idx, { balance: Number(e.target.value) })}
                      className={cn(inputClass, 'w-full')}
                      disabled={!item.checked}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={checkedCount === 0}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40',
              isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
            )}
          >
            <Check className="w-4 h-4" />
            선택 항목 저장 ({checkedCount})
          </button>
        </div>
      </div>
    </div>
  );
}
