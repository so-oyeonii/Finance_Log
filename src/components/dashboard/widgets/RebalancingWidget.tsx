'use client';

import { useEffect, useMemo, useState } from 'react';
import { Scale, Settings } from 'lucide-react';
import { getSetting, setSetting } from '@/lib/db';
import { formatKRW } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { StockMarket, PortfolioSummary } from '@/types';

interface RebalancingWidgetProps {
  portfolio: PortfolioSummary;
}

const MARKETS: StockMarket[] = ['국내', '미국', '중국', 'ETF', '코인', '기타'];
const MARKET_COLORS: Record<StockMarket, string> = {
  '국내': 'bg-blue-500',
  '미국': 'bg-emerald-500',
  '중국': 'bg-red-500',
  'ETF': 'bg-purple-500',
  '코인': 'bg-amber-500',
  '기타': 'bg-slate-500',
};

// 사용자가 설정한 목표 비중과 현재 비중을 비교.
// 편차 ≥ 5%p 이면 리밸런싱 힌트 표시.
export function RebalancingWidget({ portfolio }: RebalancingWidgetProps) {
  const [targets, setTargets] = useState<Record<StockMarket, number>>({
    '국내': 30, '미국': 40, '중국': 0, 'ETF': 20, '코인': 10, '기타': 0,
  });
  const [editing, setEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getSetting<Record<StockMarket, number> | null>('rebalanceTargets', null);
      if (saved) setTargets({ ...targets, ...saved });
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentAllocation = useMemo(() => {
    const map: Record<string, number> = {};
    portfolio.activeHoldings.forEach((h) => {
      map[h.market] = (map[h.market] || 0) + h.valuation;
    });
    const total = portfolio.totalValuation || 1;
    const result: Record<StockMarket, number> = {
      '국내': 0, '미국': 0, '중국': 0, 'ETF': 0, '코인': 0, '기타': 0,
    };
    MARKETS.forEach((m) => {
      result[m] = ((map[m] || 0) / total) * 100;
    });
    return result;
  }, [portfolio]);

  const totalValuation = portfolio.totalValuation;
  const targetSum = MARKETS.reduce((s, m) => s + (targets[m] || 0), 0);

  const rows = MARKETS.filter((m) => targets[m] > 0 || currentAllocation[m] > 0)
    .map((m) => {
      const current = currentAllocation[m];
      const target = targets[m] || 0;
      const diff = current - target;
      const currentAmount = (current / 100) * totalValuation;
      const targetAmount = (target / 100) * totalValuation;
      const adjustAmount = targetAmount - currentAmount;
      return { market: m, current, target, diff, currentAmount, targetAmount, adjustAmount };
    });

  const saveTargets = async (newTargets: Record<StockMarket, number>) => {
    setTargets(newTargets);
    await setSetting('rebalanceTargets', newTargets);
  };

  if (totalValuation === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">리밸런싱 힌트</h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3">
          보유 종목이 등록되면 비중 분석을 보여드려요
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">리밸런싱 힌트</h3>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {editing && loaded && (
        <div className="mb-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 space-y-2">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            목표 비중 (%) · 합계 {targetSum}%
          </p>
          {MARKETS.map((m) => (
            <div key={m} className="flex items-center gap-2">
              <span className="text-xs w-10 text-slate-600 dark:text-slate-300">{m}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={targets[m]}
                onChange={(e) =>
                  saveTargets({ ...targets, [m]: Number(e.target.value) })
                }
                className="flex-1 px-2 py-1 rounded border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm"
              />
              <span className="text-[10px] text-slate-400 w-6">%</span>
            </div>
          ))}
          {targetSum !== 100 && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              ⚠ 합계가 100%가 아니에요 (현재 {targetSum}%)
            </p>
          )}
        </div>
      )}

      {/* 비중 비교 bars */}
      <div className="space-y-2.5">
        {rows.map((r) => {
          const isOver = r.diff > 5;
          const isUnder = r.diff < -5;
          const isBalanced = !isOver && !isUnder;
          return (
            <div key={r.market}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full', MARKET_COLORS[r.market])} />
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{r.market}</span>
                </span>
                <span className="tabular-nums text-slate-500 dark:text-slate-400">
                  {r.current.toFixed(1)}% / 목표 {r.target}%
                </span>
              </div>

              {/* 목표 대비 현재 비중 bar */}
              <div className="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'absolute top-0 left-0 h-full transition-all',
                    isOver ? 'bg-red-400' : isUnder ? 'bg-amber-400' : 'bg-emerald-400'
                  )}
                  style={{ width: `${Math.min(r.current, 100)}%` }}
                />
                {r.target > 0 && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-slate-600 dark:bg-slate-300"
                    style={{ left: `${r.target}%` }}
                    title={`목표 ${r.target}%`}
                  />
                )}
              </div>

              {/* 조정 힌트 */}
              {!isBalanced && (
                <p
                  className={cn(
                    'text-[10px] mt-0.5',
                    isOver ? 'text-red-500' : 'text-amber-500'
                  )}
                >
                  {isOver
                    ? `${Math.abs(r.diff).toFixed(1)}%p 초과 · ${formatKRW(Math.abs(Math.round(r.adjustAmount)))} 줄이면 균형`
                    : `${Math.abs(r.diff).toFixed(1)}%p 부족 · ${formatKRW(Math.abs(Math.round(r.adjustAmount)))} 추가하면 균형`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 leading-snug">
        톱니 아이콘으로 목표 비중을 조정하세요. 편차 ±5%p 이상이면 노란/빨간색으로 표시됩니다.
      </p>
    </div>
  );
}
