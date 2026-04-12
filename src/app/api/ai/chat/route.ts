import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-openai-api-key') || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key가 설정되지 않았습니다. 설정에서 OpenAI API Key를 입력해주세요.' }, { status: 401 });
    }
    const openai = new OpenAI({ apiKey });
    const { message, history, context } = await req.json();

    // 수입 변동성을 AI에 컨텍스트로 주입 (대학원생의 불규칙 수입 대응)
    const incomeBlock = context.incomeStats
      ? `
사용자의 수입 패턴:
- 활성월 평균 수입: ${context.incomeStats.activeAvg?.toLocaleString()}원 (${context.incomeStats.stabilityLabel}, CV=${context.incomeStats.cv?.toFixed(2)})
- 중앙값: ${context.incomeStats.median?.toLocaleString()}원
- 고정 수입 월 평균: ${context.incomeStats.fixedMonthlyEstimate?.toLocaleString()}원 (매달 안정적)
- 목돈(장학금 등) 연 합계: ${context.incomeStats.lumpYearlyTotal?.toLocaleString()}원 (버퍼로 분리 권장)
- 다음달 예상 범위: ${context.incomeStats.forecast?.low?.toLocaleString()} ~ ${context.incomeStats.forecast?.high?.toLocaleString()}원
- 추천 월 지출 한도: ${context.incomeStats.suggestedSpendLimit?.toLocaleString()}원
- 원천별 평균:
${context.incomeStats.bySource?.map((s: any) => `  · ${s.category} (${s.stability}): 평균 ${s.avg?.toLocaleString()}원, 변동성 ${s.cv?.toFixed(2)}`).join('\n')}

주의: 수입이 불규칙한 사용자입니다. 조언 시 "평균 수입으로 이렇게 쓰세요" 보다 "고정 수입 기반 보수 예산" 개념을 쓰세요.
목돈(장학금/상금)은 평균 월수입에 섞지 말고 별도 저축/투자로 분리 제안하세요.`
      : '';

    const systemPrompt = `${context.aiPersonality}

사용자의 현재 재무 데이터:
- 총 자산: ${context.totalAssets?.toLocaleString()}원
- 이번 달 지출: ${context.monthlyExpense?.toLocaleString()}원
- 계좌 요약: ${context.accountSummary}
${incomeBlock}

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
      model: 'gpt-5-nano',
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
