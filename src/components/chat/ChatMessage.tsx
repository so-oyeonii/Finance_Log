'use client';

import { useState } from 'react';
import { Bot, Volume2, Loader2 } from 'lucide-react';
import { useAi } from '@/hooks/useAi';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isGraduate: boolean;
}

export function ChatMessage({ role, content, isGraduate }: ChatMessageProps) {
  const { textToSpeech } = useAi();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTts = async () => {
    try {
      setIsSpeaking(true);
      const blob = await textToSpeech(content);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch {
      setIsSpeaking(false);
    }
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            'max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white whitespace-pre-wrap',
            isGraduate ? 'bg-indigo-500' : 'bg-emerald-500'
          )}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-start">
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          isGraduate ? 'bg-indigo-100' : 'bg-emerald-100'
        )}
      >
        <Bot className={cn('w-4 h-4', isGraduate ? 'text-indigo-600' : 'text-emerald-600')} />
      </div>
      <div className="max-w-[80%]">
        <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 shadow-sm whitespace-pre-wrap">
          {content}
        </div>
        <button
          onClick={handleTts}
          disabled={isSpeaking}
          className="mt-1 ml-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
          title="음성으로 듣기"
        >
          {isSpeaking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
