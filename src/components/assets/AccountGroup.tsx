'use client';

import { Building2 } from 'lucide-react';
import { AccountCard } from './AccountCard';
import type { Account } from '@/types';

interface AccountGroupProps {
  bankName: string;
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountGroup({ bankName, accounts, onEdit, onDelete }: AccountGroupProps) {
  return (
    <div className="animate-slide-up">
      {/* Bank Header */}
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-700">{bankName}</h3>
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
          {accounts.length}
        </span>
      </div>

      {/* Account Cards */}
      <div className="space-y-2">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
