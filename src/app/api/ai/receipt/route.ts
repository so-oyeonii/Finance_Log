import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `영수증 이미지를 분석하여 다음 JSON 형식으로 반환하세요:
{
  "date": "YYYY-MM-DD",
  "amount": 숫자(총액),
  "memo": "가게명 또는 내용",
  "category": "식비" | "교통" | "카페/간식" | "쇼핑" | "기타"
}
반드시 JSON만 반환하세요.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '이 영수증을 분석해주세요.' },
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
      max_tokens: 300,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Receipt OCR Error:', error);
    return NextResponse.json({ error: '영수증 인식 실패' }, { status: 500 });
  }
}
