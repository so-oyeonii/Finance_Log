'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { formatKRW } from '@/lib/format';
import { calculateSavingsInfo } from '@/lib/calculations';
import { getToday } from '@/lib/format';
import type { AppMode, SavingsType } from '@/types';
import { cn } from '@/lib/utils';

const savingsSchema = z.object({
  type: z.enum(['예금', '적금']),
  name: z.string().min(1, '상품명을 입력하세요'),
  amount: z.number({ invalid_type_error: '금액을 입력하세요' }).positive('금액은 0보다 커야 합니다'),
  rate: z.number({ invalid_type_error: '이율을 입력하세요' }).positive('이율은 0보다 커야 합니다'),
  term: z.number({ invalid_type_error: '기간을 입력하세요' }).int().positive('기간은 1개월 이상이어야 합니다'),
  startDate: z.string().min(1, '가입일을 선택하세요'),
});

type SavingsFormData = z.infer<typeof savingsSchema>;

interface SavingsFormModalProps {
  mode: AppMode;
  onSubmit: (data: { type: SavingsType; name: string; amount: number; rate: number; term: number; startDate: string }) => void;
  onClose: () => void;
}

export function SavingsFormModal({ mode, onSubmit, onClose }: SavingsFormModalProps) {
  const isGraduate = mode === 'graduate';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SavingsFormData>({
    resolver: zodResolver(savingsSchema),
    defaultValues: {
      type: '예금',
      name: '',
      amount: 0,
      rate: 0,
      term: 12,
      startDate: getToday(),
    },
  });

  const watchedType = watch('type');
  const watchedAmount = watch('amount');
  const watchedRate = watch('rate');
  const watchedTerm = watch('term');

  // Real-time maturity preview
  const preview = useMemo(() => {
    if (watchedAmount > 0 && watchedRate > 0 && watchedTerm > 0) {
      return calculateSavingsInfo(watchedType as SavingsType, watchedAmount, watchedRate, watchedTerm);
    }
    return null;
  }, [watchedType, watchedAmount, watchedRate, watchedTerm]);

  const handleFormSubmit = (data: SavingsFormData) => {
    onSubmit(data);
  };

  const submitBtnClass = isGraduate
    ? 'bg-indigo-600 hover:bg-indigo-700'
    : 'bg-emerald-600 hover:bg-emerald-700';

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
      <div className="bg-white w-full md:w-[28rem] rounded-t-2xl md:rounded-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-slate-800">예적금 추가</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">유형</label>
            <div className="flex gap-2">
              {(['예금', '적금'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    watchedType === t
                      ? (isGraduate ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white')
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">상품명</label>
            <input
              {...register('name')}
              placeholder="예: 카카오뱅크 정기예금"
              className={cn(inputClass, errors.name && 'border-red-300')}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {watchedType === '예금' ? '거치금액 (원)' : '월 납입액 (원)'}
            </label>
            <input
              type="number"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0"
              className={cn(inputClass, errors.amount && 'border-red-300')}
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          {/* Rate & Term */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">연이율 (%)</label>
              <input
                type="number"
                step="0.01"
                {...register('rate', { valueAsNumber: true })}
                placeholder="3.5"
                className={cn(inputClass, errors.rate && 'border-red-300')}
              />
              {errors.rate && <p className="text-xs text-red-500 mt-1">{errors.rate.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">기간 (개월)</label>
              <input
                type="number"
                {...register('term', { valueAsNumber: true })}
                placeholder="12"
                className={cn(inputClass, errors.term && 'border-red-300')}
              />
              {errors.term && <p className="text-xs text-red-500 mt-1">{errors.term.message}</p>}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">가입일</label>
            <input
              type="date"
              {...register('startDate')}
              className={cn(inputClass, 'cursor-pointer', errors.startDate && 'border-red-300')}
            />
            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
          </div>

          {/* Maturity Preview */}
          {preview && (
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <p className="text-xs text-indigo-400 mb-0.5">예상 만기 수령액</p>
              <p className="text-lg font-bold text-indigo-700">{formatKRW(Math.round(preview.maturityAmount))}</p>
              <p className="text-xs text-indigo-400 mt-0.5">
                원금 {formatKRW(preview.principal)} + 세후이자 {formatKRW(Math.round(preview.afterTaxInterest))}
              </p>
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
            추가하기
          </button>
        </form>
      </div>
    </div>
  );
}
