import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Savings } from '@/types';

// ============================================
// useSavings Hook
// ============================================

export function useSavings() {
  const savings = useLiveQuery(() => db.savings.toArray()) ?? [];

  const addSavings = async (data: Omit<Savings, 'id' | 'createdAt'>) => {
    return db.savings.add({
      ...data,
      createdAt: new Date().toISOString(),
    });
  };

  const deleteSavings = async (id: number) => {
    return db.savings.delete(id);
  };

  return { savings, addSavings, deleteSavings };
}
