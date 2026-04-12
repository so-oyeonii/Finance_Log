'use client';

import { Camera, MessageSquarePlus, Pencil, Sparkles, X } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

// 첫 실행 시 한 번만 보여주는 온보딩 마법사.
// "기존 보유 자산이 있나요?"에 답하며 가장 편한 등록 방법으로 유도.
export function OnboardingModal() {
  const { mode, onboardingSeen, setOnboardingSeen, setActiveTab } = useAppStore();
  const isGraduate = mode === 'graduate';

  if (onboardingSeen) return null;

  const finish = () => setOnboardingSeen(true);

  const goToStocks = () => {
    setActiveTab('stocks');
    finish();
  };

  const goToAssets = () => {
    setActiveTab('assets');
    finish();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end md:items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full md:w-[34rem] rounded-t-2xl md:rounded-2xl p-6 max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className={cn('w-5 h-5', isGraduate ? 'text-indigo-500' : 'text-emerald-500')} />
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                처음 오셨네요!
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              이미 가지고 계신 자산이 있나요? 가장 편한 방법을 골라보세요.
            </p>
          </div>
          <button
            onClick={finish}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
            aria-label="닫기"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 3 method cards */}
        <div className="space-y-3 mt-5">
          <MethodCard
            icon={<Camera className="w-5 h-5" />}
            title="증권사 앱 스크린샷"
            desc="보유 종목 화면을 찍어서 업로드하면 AI가 종목·수량·평단을 한 번에 추출해요. 가장 빠른 방법이에요."
            badge="추천"
            isGraduate={isGraduate}
            onClick={goToStocks}
          />
          <MethodCard
            icon={<MessageSquarePlus className="w-5 h-5" />}
            title="자연어로 한번에 입력"
            desc={'"삼성전자 100주 7만원, 애플 20주 150달러" 처럼 여러 줄로 적으면 자동 파싱해요.'}
            isGraduate={isGraduate}
            onClick={goToStocks}
          />
          <MethodCard
            icon={<Pencil className="w-5 h-5" />}
            title="직접 하나씩 입력"
            desc="계좌·예적금·주식을 천천히 수기로 등록할게요. 기본 방식이에요."
            isGraduate={isGraduate}
            onClick={goToAssets}
          />
        </div>

        <button
          onClick={finish}
          className="w-full mt-5 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          아직 등록할 자산이 없어요 — 나중에 할래요
        </button>
      </div>
    </div>
  );
}

function MethodCard({
  icon,
  title,
  desc,
  badge,
  isGraduate,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
  isGraduate: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-colors',
        'border-slate-200 dark:border-slate-600 hover:border-transparent',
        isGraduate
          ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:ring-2 hover:ring-indigo-300'
          : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:ring-2 hover:ring-emerald-300'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
          isGraduate
            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300'
            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300'
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</span>
          {badge && (
            <span
              className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                isGraduate
                  ? 'bg-indigo-600 text-white'
                  : 'bg-emerald-600 text-white'
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}
