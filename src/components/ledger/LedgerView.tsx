'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useAppStore } from '@/stores/useAppStore';
import { LedgerSummary } from './LedgerSummary';
import { TransactionList } from './TransactionList';
import { TransactionFormModal } from './TransactionFormModal';
import { MonthlyChart } from './MonthlyChart';
import { ExpenseByCategory } from './ExpenseByCategory';
import { DeleteConfirmModal } from '@/components/assets/DeleteConfirmModal';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';

export function LedgerView() {
  const { mode, selectedYear } = useAppStore();
  const {
    yearlyTransactions,
    sortedTransactions,
    summary,
    expenseByCategory,
    monthlyStats,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(selectedYear);
  const { accounts } = useAccounts();

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const isGraduate = mode === 'graduate';

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

      {/* Charts */}
      <ExpenseByCategory data={expenseByCategory} mode={mode} />
      <MonthlyChart monthlyStats={monthlyStats} mode={mode} />

      {/* Transaction List Header + Add Button */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700">거래 내역</h2>
          <button
            onClick={handleAdd}
            className={cn(
              'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white transition-colors',
              isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            추가
          </button>
        </div>

        <TransactionList
          transactions={yearSorted}
          accounts={accounts}
          onEdit={handleEdit}
          onDelete={(tx) => setDeleteTarget(tx)}
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
