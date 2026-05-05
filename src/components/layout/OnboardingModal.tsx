'use client';

import { ArrowRight, Building2, GraduationCap, Briefcase, Plus, Sparkles, X } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';
import type { AppMode } from '@/types';

export function OnboardingModal() {
  const { mode, setMode, onboardingSeen, setOnboardingSeen, setActiveTab } = useAppStore();
  const isGraduate = mode === 'graduate';

  if (onboardingSeen) return null;

  const finish = () => setOnboardingSeen(true);

  const chooseMode = async (nextMode: AppMode) => {
    await setMode(nextMode);
  };

  const goToAssets = () => {
    setActiveTab('assets');
    finish();
  };

  const goToLedger = () => {
    setActiveTab('ledger');
    finish();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 animate-fade-in md:items-center">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 animate-slide-up dark:bg-slate-800 md:w-[34rem] md:rounded-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className={cn('h-5 w-5', isGraduate ? 'text-indigo-500' : 'text-emerald-500')} />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">오늘부터 기록을 시작해볼게요</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              계좌 하나와 첫 거래만 있으면 대시보드가 채워집니다. 투자와 AI 기능은 나중에 붙여도 됩니다.
            </p>
          </div>
          <button
            onClick={finish}
            className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="닫기"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <section>
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">1. 내 상황 선택</p>
            <div className="grid grid-cols-2 gap-2">
              <ModeButton
                active={mode === 'graduate'}
                icon={<GraduationCap className="h-4 w-4" />}
                label="대학원생"
                description="불규칙 수입 중심"
                tone="indigo"
                onClick={() => chooseMode('graduate')}
              />
              <ModeButton
                active={mode === 'worker'}
                icon={<Briefcase className="h-4 w-4" />}
                label="회사원"
                description="월급/투자 중심"
                tone="emerald"
                onClick={() => chooseMode('worker')}
              />
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">2. 시작 방법</p>
            <div className="space-y-2">
              <StartCard
                icon={<Building2 className="h-5 w-5" />}
                title="계좌 하나 먼저 추가"
                desc="입출금 계좌와 현재 잔액을 넣으면 거래 기록 때 잔액이 자동으로 맞춰집니다."
                badge="추천"
                isGraduate={isGraduate}
                onClick={goToAssets}
              />
              <StartCard
                icon={<Plus className="h-5 w-5" />}
                title="바로 첫 거래 기록"
                desc="이미 계좌를 만들었다면 장부로 이동해서 오늘 지출부터 기록합니다."
                isGraduate={isGraduate}
                onClick={goToLedger}
              />
            </div>
          </section>
        </div>

        <button
          onClick={finish}
          className="mt-5 w-full py-2.5 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          둘러보고 나중에 시작하기
        </button>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  icon,
  label,
  description,
  tone,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  tone: 'indigo' | 'emerald';
  onClick: () => void;
}) {
  const activeClass = tone === 'indigo'
    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200'
    : 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200';

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg border p-3 text-left transition-colors',
        active
          ? activeClass
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      )}
    >
      <div className="mb-1 flex items-center gap-1.5 text-sm font-bold">
        {icon}
        {label}
      </div>
      <p className="text-xs opacity-75">{description}</p>
    </button>
  );
}

function StartCard({
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
        'flex w-full items-start gap-3 rounded-lg border border-slate-200 p-4 text-left transition-colors dark:border-slate-600',
        isGraduate
          ? 'hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
          : 'hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
          isGraduate
            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300'
            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</span>
          {badge && <span className="rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white dark:bg-white dark:text-slate-900">{badge}</span>}
        </div>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
      <ArrowRight className="mt-2 h-4 w-4 flex-shrink-0 text-slate-300" />
    </button>
  );
}
