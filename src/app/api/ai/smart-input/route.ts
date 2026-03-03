import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-openai-api-key') || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key가 설정되지 않았습니다. 설정에서 OpenAI API Key를 입력해주세요.' }, { status: 401 });
    }
    const openai = new OpenAI({ apiKey });
    const { text, accounts, mode } = await req.json();

    const accountList = accounts.map((a: any) => `"${a.name}" (id: ${a.id})`).join(', ');

    const systemPrompt = `당신은 가계부 입력 도우미입니다.
사용자의 자연어 입력을 분석하여 거래 정보를 JSON으로 반환합니다.

사용자 계좌 목록: ${accountList || '등록된 계좌 없음'}

규칙:
- "카드"가 포함되면 type은 "expense"
- "이체", "송금"이 포함되면 type은 "transfer"
- 급여, 인건비 등은 type "income"
- accountId는 계좌 목록에서 가장 적절한 것을 매칭
- isDutchPay: "n빵", "더치페이", "나누기" 등이 포함되면 true
- date가 명시되지 않으면 오늘 날짜 사용

반드시 아래 JSON 형식으로만 응답하세요:
{
  "date": "YYYY-MM-DD",
  "type": "income" | "expense" | "transfer",
  "category": "카테고리명",
  "amount": 숫자,
  "memo": "메모",
  "isDutchPay": false,
  "totalAmount": null,
  "peopleCount": null,
  "accountId": 숫자 또는 null,
  "toAccountId": null
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.1,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Smart Input Error:', error);
    return NextResponse.json({ error: 'AI 분석 실패' }, { status: 500 });
  }
}
