'use client';

import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useSavings } from '@/hooks/useSavings';
import { useAppStore } from '@/stores/useAppStore';
import { AssetsSummary } from './AssetsSummary';
import { AccountGroup } from './AccountGroup';
import { AccountFormModal } from './AccountFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { SavingsList } from './SavingsList';
import { SavingsFormModal } from './SavingsFormModal';
import type { Account, Savings } from '@/types';
import { cn } from '@/lib/utils';

export function AssetsView() {
  const { accounts, groupedAccounts, totalBalance, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { savings, addSavings, deleteSavings } = useSavings();
  const { mode } = useAppStore();

  // Modal states
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'account' | 'savings'; item: Account | Savings } | null>(null);
  const [showSavingsForm, setShowSavingsForm] = useState(false);

  const isGraduate = mode === 'graduate';

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowAccountForm(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowAccountForm(true);
  };

  const handleAccountSubmit = async (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingAccount?.id) {
      await updateAccount(editingAccount.id, data);
    } else {
      await addAccount(data);
    }
    setShowAccountForm(false);
    setEditingAccount(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'account' && deleteTarget.item.id) {
      await deleteAccount(deleteTarget.item.id);
    } else if (deleteTarget.type === 'savings' && deleteTarget.item.id) {
      await deleteSavings(deleteTarget.item.id);
    }
    setDeleteTarget(null);
  };

  const handleSavingsSubmit = async (data: { type: '예금' | '적금'; name: string; amount: number; rate: number; term: number; startDate: string }) => {
    await addSavings(data);
    setShowSavingsForm(false);
  };

  const bankNames = Object.keys(groupedAccounts);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <AssetsSummary totalBalance={totalBalance} accountCount={accounts.length} mode={mode} />

      {/* Accounts Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">계좌 관리</h2>
          <button
            onClick={handleAddAccount}
            className={cn(
              'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white transition-colors',
              isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            추가
          </button>
        </div>

        {bankNames.length > 0 ? (
          <div className="space-y-5">
            {bankNames.map((bankName) => (
              <AccountGroup
                key={bankName}
                bankName={bankName}
                accounts={groupedAccounts[bankName]}
                onEdit={handleEditAccount}
                onDelete={(account) => setDeleteTarget({ type: 'account', item: account })}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 text-center animate-fade-in">
            <Wallet className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 dark:text-slate-500">등록된 계좌가 없습니다</p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">위의 추가 버튼을 눌러 계좌를 등록해보세요</p>
          </div>
        )}
      </div>

      {/* Savings Section */}
      <SavingsList
        savings={savings}
        mode={mode}
        onAdd={() => setShowSavingsForm(true)}
        onDelete={(saving) => setDeleteTarget({ type: 'savings', item: saving })}
      />

      {/* Account Form Modal */}
      {showAccountForm && (
        <AccountFormModal
          editingAccount={editingAccount}
          mode={mode}
          onSubmit={handleAccountSubmit}
          onClose={() => { setShowAccountForm(false); setEditingAccount(null); }}
        />
      )}

      {/* Savings Form Modal */}
      {showSavingsForm && (
        <SavingsFormModal
          mode={mode}
          onSubmit={handleSavingsSubmit}
          onClose={() => setShowSavingsForm(false)}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.type === 'account' ? '계좌 삭제' : '예적금 삭제'}
          message={
            deleteTarget.type === 'account'
              ? `"${(deleteTarget.item as Account).name}" 계좌를 삭제하시겠습니까? 관련된 거래 기록은 유지됩니다.`
              : `"${(deleteTarget.item as Savings).name}" 예적금을 삭제하시겠습니까?`
          }
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
