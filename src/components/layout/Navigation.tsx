'use client';

import {
  LayoutDashboard, Building2, ArrowRightLeft,
  Coins, MessageSquare,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';

const TABS = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'assets', label: '자산관리', icon: Building2 },
  { id: 'ledger', label: '수입/지출', icon: ArrowRightLeft },
  { id: 'stocks', label: '주식/코인', icon: Coins },
  { id: 'chat', label: 'AI 멘토', icon: MessageSquare },
] as const;

export function Navigation() {
  const { activeTab, setActiveTab, mode } = useAppStore();

  const activeColor = mode === 'graduate' ? 'text-indigo-700' : 'text-emerald-700';
  const activeBorder = mode === 'graduate' ? 'border-indigo-100' : 'border-emerald-100';

  return (
    <nav className="max-w-4xl mx-auto mt-4 px-4 flex gap-2 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-3 px-3 min-w-[80px] rounded-lg flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-xs md:text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? `bg-white ${activeColor} shadow border ${activeBorder}`
              : 'bg-white/50 text-slate-500 hover:bg-white'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
