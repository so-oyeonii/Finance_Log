// ============================================
// Number & Date Formatting Utilities
// ============================================

export const formatKRW = (amount: number): string =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);

export const formatUSD = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('ko-KR').format(num);

export const formatPercent = (num: number, decimals = 1): string =>
  `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export const getToday = (): string => new Date().toISOString().slice(0, 10);

export const getCurrentYear = (): string => new Date().getFullYear().toString();

export const getMonthLabel = (monthIndex: number): string => `${monthIndex + 1}월`;
