import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/lib/db';
import { useAppStore } from '@/stores/useAppStore';
import { computeIncomeInsights } from '@/lib/incomeStats';
import type { Transaction, MonthlyStat } from '@/types';

// ============================================
// useTransactions Hook
// ============================================

export function useTransactions(selectedYear: string) {
  const allTransactions = useLiveQuery(() => db.transactions.toArray()) ?? [];

  // Year-filtered transactions
  const yearlyTransactions = useMemo(
    () => allTransactions.filter((t) => t.date.startsWith(selectedYear)),
    [allTransactions, selectedYear]
  );

  // Sorted (newest first)
  const sortedTransactions = useMemo(
    () => [...allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [allTransactions]
  );

  // Summary
  const summary = useMemo(() => {
    const income = yearlyTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = yearlyTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [yearlyTransactions]);

  // Expense by category
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    yearlyTransactions.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [yearlyTransactions]);

  // Monthly stats
  const monthlyStats = useMemo((): MonthlyStat[] => {
    const stats = Array.from({ length: 12 }, (_, i) => ({
      month: `${selectedYear}-${String(i + 1).padStart(2, '0')}`,
      label: `${i + 1}월`,
      income: 0,
      totalExpense: 0,
      incomeBreakdown: {} as Record<string, number>,
      expenseBreakdown: {} as Record<string, number>,
    }));

    yearlyTransactions.forEach((t) => {
      const idx = parseInt(t.date.slice(5, 7)) - 1;
      if (idx < 0 || idx >= 12) return;

      if (t.type === 'income') {
        stats[idx].income += t.amount;
        stats[idx].incomeBreakdown[t.category] = (stats[idx].incomeBreakdown[t.category] || 0) + t.amount;
      } else if (t.type === 'expense') {
        stats[idx].totalExpense += t.amount;
        stats[idx].expenseBreakdown[t.category] = (stats[idx].expenseBreakdown[t.category] || 0) + t.amount;
      }
    });

    return stats.map((item) => ({
      ...item,
      incomeBreakdown: Object.entries(item.incomeBreakdown)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount),
      expenseBreakdown: Object.entries(item.expenseBreakdown)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount),
    }));
  }, [yearlyTransactions, selectedYear]);

  // 수입 인사이트 (대학원생 불규칙 수입 분석용)
  const mode = useAppStore((s) => s.mode);
  const incomeInsights = useMemo(() => {
    const thisYear = String(new Date().getFullYear());
    const isCurrentYear = selectedYear === thisYear;
    return computeIncomeInsights(monthlyStats, mode, {
      isCurrentYear,
      currentMonthIdx: new Date().getMonth(),
    });
  }, [monthlyStats, mode, selectedYear]);

  // Available years
  const availableYears = useMemo(() => {
    const years = new Set(allTransactions.map((t) => t.date.slice(0, 4)));
    years.add(new Date().getFullYear().toString());
    return Array.from(years).sort().reverse();
  }, [allTransactions]);

  // --- CRUD ---

  const applyBalanceChange = async (
    data: Pick<Transaction, 'type' | 'accountId' | 'toAccountId' | 'amount'>,
    direction: 1 | -1
  ) => {
    const applyAccountDelta = async (accountId: number, delta: number) => {
      const account = await db.accounts.get(accountId);
      if (!account) return;

      const updates = {
        balance: account.balance + delta,
        updatedAt: new Date().toISOString(),
        ...((account.type === 'IRP/연금' || account.type === '주식예수금')
          ? { principal: (account.principal ?? account.balance) + delta }
          : {}),
      };

      await db.accounts.update(accountId, updates);
    };

    if (data.type === 'income') {
      await applyAccountDelta(data.accountId, data.amount * direction);
    } else if (data.type === 'expense') {
      await applyAccountDelta(data.accountId, -data.amount * direction);
    } else if (data.type === 'transfer' && data.toAccountId) {
      await applyAccountDelta(data.accountId, -data.amount * direction);
      await applyAccountDelta(data.toAccountId, data.amount * direction);
    }
  };

  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    return db.transaction('rw', [db.transactions, db.accounts], async () => {
      const id = await db.transactions.add({
        ...data,
        createdAt: new Date().toISOString(),
      });

      await applyBalanceChange(data, 1);
      return id;
    });
  };

  const deleteTransaction = async (id: number) => {
    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      const target = await db.transactions.get(id);
      if (!target) return;

      await applyBalanceChange(target, -1);
      await db.transactions.delete(id);
    });
  };

  const updateTransaction = async (id: number, newData: Omit<Transaction, 'id' | 'createdAt'>) => {
    await db.transaction('rw', [db.transactions, db.accounts], async () => {
      const old = await db.transactions.get(id);
      if (!old) return;

      await applyBalanceChange(old, -1);
      await db.transactions.update(id, newData);
      await applyBalanceChange(newData, 1);
    });
  };

  return {
    transactions: allTransactions,
    yearlyTransactions,
    sortedTransactions,
    summary,
    expenseByCategory,
    monthlyStats,
    incomeInsights,
    availableYears,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  };
}
