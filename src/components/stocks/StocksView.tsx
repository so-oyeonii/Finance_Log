'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStocks } from '@/hooks/useStocks';
import { useAccounts } from '@/hooks/useAccounts';
import { useAppStore } from '@/stores/useAppStore';
import { PortfolioSummary } from './PortfolioSummary';
import { HoldingsList } from './HoldingsList';
import { StockFormModal } from './StockFormModal';
import { StockTransactionList } from './StockTransactionList';
import { PortfolioChart } from './PortfolioChart';
import { DividendSection } from './DividendSection';
import { PriceUpdateModal } from './PriceUpdateModal';
import { StockScanButton } from './StockScanButton';
import { StockBulkTextButton } from './StockBulkTextButton';
import { StockCsvButton } from './StockCsvButton';
import { StockScanResultModal } from './StockScanResultModal';
import { PriceRefreshButton } from './PriceRefreshButton';
import { DeleteConfirmModal } from '@/components/assets/DeleteConfirmModal';
import type { Stock, Holding, StockMarket, Currency } from '@/types';
import { cn } from '@/lib/utils';

type SubTab = 'portfolio' | 'transactions' | 'dividends';

export function StocksView() {
  const { mode, selectedYear } = useAppStore();
  const {
    stocks,
    portfolio,
    portfolioByMarket,
    dividendStats,
    addStock,
    deleteStock,
    updatePrice,
  } = useStocks(selectedYear);
  const { accounts } = useAccounts();

  const isGraduate = mode === 'graduate';

  const [subTab, setSubTab] = useState<SubTab>('portfolio');
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Stock | null>(null);
  const [priceUpdateTarget, setPriceUpdateTarget] = useState<Holding | null>(null);
  const [scanResult, setScanResult] = useState<
    { market: string; ticker: string; quantity: number; avgPrice: number; currency: 'KRW' | 'USD'; inputPrice?: number }[] | null
  >(null);

  const handleAddStock = async (data: Omit<Stock, 'id' | 'createdAt'>) => {
    await addStock(data);
    setShowForm(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget?.id) {
      await deleteStock(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const handlePriceUpdate = async (key: string, price: number) => {
    await updatePrice(key, price);
    setPriceUpdateTarget(null);
  };

  // 스크린샷에서 추출된 보유 종목을 isInitial=true 로 일괄 저장한다.
  // 기준일 스냅샷: 오늘 날짜의 "buy" 거래로 기록하되 isInitial 플래그로 구분.
  const handleScanSave = async (
    items: {
      market: StockMarket;
      ticker: string;
      quantity: number;
      avgPrice: number;
      currency: Currency;
      inputPrice?: number;
      accountId: number;
    }[]
  ) => {
    const today = new Date().toISOString().split('T')[0];
    for (const it of items) {
      await addStock({
        date: today,
        market: it.market,
        ticker: it.ticker,
        type: 'buy',
        currency: it.currency,
        price: it.avgPrice,
        inputPrice: it.inputPrice,
        quantity: it.quantity,
        memo: '초기 보유 (스냅샷)',
        accountId: it.accountId,
        isInitial: true,
      });
    }
    setScanResult(null);
  };

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'portfolio', label: '포트폴리오' },
    { key: 'transactions', label: '거래내역' },
    { key: 'dividends', label: '배당금' },
  ];

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Hero */}
      <PortfolioSummary portfolio={portfolio} mode={mode} />

      {/* Bulk initial holdings: screenshot / natural language / CSV */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <StockScanButton mode={mode} onResult={(h) => setScanResult(h)} />
        <StockBulkTextButton mode={mode} onResult={(h) => setScanResult(h)} />
        <StockCsvButton mode={mode} onResult={(h) => setScanResult(h)} />
      </div>

      {/* Current price auto-update */}
      <PriceRefreshButton mode={mode} holdings={portfolio.activeHoldings} />

      {/* Sub Tab Toggle */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={cn(
              'flex-1 py-2 rounded-md text-xs font-medium transition-colors',
              subTab === tab.key
                ? `bg-white dark:bg-slate-800 shadow-sm ${isGraduate ? 'text-indigo-600' : 'text-emerald-600'}`
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Portfolio Tab */}
      {subTab === 'portfolio' && (
        <>
          <PortfolioChart data={portfolioByMarket} mode={mode} />
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">보유 종목</h2>
              <button
                onClick={() => setShowForm(true)}
                className={cn(
                  'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white transition-colors',
                  isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                거래 추가
              </button>
            </div>
            <HoldingsList
              holdings={portfolio.activeHoldings}
              onPriceUpdate={setPriceUpdateTarget}
            />
          </div>
        </>
      )}

      {/* Transactions Tab */}
      {subTab === 'transactions' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">거래 내역</h2>
            <button
              onClick={() => setShowForm(true)}
              className={cn(
                'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white transition-colors',
                isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              거래 추가
            </button>
          </div>
          <StockTransactionList
            stocks={stocks.filter((s) => s.date.startsWith(selectedYear))}
            accounts={accounts}
            onDelete={(stock) => setDeleteTarget(stock)}
          />
        </div>
      )}

      {/* Dividends Tab */}
      {subTab === 'dividends' && (
        <DividendSection dividendStats={dividendStats} mode={mode} />
      )}

      {/* Stock Form Modal */}
      {showForm && (
        <StockFormModal
          accounts={accounts}
          mode={mode}
          onSubmit={handleAddStock}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Price Update Modal */}
      {priceUpdateTarget && (
        <PriceUpdateModal
          holding={priceUpdateTarget}
          onConfirm={handlePriceUpdate}
          onCancel={() => setPriceUpdateTarget(null)}
        />
      )}

      {/* Stock Scan Result Modal */}
      {scanResult && (
        <StockScanResultModal
          scannedHoldings={scanResult}
          accounts={accounts}
          mode={mode}
          defaultDate={new Date().toISOString().split('T')[0]}
          onSave={handleScanSave}
          onClose={() => setScanResult(null)}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="거래 삭제"
          message={`"${deleteTarget.ticker} ${deleteTarget.type === 'buy' ? '매수' : deleteTarget.type === 'sell' ? '매도' : '배당'}" 거래를 삭제하시겠습니까?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
