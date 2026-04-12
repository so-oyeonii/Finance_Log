import type { SavingsInfo, SavingsType, Stock, Account, Holding, PortfolioSummary } from '@/types';

// ============================================
// 예/적금 만기 계산
// ============================================

export function calculateSavingsInfo(
  type: SavingsType,
  amount: number,
  rate: number,
  term: number
): SavingsInfo {
  const r = rate / 100;
  const n = term;
  let principal = 0;
  let preTaxInterest = 0;

  if (type === '예금') {
    // 거치식: 원금 × 이율 × (기간/12)
    principal = amount;
    preTaxInterest = principal * r * (n / 12);
  } else {
    // 적립식: 월납입액 × n(n+1)/2 × (이율/12)
    principal = amount * n;
    preTaxInterest = amount * (n * (n + 1) / 2) * (r / 12);
  }

  const TAX_RATE = 0.154; // 이자소득세 15.4%
  const tax = preTaxInterest * TAX_RATE;
  const afterTaxInterest = preTaxInterest - tax;

  return {
    principal,
    preTaxInterest,
    tax,
    afterTaxInterest,
    maturityAmount: principal + afterTaxInterest,
  };
}

// ============================================
// 포트폴리오 계산
// ============================================

export function calculatePortfolio(
  stocks: Stock[],
  currentPrices: Record<string, number>,
  accounts: Account[]
): PortfolioSummary {
  const holdings: Record<string, {
    accountId: number;
    market: string;
    ticker: string;
    qty: number;
    avgPrice: number;
    totalCost: number;
    hasInitial: boolean;
  }> = {};

  let totalRealizedGain = 0;
  let totalDividends = 0;

  // Sort by date for correct avg price calculation
  const sorted = [...stocks].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sorted.forEach((s) => {
    const key = `${s.accountId}_${s.market}_${s.ticker}`;

    if (!holdings[key]) {
      holdings[key] = {
        accountId: s.accountId,
        market: s.market,
        ticker: s.ticker,
        qty: 0,
        avgPrice: 0,
        totalCost: 0,
        hasInitial: false,
      };
    }

    const h = holdings[key];

    if (s.type === 'buy') {
      const cost = s.price * s.quantity;
      h.totalCost += cost;
      h.qty += s.quantity;
      h.avgPrice = h.qty > 0 ? h.totalCost / h.qty : 0;
      if (s.isInitial) h.hasInitial = true;
    } else if (s.type === 'sell') {
      const costBasis = h.avgPrice * s.quantity;
      totalRealizedGain += (s.price * s.quantity) - costBasis;
      h.qty -= s.quantity;
      h.totalCost -= costBasis;
    } else if (s.type === 'dividend') {
      totalDividends += s.price;
    }
  });

  // Build active holdings with current prices
  const activeHoldings: Holding[] = Object.values(holdings)
    .filter((d) => d.qty > 0)
    .map((d) => {
      const priceKey = `${d.market}_${d.ticker}`;
      const currentPrice = currentPrices[priceKey] || d.avgPrice;
      const valuation = currentPrice * d.qty;
      const acc = accounts.find((a) => a.id === d.accountId);
      const accName = acc?.name || '삭제된 계좌';

      const totalDiv = stocks
        .filter((s) => s.type === 'dividend' && s.ticker === d.ticker)
        .reduce((sum, s) => sum + s.price, 0);
      const divYield = d.totalCost > 0 ? (totalDiv / d.totalCost) * 100 : 0;

      return {
        accountId: d.accountId,
        market: d.market as any,
        ticker: d.ticker,
        qty: d.qty,
        avgPrice: d.avgPrice,
        totalCost: d.totalCost,
        currentPrice,
        valuation,
        unrealizedGain: valuation - d.totalCost,
        returnRate: d.totalCost > 0 ? ((valuation - d.totalCost) / d.totalCost) * 100 : 0,
        totalDiv,
        divYield,
        accName,
        priceKey,
        hasInitial: d.hasInitial,
      };
    });

  const totalValuation = activeHoldings.reduce((acc, cur) => acc + cur.valuation, 0);
  const currentTotalInvested = activeHoldings.reduce((acc, cur) => acc + cur.totalCost, 0);

  return {
    activeHoldings,
    totalRealizedGain,
    totalDividends,
    totalValuation,
    totalUnrealizedGain: totalValuation - currentTotalInvested,
    totalDivYield: currentTotalInvested > 0 ? (totalDividends / currentTotalInvested) * 100 : 0,
  };
}
