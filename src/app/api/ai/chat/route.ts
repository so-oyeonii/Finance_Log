import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, history, context } = await req.json();

    const systemPrompt = `${context.aiPersonality}

사용자의 현재 재무 데이터:
- 총 자산: ${context.totalAssets?.toLocaleString()}원
- 이번 달 지출: ${context.monthlyExpense?.toLocaleString()}원
- 계좌 요약: ${context.accountSummary}

위 데이터를 참고하여 맞춤형 조언을 제공하세요.
짧고 재치있게, 하지만 핵심은 정확하게 답변하세요.`;

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map((h: any) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return NextResponse.json({
      reply: completion.choices[0]?.message?.content || '응답을 생성할 수 없습니다.',
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
