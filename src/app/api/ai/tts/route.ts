import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-openai-api-key') || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key가 설정되지 않았습니다. 설정에서 OpenAI API Key를 입력해주세요.' }, { status: 401 });
    }
    const openai = new OpenAI({ apiKey });
    const { text } = await req.json();

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',     // Good for Korean
      input: text,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: 'TTS 실패' }, { status: 500 });
  }
}
