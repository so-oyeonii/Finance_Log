import { useAppStore } from '@/stores/useAppStore';
import type {
  AiChatRequest,
  AiSmartInputRequest,
  AiSmartInputResponse,
  AiAnalysisRequest,
  AiAnalysisResponse,
} from '@/types';

// ============================================
// useAi — AI API call abstractions
// ============================================

export function useAi() {
  const openaiApiKey = useAppStore((s) => s.openaiApiKey);

  const headers = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (openaiApiKey) h['x-openai-api-key'] = openaiApiKey;
    return h;
  };

  const sendChat = async (
    message: string,
    history: AiChatRequest['history'],
    context: AiChatRequest['context']
  ): Promise<string> => {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ message, history, context } satisfies AiChatRequest),
    });
    if (!res.ok) throw new Error('채팅 응답에 실패했습니다.');
    const data = await res.json();
    return data.reply;
  };

  const smartInput = async (
    text: string,
    accounts: AiSmartInputRequest['accounts'],
    mode: AiSmartInputRequest['mode']
  ): Promise<AiSmartInputResponse> => {
    const res = await fetch('/api/ai/smart-input', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ text, accounts, mode } satisfies AiSmartInputRequest),
    });
    if (!res.ok) throw new Error('AI 입력 분석에 실패했습니다.');
    return res.json();
  };

  const analyzeFinance = async (
    data: AiAnalysisRequest
  ): Promise<AiAnalysisResponse> => {
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('AI 분석에 실패했습니다.');
    return res.json();
  };

  const scanReceipt = async (
    image: string,
    mimeType: string
  ): Promise<{ date: string; amount: number; memo: string; category: string }> => {
    const res = await fetch('/api/ai/receipt', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ image, mimeType }),
    });
    if (!res.ok) throw new Error('영수증 인식에 실패했습니다.');
    return res.json();
  };

  const scanAssets = async (
    image: string,
    mimeType: string
  ): Promise<{ accounts: { bank: string; name: string; type: string; balance: number }[] }> => {
    const res = await fetch('/api/ai/asset-scan', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ image, mimeType }),
    });
    if (!res.ok) throw new Error('스크린샷 분석에 실패했습니다.');
    return res.json();
  };

  const textToSpeech = async (text: string): Promise<Blob> => {
    const res = await fetch('/api/ai/tts', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('TTS 변환에 실패했습니다.');
    return res.blob();
  };

  return { sendChat, smartInput, analyzeFinance, scanReceipt, scanAssets, textToSpeech };
}
