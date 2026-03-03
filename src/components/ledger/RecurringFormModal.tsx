'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { getIncomeCategories, getExpenseCategories } from '@/config/modes';
import { getToday } from '@/lib/format';
import type { RecurringTransaction, Account, AppMode } from '@/types';
import { cn } from '@/lib/utils';

const recurringSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, '카테고리를 선택하세요'),
  amount: z.number({ invalid_type_error: '금액을 입력하세요' }).positive('금액은 0보다 커야 합니다'),
  frequency: z.enum(['monthly', 'weekly', 'yearly']),
  nextDate: z.string().min(1, '시작일을 선택하세요'),
  accountId: z.number({ invalid_type_error: '계좌를 선택하세요' }).positive('계좌를 선택하세요'),
  memo: z.string().default(''),
});

type RecurringFormData = z.infer<typeof recurringSchema>;

interface RecurringFormModalProps {
  accounts: Account[];
  mode: AppMode;
  onSubmit: (data: Omit<RecurringTransaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function RecurringFormModal({ accounts, mode, onSubmit, onClose }: RecurringFormModalProps) {
  const isGraduate = mode === 'graduate';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      type: 'expense',
      category: '',
      amount: 0,
      frequency: 'monthly',
      nextDate: getToday(),
      accountId: accounts[0]?.id ?? 0,
      memo: '',
    },
  });

  const watchedType = watch('type');
  const categories = watchedType === 'income'
    ? getIncomeCategories(mode)
    : getExpenseCategories(mode);

  const handleFormSubmit = (data: RecurringFormData) => {
    onSubmit({
      type: data.type,
      category: data.category,
      amount: data.amount,
      frequency: data.frequency,
      nextDate: data.nextDate,
      accountId: data.accountId,
      memo: data.memo || '',
      isActive: true,
    });
  };

  const submitBtnClass = isGraduate
    ? 'bg-indigo-600 hover:bg-indigo-700'
    : 'bg-emerald-600 hover:bg-emerald-700';

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors';

  const typeOptions = [
    { key: 'expense' as const, label: '지출' },
    { key: 'income' as const, label: '수입' },
  ];

  const freqOptions = [
    { key: 'monthly' as const, label: '매월' },
    { key: 'weekly' as const, label: '매주' },
    { key: 'yearly' as const, label: '매년' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full md:w-[28rem] rounded-t-2xl md:rounded-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">정기 거래 추가</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">유형</label>
            <div className="flex gap-2">
              {typeOptions.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { setValue('type', t.key); setValue('category', ''); }}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    watchedType === t.key
                      ? (t.key === 'income' ? 'bg-blue-600 text-white' : 'bg-red-500 text-white')
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">반복 주기</label>
            <div className="flex gap-2">
              {freqOptions.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setValue('frequency', f.key)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    watch('frequency') === f.key
                      ? (isGraduate ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white')
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
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

          {/* Next Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">다음 실행일</label>
            <input
              type="date"
              {...register('nextDate')}
              className={cn(inputClass, 'cursor-pointer', errors.nextDate && 'border-red-300')}
            />
            {errors.nextDate && <p className="text-xs text-red-500 mt-1">{errors.nextDate.message}</p>}
          </div>

          {/* Account */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">계좌</label>
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

          {/* Memo */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">메모</label>
            <input
              {...register('memo')}
              placeholder="예: 넷플릭스 구독"
              className={inputClass}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={cn(
              'w-full py-2.5 rounded-lg text-white text-sm font-medium transition-colors',
              submitBtnClass
            )}
          >
            추가하기
          </button>
        </form>
      </div>
    </div>
  );
}
