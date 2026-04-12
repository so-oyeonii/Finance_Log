import { NextRequest, NextResponse } from 'next/server';

// Yahoo Finance public chart API(공개 엔드포인트)로 현재가를 가져온다.
// - 국내: 6자리 숫자 티커에 .KS(코스피) 시도 후 실패 시 .KQ(코스닥)
// - 미국/ETF(영문): 그대로
// - 코인: {TICKER}-USD
// - 중국/홍콩: .HK 시도
// 결과는 KRW 기준으로 정규화한다 (USD→KRW는 USDKRW=X 환율 적용).

interface RefreshItem {
  market: string;
  ticker: string;
}

interface RefreshResult {
  market: string;
  ticker: string;
  price: number | null;
  currency: 'KRW' | 'USD' | null;
  found: boolean;
}

async function fetchYahoo(symbol: string): Promise<{ price: number; currency: string } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        // Yahoo는 일부 User-Agent를 차단함
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    return {
      price: Number(meta.regularMarketPrice),
      currency: String(meta.currency || 'USD'),
    };
  } catch {
    return null;
  }
}

function candidateSymbols(market: string, ticker: string): string[] {
  const t = ticker.trim();
  if (!t) return [];

  if (market === '국내') {
    // 6자리 숫자면 .KS → .KQ 시도
    if (/^\d{6}$/.test(t)) return [`${t}.KS`, `${t}.KQ`];
    return []; // 한글 종목명은 해석 불가
  }

  if (market === '미국') return [t.toUpperCase()];

  if (market === 'ETF') {
    // 숫자면 KR ETF (KS), 영문이면 US ETF
    if (/^\d{6}$/.test(t)) return [`${t}.KS`, `${t}.KQ`];
    return [t.toUpperCase()];
  }

  if (market === '중국') {
    // 4자리 홍콩 티커
    if (/^\d+$/.test(t)) return [`${t.padStart(4, '0')}.HK`];
    return [t.toUpperCase()];
  }

  if (market === '코인') {
    // 한글 이름을 심볼로 매핑
    const KR_MAP: Record<string, string> = {
      '비트코인': 'BTC', '이더리움': 'ETH', '리플': 'XRP', '솔라나': 'SOL',
      '에이다': 'ADA', '도지코인': 'DOGE', '트론': 'TRX', '폴카닷': 'DOT',
    };
    const sym = KR_MAP[t] || t.toUpperCase();
    return [`${sym}-USD`];
  }

  return [t.toUpperCase()];
}

export async function POST(req: NextRequest) {
  try {
    const { items } = (await req.json()) as { items: RefreshItem[] };
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // USD → KRW 환율 1회 조회
    let usdKrw = 1350; // fallback
    const fx = await fetchYahoo('KRW=X');
    if (fx?.price) usdKrw = fx.price;

    const results: RefreshResult[] = [];

    // 직렬 처리 (Yahoo 레이트 리밋 회피)
    for (const item of items) {
      const candidates = candidateSymbols(item.market, item.ticker);
      let found: { price: number; currency: string } | null = null;
      for (const sym of candidates) {
        found = await fetchYahoo(sym);
        if (found) break;
      }

      if (!found) {
        results.push({
          market: item.market,
          ticker: item.ticker,
          price: null,
          currency: null,
          found: false,
        });
        continue;
      }

      // KRW 정규화
      const krwPrice =
        found.currency === 'KRW' ? found.price : Math.round(found.price * usdKrw);

      results.push({
        market: item.market,
        ticker: item.ticker,
        price: krwPrice,
        currency: found.currency === 'KRW' ? 'KRW' : 'USD',
        found: true,
      });
    }

    return NextResponse.json({ results, exchangeRate: usdKrw });
  } catch (error: any) {
    console.error('Price refresh error:', error);
    return NextResponse.json(
      { error: '현재가 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}
