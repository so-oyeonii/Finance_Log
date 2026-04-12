// ============================================
// Core Data Types
// ============================================

export type AppMode = 'graduate' | 'worker';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type AccountType =
  | '입출금' | '예적금' | '주택청약' | 'IRP/연금'
  | '주식예수금' | '비상금' | '신용카드' | '코인' | '기타';

export type StockMarket = '국내' | '미국' | '중국' | 'ETF' | '코인' | '기타';
export type StockTradeType = 'buy' | 'sell' | 'dividend';
export type Currency = 'KRW' | 'USD';
export type SavingsType = '예금' | '적금';

// ============================================
// Database Models (Dexie / IndexedDB)
// ============================================

export interface Account {
  id?: number;
  bank: string;
  name: string;
  type: AccountType;
  balance: number;
  principal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id?: number;
  date: string;            // YYYY-MM-DD
  type: TransactionType;
  category: string;
  amount: number;
  memo: string;
  accountId: number;
  toAccountId?: number;    // for transfers
  isDutchPay: boolean;
  totalAmount?: number;    // for dutch pay
  peopleCount?: number;    // for dutch pay
  recurringId?: number;
  createdAt: string;
}

export interface Stock {
  id?: number;
  date: string;
  market: StockMarket;
  ticker: string;
  type: StockTradeType;
  currency: Currency;
  price: number;           // KRW 기준 단가
  inputPrice?: number;     // 원래 입력 가격 (USD일 때)
  exchangeRate?: number;
  quantity: number;
  memo: string;
  accountId: number;
  isInitial: boolean;      // 초기 보유분 여부
  createdAt: string;
}

export interface StockPrice {
  key: string;             // `${market}_${ticker}`
  price: number;
  updatedAt: string;
}

export interface Savings {
  id?: number;
  type: SavingsType;
  name: string;
  amount: number;          // 예금: 거치금, 적금: 월납입액
  rate: number;            // 연이율 (%)
  term: number;            // 개월
  startDate: string;
  createdAt: string;
}

export interface RecurringTransaction {
  id?: number;
  type: TransactionType;
  category: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  nextDate: string;
  accountId: number;
  memo: string;
  isActive: boolean;
  createdAt: string;
}

export interface AppSettings {
  key: string;
  value: string;           // JSON stringified
}

// ============================================
// Computed / Derived Types
// ============================================

export interface Holding {
  accountId: number;
  market: StockMarket;
  ticker: string;
  qty: number;
  avgPrice: number;
  totalCost: number;
  currentPrice: number;
  valuation: number;
  unrealizedGain: number;
  returnRate: number;
  totalDiv: number;
  divYield: number;
  accName: string;
  priceKey: string;
  hasInitial: boolean;       // 기준일 스냅샷(초기 보유분)이 포함된 종목인지
}

export interface PortfolioSummary {
  activeHoldings: Holding[];
  totalRealizedGain: number;
  totalDividends: number;
  totalValuation: number;
  totalUnrealizedGain: number;
  totalDivYield: number;
}

export interface MonthlyStat {
  month: string;
  label: string;
  income: number;
  totalExpense: number;
  incomeBreakdown: { category: string; amount: number }[];
  expenseBreakdown: { category: string; amount: number }[];
}

export interface DividendStat {
  month: string;
  label: string;
  totalDividend: number;
  breakdown: { ticker: string; amount: number }[];
}

export interface SavingsInfo {
  principal: number;
  preTaxInterest: number;
  tax: number;
  afterTaxInterest: number;
  maturityAmount: number;
}

// ============================================
// API Types
// ============================================

export interface AiSmartInputRequest {
  text: string;
  accounts: { id: number; name: string }[];
  mode: AppMode;
}

export interface AiSmartInputResponse {
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  memo: string;
  isDutchPay: boolean;
  totalAmount?: number;
  peopleCount?: number;
  accountId?: number;
}

export interface IncomeStatsContext {
  activeAvg: number;
  median: number;
  cv: number;
  stabilityLabel: string;
  fixedMonthlyEstimate: number;
  lumpYearlyTotal: number;
  suggestedSpendLimit: number;
  forecast: { low: number; mid: number; high: number };
  bySource: { category: string; avg: number; stability: string; cv: number }[];
}

export interface AiChatRequest {
  message: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  context: {
    aiPersonality: string;
    totalAssets: number;
    monthlyExpense: number;
    accountSummary: string;
    incomeStats?: IncomeStatsContext;
  };
}

export interface AiAnalysisRequest {
  accounts: Account[];
  savings: Savings[];
  topExpenses: { name: string; value: number }[];
  portfolioGain: number;
  mode: AppMode;
  incomeStats?: IncomeStatsContext;
}

export interface AiAnalysisResponse {
  title: string;
  message: string;
  tips: string[];
}
