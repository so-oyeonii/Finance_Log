import { getSupabaseClient } from './supabase';
import { db, setSetting, getSetting } from './db';
import type {
  Account, Transaction, Stock, StockPrice,
  Savings, RecurringTransaction
} from '@/types';

// ============================================
// Cloud Sync Engine
// ============================================
// Strategy: Full-table replacement per table.
// Personal finance app with small data — simple & conflict-free.

export type SyncStatus = 'idle' | 'pushing' | 'pulling' | 'error';

export async function pushToCloud(userId: string): Promise<void> {
  const client = await getSupabaseClient();
  if (!client) throw new Error('Supabase not configured');

  // Read all local data
  const [accounts, transactions, stocks, stockPrices, savings, recurring] =
    await Promise.all([
      db.accounts.toArray(),
      db.transactions.toArray(),
      db.stocks.toArray(),
      db.stockPrices.toArray(),
      db.savings.toArray(),
      db.recurring.toArray(),
    ]);

  // Delete existing cloud data for this user, then insert fresh
  // Using a sequential approach per table for clarity

  // 1. Accounts
  await client.from('sl_accounts').delete().eq('user_id', userId);
  if (accounts.length > 0) {
    const rows = accounts.map((a: Account) => ({
      user_id: userId,
      local_id: a.id!,
      bank: a.bank,
      name: a.name,
      type: a.type,
      balance: a.balance,
      principal: a.principal,
      created_at: a.createdAt,
      updated_at: a.updatedAt,
    }));
    const { error } = await client.from('sl_accounts').insert(rows);
    if (error) throw new Error(`accounts push failed: ${error.message}`);
  }

  // 2. Transactions
  await client.from('sl_transactions').delete().eq('user_id', userId);
  if (transactions.length > 0) {
    const rows = transactions.map((t: Transaction) => ({
      user_id: userId,
      local_id: t.id!,
      date: t.date,
      type: t.type,
      category: t.category,
      amount: t.amount,
      memo: t.memo,
      account_id: t.accountId,
      to_account_id: t.toAccountId ?? null,
      is_dutch_pay: t.isDutchPay,
      total_amount: t.totalAmount ?? null,
      people_count: t.peopleCount ?? null,
      recurring_id: t.recurringId ?? null,
      created_at: t.createdAt,
    }));
    const { error } = await client.from('sl_transactions').insert(rows);
    if (error) throw new Error(`transactions push failed: ${error.message}`);
  }

  // 3. Stocks
  await client.from('sl_stocks').delete().eq('user_id', userId);
  if (stocks.length > 0) {
    const rows = stocks.map((s: Stock) => ({
      user_id: userId,
      local_id: s.id!,
      date: s.date,
      market: s.market,
      ticker: s.ticker,
      type: s.type,
      currency: s.currency,
      price: s.price,
      input_price: s.inputPrice ?? null,
      exchange_rate: s.exchangeRate ?? null,
      quantity: s.quantity,
      memo: s.memo,
      account_id: s.accountId,
      is_initial: s.isInitial,
      created_at: s.createdAt,
    }));
    const { error } = await client.from('sl_stocks').insert(rows);
    if (error) throw new Error(`stocks push failed: ${error.message}`);
  }

  // 4. Stock Prices
  await client.from('sl_stock_prices').delete().eq('user_id', userId);
  if (stockPrices.length > 0) {
    const rows = stockPrices.map((sp: StockPrice) => ({
      user_id: userId,
      key: sp.key,
      price: sp.price,
      updated_at: sp.updatedAt,
    }));
    const { error } = await client.from('sl_stock_prices').insert(rows);
    if (error) throw new Error(`stockPrices push failed: ${error.message}`);
  }

  // 5. Savings
  await client.from('sl_savings').delete().eq('user_id', userId);
  if (savings.length > 0) {
    const rows = savings.map((s: Savings) => ({
      user_id: userId,
      local_id: s.id!,
      type: s.type,
      name: s.name,
      amount: s.amount,
      rate: s.rate,
      term: s.term,
      start_date: s.startDate,
      created_at: s.createdAt,
    }));
    const { error } = await client.from('sl_savings').insert(rows);
    if (error) throw new Error(`savings push failed: ${error.message}`);
  }

  // 6. Recurring
  await client.from('sl_recurring').delete().eq('user_id', userId);
  if (recurring.length > 0) {
    const rows = recurring.map((r: RecurringTransaction) => ({
      user_id: userId,
      local_id: r.id!,
      type: r.type,
      category: r.category,
      amount: r.amount,
      frequency: r.frequency,
      next_date: r.nextDate,
      account_id: r.accountId,
      is_active: r.isActive,
      memo: r.memo,
      created_at: r.createdAt,
    }));
    const { error } = await client.from('sl_recurring').insert(rows);
    if (error) throw new Error(`recurring push failed: ${error.message}`);
  }

  await setSetting('lastSyncedAt', new Date().toISOString());
}

export async function pullFromCloud(userId: string): Promise<void> {
  const client = await getSupabaseClient();
  if (!client) throw new Error('Supabase not configured');

  // Fetch all cloud data
  const [
    { data: accounts, error: e1 },
    { data: transactions, error: e2 },
    { data: stocks, error: e3 },
    { data: stockPrices, error: e4 },
    { data: savings, error: e5 },
    { data: recurring, error: e6 },
  ] = await Promise.all([
    client.from('sl_accounts').select('*').eq('user_id', userId),
    client.from('sl_transactions').select('*').eq('user_id', userId),
    client.from('sl_stocks').select('*').eq('user_id', userId),
    client.from('sl_stock_prices').select('*').eq('user_id', userId),
    client.from('sl_savings').select('*').eq('user_id', userId),
    client.from('sl_recurring').select('*').eq('user_id', userId),
  ]);

  const firstError = e1 || e2 || e3 || e4 || e5 || e6;
  if (firstError) throw new Error(`pull failed: ${firstError.message}`);

  // Preserve settings (local-only)
  const settings = await db.settings.toArray();

  await db.transaction('rw',
    [db.accounts, db.transactions, db.stocks, db.stockPrices, db.savings, db.recurring, db.settings],
    async () => {
      await Promise.all([
        db.accounts.clear(),
        db.transactions.clear(),
        db.stocks.clear(),
        db.stockPrices.clear(),
        db.savings.clear(),
        db.recurring.clear(),
        db.settings.clear(),
      ]);

      // Restore settings first
      if (settings.length) await db.settings.bulkAdd(settings);

      // Map cloud data back to local format
      if (accounts?.length) {
        await db.accounts.bulkAdd(accounts.map((a) => ({
          id: a.local_id as number,
          bank: a.bank as string,
          name: a.name as string,
          type: a.type as Account['type'],
          balance: Number(a.balance),
          principal: Number(a.principal),
          createdAt: a.created_at as string,
          updatedAt: a.updated_at as string,
        })));
      }

      if (transactions?.length) {
        await db.transactions.bulkAdd(transactions.map((t) => ({
          id: t.local_id as number,
          date: t.date as string,
          type: t.type as Transaction['type'],
          category: t.category as string,
          amount: Number(t.amount),
          memo: t.memo as string,
          accountId: t.account_id as number,
          toAccountId: t.to_account_id as number | undefined,
          isDutchPay: t.is_dutch_pay as boolean,
          totalAmount: t.total_amount != null ? Number(t.total_amount) : undefined,
          peopleCount: t.people_count as number | undefined,
          recurringId: t.recurring_id as number | undefined,
          createdAt: t.created_at as string,
        })));
      }

      if (stocks?.length) {
        await db.stocks.bulkAdd(stocks.map((s) => ({
          id: s.local_id as number,
          date: s.date as string,
          market: s.market as Stock['market'],
          ticker: s.ticker as string,
          type: s.type as Stock['type'],
          currency: s.currency as Stock['currency'],
          price: Number(s.price),
          inputPrice: s.input_price != null ? Number(s.input_price) : undefined,
          exchangeRate: s.exchange_rate != null ? Number(s.exchange_rate) : undefined,
          quantity: Number(s.quantity),
          memo: s.memo as string,
          accountId: s.account_id as number,
          isInitial: s.is_initial as boolean,
          createdAt: s.created_at as string,
        })));
      }

      if (stockPrices?.length) {
        await db.stockPrices.bulkAdd(stockPrices.map((sp) => ({
          key: sp.key as string,
          price: Number(sp.price),
          updatedAt: sp.updated_at as string,
        })));
      }

      if (savings?.length) {
        await db.savings.bulkAdd(savings.map((s) => ({
          id: s.local_id as number,
          type: s.type as Savings['type'],
          name: s.name as string,
          amount: Number(s.amount),
          rate: Number(s.rate),
          term: s.term as number,
          startDate: s.start_date as string,
          createdAt: s.created_at as string,
        })));
      }

      if (recurring?.length) {
        await db.recurring.bulkAdd(recurring.map((r) => ({
          id: r.local_id as number,
          type: r.type as RecurringTransaction['type'],
          category: r.category as string,
          amount: Number(r.amount),
          frequency: r.frequency as RecurringTransaction['frequency'],
          nextDate: r.next_date as string,
          accountId: r.account_id as number,
          isActive: r.is_active as boolean,
          memo: r.memo as string,
          createdAt: r.created_at as string,
        })));
      }
    }
  );

  await setSetting('lastSyncedAt', new Date().toISOString());
}

export async function getLastSyncedAt(): Promise<string | null> {
  return getSetting<string | null>('lastSyncedAt', null);
}
