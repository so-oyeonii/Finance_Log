'use client';

import { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { Holding } from '@/types';

interface PriceUpdateModalProps {
  holding: Holding;
  onConfirm: (key: string, price: number) => void;
  onCancel: () => void;
}

export function PriceUpdateModal({ holding, onConfirm, onCancel }: PriceUpdateModalProps) {
  const [newPrice, setNewPrice] = useState(holding.currentPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPrice > 0) {
      onConfirm(holding.priceKey, newPrice);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
      <div className="bg-white w-full md:w-96 rounded-t-2xl md:rounded-2xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <RefreshCw className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-lg">현재가 업데이트</h3>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Info */}
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-slate-800">{holding.ticker}</p>
          <p className="text-xs text-slate-400">현재가: {formatKRW(holding.currentPrice)}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-medium text-slate-600 mb-1">새 가격 (원)</label>
          <input
            type="number"
            step="any"
            value={newPrice}
            onChange={(e) => setNewPrice(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors mb-4"
            autoFocus
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              업데이트
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
