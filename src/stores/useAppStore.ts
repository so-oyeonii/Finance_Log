import { create } from 'zustand';
import type { AppMode } from '@/types';
import { getSetting, setSetting } from '@/lib/db';
import { getCurrentYear } from '@/lib/format';
import { clearSupabaseClient } from '@/lib/supabase';

// ============================================
// Global App State
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';

function applyTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
  localStorage.setItem('theme', theme);
}

interface AppState {
  // App mode
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

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

  // OpenAI API Key (user-provided)
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;

  // Supabase config (user-provided, fallback if no env vars)
  supabaseUrl: string;
  supabaseAnonKey: string;
  setSupabaseConfig: (url: string, key: string) => void;

  // UI states
  isDataLoaded: boolean;
  setIsDataLoaded: (loaded: boolean) => void;

  // Initialize from IndexedDB
  initialize: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'graduate',
  theme: 'system',
  selectedYear: getCurrentYear(),
  activeTab: 'dashboard',
  dashboardLayout: [
    'netWorth', 'dividendChart', 'incomeChart', 'expenseChart',
    'portfolio', 'expenseTop3', 'investComp', 'aiReport',
  ],
  isEditingLayout: false,
  openaiApiKey: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  isDataLoaded: false,

  setMode: async (mode) => {
    set({ mode });
    await setSetting('appMode', mode);
  },

  setTheme: async (theme) => {
    set({ theme });
    applyTheme(theme);
    await setSetting('theme', theme);
  },

  setSelectedYear: (year) => set({ selectedYear: year }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  setDashboardLayout: async (layout) => {
    set({ dashboardLayout: layout });
    await setSetting('dashboardLayout', layout);
  },

  setIsEditingLayout: (editing) => set({ isEditingLayout: editing }),

  setOpenaiApiKey: async (key) => {
    set({ openaiApiKey: key });
    await setSetting('openaiApiKey', key);
  },

  setSupabaseConfig: async (url, key) => {
    set({ supabaseUrl: url, supabaseAnonKey: key });
    clearSupabaseClient();
    await setSetting('supabaseUrl', url);
    await setSetting('supabaseAnonKey', key);
  },

  setIsDataLoaded: (loaded) => set({ isDataLoaded: loaded }),

  initialize: async () => {
    const mode = await getSetting<AppMode>('appMode', 'graduate');
    const theme = await getSetting<ThemeMode>('theme', 'system');
    const layout = await getSetting<string[]>('dashboardLayout', [
      'netWorth', 'dividendChart', 'incomeChart', 'expenseChart',
      'portfolio', 'expenseTop3', 'investComp', 'aiReport',
    ]);
    const openaiApiKey = await getSetting<string>('openaiApiKey', '');
    const supabaseUrl = await getSetting<string>('supabaseUrl', '');
    const supabaseAnonKey = await getSetting<string>('supabaseAnonKey', '');
    applyTheme(theme);
    set({ mode, theme, dashboardLayout: layout, openaiApiKey, supabaseUrl, supabaseAnonKey, isDataLoaded: true });
  },
}));
