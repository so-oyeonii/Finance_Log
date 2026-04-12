'use client';

import { useState, useRef } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
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

interface StockCsvButtonProps {
  mode: AppMode;
  onResult: (holdings: ScannedHolding[]) => void;
}

// 증권사 CSV 파일 업로드 → AI가 컬럼 매핑 → 보유 종목 추출
// 키움/미래에셋/삼성/NH/토스증권 CSV 포맷 자동 감지
export function StockCsvButton({ mode, onResult }: StockCsvButtonProps) {
  const openaiApiKey = useAppStore((s) => s.openaiApiKey);
  const isGraduate = mode === 'graduate';
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      // CSV/TSV/엑셀-복사본 텍스트를 그대로 문자열로 읽음
      const text = await file.text();

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (openaiApiKey) headers['x-openai-api-key'] = openaiApiKey;

      const res = await fetch('/api/ai/stock-csv', {
        method: 'POST',
        headers,
        body: JSON.stringify({ csvText: text }),
      });
      if (!res.ok) throw new Error('CSV 분석에 실패했어요.');
      const result = await res.json();

      if (!result.holdings || result.holdings.length === 0) {
        setError('CSV에서 보유 종목을 찾지 못했어요. 거래내역 또는 잔고 CSV인지 확인해주세요.');
      } else {
        onResult(result.holdings);
      }
    } catch (err: any) {
      setError(err?.message || '분석 실패');
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors',
          loading
            ? 'border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-wait'
            : isGraduate
              ? 'border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
              : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            CSV 분석 중...
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-4 h-4" />
            증권사 CSV 파일 업로드
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.tsv,.txt,text/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
