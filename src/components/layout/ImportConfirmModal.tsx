'use client';

import { AlertTriangle, X, FileJson } from 'lucide-react';

interface ImportConfirmModalProps {
  fileName: string;
  counts: Record<string, number>;
  onConfirm: () => void;
  onCancel: () => void;
}

const TABLE_LABELS: Record<string, string> = {
  accounts: '계좌',
  transactions: '거래',
  stocks: '주식/코인',
  stockPrices: '시세',
  savings: '예적금',
  recurring: '정기거래',
  settings: '설정',
};

export function ImportConfirmModal({ fileName, counts, onConfirm, onCancel }: ImportConfirmModalProps) {
  const totalRecords = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end md:items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full md:w-96 rounded-t-2xl md:rounded-2xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-lg">데이터 가져오기</h3>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        {/* File Info */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FileJson className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{fileName}</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.entries(counts).map(([table, count]) => (
              count > 0 && (
                <div key={table} className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{TABLE_LABELS[table] || table}</span>
                  <span className="font-medium">{count}건</span>
                </div>
              )
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 flex justify-between text-xs font-medium text-slate-700 dark:text-slate-200">
            <span>총 레코드</span>
            <span>{totalRecords}건</span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            기존 데이터가 모두 삭제되고 백업 데이터로 대체됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            가져오기
          </button>
        </div>
      </div>
    </div>
  );
}
