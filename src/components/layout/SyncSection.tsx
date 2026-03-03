'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudUpload, CloudDownload, LogIn, LogOut, Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSync } from '@/hooks/useSync';
import { hasEnvConfig } from '@/lib/supabase';
import { AuthModal } from '@/components/auth/AuthModal';
import { MigrateModal } from '@/components/supabase/MigrateModal';

export function SyncSection() {
  const { supabaseUrl, supabaseAnonKey, setSupabaseConfig } = useAppStore();
  const { user, signOut, initAuth } = useAuthStore();
  const { push, pull, lastSyncedAt, syncStatus, isConfigured, isReady, tablesReady, recheckTables } = useSync();

  const [inputUrl, setInputUrl] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [showMigrate, setShowMigrate] = useState(false);
  const envConfigured = hasEnvConfig();

  useEffect(() => {
    setInputUrl(supabaseUrl);
    setInputKey(supabaseAnonKey);
  }, [supabaseUrl, supabaseAnonKey]);

  // Init auth when config becomes available
  useEffect(() => {
    if (isConfigured) {
      initAuth();
    }
  }, [isConfigured, initAuth]);

  const handleSaveConfig = () => {
    setSupabaseConfig(inputUrl.trim(), inputKey.trim());
  };

  const handleClearConfig = () => {
    setSupabaseConfig('', '');
    setInputUrl('');
    setInputKey('');
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '없음';
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const isSyncing = syncStatus === 'pushing' || syncStatus === 'pulling';

  // Determine the effective Supabase URL for migration
  const effectiveUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;

  return (
    <>
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          클라우드 동기화
        </h3>

        {/* Supabase Config */}
        {envConfigured ? (
          <p className="text-xs text-green-600 dark:text-green-400 mb-3 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            환경변수로 Supabase가 설정되어 있습니다.
          </p>
        ) : (
          <div className="space-y-2 mb-3">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Supabase URL (https://xxx.supabase.co)"
              className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Supabase Anon Key"
              className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveConfig}
                disabled={!inputUrl.trim() || !inputKey.trim()}
                className="flex-1 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                저장
              </button>
              {supabaseUrl && (
                <button
                  onClick={handleClearConfig}
                  className="px-3 py-1.5 text-sm text-red-500 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Supabase 프로젝트의 URL과 anon key를 입력하세요.
            </p>
          </div>
        )}

        {/* Table Status */}
        {isConfigured && tablesReady === false && (
          <div className="mb-3">
            <button
              onClick={() => setShowMigrate(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
            >
              <Database className="w-4 h-4" />
              데이터베이스 테이블 생성
            </button>
            <p className="text-xs text-orange-500 dark:text-orange-400 mt-1.5">
              동기화를 사용하려면 먼저 데이터베이스 테이블을 생성해야 합니다.
            </p>
          </div>
        )}

        {isConfigured && tablesReady === true && (
          <p className="text-xs text-green-600 dark:text-green-400 mb-3 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            데이터베이스 테이블이 준비되었습니다.
          </p>
        )}

        {/* Auth Status */}
        {isConfigured && (
          <div className="mb-3">
            {user ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                <span className="text-sm text-green-700 dark:text-green-300 truncate">
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 ml-2 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                로그인 / 회원가입
              </button>
            )}
          </div>
        )}

        {/* Sync Buttons */}
        {isReady && (
          <>
            <div className="flex gap-2 mb-2">
              <button
                onClick={push}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                {syncStatus === 'pushing' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CloudUpload className="w-4 h-4" />
                )}
                업로드
              </button>
              <button
                onClick={pull}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                {syncStatus === 'pulling' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CloudDownload className="w-4 h-4" />
                )}
                다운로드
              </button>
            </div>

            {syncStatus === 'error' && (
              <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mb-1">
                <AlertCircle className="w-3.5 h-3.5" />
                동기화 중 오류가 발생했습니다.
              </p>
            )}

            <p className="text-xs text-slate-400 dark:text-slate-500">
              마지막 동기화: {formatDate(lastSyncedAt)}
            </p>
          </>
        )}

        {!isConfigured && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Supabase URL과 Anon Key를 입력하면 클라우드 동기화를 사용할 수 있습니다.
          </p>
        )}
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <MigrateModal
        isOpen={showMigrate}
        onClose={() => setShowMigrate(false)}
        supabaseUrl={effectiveUrl}
        onSuccess={recheckTables}
      />
    </>
  );
}
