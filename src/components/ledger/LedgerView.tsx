'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useAppStore } from '@/stores/useAppStore';
import { LedgerSummary } from './LedgerSummary';
import { TransactionList } from './TransactionList';
import { TransactionFormModal } from './TransactionFormModal';
import { MonthlyChart } from './MonthlyChart';
import { ExpenseByCategory } from './ExpenseByCategory';
import { IncomeAnalysisSection } from './IncomeAnalysisSection';
import { RecurringList } from './RecurringList';
import { DeleteConfirmModal } from '@/components/assets/DeleteConfirmModal';
import type { Transaction } from '@/types';

export function LedgerView() {
  const { mode, selectedYear, setActiveTab } = useAppStore();
  const {
    yearlyTransactions,
    sortedTransactions,
    summary,
    expenseByCategory,
    monthlyStats,
    incomeInsights,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(selectedYear);
  const { accounts } = useAccounts();

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  // Filter sorted transactions for the selected year
  const yearSorted = sortedTransactions.filter((t) => t.date.startsWith(selectedYear));

  const handleAdd = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleSubmit = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction?.id) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await addTransaction(data);
    }
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget?.id) {
      await deleteTransaction(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <LedgerSummary
        income={summary.income}
        expense={summary.expense}
        balance={summary.balance}
        mode={mode}
      />

      {/* 수입 원천별 분석 (대학원생 불규칙 수입 대응) */}
      <IncomeAnalysisSection insights={incomeInsights} />

      {/* Charts */}
      <ExpenseByCategory data={expenseByCategory} mode={mode} />
      <MonthlyChart monthlyStats={monthlyStats} mode={mode} />

      {/* Recurring Transactions */}
      <RecurringList accounts={accounts} mode={mode} />

      {/* Transaction List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">거래 내역</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">하단 기록 버튼으로 빠르게 추가</p>
        </div>

        <TransactionList
          transactions={yearSorted}
          accounts={accounts}
          onEdit={handleEdit}
          onDelete={(tx) => setDeleteTarget(tx)}
          onAdd={handleAdd}
          onAddAccount={() => setActiveTab('assets')}
        />
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionFormModal
          editingTransaction={editingTransaction}
          accounts={accounts}
          mode={mode}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditingTransaction(null); }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="거래 삭제"
          message={`"${deleteTarget.category} ${deleteTarget.amount.toLocaleString()}원" 거래를 삭제하시겠습니까? 계좌 잔액이 자동으로 복원됩니다.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
