'use client';

import { useState } from 'react';
import { X, Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface MigrateModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseUrl: string;
  onSuccess: () => void;
}

export function MigrateModal({ isOpen, onClose, supabaseUrl, onSuccess }: MigrateModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string[] | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setPassword('');
    setError('');
    setSuccess(null);
    onClose();
  };

  const handleMigrate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/supabase/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseUrl, databasePassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '알 수 없는 오류가 발생했습니다.');
        return;
      }

      setSuccess(data.tables);
      setPassword('');
      onSuccess();
    } catch {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5" />
            데이터베이스 테이블 생성
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="p-4">
          {success ? (
            // Success state
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">테이블 생성 완료!</span>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-xs text-green-700 dark:text-green-300 mb-2">생성된 테이블:</p>
                <ul className="space-y-1">
                  {success.map((table) => (
                    <li key={table} className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3" />
                      {table}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                확인
              </button>
            </div>
          ) : (
            // Input state
            <form onSubmit={handleMigrate} className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  Supabase 프로젝트의 데이터베이스 비밀번호를 입력하세요.
                  비밀번호는 테이블 생성에만 1회 사용되며 저장되지 않습니다.
                </p>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Database Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="프로젝트 생성 시 설정한 비밀번호"
                  className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-500 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    테이블 생성 중...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    테이블 생성
                  </>
                )}
              </button>

              <p className="text-xs text-slate-400 dark:text-slate-500">
                Supabase Dashboard → Settings → Database에서 비밀번호를 확인할 수 있습니다.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
