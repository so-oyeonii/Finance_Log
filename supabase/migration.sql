-- ============================================
-- Smart Ledger Pro — Supabase Migration
-- ============================================
-- Run this SQL in Supabase SQL Editor to set up cloud sync tables.
-- All tables use sl_ prefix to avoid conflicts.

-- 1. sl_accounts
CREATE TABLE sl_accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id integer NOT NULL,
  bank text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT '',
  balance numeric NOT NULL DEFAULT 0,
  principal numeric NOT NULL DEFAULT 0,
  created_at text NOT NULL DEFAULT '',
  updated_at text NOT NULL DEFAULT '',
  synced_at timestamptz DEFAULT now()
);

ALTER TABLE sl_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own accounts" ON sl_accounts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. sl_transactions
CREATE TABLE sl_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id integer NOT NULL,
  date text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  memo text NOT NULL DEFAULT '',
  account_id integer NOT NULL DEFAULT 0,
  to_account_id integer,
  is_dutch_pay boolean NOT NULL DEFAULT false,
  total_amount numeric,
  people_count integer,
  recurring_id integer,
  created_at text NOT NULL DEFAULT '',
  synced_at timestamptz DEFAULT now()
);

ALTER TABLE sl_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transactions" ON sl_transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. sl_stocks
CREATE TABLE sl_stocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id integer NOT NULL,
  date text NOT NULL DEFAULT '',
  market text NOT NULL DEFAULT '',
  ticker text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'KRW',
  price numeric NOT NULL DEFAULT 0,
  input_price numeric,
  exchange_rate numeric,
  quantity numeric NOT NULL DEFAULT 0,
  memo text NOT NULL DEFAULT '',
  account_id integer NOT NULL DEFAULT 0,
  is_initial boolean NOT NULL DEFAULT false,
  created_at text NOT NULL DEFAULT '',
  synced_at timestamptz DEFAULT now()
);

ALTER TABLE sl_stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own stocks" ON sl_stocks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. sl_stock_prices
CREATE TABLE sl_stock_prices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  updated_at text NOT NULL DEFAULT '',
  synced_at timestamptz DEFAULT now(),
  UNIQUE(user_id, key)
);

ALTER TABLE sl_stock_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own stock_prices" ON sl_stock_prices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. sl_savings
CREATE TABLE sl_savings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id integer NOT NULL,
  type text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  rate numeric NOT NULL DEFAULT 0,
  term integer NOT NULL DEFAULT 0,
  start_date text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT '',
  synced_at timestamptz DEFAULT now()
);

ALTER TABLE sl_savings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own savings" ON sl_savings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. sl_recurring
CREATE TABLE sl_recurring (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_id integer NOT NULL,
  type text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  frequency text NOT NULL DEFAULT 'monthly',
  next_date text NOT NULL DEFAULT '',
  account_id integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  memo text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT '',
  synced_at timestamptz DEFAULT now()
);

ALTER TABLE sl_recurring ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own recurring" ON sl_recurring
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for faster lookups
CREATE INDEX idx_sl_accounts_user ON sl_accounts(user_id);
CREATE INDEX idx_sl_transactions_user ON sl_transactions(user_id);
CREATE INDEX idx_sl_stocks_user ON sl_stocks(user_id);
CREATE INDEX idx_sl_stock_prices_user ON sl_stock_prices(user_id);
CREATE INDEX idx_sl_savings_user ON sl_savings(user_id);
CREATE INDEX idx_sl_recurring_user ON sl_recurring(user_id);
