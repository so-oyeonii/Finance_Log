'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { RecurringTransaction } from '@/types';

export function useRecurring() {
  const recurring = useLiveQuery(() => db.recurring.toArray()) ?? [];

  const activeRecurring = recurring.filter((r) => r.isActive);

  const addRecurring = async (data: Omit<RecurringTransaction, 'id' | 'createdAt'>) => {
    await db.recurring.add({
      ...data,
      createdAt: new Date().toISOString(),
    });
  };

  const updateRecurring = async (id: number, data: Partial<RecurringTransaction>) => {
    await db.recurring.update(id, data);
  };

  const deleteRecurring = async (id: number) => {
    await db.recurring.delete(id);
  };

  const toggleActive = async (id: number) => {
    const item = await db.recurring.get(id);
    if (item) {
      await db.recurring.update(id, { isActive: !item.isActive });
    }
  };

  return {
    recurring,
    activeRecurring,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
  };
}
