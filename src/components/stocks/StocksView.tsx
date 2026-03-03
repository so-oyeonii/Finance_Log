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
import { DeleteConfirmModal } from '@/components/assets/DeleteConfirmModal';
import type { Stock, Holding } from '@/types';
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

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'portfolio', label: '포트폴리오' },
    { key: 'transactions', label: '거래내역' },
    { key: 'dividends', label: '배당금' },
  ];

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Hero */}
      <PortfolioSummary portfolio={portfolio} mode={mode} />

      {/* Sub Tab Toggle */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={cn(
              'flex-1 py-2 rounded-md text-xs font-medium transition-colors',
              subTab === tab.key
                ? `bg-white shadow-sm ${isGraduate ? 'text-indigo-600' : 'text-emerald-600'}`
                : 'text-slate-400 hover:text-slate-600'
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
              <h2 className="text-sm font-bold text-slate-700">보유 종목</h2>
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
            <h2 className="text-sm font-bold text-slate-700">거래 내역</h2>
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
