import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-openai-api-key') || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key가 설정되지 않았습니다. 설정에서 OpenAI API Key를 입력해주세요.' }, { status: 401 });
    }
    const openai = new OpenAI({ apiKey });
    const { accounts, savings, topExpenses, portfolioGain, mode } = await req.json();

    const modeLabel = mode === 'graduate' ? '대학원생' : '직장인';

    const systemPrompt = `당신은 ${modeLabel} 전문 재무 분석가입니다.
사용자의 재무 데이터를 분석하여 유머러스하지만 실용적인 진단 리포트를 작성합니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "진단 제목 (재치있게, 20자 이내)",
  "message": "종합 분석 메시지 (100자 이내, 핵심만)",
  "tips": ["구체적인 팁1", "구체적인 팁2", "구체적인 팁3"]
}`;

    const userPrompt = `내 재무 데이터:
- 보유 계좌: ${JSON.stringify(accounts?.map((a: any) => ({ name: a.name, type: a.type, balance: a.balance })))}
- 예적금: ${JSON.stringify(savings?.map((s: any) => ({ name: s.name, amount: s.amount })))}
- 지출 Top3: ${JSON.stringify(topExpenses)}
- 투자 실현손익: ${portfolioGain?.toLocaleString()}원`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
