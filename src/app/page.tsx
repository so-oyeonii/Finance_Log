'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { OnboardingModal } from '@/components/layout/OnboardingModal';
import { Loader2 } from 'lucide-react';

import { AssetsView } from '@/components/assets/AssetsView';
import { LedgerView } from '@/components/ledger/LedgerView';
import { StocksView } from '@/components/stocks/StocksView';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ChatView } from '@/components/chat/ChatView';
import { processRecurringTransactions } from '@/lib/recurring';

export default function HomePage() {
  const { activeTab, isDataLoaded, theme, initialize } = useAppStore();

  useEffect(() => {
    initialize().then(() => {
      processRecurringTransactions();
    });
  }, [initialize]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  if (!isDataLoaded) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-900 flex flex-col items-center justify-center z-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-2" />
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-20 transition-colors">
      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'assets' && <AssetsView />}
        {activeTab === 'ledger' && <LedgerView />}
        {activeTab === 'stocks' && <StocksView />}
        {activeTab === 'chat' && <ChatView />}
      </main>

      <OnboardingModal />
    </div>
  );
}
