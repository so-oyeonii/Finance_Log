'use client';

import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, Lightbulb } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useAccounts } from '@/hooks/useAccounts';
import { useSavings } from '@/hooks/useSavings';
import { useTransactions } from '@/hooks/useTransactions';
import { useStocks } from '@/hooks/useStocks';
import { useAi } from '@/hooks/useAi';
import type { AiAnalysisResponse } from '@/types';

export function AiReportWidget() {
  const { mode, selectedYear } = useAppStore();
  const { accounts } = useAccounts();
  const { savings } = useSavings();
  const { expenseByCategory } = useTransactions(selectedYear);
  const { portfolio } = useStocks(selectedYear);
  const { analyzeFinance } = useAi();

  const [report, setReport] = useState<AiAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError('');
    try {
      const topExpenses = expenseByCategory.slice(0, 3).map((e) => ({
        name: e.name,
        value: e.value,
      }));
      const result = await analyzeFinance({
        accounts,
        savings,
        topExpenses,
        portfolioGain: portfolio.totalRealizedGain,
        mode,
      });
      setReport(result);
    } catch (err: any) {
      setError(err?.message || 'AI 분석에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-violet-500" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">AI 분석 리포트</h3>
      </div>

      {!report && !isLoading && !error && (
        <div className="text-center py-4">
          <Sparkles className="w-8 h-8 text-violet-300 dark:text-violet-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            AI가 재무 데이터를 분석하여 맞춤 리포트를 생성합니다
          </p>
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm rounded-lg transition-colors"
          >
            분석하기
          </button>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">AI가 분석 중입니다...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <button
            onClick={handleAnalyze}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}

      {report && !isLoading && (
        <div className="space-y-3">
          <div className="bg-violet-50 dark:bg-violet-900/30 rounded-lg p-3">
            <p className="text-sm font-bold text-violet-700 dark:text-violet-300 mb-1">{report.title}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{report.message}</p>
          </div>

          {report.tips.length > 0 && (
            <div className="space-y-1.5">
              {report.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mx-auto"
          >
            <RefreshCw className="w-3 h-3" />
            다시 분석
          </button>
        </div>
      )}
    </div>
  );
}
