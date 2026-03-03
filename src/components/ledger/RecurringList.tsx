'use client';

import { useState } from 'react';
import { Plus, Repeat, CalendarClock } from 'lucide-react';
import { useRecurring } from '@/hooks/useRecurring';
import { RecurringCard } from './RecurringCard';
import { RecurringFormModal } from './RecurringFormModal';
import { DeleteConfirmModal } from '@/components/assets/DeleteConfirmModal';
import type { RecurringTransaction, Account, AppMode } from '@/types';
import { cn } from '@/lib/utils';

interface RecurringListProps {
  accounts: Account[];
  mode: AppMode;
}

export function RecurringList({ accounts, mode }: RecurringListProps) {
  const { recurring, addRecurring, deleteRecurring, toggleActive } = useRecurring();
  const isGraduate = mode === 'graduate';

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RecurringTransaction | null>(null);

  const handleSubmit = async (data: Omit<RecurringTransaction, 'id' | 'createdAt'>) => {
    await addRecurring(data);
    setShowForm(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget?.id) {
      await deleteRecurring(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">정기 거래</h2>
          {recurring.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              {recurring.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className={cn(
            'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white transition-colors',
            isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          추가
        </button>
      </div>

      {/* List */}
      {recurring.length > 0 ? (
        <div className="space-y-2">
          {recurring.map((rec) => (
            <RecurringCard
              key={rec.id}
              recurring={rec}
              onToggle={toggleActive}
              onDelete={(r) => setDeleteTarget(r)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 text-center">
          <CalendarClock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400 dark:text-slate-500">등록된 정기 거래가 없습니다</p>
          <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">매월 반복되는 수입/지출을 등록해보세요</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <RecurringFormModal
          accounts={accounts}
          mode={mode}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="정기 거래 삭제"
          message={`"${deleteTarget.category} ${deleteTarget.amount.toLocaleString()}원 (${deleteTarget.frequency === 'monthly' ? '매월' : deleteTarget.frequency === 'weekly' ? '매주' : '매년'})" 정기 거래를 삭제하시겠습니까?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
