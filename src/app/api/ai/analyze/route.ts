import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-openai-api-key') || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key가 설정되지 않았습니다. 설정에서 OpenAI API Key를 입력해주세요.' }, { status: 401 });
    }
    const openai = new OpenAI({ apiKey });
    const { accounts, savings, topExpenses, portfolioGain, mode, incomeStats } = await req.json();

    const modeLabel = mode === 'graduate' ? '대학원생' : '직장인';

    const systemPrompt = `당신은 ${modeLabel} 전문 재무 분석가입니다.
사용자의 재무 데이터를 분석하여 유머러스하지만 실용적인 진단 리포트를 작성합니다.

${mode === 'graduate' ? `대학원생은 수입이 불규칙(BK인건비 매달 / 과제인건비 들쑥날쑥 / 장학금 목돈) 합니다.
조언 시 다음 원칙을 지키세요:
- "고정 수입(BK/조교) 기반의 보수 예산"을 먼저 제안
- 목돈(장학금/상금)은 평균에 섞지 말고 버퍼·저축으로 분리 제안
- "월 평균 대비 이번달 수입이 많다/적다"식 해석 권장
- 세금: BK/과제 인건비는 3.3% 원천징수 사업소득, 장학금은 비과세 (성적/재단)` : ''}

반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "진단 제목 (재치있게, 20자 이내)",
  "message": "종합 분석 메시지 (100자 이내, 핵심만)",
  "tips": ["구체적인 팁1", "구체적인 팁2", "구체적인 팁3"]
}`;

    const incomeBlock = incomeStats
      ? `
- 수입 패턴: 활성월 평균 ${incomeStats.activeAvg?.toLocaleString()}원 (${incomeStats.stabilityLabel}, CV=${incomeStats.cv?.toFixed(2)})
- 고정 수입 월: ${incomeStats.fixedMonthlyEstimate?.toLocaleString()}원, 목돈 연: ${incomeStats.lumpYearlyTotal?.toLocaleString()}원
- 다음달 예상: ${incomeStats.forecast?.low?.toLocaleString()} ~ ${incomeStats.forecast?.high?.toLocaleString()}원
- 현재 추천 지출 한도: ${incomeStats.suggestedSpendLimit?.toLocaleString()}원
- 원천별 평균: ${incomeStats.bySource?.map((s: any) => `${s.category}(${s.stability}) ${s.avg?.toLocaleString()}`).join(', ')}`
      : '';

    const userPrompt = `내 재무 데이터:
- 보유 계좌: ${JSON.stringify(accounts?.map((a: any) => ({ name: a.name, type: a.type, balance: a.balance })))}
- 예적금: ${JSON.stringify(savings?.map((s: any) => ({ name: s.name, amount: s.amount })))}
- 지출 Top3: ${JSON.stringify(topExpenses)}
- 투자 실현손익: ${portfolioGain?.toLocaleString()}원${incomeBlock}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.8,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analysis Error:', error);
    return NextResponse.json({ error: '분석 실패' }, { status: 500 });
  }
}
