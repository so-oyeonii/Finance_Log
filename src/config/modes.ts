import type { AppMode, AccountType, StockMarket } from '@/types';

// ============================================
// Mode Definitions
// ============================================

export interface ModeConfig {
  label: string;
  icon: string;           // Lucide icon name
  colorScheme: string;    // Tailwind color prefix
  incomeCategories: string[];
  expenseCategories: string[];
  aiPersonality: string;
  greeting: string;
  defaultDashboardOrder: string[];
}

export const MODES: Record<AppMode, ModeConfig> = {
  graduate: {
    label: '대학원생',
    icon: 'GraduationCap',
    colorScheme: 'indigo',
    incomeCategories: [
      'BK 인건비', '과제 인건비', '조교 수당',
      '학회 스태프', '논문/상금', '장학금', '기타',
    ],
    expenseCategories: [
      '식비', '교통', '카페/간식', '연구실 회비',
      '도서/인쇄', '쇼핑', '주거/통신', '기타',
    ],
    aiPersonality: `당신은 대학원생 전문 재무 멘토입니다.
학업과 연구를 병행하는 대학원생의 상황을 깊이 이해합니다.
장학금·인건비 활용법, 학자금 관리, 소액 투자 전략에 초점을 맞춥니다.
친근하고 유머러스한 톤으로 조언하되, 핵심은 정확하게 전달합니다.
한국어로 답변합니다.`,
    greeting: '안녕하세요! 🎓 대학원생 재무 멘토입니다. 연구비 관리부터 소액 투자까지, 무엇이든 물어보세요!',
    defaultDashboardOrder: [
      'incomeInsight', 'spendLimit', 'netWorth', 'savingsMaturity',
      'incomeChart', 'expenseChart', 'rebalancing', 'portfolio',
      'dividendChart', 'expenseTop3', 'capitalGainsTax', 'investComp', 'aiReport',
    ],
  },

  worker: {
    label: '회사원',
    icon: 'Briefcase',
    colorScheme: 'emerald',
    incomeCategories: [
      '월급', '성과급', '야근수당', '인센티브',
      '부업/프리랜서', '투자수익', '기타',
    ],
    expenseCategories: [
      '식비', '교통/주유', '카페', '쇼핑',
      '주거/공과금', '통신', '보험/세금', '경조사', '기타',
    ],
    aiPersonality: `당신은 직장인 전문 재무 멘토입니다.
연봉 관리, 연말정산, 퇴직연금(IRP), 재테크 전략에 초점을 맞춥니다.
실질적이고 구체적인 조언을 제공합니다.
친근하지만 프로페셔널한 톤으로 한국어 답변합니다.`,
    greeting: '안녕하세요! 💼 직장인 재무 멘토입니다. 월급 관리부터 투자 전략까지 도와드릴게요!',
    defaultDashboardOrder: [
      'incomeInsight', 'spendLimit', 'netWorth', 'incomeChart', 'expenseChart',
      'rebalancing', 'savingsMaturity', 'portfolio', 'expenseTop3',
      'dividendChart', 'capitalGainsTax', 'investComp', 'aiReport',
    ],
  },
};

// ============================================
// Income Stability Map
// ============================================
// fixed: 매달 거의 동일하게 들어옴 (월급, BK, 조교 등 예산의 기반)
// semi : 있는 달/없는 달이 섞임 (과제, 부업 — 보조 수입)
// lump : 연 1~2회 큰 금액 (장학금, 논문상금 — 버퍼/저축)
export const INCOME_STABILITY: Record<AppMode, Record<string, 'fixed' | 'semi' | 'lump'>> = {
  graduate: {
    'BK 인건비': 'fixed',
    '과제 인건비': 'semi',
    '조교 수당': 'fixed',
    '학회 스태프': 'semi',
    '논문/상금': 'lump',
    '장학금': 'lump',
    '기타': 'semi',
  },
  worker: {
    '월급': 'fixed',
    '성과급': 'lump',
    '야근수당': 'semi',
    '인센티브': 'lump',
    '부업/프리랜서': 'semi',
    '투자수익': 'semi',
    '기타': 'semi',
  },
};

// ============================================
// Shared Constants (mode-independent)
// ============================================

export const ACCOUNT_TYPES: AccountType[] = [
  '입출금', '예적금', '주택청약', 'IRP/연금',
  '주식예수금', '비상금', '신용카드', '코인', '기타',
];

export const STOCK_MARKETS: StockMarket[] = [
  '국내', '미국', '중국', 'ETF', '코인', '기타',
];

// Categories helper
export function getIncomeCategories(mode: AppMode): string[] {
  return MODES[mode].incomeCategories;
}

export function getExpenseCategories(mode: AppMode): string[] {
  return MODES[mode].expenseCategories;
}

export function getAllCategories(mode: AppMode) {
  return {
    income: MODES[mode].incomeCategories,
    expense: MODES[mode].expenseCategories,
  };
}
