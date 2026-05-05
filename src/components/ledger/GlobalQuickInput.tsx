'use client';

import { useState } from 'react';
import { Camera, Plus, Wallet, X } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useAppStore } from '@/stores/useAppStore';
import { SmartInputButton } from './SmartInputButton';
import { TransactionFormModal } from './TransactionFormModal';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';

export function GlobalQuickInput() {
  const { mode, selectedYear, setActiveTab } = useAppStore();
  const { accounts } = useAccounts();
  const { addTransaction } = useTransactions(selectedYear);

  const [showSheet, setShowSheet] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [draftTransaction, setDraftTransaction] = useState<Transaction | null>(null);

  const isGraduate = mode === 'graduate';
  const hasAccounts = accounts.length > 0;

  const closeAll = () => {
    setShowSheet(false);
    setShowForm(false);
    setDraftTransaction(null);
  };

  const goToAccountSetup = () => {
    closeAll();
    setActiveTab('assets');
  };

  const openManualForm = () => {
    if (!hasAccounts) {
      goToAccountSetup();
      return;
    }

    setShowSheet(false);
    setDraftTransaction(null);
    setShowForm(true);
  };

  const openAiDraftInForm = (data: Partial<Transaction>) => {
    setShowSheet(false);
    setDraftTransaction({
      id: undefined,
      date: data.date || new Date().toISOString().slice(0, 10),
      type: data.type || 'expense',
      category: data.category || '',
      amount: data.amount || 0,
      memo: data.memo || '',
      accountId: data.accountId || accounts[0]?.id || 0,
      isDutchPay: data.isDutchPay || false,
      totalAmount: data.totalAmount,
      peopleCount: data.peopleCount,
      createdAt: '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    await addTransaction(data);
    closeAll();
    setActiveTab('ledger');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowSheet(true)}
        className={cn(
          'fixed bottom-5 left-1/2 z-40 flex h-14 -translate-x-1/2 items-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-colors md:bottom-6',
          isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
        )}
      >
        <Plus className="h-5 w-5" />
        기록
      </button>

      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in md:items-center">
          <div className="w-full rounded-t-2xl bg-white p-5 shadow-xl animate-slide-up dark:bg-slate-800 md:w-[28rem] md:rounded-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">무엇을 기록할까요?</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  평소에는 직접 입력이 가장 빠르고, 영수증이나 캡처가 있으면 AI를 쓰면 됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSheet(false)}
                className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="닫기"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {!hasAccounts && (
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200">
                거래를 저장하려면 계좌가 하나 필요합니다. 현재 잔액을 넣어두면 이후 거래가 자동으로 반영됩니다.
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={openManualForm}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-4 text-left transition-colors hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">직접 입력</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">금액과 카테고리만 빠르게 기록합니다.</p>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <SmartInputButton
                  accounts={accounts}
                  mode={mode}
                  onConfirm={handleSubmit}
                  onEditInForm={openAiDraftInForm}
                  label="사진/AI"
                  buttonClassName={cn(
                    'h-12 w-full justify-center rounded-lg text-sm',
                    isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  )}
                />
                <button
                  type="button"
                  onClick={goToAccountSetup}
                  className="flex h-12 items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  <Wallet className="h-4 w-4" />
                  계좌 추가
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
                <Camera className="h-3.5 w-3.5" />
                <span>영수증 사진과 자연어 입력은 같은 AI 입력 화면에서 선택할 수 있습니다.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <TransactionFormModal
          editingTransaction={draftTransaction}
          accounts={accounts}
          mode={mode}
          onSubmit={handleSubmit}
          onClose={closeAll}
        />
      )}
    </>
  );
}
