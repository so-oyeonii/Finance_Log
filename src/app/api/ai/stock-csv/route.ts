import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 증권사 CSV/엑셀-텍스트를 자동 감지하여 보유 종목 배열로 변환한다.
// 키움/미래에셋/삼성/NH/토스증권 등 포맷이 제각각이라 AI로 컬럼 매핑을 처리.
// 결과 포맷은 /api/ai/stock-scan과 동일하여 StockScanResultModal 재사용 가능.
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
    const { csvText } = await req.json();

    if (!csvText || typeof csvText !== 'string' || csvText.trim().length === 0) {
      return NextResponse.json({ holdings: [] });
    }

    // 너무 긴 CSV는 앞부분만 전달 (토큰 절감)
    const truncated = csvText.length > 20000 ? csvText.slice(0, 20000) + '\n[...이하 생략]' : csvText;

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 한국 증권사 CSV(키움 영웅문, 미래에셋 M-STOCK, 삼성 mPOP, NH나무, 토스증권 등) 파서입니다.
거래내역이든 보유잔고든 상관없이, **현재 보유 중인 종목**을 추출하여 다음 JSON으로 변환하세요:

{
  "holdings": [
    {
      "market": "국내" | "미국" | "중국" | "ETF" | "코인" | "기타",
      "ticker": "종목명 또는 티커",
      "quantity": 숫자(보유 수량),
      "avgPrice": 숫자(평균 매수 단가, 원 단위),
      "currency": "KRW" | "USD",
      "inputPrice": 숫자(원래 표시된 가격)
    }
  ]
}

[파싱 규칙]
- CSV 헤더 형태가 다양하므로 컬럼명을 유연하게 해석: "종목명/종목/Name", "수량/보유수량/Quantity", "평단/평균단가/매입단가/Avg Price" 등
- 거래내역(매수/매도 여러 줄)이면 **같은 종목끼리 집계**하여 순보유 수량과 가중평균 단가 계산
- 수량이 0인 종목(전량 매도)은 제외
- 숫자는 쉼표/단위 제거 후 순수 숫자
- ETF: KODEX/TIGER/ACE/VOO/SPY/QQQ 등 → market="ETF"
- 코인: BTC/ETH/XRP 등 → market="코인"
- 미국 주식(영문 3~5자 티커) → market="미국", currency="USD"
- 한글 종목명 → market="국내", currency="KRW"
- 애매하면 누락하지 말고 최선의 추측으로 채움
- 반드시 JSON만 반환`,
        },
        {
          role: 'user',
          content: `다음 CSV에서 보유 종목을 추출하세요:\n\n${truncated}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
    });

    const result = JSON.parse(
      completion.choices[0]?.message?.content || '{"holdings":[]}'
    );
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Stock CSV Parse Error:', error);
    return NextResponse.json({ error: 'CSV 분석에 실패했습니다.' }, { status: 500 });
  }
}
