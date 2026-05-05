import { create } from 'zustand';
import type { AppMode } from '@/types';
import { getSetting, setSetting } from '@/lib/db';
import { getCurrentYear } from '@/lib/format';
import { clearSupabaseClient } from '@/lib/supabase';
import { MODES } from '@/config/modes';

// ============================================
// Global App State
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';

const defaultDashboardLayout = MODES.graduate.defaultDashboardOrder;

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

  // Onboarding
  onboardingSeen: boolean;
  setOnboardingSeen: (seen: boolean) => void;

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
  activeTab: 'ledger',
  dashboardLayout: defaultDashboardLayout,
  isEditingLayout: false,
  openaiApiKey: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  onboardingSeen: false,
  isDataLoaded: false,

  setMode: async (mode) => {
    const dashboardLayout = MODES[mode].defaultDashboardOrder;
    set({ mode, dashboardLayout });
    await setSetting('appMode', mode);
    await setSetting('dashboardLayout', dashboardLayout);
  },

  setTheme: async (theme) => {
    set({ theme });
    applyTheme(theme);
    await setSetting('theme', theme);
  },

  setSelectedYear: (year) => set({ selectedYear: year }),
  setActiveTab: async (tab) => {
    set({ activeTab: tab });
    await setSetting('activeTab', tab);
  },

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

  setOnboardingSeen: async (seen) => {
    set({ onboardingSeen: seen });
    await setSetting('onboardingSeen', seen);
  },

  setIsDataLoaded: (loaded) => set({ isDataLoaded: loaded }),

  initialize: async () => {
    const mode = await getSetting<AppMode>('appMode', 'graduate');
    const theme = await getSetting<ThemeMode>('theme', 'system');
    const layout = await getSetting<string[]>('dashboardLayout', MODES[mode].defaultDashboardOrder);
    const openaiApiKey = await getSetting<string>('openaiApiKey', '');
    const supabaseUrl = await getSetting<string>('supabaseUrl', '');
    const supabaseAnonKey = await getSetting<string>('supabaseAnonKey', '');
    const onboardingSeen = await getSetting<boolean>('onboardingSeen', false);
    const activeTab = await getSetting<string>('activeTab', onboardingSeen ? 'ledger' : 'ledger');
    applyTheme(theme);
    set({ mode, theme, activeTab, dashboardLayout: layout, openaiApiKey, supabaseUrl, supabaseAnonKey, onboardingSeen, isDataLoaded: true });
  },
}));
