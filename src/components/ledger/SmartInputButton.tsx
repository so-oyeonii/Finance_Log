'use client';

import { useState, useRef } from 'react';
import { Sparkles, X, Camera, MessageSquare, Loader2, Check, Edit3 } from 'lucide-react';
import { useAi } from '@/hooks/useAi';
import { formatKRW } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Account, AppMode, AiSmartInputResponse, Transaction } from '@/types';

interface SmartInputButtonProps {
  accounts: Account[];
  mode: AppMode;
  onConfirm: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onEditInForm: (data: Partial<Transaction>) => void;
}

export function SmartInputButton({ accounts, mode, onConfirm, onEditInForm }: SmartInputButtonProps) {
  const { smartInput, scanReceipt } = useAi();
  const isGraduate = mode === 'graduate';

  const [isOpen, setIsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'receipt'>('text');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AiSmartInputResponse | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setText('');
    setError('');
    setResult(null);
    setIsLoading(false);
    setInputMode('text');
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const handleTextSubmit = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const accountList = accounts.map((a) => ({ id: a.id!, name: `${a.bank} ${a.name}` }));
      const parsed = await smartInput(text, accountList, mode);
      setResult(parsed);
    } catch (err: any) {
      setError(err?.message || 'AI 분석에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setError('');
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const dataUrl = reader.result as string;
          resolve(dataUrl.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const parsed = await scanReceipt(base64, file.type);
      setResult({
        date: parsed.date,
        type: 'expense',
        category: parsed.category,
        amount: parsed.amount,
        memo: parsed.memo,
        isDutchPay: false,
      });
    } catch (err: any) {
      setError(err?.message || '영수증 인식에 실패했습니다.');
    } finally {
      setIsLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (!result) return;
    onConfirm({
      date: result.date,
      type: result.type,
      category: result.category,
      amount: result.amount,
      memo: result.memo,
      accountId: result.accountId || accounts[0]?.id || 0,
      toAccountId: result.type === 'transfer' ? undefined : undefined,
      isDutchPay: result.isDutchPay,
      totalAmount: result.totalAmount,
      peopleCount: result.peopleCount,
    });
    handleClose();
  };

  const handleEdit = () => {
    if (!result) return;
    onEditInForm({
      date: result.date,
      type: result.type,
      category: result.category,
      amount: result.amount,
      memo: result.memo,
      accountId: result.accountId || accounts[0]?.id || 0,
      isDutchPay: result.isDutchPay,
      totalAmount: result.totalAmount,
      peopleCount: result.peopleCount,
    });
    handleClose();
  };

  const typeLabel = (t: string) =>
    t === 'income' ? '수입' : t === 'expense' ? '지출' : '이체';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white transition-colors',
          isGraduate ? 'bg-violet-500 hover:bg-violet-600' : 'bg-teal-500 hover:bg-teal-600'
        )}
      >
        <Sparkles className="w-3.5 h-3.5" />
        AI 입력
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
          <div className="bg-white w-full md:w-[28rem] rounded-t-2xl md:rounded-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800">AI 거래 입력</h3>
              <button onClick={handleClose} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {!result ? (
              <>
                {/* Mode toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setInputMode('text')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors',
                      inputMode === 'text'
                        ? (isGraduate ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700')
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                    자연어 입력
                  </button>
                  <button
                    onClick={() => setInputMode('receipt')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors',
                      inputMode === 'receipt'
                        ? (isGraduate ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700')
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    <Camera className="w-4 h-4" />
                    영수증 촬영
                  </button>
                </div>

                {inputMode === 'text' ? (
                  <div className="space-y-3">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="예: 어제 스타벅스에서 아메리카노 4500원 카드로 결제"
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleTextSubmit}
                      disabled={!text.trim() || isLoading}
                      className={cn(
                        'w-full py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-40',
                        isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      )}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          분석 중...
                        </span>
                      ) : (
                        'AI 분석하기'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      {isLoading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                          <p className="text-sm text-slate-500">영수증 분석 중...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Camera className="w-8 h-8 text-slate-400" />
                          <p className="text-sm text-slate-500">영수증 사진을 선택하세요</p>
                          <p className="text-xs text-slate-400">JPG, PNG 지원</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-500 mt-3">{error}</p>
                )}
              </>
            ) : (
              /* Result preview */
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">날짜</span>
                    <span className="font-medium text-slate-700">{result.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">유형</span>
                    <span className={cn(
                      'font-medium',
                      result.type === 'income' ? 'text-blue-600' : result.type === 'expense' ? 'text-red-500' : 'text-amber-600'
                    )}>
                      {typeLabel(result.type)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">카테고리</span>
                    <span className="font-medium text-slate-700">{result.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">금액</span>
                    <span className="font-bold text-slate-800">{formatKRW(result.amount)}</span>
                  </div>
                  {result.memo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">메모</span>
                      <span className="text-slate-700">{result.memo}</span>
                    </div>
                  )}
                  {result.isDutchPay && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">더치페이</span>
                      <span className="text-slate-700">
                        {result.totalAmount?.toLocaleString()}원 / {result.peopleCount}명
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    수정
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white text-sm font-medium transition-colors',
                      isGraduate ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    )}
                  >
                    <Check className="w-4 h-4" />
                    확인
                  </button>
                </div>

                <button
                  onClick={reset}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  다시 입력하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
