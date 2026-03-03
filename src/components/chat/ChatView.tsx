'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useAi } from '@/hooks/useAi';
import { MODES } from '@/config/modes';
import { formatKRW } from '@/lib/format';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatView() {
  const { mode, selectedYear } = useAppStore();
  const { accounts, totalBalance } = useAccounts();
  const { summary } = useTransactions(selectedYear);
  const { sendChat } = useAi();

  const modeConfig = MODES[mode];
  const isGraduate = mode === 'graduate';

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: modeConfig.greeting },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Build context for AI
  const buildContext = useCallback(() => {
    const accountSummary = accounts
      .map((a) => `${a.bank} ${a.name}(${a.type}): ${formatKRW(a.balance)}`)
      .join(', ');

    return {
      aiPersonality: modeConfig.aiPersonality,
      totalAssets: totalBalance,
      monthlyExpense: Math.round(summary.expense / 12),
      accountSummary: accountSummary || '등록된 계좌 없음',
    };
  }, [accounts, totalBalance, summary.expense, modeConfig.aiPersonality]);

  const handleSend = async (text: string) => {
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const context = buildContext();
      const reply = await sendChat(text, history, context);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err?.message || '죄송합니다. 응답을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pb-4 px-1"
      >
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            isGraduate={isGraduate}
          />
        ))}
        {isLoading && (
          <div className="flex gap-2 items-start">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                isGraduate ? 'bg-indigo-100' : 'bg-emerald-100'
              }`}
            >
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput onSend={handleSend} isLoading={isLoading} isGraduate={isGraduate} />
    </div>
  );
}
