# Smart Ledger Pro — AI 스마트 가계부

> 대학원생/회사원 모드 전환이 가능한 AI 기반 스마트 가계부 웹앱
> Local-first (IndexedDB) + 선택적 Supabase 클라우드 동기화

---

## 주요 기능 요약

| 기능 | 설명 | Phase |
|------|------|-------|
| **모드 전환** | 대학원생 ↔ 회사원 (카테고리, AI 성격, UI 색상 자동 변경) | 1 |
| **자산 관리** | 계좌 CRUD, 예적금 관리, 잔액 자동 계산 | 2 |
| **수입/지출 관리** | 거래 입력, 카테고리별 분석, 월별 통계 | 3 |
| **주식/코인 포트폴리오** | 매수/매도 기록, 평균단가, 수익률, 시장별 분류 | 4 |
| **대시보드** | 드래그 정렬 위젯, 차트 (수입/지출/배당), 순자산 추이 | 5 |
| **AI 스마트 입력** | 자연어 → 거래 자동 파싱 ("현대카드로 스타벅스 5000원") | 6 |
| **영수증 스캔** | GPT-4o Vision으로 영수증 사진 → 자동 입력 | 6 |
| **AI 재무 멘토** | 맞춤형 재무 상담 챗봇 (모드별 성격) | 6 |
| **AI 재무 분석** | 자산/지출 진단 리포트 + 맞춤 팁 | 6 |
| **TTS 음성 읽기** | AI 분석 결과를 음성으로 재생 | 6 |
| **다크 모드** | class 기반 다크/라이트 전환 | 7 |
| **PWA 설치** | 모바일 앱처럼 홈화면 설치 | 7 |
| **데이터 백업** | JSON 내보내기/가져오기 | 7 |
| **정기 거래** | 반복 수입/지출 자동 등록 | 7 |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand (글로벌 상태) + React Hook Form (폼) |
| Database | Dexie.js (IndexedDB, local-first) |
| Cloud Sync | Supabase (선택적) |
| AI | OpenAI GPT-4o-mini (API Routes 경유) |
| Charts | Recharts |
| Icons | Lucide React |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| PWA | next-pwa |
| Validation | Zod |

---

## 프로젝트 구조

```
smart-ledger/
├── public/
│   └── manifest.json              # PWA 설정
├── src/
│   ├── app/
│   │   ├── api/ai/
│   │   │   ├── analyze/route.ts   # AI 재무 분석
│   │   │   ├── chat/route.ts      # AI 멘토 챗봇
│   │   │   ├── receipt/route.ts   # 영수증 OCR
│   │   │   ├── smart-input/route.ts # 자연어 파싱
│   │   │   └── tts/route.ts       # TTS 음성
│   │   ├── globals.css            # 전역 스타일 + Tailwind
│   │   ├── layout.tsx             # 루트 레이아웃
│   │   └── page.tsx               # 메인 페이지 (탭 라우팅)
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx         # 상단 헤더 (모드/연도 선택)
│   │       └── Navigation.tsx     # 하단 탭 네비게이션
│   ├── config/
│   │   └── modes.ts               # 모드별 카테고리/AI 성격/색상
│   ├── hooks/
│   │   ├── useAccounts.ts         # 계좌 CRUD + 잔액 계산
│   │   ├── useSavings.ts          # 예적금 CRUD
│   │   ├── useStocks.ts           # 주식 CRUD + 포트폴리오
│   │   └── useTransactions.ts     # 거래 CRUD + 통계 분석
│   ├── lib/
│   │   ├── calculations.ts        # 포트폴리오/예적금 수익 계산
│   │   ├── db.ts                  # Dexie.js DB 설정 + 내보내기
│   │   ├── format.ts              # 숫자/날짜 포매팅
│   │   └── utils.ts               # cn() 유틸 (clsx + tailwind-merge)
│   ├── stores/
│   │   └── useAppStore.ts         # Zustand 글로벌 스토어
│   └── types/
│       └── index.ts               # 전체 TypeScript 타입 정의
├── .env.example                   # 환경변수 템플릿
├── .gitignore
├── CLAUDE.md                      # 개발 가이드
├── next.config.js                 # Next.js 설정
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## DB 스키마 (IndexedDB via Dexie.js)

| 테이블 | 주요 필드 | 설명 |
|--------|----------|------|
| `accounts` | id, bank, name, type, balance, principal | 계좌 정보 |
| `transactions` | id, date, type, category, amount, memo, accountId | 수입/지출/이체 |
| `stocks` | id, date, market, ticker, type, currency, price, quantity | 주식/코인 매매 |
| `stockPrices` | [market+ticker], price, updatedAt | 현재가 캐시 |
| `savings` | id, type, name, amount, rate, term, startDate | 예금/적금 |
| `recurring` | id, type, category, amount, frequency, nextDate | 정기 거래 |
| `settings` | key, value | 앱 설정 (모드, 레이아웃 등) |

---

## 모드 시스템

### 대학원생 모드
- **색상**: Indigo 계열
- **수입**: BK인건비, 과제인건비, 조교수당, 학회스태프, 논문/상금, 장학금
- **지출**: 식비, 교통, 카페/간식, 연구실회비, 도서/인쇄, 쇼핑, 주거/통신
- **AI 성격**: 친근한 선배 스타일, 유머 섞인 재무 조언

### 회사원 모드
- **색상**: Emerald 계열
- **수입**: 월급, 성과급, 야근수당, 인센티브, 부업/프리랜서, 투자수익
- **지출**: 식비, 교통/주유, 카페, 쇼핑, 주거/공과금, 통신, 보험/세금, 경조사
- **AI 성격**: 전문적인 재무 코치 스타일

---

## API Routes

| 엔드포인트 | 메서드 | 기능 | 모델 |
|-----------|--------|------|------|
| `/api/ai/smart-input` | POST | 자연어 → 거래 파싱 | GPT-4o-mini |
| `/api/ai/receipt` | POST | 영수증 OCR | GPT-4o (Vision) |
| `/api/ai/chat` | POST | AI 멘토 대화 | GPT-4o-mini |
| `/api/ai/analyze` | POST | 재무 분석 리포트 | GPT-4o-mini |
| `/api/ai/tts` | POST | 텍스트 → 음성 | OpenAI TTS |

---

## 개발 Phase 로드맵

총 **7개 Phase**로 구성됩니다.

| Phase | 이름 | 내용 | 상태 |
|-------|------|------|------|
| **Phase 1** | 기반 구축 | types, lib, config, stores, layout, API routes | ✅ 완료 |
| **Phase 2** | 자산관리 탭 | 계좌 CRUD, 예적금 관리, 잔액 표시 | ⬜ 예정 |
| **Phase 3** | 수입/지출 탭 | 거래 입력/수정/삭제, 카테고리 분석, 월별 통계 | ⬜ 예정 |
| **Phase 4** | 주식/코인 탭 | 매매 기록, 포트폴리오 계산, 시장별 분류 | ⬜ 예정 |
| **Phase 5** | 대시보드 | 위젯 시스템, 차트 (Recharts), 드래그 정렬 | ⬜ 예정 |
| **Phase 6** | AI 기능 | 자연어 입력, 영수증 스캔, 멘토 챗봇, 분석 | ⬜ 예정 |
| **Phase 7** | 마무리 | 다크모드, PWA, 데이터 백업, 정기거래 | ⬜ 예정 |

---

## Quick Start

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local에 OPENAI_API_KEY 입력

# 3. 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인

---

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `OPENAI_API_KEY` | ✅ | OpenAI API 키 (서버 전용) |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ | Supabase 클라우드 동기화 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ | Supabase 익명 키 |
| `NEXT_PUBLIC_APP_NAME` | ❌ | 앱 이름 (기본: Smart Ledger Pro) |
| `NEXT_PUBLIC_APP_URL` | ❌ | 앱 URL (기본: http://localhost:3000) |

---

## 핵심 설계 원칙

1. **Local-first** — 모든 데이터는 IndexedDB에 우선 저장. 네트워크 없이 100% 동작
2. **모드 불가지론** — 핵심 로직은 모드에 의존하지 않음. config에서 주입만
3. **API key 보호** — AI 호출은 반드시 `/api/*` 경유. 클라이언트 노출 금지
4. **컴포넌트 200줄 제한** — UI와 로직(hooks) 분리
5. **한국어 UI** — 사용자 대면 텍스트는 한국어, 코드/주석은 영어 OK

---

## PWA 설치

- **Chrome/Edge**: 메뉴 → "앱 설치"
- **Safari (iOS)**: 공유 → "홈 화면에 추가"
