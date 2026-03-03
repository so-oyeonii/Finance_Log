'use client';

import { Sparkles } from 'lucide-react';

export function AiReportWidget() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-violet-500" />
        <h3 className="text-sm font-bold text-slate-700">AI 분석 리포트</h3>
      </div>
      <div className="text-center py-6">
        <Sparkles className="w-8 h-8 text-violet-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">AI 분석은 곧 추가됩니다</p>
        <p className="text-xs text-slate-300 mt-1">Phase 6에서 구현 예정</p>
      </div>
    </div>
  );
}
