'use client';

import { useState } from 'react';
import { MessageSquarePlus, Loader2, X } from 'lucide-react';
import { useAi } from '@/hooks/useAi';
import { cn } from '@/lib/utils';
import type { AppMode } from '@/types';

interface ScannedHolding {
  market: string;
  ticker: string;
  quantity: number;
  avgPrice: number;
  currency: 'KRW' | 'USD';
  inputPrice?: number;
}

interface StockBulkTextButtonProps {
  mode: AppMode;
  onResult: (holdings: ScannedHolding[]) => void;
}

const EXAMPLE = `예시)
삼성전자 100주 평단 7만원
애플 20주 150달러
KODEX200 50주 3만원
비트코인 0.5개 6천만원`;

export function StockBulkTextButton({ mode, onResult }: StockBulkTextButtonProps) {
  const { bulkStockInput } = useAi();
  const isGraduate = mode === 'graduate';
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await bulkStockInput(text);
      if (!result.holdings || result.holdings.length === 0) {
        setError('종목을 추출하지 못했어요. 형식을 조금 바꿔서 다시 시도해보세요.');
      } else {
        onResult(result.holdings);
        setOpen(false);
        setText('');
      }
    } catch (err: any) {
      setError(err?.message || '분석에 실패했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors',
          isGraduate
            ? 'border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
        )}
      >
        <MessageSquarePlus className="w-4 h-4" />
        자연어로 여러 종목 한번에 등록
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full md:w-[32rem] rounded-t-2xl md:rounded-2xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                자연어로 보유 종목 입력
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              여러 줄로 한번에 입력하세요. AI가 종목·수량·평단을 추출해서 프리뷰로 보여드려요.
            </p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={EXAMPLE}
              rows={8}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 resize-none"
              disabled={loading}
            />

            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !text.trim()}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40',
                  isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  '분석하기'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
