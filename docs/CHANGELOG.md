# Smart Ledger Pro — 개발 히스토리

## Phase 8: Supabase 클라우드 동기화 (2026-03-03)

Local-first 가계부에 선택적 클라우드 동기화 기능 추가.
Supabase를 백엔드로 사용하여 인증 + 데이터 동기화 구현.

### 추가된 파일

| 파일 | 역할 |
|------|------|
| `src/lib/supabase.ts` | Supabase 클라이언트 팩토리 (env → IndexedDB fallback) |
| `src/lib/sync.ts` | Push/Pull 동기화 엔진 (6개 테이블 전체 교체 방식) |
| `src/stores/useAuthStore.ts` | Zustand 인증 상태 관리 (signIn/signUp/signOut) |
| `src/hooks/useSync.ts` | 동기화 React 훅 (push/pull/status/lastSyncedAt) |
| `src/components/auth/AuthModal.tsx` | 로그인/회원가입 모달 UI |
| `src/components/layout/SyncSection.tsx` | 설정 내 동기화 섹션 (설정→인증→동기화 플로우) |
| `supabase/migration.sql` | 클라우드 DB 스키마 (6개 테이블 + RLS + 인덱스) |

### 수정된 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/stores/useAppStore.ts` | Supabase URL/Key 설정 저장/로드 추가 |
| `src/components/layout/SettingsModal.tsx` | SyncSection 통합 |
| `package.json` | `@supabase/supabase-js` 의존성 추가 |
| `tsconfig.json` | `types` 명시로 빌드 에러 해결 |

### 동기화 아키텍처

```
┌─────────────┐     Push (업로드)     ┌──────────────┐
│  IndexedDB   │ ──────────────────→  │   Supabase    │
│  (Dexie.js)  │ ←──────────────────  │  PostgreSQL   │
└─────────────┘     Pull (다운로드)    └──────────────┘
       │                                     │
  Local-first                          RLS per user
  오프라인 OK                          auth.uid() 격리
```

- **Push**: 로컬 데이터 전체를 클라우드에 덮어쓰기
- **Pull**: 클라우드 데이터를 로컬에 덮어쓰기 (settings 유지)
- **인증**: Supabase Auth (이메일/비밀번호)
- **RLS**: 각 테이블에 `user_id` 기반 Row Level Security 적용

### Supabase 설정 방법

1. 환경변수 방식: `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
2. 수동 입력 방식: 설정 모달에서 직접 URL/Key 입력 (IndexedDB에 저장)

---

## Phase 7: 다크모드 + PWA + Import/Export + 정기거래 (27dce11)

- 테마 시스템 (라이트/다크/시스템)
- PWA 지원 (next-pwa, 오프라인 캐싱)
- 데이터 백업/복원 (JSON Export/Import)
- 정기거래 관리 (월별/주별 자동 등록)

## Phase 6: AI 기능 구현 (a20023b)

- API Routes: 자연어 입력, 영수증 OCR, AI 채팅, 재무분석, TTS
- GPT-4o-mini 프록시 (API key 서버 보호)
- AI 멘토 컴포넌트

## Phase 5: 대시보드 위젯 + 차트 + 드래그앤드롭 (da574fc)

- Recharts 기반 차트 위젯
- @dnd-kit 드래그앤드롭 레이아웃 커스터마이징
- 카테고리별 지출, 월별 추이, 포트폴리오 등

## Phase 4: 주식/코인 탭 UI (4587529)

- 매매 기록 CRUD
- 포트폴리오 계산 (평단가, 수익률)
- 실시간 시세 연동 구조

## Phase 3: 수입/지출 탭 UI (9b7bcb8)

- 거래 입력/수정/삭제
- 카테고리별 분류 (모드별 카테고리)
- 더치페이, 이체 기능

## Phase 2: 자산관리 탭 UI (89c9824)

- 계좌/자산 CRUD
- 예적금 관리 (이자 계산)
- 자산 현황 요약

## Phase 1: 프로젝트 기반 구축 (bb009bf)

- Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- Dexie.js (IndexedDB) 로컬 DB 설계
- Zustand 글로벌 상태 관리
- 타입 정의, 유틸리티, 모드 시스템 (대학원생/회사원)
- 레이아웃 + 네비게이션
