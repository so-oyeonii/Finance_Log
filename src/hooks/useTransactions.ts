import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/lib/db';
import { useAccounts } from './useAccounts';
import { useAppStore } from '@/stores/useAppStore';
import { computeIncomeInsights } from '@/lib/incomeStats';
import type { Transaction, TransactionType, MonthlyStat } from '@/types';

// ============================================
// useTransactions Hook
// ============================================

export function useTransactions(selectedYear: string) {
  const allTransactions = useLiveQuery(() => db.transactions.toArray()) ?? [];
  const { updateBalance } = useAccounts();

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

  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const id = await db.transactions.add({
      ...data,
      createdAt: new Date().toISOString(),
    });

    // Update account balances
    if (data.type === 'income') {
      await updateBalance(data.accountId, data.amount, true);
    } else if (data.type === 'expense') {
      await updateBalance(data.accountId, -data.amount, true);
    } else if (data.type === 'transfer' && data.toAccountId) {
      await updateBalance(data.accountId, -data.amount, true);
      await updateBalance(data.toAccountId, data.amount, true);
    }

    return id;
  };

  const deleteTransaction = async (id: number) => {
    const target = await db.transactions.get(id);
    if (!target) return;

    // Reverse account balance changes
    if (target.type === 'income') {
      await updateBalance(target.accountId, -target.amount, true);
    } else if (target.type === 'expense') {
      await updateBalance(target.accountId, target.amount, true);
    } else if (target.type === 'transfer' && target.toAccountId) {
      await updateBalance(target.accountId, target.amount, true);
      await updateBalance(target.toAccountId, -target.amount, true);
    }

    await db.transactions.delete(id);
  };

  const updateTransaction = async (id: number, newData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const old = await db.transactions.get(id);
    if (!old) return;

    // Reverse old balance changes
    if (old.type === 'income') await updateBalance(old.accountId, -old.amount, true);
    else if (old.type === 'expense') await updateBalance(old.accountId, old.amount, true);
    else if (old.type === 'transfer' && old.toAccountId) {
      await updateBalance(old.accountId, old.amount, true);
      await updateBalance(old.toAccountId, -old.amount, true);
    }

    // Apply new data
    await db.transactions.update(id, newData);

    // Apply new balance changes
    if (newData.type === 'income') await updateBalance(newData.accountId, newData.amount, true);
    else if (newData.type === 'expense') await updateBalance(newData.accountId, -newData.amount, true);
    else if (newData.type === 'transfer' && newData.toAccountId) {
      await updateBalance(newData.accountId, -newData.amount, true);
      await updateBalance(newData.toAccountId, newData.amount, true);
    }
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
