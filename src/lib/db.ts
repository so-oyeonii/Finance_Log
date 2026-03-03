import Dexie, { type EntityTable } from 'dexie';
import type {
  Account, Transaction, Stock, StockPrice,
  Savings, RecurringTransaction, AppSettings
} from '@/types';

// ============================================
// Local Database (IndexedDB via Dexie.js)
// ============================================
// 모든 데이터는 브라우저 IndexedDB에 저장됩니다.
// 서버/클라우드 없이 완전히 로컬에서 동작합니다.
// Supabase 동기화는 선택적으로 추가 가능합니다.

class SmartLedgerDB extends Dexie {
  accounts!: EntityTable<Account, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  stocks!: EntityTable<Stock, 'id'>;
  stockPrices!: EntityTable<StockPrice, 'key'>;
  savings!: EntityTable<Savings, 'id'>;
  recurring!: EntityTable<RecurringTransaction, 'id'>;
  settings!: EntityTable<AppSettings, 'key'>;

  constructor() {
    super('SmartLedgerDB');

    this.version(1).stores({
      accounts: '++id, bank, name, type, createdAt',
      transactions: '++id, date, type, category, accountId, recurringId, createdAt',
      stocks: '++id, date, market, ticker, type, accountId, createdAt',
      stockPrices: 'key',
      savings: '++id, type, name, createdAt',
      recurring: '++id, type, isActive, nextDate',
      settings: 'key',
    });
  }
}

export const db = new SmartLedgerDB();

// ============================================
// Helper: Get/Set Settings
// ============================================

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const row = await db.settings.get(key);
  if (!row) return defaultValue;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({ key, value: JSON.stringify(value) });
}

// ============================================
// Helper: Export / Import All Data (JSON backup)
// ============================================

export async function exportAllData() {
  const [accounts, transactions, stocks, stockPrices, savings, recurring, settings] =
    await Promise.all([
      db.accounts.toArray(),
      db.transactions.toArray(),
      db.stocks.toArray(),
      db.stockPrices.toArray(),
      db.savings.toArray(),
      db.recurring.toArray(),
      db.settings.toArray(),
    ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { accounts, transactions, stocks, stockPrices, savings, recurring, settings },
  };
}

// ============================================
// Helper: Validate Backup Data
// ============================================

const TABLE_NAMES = ['accounts', 'transactions', 'stocks', 'stockPrices', 'savings', 'recurring', 'settings'] as const;

export function validateBackupData(json: unknown): {
  valid: boolean;
  error?: string;
  counts?: Record<string, number>;
} {
  if (!json || typeof json !== 'object') {
    return { valid: false, error: '유효한 JSON 객체가 아닙니다.' };
  }

  const obj = json as Record<string, unknown>;

  if (!obj.data || typeof obj.data !== 'object') {
    return { valid: false, error: 'data 필드가 없습니다.' };
  }

  const data = obj.data as Record<string, unknown>;
  const counts: Record<string, number> = {};

  for (const table of TABLE_NAMES) {
    const arr = data[table];
    if (arr !== undefined && !Array.isArray(arr)) {
      return { valid: false, error: `${table} 필드가 배열이 아닙니다.` };
    }
    counts[table] = Array.isArray(arr) ? arr.length : 0;
  }

  return { valid: true, counts };
}

export async function importAllData(backup: Awaited<ReturnType<typeof exportAllData>>) {
  await db.transaction('rw',
    [db.accounts, db.transactions, db.stocks,
    db.stockPrices, db.savings, db.recurring, db.settings],
    async () => {
      // Clear all tables
      await Promise.all([
        db.accounts.clear(),
        db.transactions.clear(),
        db.stocks.clear(),
        db.stockPrices.clear(),
        db.savings.clear(),
        db.recurring.clear(),
        db.settings.clear(),
      ]);

      // Bulk insert
      const d = backup.data;
      if (d.accounts?.length) await db.accounts.bulkAdd(d.accounts);
      if (d.transactions?.length) await db.transactions.bulkAdd(d.transactions);
      if (d.stocks?.length) await db.stocks.bulkAdd(d.stocks);
      if (d.stockPrices?.length) await db.stockPrices.bulkAdd(d.stockPrices);
      if (d.savings?.length) await db.savings.bulkAdd(d.savings);
      if (d.recurring?.length) await db.recurring.bulkAdd(d.recurring);
      if (d.settings?.length) await db.settings.bulkAdd(d.settings);
    }
  );
}
