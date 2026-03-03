'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { ACCOUNT_TYPES } from '@/config/modes';
import type { Account, AppMode } from '@/types';
import { cn } from '@/lib/utils';

const accountSchema = z.object({
  bank: z.string().min(1, '은행/증권사를 입력하세요'),
  name: z.string().min(1, '계좌명을 입력하세요'),
  type: z.string().min(1, '계좌 유형을 선택하세요'),
  balance: z.number({ invalid_type_error: '금액을 입력하세요' }),
  principal: z.number().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormModalProps {
  editingAccount: Account | null;
  mode: AppMode;
  onSubmit: (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export function AccountFormModal({ editingAccount, mode, onSubmit, onClose }: AccountFormModalProps) {
  const isEditing = !!editingAccount;
  const isGraduate = mode === 'graduate';

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      bank: '',
      name: '',
      type: '입출금',
      balance: 0,
      principal: 0,
    },
  });

  useEffect(() => {
    if (editingAccount) {
      reset({
        bank: editingAccount.bank,
        name: editingAccount.name,
        type: editingAccount.type,
        balance: editingAccount.balance,
        principal: editingAccount.principal,
      });
    }
  }, [editingAccount, reset]);

  const selectedType = watch('type');
  const showPrincipal = selectedType === 'IRP/연금' || selectedType === '주식예수금';

  const handleFormSubmit = (data: AccountFormData) => {
    onSubmit({
      bank: data.bank,
      name: data.name,
      type: data.type as Account['type'],
      balance: data.balance,
      principal: showPrincipal ? (data.principal ?? 0) : data.balance,
    });
  };

  const submitBtnClass = isGraduate
    ? 'bg-indigo-600 hover:bg-indigo-700'
    : 'bg-emerald-600 hover:bg-emerald-700';

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full md:w-[28rem] rounded-t-2xl md:rounded-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            {isEditing ? '계좌 수정' : '계좌 추가'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Bank */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">은행/증권사</label>
            <input
              {...register('bank')}
              placeholder="예: 카카오뱅크, 토스"
              className={cn(inputClass, errors.bank && 'border-red-300')}
            />
            {errors.bank && <p className="text-xs text-red-500 mt-1">{errors.bank.message}</p>}
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">계좌명</label>
            <input
              {...register('name')}
              placeholder="예: 생활비 통장"
              className={cn(inputClass, errors.name && 'border-red-300')}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">계좌 유형</label>
            <select
              {...register('type')}
              className={cn(inputClass, 'cursor-pointer')}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Balance */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              {selectedType === '신용카드' ? '결제 예정액' : '잔액'}
            </label>
            <input
              type="number"
              {...register('balance', { valueAsNumber: true })}
              placeholder="0"
              className={cn(inputClass, errors.balance && 'border-red-300')}
            />
            {errors.balance && <p className="text-xs text-red-500 mt-1">{errors.balance.message}</p>}
          </div>

          {/* Principal (conditional) */}
          {showPrincipal && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">원금 (투자원금)</label>
              <input
                type="number"
                {...register('principal', { valueAsNumber: true })}
                placeholder="0"
                className={inputClass}
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={cn(
              'w-full py-2.5 rounded-lg text-white text-sm font-medium transition-colors',
              submitBtnClass
            )}
          >
            {isEditing ? '수정 완료' : '추가하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
