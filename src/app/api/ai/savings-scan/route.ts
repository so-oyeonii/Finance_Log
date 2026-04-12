import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 은행/증권 앱의 "예적금 목록" 스크린샷을 분석해 상품명/원금/이율/기간을 배열로 추출한다.
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-openai-api-key') || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key가 설정되지 않았습니다. 설정에서 OpenAI API Key를 입력해주세요.' },
        { status: 401 }
      );
    }
    const openai = new OpenAI({ apiKey });
    const { image, mimeType } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 한국 은행/증권 앱 스크린샷에서 예적금 상품 정보를 추출하는 파서입니다.
다음 JSON 형식으로 반환하세요:

{
  "savings": [
    {
      "type": "예금" | "적금",
      "name": "상품명 (은행명 + 상품명 포함)",
      "amount": 숫자(예금: 거치금액 원 단위 / 적금: 월 납입액 원 단위),
      "rate": 숫자(연이율 %, 소수점 허용 예: 3.5),
      "term": 숫자(개월 단위 예: 12, 24, 36),
      "startDate": "YYYY-MM-DD" (가입일, 보이지 않으면 오늘 날짜)
    }
  ]
}

규칙:
- 숫자는 쉼표/단위 제거 후 순수 숫자로 (5,000,000원 → 5000000)
- 기간: "1년"→12, "2년"→24, "6개월"→6
- 이율: "연 3.5%", "3.50%" → 3.5 (세전 명목금리 기준)
- 예금: 거치식, 한번에 큰 금액 보관 → amount는 그 총액
- 적금: 매월 불입 → amount는 월 납입액 (총 납입금 아님!)
- 만기수령액이 표시되어 있어도 amount에 쓰지 말 것 (원금 기준)
- 가입일 보이지 않으면 "${new Date().toISOString().split('T')[0]}"
- 반드시 JSON만 반환`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '이 예적금 스크린샷에서 상품 정보를 추출해주세요.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });

    const result = JSON.parse(
      completion.choices[0]?.message?.content || '{"savings":[]}'
    );
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Savings Scan Error:', error);
    return NextResponse.json(
      { error: '스크린샷 분석에 실패했습니다.' },
      { status: 500 }
    );
  }
}
