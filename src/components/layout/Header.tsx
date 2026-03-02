'use client';

import { GraduationCap, Briefcase, Save, ArrowLeftRight } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { MODES } from '@/config/modes';
import { exportAllData } from '@/lib/db';

export function Header() {
  const { mode, setMode, selectedYear, setSelectedYear } = useAppStore();
  const modeConfig = MODES[mode];

  const handleModeToggle = () => {
    setMode(mode === 'graduate' ? 'worker' : 'graduate');
  };

  const handleBackup = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_ledger_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate year options (current year ± 2)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i)).reverse();

  const bgColor = mode === 'graduate' ? 'bg-indigo-700' : 'bg-emerald-700';
  const accentColor = mode === 'graduate' ? 'bg-indigo-600' : 'bg-emerald-600';
  const borderColor = mode === 'graduate' ? 'border-indigo-500' : 'border-emerald-500';
  const hoverColor = mode === 'graduate' ? 'hover:bg-indigo-500' : 'hover:bg-emerald-500';
  const textColor = mode === 'graduate' ? 'text-indigo-200' : 'text-emerald-200';

  return (
    <header className={`${bgColor} text-white p-4 shadow-lg sticky top-0 z-20 transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Logo & Title */}
        <div className="flex items-center gap-2">
          {mode === 'graduate' ? (
            <GraduationCap className="w-7 h-7" />
          ) : (
            <Briefcase className="w-7 h-7" />
          )}
          <div>
            <h1 className="text-xl font-bold">스마트 가계부 Pro</h1>
            <p className={`text-xs ${textColor}`}>
              {modeConfig.label} 모드 · 투자 & 자산 통합 관리
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 items-center">
          {/* Mode Toggle */}
          <button
            onClick={handleModeToggle}
            className={`text-xs ${accentColor} ${hoverColor} px-2 py-1.5 rounded flex items-center gap-1 border ${borderColor} transition-colors`}
            title="모드 전환"
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span className="hidden sm:inline">
              {mode === 'graduate' ? '회사원' : '대학원생'}
            </span>
          </button>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={`${accentColor} text-white border ${borderColor} rounded px-2 py-1 text-xs cursor-pointer focus:outline-none`}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>

          {/* Backup */}
          <button
            onClick={handleBackup}
            className={`text-xs ${accentColor} ${hoverColor} px-3 py-1.5 rounded flex items-center gap-1 border ${borderColor}`}
          >
            <Save className="w-3 h-3" />
            <span className="hidden sm:inline">백업</span>
          </button>
        </div>
      </div>
    </header>
  );
}
