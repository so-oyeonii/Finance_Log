'use client';

import { useMemo } from 'react';
import { Receipt, Info } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import type { Stock } from '@/types';

interface CapitalGainsTaxWidgetProps {
  stocks: Stock[];
  selectedYear: string;
}

// 해외주식 양도소득세 = (실현 양도차익 - 250만원 기본공제) × 22%
// 국내주식은 대주주 아닌 한 비과세라 제외.
// 단순 추정용이며 실제 신고는 국세청 HTS 확인 필요 (안내 문구 필수).
export function CapitalGainsTaxWidget({ stocks, selectedYear }: CapitalGainsTaxWidgetProps) {
  const { realized, taxEstimate, overseasSells, deduction } = useMemo(() => {
    // 연도 내 매도 거래 중 해외(미국/중국/ETF-USD 기준)만
    const sells = stocks.filter(
      (s) =>
        s.type === 'sell' &&
        s.date.startsWith(selectedYear) &&
        (s.market === '미국' || s.market === '중국' || (s.market === 'ETF' && s.currency === 'USD'))
    );

    // 종목별로 평단을 추정하기 위해 해당 종목 전체 매수 평단 사용
    const gainPerSell = sells.map((sell) => {
      const priorBuys = stocks
        .filter(
          (s) =>
            s.type === 'buy' &&
            s.market === sell.market &&
            s.ticker === sell.ticker &&
            new Date(s.date).getTime() <= new Date(sell.date).getTime()
        );
      const totalBuyCost = priorBuys.reduce((sum, b) => sum + b.price * b.quantity, 0);
      const totalBuyQty = priorBuys.reduce((sum, b) => sum + b.quantity, 0);
      const avg = totalBuyQty > 0 ? totalBuyCost / totalBuyQty : 0;
      const gain = (sell.price - avg) * sell.quantity;
      return gain;
    });

    const totalGain = gainPerSell.reduce((s, g) => s + g, 0);
    const basic = 2_500_000; // 250만원 기본공제
    const taxable = Math.max(0, totalGain - basic);
    const tax = Math.round(taxable * 0.22); // 양도세 20% + 지방세 2% = 22%

    return {
      realized: totalGain,
      taxEstimate: tax,
      overseasSells: sells.length,
      deduction: basic,
    };
  }, [stocks, selectedYear]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="w-4 h-4 text-rose-500" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          해외주식 양도세 예상 ({selectedYear}년)
        </h3>
      </div>

      {overseasSells === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-3">
          올해 해외주식 매도 내역이 없어요
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400">실현손익</p>
              <p
                className={`text-xs font-bold tabular-nums ${
                  realized >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                }`}
              >
                {formatKRW(Math.round(realized))}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400">기본공제</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                {formatKRW(deduction)}
              </p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/30 rounded-lg p-2 text-center">
              <p className="text-[10px] text-rose-600/70 dark:text-rose-400/70">예상 세액</p>
              <p className="text-xs font-bold text-rose-700 dark:text-rose-300 tabular-nums">
                {formatKRW(taxEstimate)}
              </p>
            </div>
          </div>

          <div className="flex gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 dark:text-amber-200 leading-relaxed">
              (실현손익 − 기본공제 250만원) × 22%로 계산한 <b>참고용 추정치</b>입니다.
              실제 신고는 다음해 5월 홈택스 종합소득세 신고 기간에 확정. 손실 이월, 종목별 수수료는
              반영되지 않습니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
