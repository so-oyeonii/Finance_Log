import { create } from 'zustand';
import type { AppMode } from '@/types';
import { getSetting, setSetting } from '@/lib/db';
import { getCurrentYear } from '@/lib/format';

// ============================================
// Global App State
// ============================================

interface AppState {
  // App mode
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // Selected year for filtering
  selectedYear: string;
  setSelectedYear: (year: string) => void;

  // Active tab (for mobile nav)
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Dashboard layout
  dashboardLayout: string[];
  setDashboardLayout: (layout: string[]) => void;
  isEditingLayout: boolean;
  setIsEditingLayout: (editing: boolean) => void;

  // UI states
  isDataLoaded: boolean;
  setIsDataLoaded: (loaded: boolean) => void;

  // Initialize from IndexedDB
  initialize: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'graduate',
  selectedYear: getCurrentYear(),
  activeTab: 'dashboard',
  dashboardLayout: [
    'netWorth', 'dividendChart', 'incomeChart', 'expenseChart',
    'portfolio', 'expenseTop3', 'investComp', 'aiReport',
  ],
  isEditingLayout: false,
  isDataLoaded: false,

  setMode: async (mode) => {
    set({ mode });
    await setSetting('appMode', mode);
  },

  setSelectedYear: (year) => set({ selectedYear: year }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  setDashboardLayout: async (layout) => {
    set({ dashboardLayout: layout });
    await setSetting('dashboardLayout', layout);
  },

  setIsEditingLayout: (editing) => set({ isEditingLayout: editing }),
  setIsDataLoaded: (loaded) => set({ isDataLoaded: loaded }),

  initialize: async () => {
    const mode = await getSetting<AppMode>('appMode', 'graduate');
    const layout = await getSetting<string[]>('dashboardLayout', [
      'netWorth', 'dividendChart', 'incomeChart', 'expenseChart',
      'portfolio', 'expenseTop3', 'investComp', 'aiReport',
    ]);
    set({ mode, dashboardLayout: layout, isDataLoaded: true });
  },
}));
