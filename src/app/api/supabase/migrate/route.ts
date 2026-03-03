import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { MIGRATION_SQL, EXPECTED_TABLES } from '@/lib/migration-sql';

export async function POST(req: NextRequest) {
  let client: Client | null = null;

  try {
    const { supabaseUrl, databasePassword } = await req.json();

    if (!supabaseUrl || !databasePassword) {
      return NextResponse.json(
        { error: 'Supabase URL과 데이터베이스 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // Extract project ref from Supabase URL
    // e.g., https://abcdefgh.supabase.co → abcdefgh
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (!match) {
      return NextResponse.json(
        { error: 'Supabase URL 형식이 올바르지 않습니다. (예: https://xxx.supabase.co)' },
        { status: 400 }
      );
    }

    const ref = match[1];
    const connectionString = `postgresql://postgres.${ref}:${encodeURIComponent(databasePassword)}@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres`;

    client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    await client.connect();

    // Run migration
    await client.query(MIGRATION_SQL);

    // Verify tables were created
    const result = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name LIKE 'sl_%'
       ORDER BY table_name`
    );

    const createdTables = result.rows.map((r: { table_name: string }) => r.table_name);
    const missingTables = EXPECTED_TABLES.filter(t => !createdTables.includes(t));

    if (missingTables.length > 0) {
      return NextResponse.json(
        { error: `일부 테이블이 생성되지 않았습니다: ${missingTables.join(', ')}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tables: createdTables,
      message: `${createdTables.length}개 테이블이 준비되었습니다.`,
    });
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    console.error('Migration error:', error.message);

    // Map common pg errors to Korean messages
    let message = '마이그레이션 중 오류가 발생했습니다.';

    if (error.message?.includes('password authentication failed')) {
      message = '데이터베이스 비밀번호가 올바르지 않습니다.';
    } else if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      message = '연결 시간이 초과되었습니다. Supabase URL을 확인해주세요.';
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      message = 'Supabase 서버를 찾을 수 없습니다. URL을 확인해주세요.';
    } else if (error.message?.includes('ECONNREFUSED')) {
      message = '서버 연결이 거부되었습니다. Supabase 프로젝트가 활성 상태인지 확인해주세요.';
    } else if (error.message) {
      message = `데이터베이스 오류: ${error.message}`;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
