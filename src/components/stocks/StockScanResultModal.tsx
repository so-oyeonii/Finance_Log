'use client';

import { useState, useMemo } from 'react';
import { X, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Account, AppMode, StockMarket, Currency } from '@/types';

interface ScannedHolding {
  market: string;
  ticker: string;
  quantity: number;
  avgPrice: number;
  currency: 'KRW' | 'USD';
  inputPrice?: number;
}

interface EditableHolding extends ScannedHolding {
  checked: boolean;
  accountId: number | null;
}

interface StockScanResultModalProps {
  scannedHoldings: ScannedHolding[];
  accounts: Account[];
  mode: AppMode;
  defaultDate: string;
  onSave: (items: {
    market: StockMarket;
    ticker: string;
    quantity: number;
    avgPrice: number;
    currency: Currency;
    inputPrice?: number;
    accountId: number;
  }[]) => Promise<void>;
  onClose: () => void;
}

const MARKETS: StockMarket[] = ['국내', '미국', '중국', 'ETF', '코인', '기타'];

// 증권 관련 계좌만 기본 후보로 제시
function pickDefaultAccount(accounts: Account[]): number | null {
  const stockAccount = accounts.find(
    (a) => a.type === '주식예수금' || a.type === '코인'
  );
  return stockAccount?.id ?? accounts[0]?.id ?? null;
}

export function StockScanResultModal({
  scannedHoldings,
  accounts,
  mode,
  defaultDate,
  onSave,
  onClose,
}: StockScanResultModalProps) {
  const isGraduate = mode === 'graduate';
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState<EditableHolding[]>(() => {
    const defaultAcc = pickDefaultAccount(accounts);
    return scannedHoldings.map((h) => ({
      ...h,
      market: MARKETS.includes(h.market as StockMarket) ? h.market : '기타',
      checked: true,
      accountId: defaultAcc,
    }));
  });

  const checkedCount = useMemo(
    () => items.filter((i) => i.checked).length,
    [items]
  );

  const updateItem = (index: number, updates: Partial<EditableHolding>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const handleSave = async () => {
    const selected = items
      .filter((i) => i.checked && i.accountId && i.ticker && i.quantity > 0)
      .map((i) => ({
        market: i.market as StockMarket,
        ticker: i.ticker,
        quantity: i.quantity,
        avgPrice: i.avgPrice,
        currency: i.currency,
        inputPrice: i.inputPrice,
        accountId: i.accountId!,
      }));
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
      <div className="bg-white dark:bg-slate-800 w-full md:w-[42rem] rounded-t-2xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            보유 종목 스크린샷 결과
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
          >
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        {/* Info banner: 스냅샷 방식 안내 (domain-expert 제안) */}
        <div className="flex gap-2 p-3 mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-200 leading-relaxed">
            <b>기준일 스냅샷으로 저장됩니다.</b> 과거 매매 이력 없이 "{defaultDate} 기준 OOO주, 평단 OOO원"
            형태로 입력돼요. 이후 매매부터 실제 거래로 기록하시면 됩니다.
            수량·평단가는 저장 전 자유롭게 수정하세요.
          </p>
        </div>

        {accounts.length === 0 && (
          <p className="text-xs text-red-500 mb-3">
            먼저 "자산" 탭에서 증권 계좌(주식예수금/코인)를 1개 이상 등록해주세요.
          </p>
        )}

        {/* Holdings list */}
        <div className="space-y-3">
          {items.map((item, idx) => (
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
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  #{idx + 1}
                </span>
                <select
                  value={item.market}
                  onChange={(e) => updateItem(idx, { market: e.target.value })}
                  className={cn(inputClass, 'ml-auto text-xs')}
                  disabled={!item.checked}
                >
                  {MARKETS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={item.currency}
                  onChange={(e) => updateItem(idx, { currency: e.target.value as Currency })}
                  className={cn(inputClass, 'text-xs')}
                  disabled={!item.checked}
                >
                  <option value="KRW">KRW</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                    종목명/티커
                  </label>
                  <input
                    value={item.ticker}
                    onChange={(e) => updateItem(idx, { ticker: e.target.value })}
                    className={cn(inputClass, 'w-full')}
                    disabled={!item.checked}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                    수량
                  </label>
                  <input
                    type="number"
                    step="0.00000001"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, { quantity: Number(e.target.value) })
                    }
                    className={cn(inputClass, 'w-full')}
                    disabled={!item.checked}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                    평단가 ({item.currency === 'USD' ? 'USD' : 'KRW'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.currency === 'USD' ? (item.inputPrice ?? item.avgPrice) : item.avgPrice}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (item.currency === 'USD') {
                        updateItem(idx, { inputPrice: v });
                      } else {
                        updateItem(idx, { avgPrice: v, inputPrice: v });
                      }
                    }}
                    className={cn(inputClass, 'w-full')}
                    disabled={!item.checked}
                  />
                </div>
                <div className="col-span-2 md:col-span-4">
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                    거래 계좌
                  </label>
                  <select
                    value={item.accountId ?? ''}
                    onChange={(e) =>
                      updateItem(idx, {
                        accountId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className={cn(inputClass, 'w-full cursor-pointer')}
                    disabled={!item.checked}
                  >
                    <option value="">계좌를 선택하세요</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.bank} · {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
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
            disabled={checkedCount === 0 || saving || accounts.length === 0}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40',
              isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
            )}
          >
            <Check className="w-4 h-4" />
            {saving ? '저장 중...' : `초기 보유로 저장 (${checkedCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
