'use client';

import { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import type { AppMode, Holding } from '@/types';

interface PriceRefreshButtonProps {
  mode: AppMode;
  holdings: Holding[];
}

// Yahoo Finance API로 보유 종목 현재가를 일괄 갱신한다.
// 실패한 종목은 수동 업데이트 가능(기존 PriceUpdateModal 유지).
export function PriceRefreshButton({ mode, holdings }: PriceRefreshButtonProps) {
  const isGraduate = mode === 'graduate';
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleRefresh = async () => {
    if (holdings.length === 0) return;
    setLoading(true);
    setStatus(null);

    try {
      const items = holdings.map((h) => ({ market: h.market, ticker: h.ticker }));
      const res = await fetch('/api/prices/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('업데이트 실패');
      const data = await res.json();

      let okCount = 0;
      let failCount = 0;
      for (const r of data.results as {
        market: string;
        ticker: string;
        price: number | null;
        found: boolean;
      }[]) {
        if (r.found && r.price) {
          const key = `${r.market}_${r.ticker}`;
          await db.stockPrices.put({
            key,
            price: r.price,
            updatedAt: new Date().toISOString(),
          });
          okCount += 1;
        } else {
          failCount += 1;
        }
      }

      setStatus(
        failCount === 0
          ? `✓ 전체 ${okCount}개 종목 현재가를 업데이트했어요`
          : `✓ ${okCount}개 업데이트 (${failCount}개는 찾지 못함 — 수동 입력해주세요)`
      );
    } catch (err: any) {
      setStatus(`⚠ ${err?.message || '업데이트 실패'}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 6000);
    }
  };

  if (holdings.length === 0) return null;

  return (
    <div className="space-y-1">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors',
          loading
            ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-wait'
            : isGraduate
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
              : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            현재가 가져오는 중... ({holdings.length}개)
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            Yahoo Finance로 전체 현재가 업데이트
          </>
        )}
      </button>
      {status && (
        <p className="text-xs text-center text-slate-500 dark:text-slate-400">{status}</p>
      )}
    </div>
  );
}
