'use client';

import { useState, useRef } from 'react';
import { PiggyBank, Loader2 } from 'lucide-react';
import { useAi } from '@/hooks/useAi';
import { cn } from '@/lib/utils';
import type { AppMode } from '@/types';

interface ScannedSavings {
  type: '예금' | '적금';
  name: string;
  amount: number;
  rate: number;
  term: number;
  startDate: string;
}

interface SavingsScanButtonProps {
  mode: AppMode;
  onResult: (savings: ScannedSavings[]) => void;
}

export function SavingsScanButton({ mode, onResult }: SavingsScanButtonProps) {
  const { scanSavings } = useAi();
  const isGraduate = mode === 'graduate';
  const fileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setError('');
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve(dataUrl.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await scanSavings(base64, file.type);

      if (!result.savings || result.savings.length === 0) {
        setError('스크린샷에서 예적금 정보를 찾지 못했어요.');
      } else {
        onResult(result.savings);
      }
    } catch (err: any) {
      setError(err?.message || '분석 실패');
    } finally {
      setIsLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => fileRef.current?.click()}
        disabled={isLoading}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors',
          isLoading
            ? 'border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-wait'
            : isGraduate
              ? 'border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
              : 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI 분석 중...
          </>
        ) : (
          <>
            <PiggyBank className="w-4 h-4" />
            스크린샷으로 예적금 일괄 등록
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
