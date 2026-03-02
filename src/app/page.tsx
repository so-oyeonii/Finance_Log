'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Loader2 } from 'lucide-react';

import { AssetsView } from '@/components/assets/AssetsView';
import { LedgerView } from '@/components/ledger/LedgerView';

// Lazy-loaded tab pages (will be created in later phases)
// import { DashboardView } from '@/components/dashboard/DashboardView';
// import { StocksView } from '@/components/stocks/StocksView';
// import { ChatView } from '@/components/chat/ChatView';

export default function HomePage() {
  const { activeTab, isDataLoaded, initialize } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isDataLoaded) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-2" />
        <p className="text-slate-600 text-sm font-medium">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      <Header />
      <Navigation />

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* TODO: Phase별로 각 탭 컴포넌트 연결 */}
        {activeTab === 'dashboard' && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-medium mb-2">📊 대시보드</p>
            <p className="text-sm">Phase 5에서 구현 예정</p>
          </div>
        )}
        {activeTab === 'assets' && <AssetsView />}
        {activeTab === 'ledger' && <LedgerView />}
        {activeTab === 'stocks' && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-medium mb-2">📈 주식/코인</p>
            <p className="text-sm">Phase 4에서 구현 예정</p>
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-medium mb-2">🤖 AI 멘토</p>
            <p className="text-sm">Phase 6에서 구현 예정</p>
          </div>
        )}
      </main>
    </div>
  );
}
