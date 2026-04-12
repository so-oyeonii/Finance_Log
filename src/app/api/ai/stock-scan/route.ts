import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 증권사 앱의 "보유 종목" 스크린샷을 분석해 종목/수량/평단가를 배열로 추출한다.
// 결과는 "기준일 스냅샷" 방식의 초기 보유분으로 일괄 등록된다.
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
          content: `당신은 한국 증권사 앱(키움/미래에셋/삼성/NH/토스증권 등) 스크린샷에서
보유 종목 정보를 추출하는 파서입니다. 다음 JSON 형식으로 반환하세요:

{
  "holdings": [
    {
      "market": "국내" | "미국" | "중국" | "ETF" | "코인" | "기타",
      "ticker": "종목명 또는 티커 (예: 삼성전자, AAPL, KODEX200)",
      "quantity": 숫자(보유 수량, 소수점 허용),
      "avgPrice": 숫자(평균 매수 단가, 원 단위 — 해외주식도 원화 환산된 값 우선),
      "currency": "KRW" | "USD",
      "inputPrice": 숫자(원래 표시된 가격 값. 해외는 USD, 국내는 KRW)
    }
  ]
}

규칙:
- 수량/가격은 숫자로만. 쉼표, "주", "원", "$" 제거
- ETF 판별: "KODEX", "TIGER", "ACE", "SOL", "VOO", "SPY", "QQQ" 등 → market="ETF"
- 코인: "BTC", "ETH", "원화마켓" 등 → market="코인"
- 미국 주식 티커(3~5자 영문) → market="미국", currency="USD"
- 중국 주식(HK/CN 접미사, 홍콩 티커) → market="중국"
- 그 외 한글 종목명 → market="국내", currency="KRW"
- 평균단가가 보이지 않으면 "현재가"라도 추출하고 avgPrice에 넣기 (사용자 수정 예정)
- 애매하면 누락하지 말고 추출 후 사용자가 프리뷰에서 수정하게 함
- 반드시 JSON만 반환`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '이 증권사 스크린샷에서 보유 종목 정보를 추출해주세요.' },
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
      max_tokens: 2000,
    });

    const result = JSON.parse(
      completion.choices[0]?.message?.content || '{"holdings":[]}'
    );
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Stock Scan Error:', error);
    return NextResponse.json(
      { error: '스크린샷 분석에 실패했습니다.' },
      { status: 500 }
    );
  }
}
