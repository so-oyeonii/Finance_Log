import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/lib/db';
import type { Account, AccountType } from '@/types';

// ============================================
// useAccounts Hook
// ============================================

export function useAccounts() {
  const accounts = useLiveQuery(() => db.accounts.toArray()) ?? [];

  // Group accounts by bank
  const groupedAccounts = useMemo(() => {
    const groups: Record<string, Account[]> = {};
    accounts.forEach((acc) => {
      const bankName = acc.bank || '기타';
      if (!groups[bankName]) groups[bankName] = [];
      groups[bankName].push(acc);
    });
    return groups;
  }, [accounts]);

  // Total balance (excluding credit cards)
  const totalBalance = useMemo(
    () => accounts.filter((a) => a.type !== '신용카드').reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  );

  const addAccount = async (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    return db.accounts.add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  };

  const updateAccount = async (id: number, data: Partial<Account>) => {
    return db.accounts.update(id, { ...data, updatedAt: new Date().toISOString() });
  };

  const deleteAccount = async (id: number) => {
    return db.accounts.delete(id);
  };

  const updateBalance = async (id: number, delta: number, isPrincipalChange = false) => {
    const acc = await db.accounts.get(id);
    if (!acc) return;

    const updates: Partial<Account> = {
      balance: acc.balance + delta,
      updatedAt: new Date().toISOString(),
    };

    if (isPrincipalChange && (acc.type === 'IRP/연금' || acc.type === '주식예수금')) {
      updates.principal = (acc.principal ?? acc.balance) + delta;
    }

    return db.accounts.update(id, updates);
  };

  return {
    accounts,
    groupedAccounts,
    totalBalance,
    addAccount,
    updateAccount,
    deleteAccount,
    updateBalance,
  };
}
