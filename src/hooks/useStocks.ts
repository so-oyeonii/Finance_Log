import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/lib/db';
import { calculatePortfolio } from '@/lib/calculations';
import { useAccounts } from './useAccounts';
import type { Stock, StockPrice, DividendStat } from '@/types';

// ============================================
// useStocks Hook
// ============================================

export function useStocks(selectedYear: string) {
  const allStocks = useLiveQuery(() => db.stocks.toArray()) ?? [];
  const allPrices = useLiveQuery(() => db.stockPrices.toArray()) ?? [];
  const { accounts } = useAccounts();

  // Convert prices array to Record
  const currentPrices = useMemo(() => {
    const map: Record<string, number> = {};
    allPrices.forEach((p) => { map[p.key] = p.price; });
    return map;
  }, [allPrices]);

  // Portfolio calculation
  const portfolio = useMemo(
    () => calculatePortfolio(allStocks, currentPrices, accounts),
    [allStocks, currentPrices, accounts]
  );

  // Portfolio by market
  const portfolioByMarket = useMemo(() => {
    const map: Record<string, number> = {};
    portfolio.activeHoldings.forEach((h) => {
      map[h.market] = (map[h.market] || 0) + h.valuation;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [portfolio]);

  // Dividend stats by month
  const dividendStats = useMemo(() => {
    const stats: DividendStat[] = Array.from({ length: 12 }, (_, i) => ({
      month: `${selectedYear}-${String(i + 1).padStart(2, '0')}`,
      label: `${i + 1}월`,
      totalDividend: 0,
      breakdown: [],
    }));

    allStocks
      .filter((s) => s.type === 'dividend' && s.date.startsWith(selectedYear))
      .forEach((d) => {
        const idx = parseInt(d.date.slice(5, 7)) - 1;
        if (idx >= 0 && idx < 12) {
          stats[idx].totalDividend += d.price;
          stats[idx].breakdown.push({ ticker: d.ticker, amount: d.price });
        }
      });

    // Merge duplicate tickers in breakdown
    const refined = stats.map((item) => {
      const obj: Record<string, number> = {};
      item.breakdown.forEach((b) => { obj[b.ticker] = (obj[b.ticker] || 0) + b.amount; });
      return {
        ...item,
        breakdown: Object.entries(obj)
          .map(([ticker, amount]) => ({ ticker, amount }))
          .sort((a, b) => b.amount - a.amount),
      };
    });

    const totalYearlyDiv = refined.reduce((sum, m) => sum + m.totalDividend, 0);
    return {
      monthlyData: refined,
      totalYearlyDiv,
      avgMonthlyDiv: Math.round(totalYearlyDiv / 12),
    };
  }, [allStocks, selectedYear]);

  // --- CRUD ---

  const getCashDelta = (data: Pick<Stock, 'type' | 'price' | 'quantity' | 'isInitial'>) => {
    if (data.isInitial) return 0;

    const amount = data.price * (data.type === 'dividend' ? 1 : data.quantity);
    if (data.type === 'buy') return -amount;
    if (data.type === 'sell' || data.type === 'dividend') return amount;
    return 0;
  };

  const applyAccountDelta = async (accountId: number, delta: number) => {
    if (delta === 0) return;

    const account = await db.accounts.get(accountId);
    if (!account) return;

    await db.accounts.update(accountId, {
      balance: account.balance + delta,
      updatedAt: new Date().toISOString(),
    });
  };

  const addStock = async (data: Omit<Stock, 'id' | 'createdAt'>) => {
    return db.transaction('rw', [db.stocks, db.stockPrices, db.accounts], async () => {
      const id = await db.stocks.add({
        ...data,
        createdAt: new Date().toISOString(),
      });

      if (data.type === 'buy') {
        const key = `${data.market}_${data.ticker}`;
        await db.stockPrices.put({
          key,
          price: data.price,
          updatedAt: new Date().toISOString(),
        });
      }

      await applyAccountDelta(data.accountId, getCashDelta(data));
      return id;
    });
  };

  const deleteStock = async (id: number) => {
    await db.transaction('rw', [db.stocks, db.accounts], async () => {
      const target = await db.stocks.get(id);
      if (!target) return;

      await applyAccountDelta(target.accountId, -getCashDelta(target));
      await db.stocks.delete(id);
    });
  };

  const updatePrice = async (key: string, price: number) => {
    await db.stockPrices.put({
      key,
      price,
      updatedAt: new Date().toISOString(),
    });
  };

  return {
    stocks: allStocks,
    currentPrices,
    portfolio,
    portfolioByMarket,
    dividendStats,
    addStock,
    deleteStock,
    updatePrice,
  };
}
