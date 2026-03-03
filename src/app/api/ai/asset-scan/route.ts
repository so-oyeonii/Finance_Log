import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-openai-api-key') || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key가 설정되지 않았습니다. 설정에서 OpenAI API Key를 입력해주세요.' }, { status: 401 });
    }
    const openai = new OpenAI({ apiKey });
    const { image, mimeType } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `은행/증권 앱 스크린샷을 분석하여 계좌 정보를 추출하세요.
다음 JSON 형식으로 반환하세요:
{
  "accounts": [
    {
      "bank": "은행/증권사 이름",
      "name": "계좌명 또는 상품명",
      "type": "입출금" | "예적금" | "주택청약" | "IRP/연금" | "주식예수금" | "비상금" | "신용카드" | "코인" | "기타",
      "balance": 숫자(잔액, 원 단위)
    }
  ]
}

규칙:
- 잔액은 반드시 숫자로 변환 (쉼표, "원" 등 제거)
- 신용카드의 경우 결제 예정액을 balance로
- 여러 계좌가 보이면 모두 추출
- 계좌 유형은 위 목록에서 가장 적합한 것을 선택
- 반드시 JSON만 반환하세요`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '이 스크린샷에서 계좌 정보를 추출해주세요.' },
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
      max_tokens: 1000,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"accounts":[]}');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Asset Scan Error:', error);
    return NextResponse.json({ error: '스크린샷 분석에 실패했습니다.' }, { status: 500 });
  }
}
