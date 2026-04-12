import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 자연어 여러 줄 입력을 받아 보유 종목 배열로 파싱한다.
// 예: "삼성전자 100주 평단 7만원, 애플 20주 150달러, KODEX200 50주 3만"
// 결과는 stock-scan과 동일한 포맷이므로 StockScanResultModal을 재사용한다.
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
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ holdings: [] });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: `당신은 한국 개인 투자자의 보유 종목을 자연어로 받아 JSON 배열로 변환하는 파서입니다.

[출력 형식]
{
  "holdings": [
    {
      "market": "국내" | "미국" | "중국" | "ETF" | "코인" | "기타",
      "ticker": "종목명 또는 티커",
      "quantity": 숫자(소수점 허용),
      "avgPrice": 숫자(원 단위 평균단가. 해외는 원래 입력값을 inputPrice에 두고 avgPrice는 참고값으로 채움),
      "currency": "KRW" | "USD",
      "inputPrice": 숫자(원래 표시된 가격. USD면 USD, KRW면 KRW)
    }
  ]
}

[규칙]
- 쉼표, 줄바꿈, "그리고" 등으로 구분된 여러 종목을 각각 하나의 객체로 변환
- "5천원"→5000, "1.5만"→15000, "7만"→70000, "150달러"→150(USD)
- ETF: KODEX/TIGER/ACE/SOL/VOO/SPY/QQQ 등 → market="ETF"
- 코인: BTC/ETH/비트코인/이더리움 등 → market="코인"
- 미국 주식 티커(영문 3~5자) → market="미국", currency="USD"
- 중국(HK/홍콩) → market="중국"
- 한글 종목명(삼성전자, 카카오 등) → market="국내", currency="KRW"
- 수량·평단가 하나라도 명확히 추출 가능한 항목만 포함
- 반드시 JSON만 반환`,
        },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.1,
    });

    const result = JSON.parse(
      completion.choices[0]?.message?.content || '{"holdings":[]}'
    );
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Bulk Stock Input Error:', error);
    return NextResponse.json(
      { error: '자연어 분석에 실패했습니다.' },
      { status: 500 }
    );
  }
}
