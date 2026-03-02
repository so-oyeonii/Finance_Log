# Smart Ledger Pro — Claude Code 작업 가이드

## 프로젝트 개요
대학원생/회사원 모드 전환이 가능한 AI 기반 스마트 가계부 웹앱.
Local-first (IndexedDB via Dexie.js) + 선택적 Supabase 동기화.

## 기술 스택
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand (글로벌) + React Hook Form (폼)
- **DB**: Dexie.js (IndexedDB, local-first) + Supabase (선택적 클라우드 동기화)
- **AI**: OpenAI GPT-4o-mini (API Routes 경유)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **PWA**: next-pwa

## 핵심 설계 원칙
1. **Local-first**: 모든 데이터는 IndexedDB에 먼저 저장. 네트워크 없이도 100% 동작.
2. **모드 불가지론**: 핵심 로직은 모드에 의존하지 않음. config/modes.ts에서 카테고리/텍스트만 주입.
3. **API key 보호**: AI 호출은 반드시 /api/* 경유. 클라이언트에 API key 노출 금지.
4. **컴포넌트 분리**: 각 컴포넌트는 200줄 이하. UI와 로직(hooks) 분리.
5. **한국어 UI**: 모든 사용자 대면 텍스트는 한국어. 코드/주석은 영어 OK.

## 파일 구조 규칙
- `src/app/` — 페이지 라우팅 (Next.js App Router)
- `src/app/api/` — 서버리스 API (AI 프록시 등)
- `src/components/` — React 컴포넌트 (도메인별 폴더)
- `src/hooks/` — 커스텀 훅 (데이터 로직)
- `src/stores/` — Zustand 스토어 (글로벌 상태)
- `src/lib/` — 유틸리티, DB 설정, 포매팅
- `src/config/` — 모드별 설정, 상수
- `src/types/` — TypeScript 타입 정의

## DB 스키마 (Dexie.js / IndexedDB)
```
accounts:    ++id, bank, name, type, balance, principal, createdAt, updatedAt
transactions: ++id, date, type, category, amount, memo, accountId, toAccountId, isDutchPay, totalAmount, peopleCount, recurringId, createdAt
stocks:      ++id, date, market, ticker, type, currency, price, inputPrice, exchangeRate, quantity, memo, accountId, isInitial, createdAt
stockPrices: [market+ticker], price, updatedAt
savings:     ++id, type, name, amount, rate, term, startDate, createdAt
recurring:   ++id, type, category, amount, frequency, nextDate, accountId, isActive
settings:    key, value
```

## 모드 시스템
- `graduate` (대학원생): BK인건비, 과제인건비, 조교수당, 장학금 등
- `worker` (회사원): 월급, 성과급, 야근수당, 인센티브 등
- 모드 변경 시 데이터 유지, 카테고리/AI 성격/UI 색상만 변경

## API Routes
| Endpoint | 기능 |
|----------|------|
| POST /api/ai/smart-input | 자연어 → 거래 파싱 |
| POST /api/ai/receipt | 영수증 OCR (GPT-4o vision) |
| POST /api/ai/chat | AI 멘토 대화 |
| POST /api/ai/analyze | 재무 분석 리포트 |
| POST /api/ai/tts | TTS (OpenAI TTS) |

## 개발 순서
1. Phase 1: 기반 (types, lib, config, stores, layout)
2. Phase 2: 자산관리 탭 (accounts + savings)
3. Phase 3: 수입/지출 탭 (transactions)
4. Phase 4: 주식/코인 탭 (stocks + portfolio)
5. Phase 5: 대시보드 (위젯 + 차트 + 드래그)
6. Phase 6: AI 기능 (API routes + 컴포넌트)
7. Phase 7: 추가 (다크모드, PWA, Export, 정기거래)

## 참고: 기존 코드
원본 프론트엔드 코드는 `docs/original-code.tsx`에 보존.
Firebase + Gemini 기반이었으나, Dexie.js + OpenAI GPT로 전환.
기존 로직(포트폴리오 계산, 예적금 계산 등)은 최대한 재활용.
