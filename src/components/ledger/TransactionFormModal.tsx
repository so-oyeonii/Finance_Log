'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet, X } from 'lucide-react';
import { getIncomeCategories, getExpenseCategories } from '@/config/modes';
import { getToday } from '@/lib/format';
import type { Transaction, Account, AppMode } from '@/types';
import { cn } from '@/lib/utils';

const transactionSchema = z.object({
  date: z.string().min(1, '날짜를 선택하세요'),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().min(1, '카테고리를 선택하세요'),
  amount: z.number({ invalid_type_error: '금액을 입력하세요' }).positive('금액은 0보다 커야 합니다'),
  memo: z.string().default(''),
  accountId: z.number({ invalid_type_error: '계좌를 선택하세요' }).positive('계좌를 선택하세요'),
  toAccountId: z.number().optional(),
  isDutchPay: z.boolean().default(false),
  totalAmount: z.number().optional(),
  peopleCount: z.number().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormModalProps {
  editingTransaction: Transaction | null;
  accounts: Account[];
  mode: AppMode;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function TransactionFormModal({
  editingTransaction,
  accounts,
  mode,
  onSubmit,
  onClose,
}: TransactionFormModalProps) {
  const isEditing = !!editingTransaction;
  const isGraduate = mode === 'graduate';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: getToday(),
      type: 'expense',
      category: '',
      amount: 0,
      memo: '',
      accountId: accounts[0]?.id ?? 0,
      isDutchPay: false,
    },
  });

  useEffect(() => {
    if (editingTransaction) {
      reset({
        date: editingTransaction.date,
        type: editingTransaction.type,
        category: editingTransaction.category,
        amount: editingTransaction.amount,
        memo: editingTransaction.memo,
        accountId: editingTransaction.accountId,
        toAccountId: editingTransaction.toAccountId,
        isDutchPay: editingTransaction.isDutchPay,
        totalAmount: editingTransaction.totalAmount,
        peopleCount: editingTransaction.peopleCount,
      });
    }
  }, [editingTransaction, reset]);

  const watchedType = watch('type');
  const watchedIsDutchPay = watch('isDutchPay');

  const categories = watchedType === 'income'
    ? getIncomeCategories(mode)
    : watchedType === 'expense'
      ? getExpenseCategories(mode)
      : ['이체'];

  // Reset category when type changes
  useEffect(() => {
    if (!isEditing) {
      setValue('category', watchedType === 'transfer' ? '이체' : '');
    }
  }, [watchedType, setValue, isEditing]);

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit({
      date: data.date,
      type: data.type,
      category: data.category,
      amount: data.amount,
      memo: data.memo || '',
      accountId: data.accountId,
      toAccountId: data.type === 'transfer' ? data.toAccountId : undefined,
      isDutchPay: data.isDutchPay,
      totalAmount: data.isDutchPay ? data.totalAmount : undefined,
      peopleCount: data.isDutchPay ? data.peopleCount : undefined,
    });
  };

  const submitBtnClass = isGraduate
    ? 'bg-indigo-600 hover:bg-indigo-700'
    : 'bg-emerald-600 hover:bg-emerald-700';

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors';

  const typeOptions = [
    { key: 'expense' as const, label: '지출' },
    { key: 'income' as const, label: '수입' },
    { key: 'transfer' as const, label: '이체' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full md:w-[28rem] rounded-t-2xl md:rounded-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            {isEditing ? '거래 수정' : '거래 추가'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-900/60 dark:bg-amber-900/20">
            <Wallet className="mx-auto mb-2 h-8 w-8 text-amber-600 dark:text-amber-300" />
            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">계좌를 먼저 추가해주세요</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
              거래는 계좌 잔액과 연결됩니다. 입출금 계좌 하나를 만든 뒤 바로 지출을 기록할 수 있습니다.
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">유형</label>
            <div className="flex gap-2">
              {typeOptions.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setValue('type', t.key)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    watchedType === t.key
                      ? (t.key === 'income'
                        ? 'bg-blue-600 text-white'
                        : t.key === 'expense'
                          ? 'bg-red-500 text-white'
                          : 'bg-amber-500 text-white')
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">날짜</label>
            <input
              type="date"
              {...register('date')}
              className={cn(inputClass, 'cursor-pointer', errors.date && 'border-red-300')}
            />
          </div>

          {/* Category */}
          {watchedType !== 'transfer' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">카테고리</label>
              <select
                {...register('category')}
                className={cn(inputClass, 'cursor-pointer', errors.category && 'border-red-300')}
              >
                <option value="">선택하세요</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">금액 (원)</label>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0"
              className={cn(inputClass, errors.amount && 'border-red-300')}
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          {/* Account */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              {watchedType === 'transfer' ? '출금 계좌' : '계좌'}
            </label>
            <select
              {...register('accountId', { valueAsNumber: true })}
              className={cn(inputClass, 'cursor-pointer', errors.accountId && 'border-red-300')}
            >
              <option value={0}>선택하세요</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.bank} - {a.name}</option>
              ))}
            </select>
            {errors.accountId && <p className="text-xs text-red-500 mt-1">{errors.accountId.message}</p>}
          </div>

          {/* To Account (transfer only) */}
          {watchedType === 'transfer' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">입금 계좌</label>
              <select
                {...register('toAccountId', { valueAsNumber: true })}
                className={cn(inputClass, 'cursor-pointer')}
              >
                <option value={0}>선택하세요</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.bank} - {a.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Memo */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">메모</label>
            <input
              {...register('memo')}
              placeholder="예: 점심 김치찌개"
              className={inputClass}
            />
          </div>

          {/* Dutch Pay Toggle */}
          {watchedType === 'expense' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDutchPay"
                {...register('isDutchPay')}
                className="rounded border-slate-300"
              />
              <label htmlFor="isDutchPay" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                더치페이 (N빵)
              </label>
            </div>
          )}

          {/* Dutch Pay Fields */}
          {watchedIsDutchPay && watchedType === 'expense' && (
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">총 금액</label>
                <input
                  type="number"
                  {...register('totalAmount', { valueAsNumber: true })}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">인원</label>
                <input
                  type="number"
                  {...register('peopleCount', { valueAsNumber: true })}
                  placeholder="2"
                  className={inputClass}
                />
              </div>
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
        )}
      </div>
    </div>
  );
}
