'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Trash2, Sun, Moon, Monitor, Download, Upload } from 'lucide-react';
import { useAppStore, type ThemeMode } from '@/stores/useAppStore';
import { exportAllData, validateBackupData, importAllData } from '@/lib/db';
import { ImportConfirmModal } from './ImportConfirmModal';
import { SyncSection } from './SyncSection';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { openaiApiKey, setOpenaiApiKey, theme, setTheme } = useAppStore();
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import state
  const [importData, setImportData] = useState<{
    fileName: string;
    data: Awaited<ReturnType<typeof exportAllData>>;
    counts: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputKey(openaiApiKey);
      setShowKey(false);
    }
  }, [isOpen, openaiApiKey]);

  if (!isOpen) return null;

  const maskedKey = openaiApiKey
    ? `${openaiApiKey.slice(0, 3)}...${openaiApiKey.slice(-4)}`
    : '';

  const handleSaveKey = () => {
    setOpenaiApiKey(inputKey.trim());
  };

  const handleDeleteKey = () => {
    setOpenaiApiKey('');
    setInputKey('');
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validation = validateBackupData(json);
        if (!validation.valid) {
          alert(`잘못된 백업 파일입니다: ${validation.error}`);
          return;
        }
        setImportData({
          fileName: file.name,
          data: json,
          counts: validation.counts!,
        });
      } catch {
        alert('JSON 파일을 읽을 수 없습니다.');
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  const handleImportConfirm = async () => {
    if (!importData) return;
    try {
      await importAllData(importData.data);
      setImportData(null);
      onClose();
      window.location.reload();
    } catch {
      alert('데이터 가져오기에 실패했습니다.');
    }
  };

  const themeButtons: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: '라이트', icon: Sun },
    { value: 'dark', label: '다크', icon: Moon },
    { value: 'system', label: '시스템', icon: Monitor },
  ];

  return (
    <>
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">설정</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">테마</h3>
            <div className="flex gap-2">
              {themeButtons.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    theme === value
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* API Key Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">OpenAI API Key</h3>
            {openaiApiKey && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                현재 키: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">{maskedKey}</code>
              </p>
            )}

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="sk-..."
                className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              키는 브라우저(IndexedDB)에 저장되며 서버에 전송되지 않습니다.
            </p>

            <div className="flex justify-between mt-3">
              <button
                onClick={handleDeleteKey}
                disabled={!openaiApiKey}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
              <button
                onClick={handleSaveKey}
                disabled={!inputKey.trim()}
                className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                저장
              </button>
            </div>
          </div>

          {/* Data Management Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">데이터 관리</h3>
            <div className="flex gap-2">
              <button
                onClick={handleBackup}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                백업 (내보내기)
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <Upload className="w-4 h-4" />
                가져오기
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Cloud Sync Section */}
          <SyncSection />
        </div>
      </div>
    </div>

    {importData && (
      <ImportConfirmModal
        fileName={importData.fileName}
        counts={importData.counts}
        onConfirm={handleImportConfirm}
        onCancel={() => setImportData(null)}
      />
    )}
    </>
  );
}
