'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { STOCK_MARKETS } from '@/config/modes';
import { getToday } from '@/lib/format';
import type { Stock, Account, AppMode } from '@/types';
import { cn } from '@/lib/utils';

const stockSchema = z.object({
  date: z.string().min(1, '날짜를 선택하세요'),
  type: z.enum(['buy', 'sell', 'dividend']),
  market: z.enum(['국내', '미국', '중국', 'ETF', '코인', '기타']),
  ticker: z.string().min(1, '종목명을 입력하세요'),
  currency: z.enum(['KRW', 'USD']),
  inputPrice: z.number({ invalid_type_error: '가격을 입력하세요' }).positive('가격은 0보다 커야 합니다'),
  exchangeRate: z.number().optional(),
  quantity: z.number().optional(),
  accountId: z.number({ invalid_type_error: '계좌를 선택하세요' }).positive('계좌를 선택하세요'),
  memo: z.string().default(''),
  isInitial: z.boolean().default(false),
});

type StockFormData = z.infer<typeof stockSchema>;

interface StockFormModalProps {
  accounts: Account[];
  mode: AppMode;
  onSubmit: (data: Omit<Stock, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function StockFormModal({ accounts, mode, onSubmit, onClose }: StockFormModalProps) {
  const isGraduate = mode === 'graduate';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      date: getToday(),
      type: 'buy',
      market: '국내',
      ticker: '',
      currency: 'KRW',
      inputPrice: 0,
      exchangeRate: 1300,
      quantity: 1,
      accountId: accounts[0]?.id ?? 0,
      memo: '',
      isInitial: false,
    },
  });

  const watchedType = watch('type');
  const watchedCurrency = watch('currency');
  const watchedMarket = watch('market');

  // Auto-set currency based on market
  useEffect(() => {
    if (watchedMarket === '미국') {
      setValue('currency', 'USD');
    } else {
      setValue('currency', 'KRW');
    }
  }, [watchedMarket, setValue]);

  const handleFormSubmit = (data: StockFormData) => {
    const isUsd = data.currency === 'USD';
    const exchangeRate = isUsd ? (data.exchangeRate || 1300) : 1;
    const priceKrw = isUsd ? data.inputPrice * exchangeRate : data.inputPrice;

    // For dividends, quantity is 0, price is total amount
    const quantity = data.type === 'dividend' ? 0 : (data.quantity || 1);
    const price = data.type === 'dividend' ? priceKrw : priceKrw;

    onSubmit({
      date: data.date,
      type: data.type,
      market: data.market,
      ticker: data.ticker,
      currency: data.currency,
      price,
      inputPrice: isUsd ? data.inputPrice : undefined,
      exchangeRate: isUsd ? exchangeRate : undefined,
      quantity,
      accountId: data.accountId,
      memo: data.memo || '',
      isInitial: data.isInitial,
    });
  };

  const typeOptions = [
    { key: 'buy' as const, label: '매수', color: 'bg-blue-600 text-white' },
    { key: 'sell' as const, label: '매도', color: 'bg-red-500 text-white' },
    { key: 'dividend' as const, label: '배당', color: 'bg-amber-500 text-white' },
  ];

  const submitBtnClass = isGraduate
    ? 'bg-indigo-600 hover:bg-indigo-700'
    : 'bg-emerald-600 hover:bg-emerald-700';

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full md:w-[28rem] rounded-t-2xl md:rounded-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">주식/코인 거래 추가</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">거래유형</label>
            <div className="flex gap-2">
              {typeOptions.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setValue('type', t.key)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    watchedType === t.key ? t.color : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
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

          {/* Market */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">시장</label>
            <select
              {...register('market')}
              className={cn(inputClass, 'cursor-pointer')}
            >
              {STOCK_MARKETS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Ticker */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">종목명</label>
            <input
              {...register('ticker')}
              placeholder="예: 삼성전자, AAPL"
              className={cn(inputClass, errors.ticker && 'border-red-300')}
            />
            {errors.ticker && <p className="text-xs text-red-500 mt-1">{errors.ticker.message}</p>}
          </div>

          {/* Currency Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">통화</label>
            <div className="flex gap-2">
              {(['KRW', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('currency', c)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                    watchedCurrency === c
                      ? 'bg-slate-700 dark:bg-slate-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  )}
                >
                  {c === 'KRW' ? '원 (KRW)' : '달러 (USD)'}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              {watchedType === 'dividend' ? '배당금액' : '단가'} ({watchedCurrency === 'KRW' ? '원' : '$'})
            </label>
            <input
              type="number"
              step="any"
              {...register('inputPrice', { valueAsNumber: true })}
              placeholder="0"
              className={cn(inputClass, errors.inputPrice && 'border-red-300')}
            />
            {errors.inputPrice && <p className="text-xs text-red-500 mt-1">{errors.inputPrice.message}</p>}
          </div>

          {/* Exchange Rate (USD only) */}
          {watchedCurrency === 'USD' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">환율 (₩/$)</label>
              <input
                type="number"
                step="any"
                {...register('exchangeRate', { valueAsNumber: true })}
                placeholder="1300"
                className={inputClass}
              />
            </div>
          )}

          {/* Quantity (hidden for dividends) */}
          {watchedType !== 'dividend' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">수량</label>
              <input
                type="number"
                step="any"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="1"
                className={cn(inputClass, errors.quantity && 'border-red-300')}
              />
            </div>
          )}

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
              placeholder="메모 (선택)"
              className={inputClass}
            />
          </div>

          {/* Initial Holding */}
          {watchedType === 'buy' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isInitial"
                {...register('isInitial')}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <label htmlFor="isInitial" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                초기 보유분 (계좌 잔액 차감 안함)
              </label>
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
