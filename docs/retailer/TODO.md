# 도매-소매 중개 플랫폼 MVP 개발 TODO

> **프로젝트명**: 도매-소매 중개 플랫폼 (MVP)  
> **개발 기간**: 8주 (2개월)  
> **기준 문서**: [PRD.md](./PRD.md)  
> **최종 업데이트**: 2025-11-20

---

## 📋 목차

1. [프로젝트 초기 설정](#-1-프로젝트-초기-설정)
2. [환경 설정](#-2-환경-설정)
3. [폴더 구조 생성](#-3-폴더-구조-생성)
4. [Week 1-2: 인프라 및 인증](#-4-week-1-2-인프라-및-인증)
5. [Week 3: 도매 기능 + 🥇 AI 표준화](#-5-week-3-도매-기능--ai-표준화)
6. [Week 4: 도매 상품 관리 + 🥈 시세 조회](#-6-week-4-도매-상품-관리--시세-조회)
7. [Week 5: 소매 기능 + 🥉 장바구니](#-7-week-5-소매-기능-장바구니)
8. [Week 6: 주문 관리 + 4순위 ProductVariant](#-8-week-6-주문-관리-4순위-productvariant)
9. [Week 7: 7순위 결제 + 5순위 CS 봇](#-9-week-7-7순위-결제-5순위-cs-봇)
10. [Week 8: 6순위 감사로그 + 통합 테스트 + 배포](#-10-week-8-6순위-감사로그-통합-테스트-배포)

---

## 🚀 1. 프로젝트 초기 설정

### 1.1 프로젝트 생성

- [ ] Next.js 15 프로젝트 확인/생성
  - [ ] TypeScript 설정 확인
  - [ ] Tailwind CSS 설정 확인
  - [ ] App Router 사용 확인

### 1.2 필수 패키지 설치

- [ ] `@clerk/nextjs` - 인증
- [ ] `@supabase/supabase-js` - 데이터베이스
- [ ] `@supabase/ssr` - 서버 사이드 렌더링
- [ ] `recharts` - 시세 차트 (2순위)
- [ ] `zod` - 스키마 검증
- [ ] `react-hook-form` - 폼 관리

### 1.3 프로젝트 설정 파일

- [ ] `tsconfig.json` 설정 확인
- [ ] `next.config.ts` 설정 확인
- [ ] `tailwind.config.js` 또는 `globals.css` 설정 확인
- [ ] `.gitignore` 설정 확인
- [ ] `.env.local.example` 파일 생성

---

## 🔧 2. 환경 설정

### 2.1 Supabase 설정

- [ ] Supabase 프로젝트 생성
- [ ] DB 스키마 적용 (13개 테이블)
  - [ ] `supabase/migrations/mk_schema.sql` 실행
  - [ ] RLS 정책 확인
  - [ ] Storage 버킷 생성 (`product-images`)
- [ ] 환경 변수 설정
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

### 2.2 Clerk 설정

- [ ] Clerk 프로젝트 생성
- [ ] 환경 변수 설정
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - [ ] `CLERK_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
  - [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

### 2.3 외부 API 키 발급

- [ ] **Gemini API** (1순위)

  - [ ] Google AI Studio에서 API 키 발급
  - [ ] `GEMINI_API_KEY` 환경 변수 설정

- [ ] **공공데이터포털 API** (2순위)

  - [ ] 공공데이터포털 회원가입
  - [ ] 농수산물 시세 API 활용신청
  - [ ] `NEXT_PUBLIC_MARKET_API_KEY` 환경 변수 설정

- [ ] **TossPayments** (7순위)

  - [ ] TossPayments 개발자센터 계정 생성
  - [ ] 테스트 키 발급
  - [ ] `NEXT_PUBLIC_TOSS_CLIENT_KEY` 환경 변수 설정
  - [ ] `TOSS_SECRET_KEY` 환경 변수 설정

- [ ] **LLM API** (5순위 - CS 봇)
  - [ ] OpenAI 또는 Gemini API 키 발급
  - [ ] `LLM_API_KEY` 환경 변수 설정
  - [ ] `LLM_PROVIDER` 환경 변수 설정 (openai 또는 gemini)

### 2.4 기타 환경 변수

- [ ] `NEXT_PUBLIC_APP_URL` 설정
- [ ] `NEXT_PUBLIC_PLATFORM_FEE_RATE=0.05` 설정 (5% 수수료)

---

## 📁 3. 폴더 구조 생성

> **⚠️ 중요**: 프로젝트 초기에 소매/도매/관리자를 모두 고려한 통합 폴더 구조를 생성합니다.

### 3.1 app 폴더 구조

- [ ] `app/(auth)/` 디렉토리 생성

  - [ ] `sign-in/` 폴더
  - [ ] `sign-up/` 폴더
  - [ ] `role-selection/` 폴더
  - [ ] `wholesaler-onboarding/` 폴더
  - [ ] `retailer-onboarding/` 폴더

- [ ] `app/retailer/` 디렉토리 생성

  - [ ] `dashboard/` 폴더
  - [ ] `products/` 폴더
  - [ ] `products/[id]/` 폴더
  - [ ] `cart/` 폴더
  - [ ] `checkout/` 폴더
  - [ ] `orders/` 폴더
  - [ ] `orders/[id]/` 폴더
  - [ ] `cs/` 폴더

- [ ] `app/wholesaler/` 디렉토리 생성

  - [ ] `pending-approval/` 폴더
  - [ ] `dashboard/` 폴더
  - [ ] `products/` 폴더
  - [ ] `products/new/` 폴더
  - [ ] `products/[id]/edit/` 폴더
  - [ ] `market-prices/` 폴더
  - [ ] `orders/` 폴더
  - [ ] `orders/[id]/` 폴더
  - [ ] `settlements/` 폴더

- [ ] `app/admin/` 디렉토리 생성

  - [ ] `dashboard/` 폴더
  - [ ] `wholesalers/` 폴더
  - [ ] `users/` 폴더
  - [ ] `cs/` 폴더
  - [ ] `audit-logs/` 폴더

- [ ] `app/api/` 디렉토리 생성
  - [ ] `ai/standardize/` 폴더 (1순위)
  - [ ] `ai/market-price/` 폴더 (2순위)
  - [ ] `payments/callback/` 폴더 (7순위)
  - [ ] `cs/chat/` 폴더 (5순위)

### 3.2 components 폴더 구조

- [ ] `components/ui/` 디렉토리 (shadcn/ui)
- [ ] `components/common/` 디렉토리
- [ ] `components/shared/` 디렉토리 (소매/도매 공통)
- [ ] `components/retailer/` 디렉토리
  - [ ] `Layout/` 폴더
  - [ ] `Products/` 폴더
  - [ ] `Cart/` 폴더
  - [ ] `Checkout/` 폴더
  - [ ] `Orders/` 폴더
- [ ] `components/wholesaler/` 디렉토리
  - [ ] `Layout/` 폴더
  - [ ] `Dashboard/` 폴더
  - [ ] `Products/` 폴더
  - [ ] `MarketPrices/` 폴더
  - [ ] `Orders/` 폴더
  - [ ] `Settlements/` 폴더

### 3.3 lib 폴더 구조

- [ ] `lib/supabase/` 디렉토리

  - [ ] `client.ts` 파일
  - [ ] `server.ts` 파일
  - [ ] `realtime.ts` 파일
  - [ ] `queries/` 폴더
    - [ ] `products.ts` (공통)
    - [ ] `orders.ts` (공통)
    - [ ] `wholesalers.ts` (도매 전용)
    - [ ] `retailers.ts` (소매 전용)
    - [ ] `settlements.ts` (도매 전용)

- [ ] `lib/clerk/` 디렉토리

  - [ ] `auth.ts` 파일

- [ ] `lib/api/` 디렉토리

  - [ ] `ai-standardize.ts` (1순위)
  - [ ] `market-prices.ts` (2순위)

- [ ] `lib/validation/` 디렉토리

  - [ ] `product.ts` (공통)
  - [ ] `order.ts` (공통)
  - [ ] `wholesaler.ts`
  - [ ] `retailer.ts`

- [ ] `lib/utils/` 디렉토리
  - [ ] `format.ts` (날짜, 금액 포맷)
  - [ ] `constants.ts` (상수)

### 3.4 types, hooks 폴더

- [ ] `types/` 디렉토리 생성

  - [ ] `database.ts` (Supabase 타입)
  - [ ] `product.ts` (공통)
  - [ ] `order.ts` (공통)
  - [ ] `wholesaler.ts`
  - [ ] `retailer.ts`
  - [ ] `settlement.ts`

- [ ] `hooks/` 디렉토리 생성
  - [ ] `useProducts.ts` (공통)
  - [ ] `useOrders.ts` (공통)
  - [ ] `useWholesaler.ts`
  - [ ] `useRetailer.ts`
  - [ ] `useRealtime.ts` (공통)

---

## 🔐 4. Week 1-2: 인프라 및 인증

### 4.1 Next.js 기본 설정

- [ ] 프로젝트 초기 설정 완료
- [ ] Tailwind CSS 설정 완료
- [ ] TypeScript 설정 확인

### 4.2 Clerk 연동

- [ ] Clerk Provider 설정 (`app/layout.tsx`)
- [ ] 회원가입 페이지 (`app/(auth)/sign-up/`)
- [ ] 로그인 페이지 (`app/(auth)/sign-in/`)
- [ ] 역할 선택 페이지 (`app/(auth)/role-selection/`)
- [ ] Clerk → Supabase 사용자 동기화
  - [ ] `app/api/sync-user/route.ts` 구현
  - [ ] `hooks/use-sync-user.ts` 구현
  - [ ] `components/providers/sync-user-provider.tsx` 구현

### 4.3 Supabase 연동

- [ ] Supabase 클라이언트 설정
  - [ ] `lib/supabase/client.ts` (클라이언트 사이드)
  - [ ] `lib/supabase/server.ts` (서버 사이드)
  - [ ] `lib/supabase/realtime.ts` (실시간 구독)
- [ ] RLS 정책 기본 적용 확인
- [ ] Storage 버킷 설정 확인

### 4.4 역할별 프로필 생성

- [ ] 소매 프로필 생성 (`app/(auth)/retailer-onboarding/`)
- [ ] 도매 프로필 생성 (`app/(auth)/wholesaler-onboarding/`)
- [ ] 역할별 대시보드 리다이렉트 로직
- [ ] 미들웨어 설정 (`middleware.ts`)

### 4.5 기본 레이아웃

- [ ] Root Layout (`app/layout.tsx`)
- [ ] 공통 컴포넌트
  - [ ] `components/common/LoadingSpinner.tsx`
  - [ ] `components/common/EmptyState.tsx`
  - [ ] `components/common/PageHeader.tsx`

---

## 🏭 5. Week 3: 도매 기능 + 🥇 AI 표준화

### 5.1 도매 기본 기능

- [ ] 도매 회원가입 및 사업자 정보 등록

  - [ ] `app/(auth)/wholesaler-onboarding/page.tsx`
  - [ ] 사업자 정보 폼 구현
  - [ ] 유효성 검증 (`lib/validation/wholesaler.ts`)
  - [ ] Supabase에 저장

- [ ] 승인 대기 페이지

  - [ ] `app/wholesaler/pending-approval/page.tsx`
  - [ ] Realtime 구독으로 승인 상태 실시간 확인
  - [ ] 승인 완료 시 대시보드로 리다이렉트

- [ ] 관리자 도매 승인/반려 기능

  - [ ] `app/admin/wholesalers/pending/page.tsx` (승인 대기 목록)
  - [ ] `app/admin/wholesalers/[id]/page.tsx` (상세 + 승인/반려)
  - [ ] 승인/반려 처리 로직

- [ ] 도매 상품 등록/수정 폼 (기본)
  - [ ] `app/wholesaler/products/new/page.tsx`
  - [ ] `app/wholesaler/products/[id]/edit/page.tsx`
  - [ ] 기본 상품 정보 입력 폼

### 5.2 🥇 1순위: Gemini 상품명 표준화

- [ ] Gemini API 연동

  - [ ] `lib/api/ai-standardize.ts` 구현
  - [ ] `app/api/ai/standardize/route.ts` 구현

- [ ] 상품 등록/수정 페이지에 "AI 표준화" 버튼 추가

  - [ ] 버튼 UI 구현
  - [ ] API 호출 로직

- [ ] AI 제안 UI

  - [ ] 표준화 상품명 표시
  - [ ] 카테고리 자동 추천 표시
  - [ ] 검색 키워드 표시
  - [ ] 신뢰도 점수 표시

- [ ] 제안 수락/거부 처리

  - [ ] 수락 시 자동 입력
  - [ ] 거부 시 원래 값 유지

- [ ] (선택) AI 제안 이력 저장
  - [ ] `ai_product_suggestions` 테이블에 로그 저장

---

## 📊 6. Week 4: 도매 상품 관리 + 🥈 시세 조회

### 6.1 도매 상품 관리

- [ ] 도매 상품 목록 조회

  - [ ] `app/wholesaler/products/page.tsx`
  - [ ] 상품 테이블 구현
  - [ ] 필터/검색 기능

- [ ] 도매 상품 삭제/비활성화

  - [ ] 삭제 기능
  - [ ] 비활성화 기능 (`is_active` 토글)

- [ ] 도매 대시보드
  - [ ] `app/wholesaler/dashboard/page.tsx`
  - [ ] 오늘 신규 주문 수
  - [ ] 출고 대기 주문 수
  - [ ] 금주 정산 예정 금액

### 6.2 🥈 2순위: 실시간 시세 조회

- [ ] 공공데이터포털 API 연동

  - [ ] `lib/api/market-prices.ts` 구현
  - [ ] `app/api/ai/market-price/route.ts` 구현

- [ ] 상품 가격 책정 시 "시세 조회" 버튼 추가

  - [ ] 버튼 UI 구현
  - [ ] 모달 또는 사이드바로 시세 표시

- [ ] 시세 검색 UI

  - [ ] 품목별 검색
  - [ ] 지역별 검색
  - [ ] 날짜별 검색

- [ ] 가격 추이 차트

  - [ ] Recharts 라이브러리 사용
  - [ ] 최근 7일 가격 추이 표시
  - [ ] 차트 스타일링

- [ ] 참고 가격으로 활용
  - [ ] 자동 입력은 하지 않음
  - [ ] 사용자가 참고하여 수동 입력

---

## 🛒 7. Week 5: 소매 기능 + 🥉 장바구니

### 7.1 소매 기본 기능

- [ ] 소매 회원가입 및 프로필 등록

  - [ ] `app/(auth)/retailer-onboarding/page.tsx`
  - [ ] 기본 정보 입력 폼

- [ ] 상품 목록 조회

  - [ ] `app/retailer/products/page.tsx`
  - [ ] 카테고리 필터
  - [ ] 지역 필터
  - [ ] 검색 기능 (상품명, 키워드)

- [ ] 상품 상세 조회
  - [ ] `app/retailer/products/[id]/page.tsx`
  - [ ] 도매 정보 익명 처리 (anonymous_code만 표시)
  - [ ] 상품 정보 표시
  - [ ] 가격, MOQ 표시

### 7.2 🥉 3순위: 장바구니

- [ ] cart_items 테이블 및 RLS 정책

  - [ ] 마이그레이션 파일 확인
  - [ ] RLS 정책 확인

- [ ] 상품 상세에 "장바구니 담기" 버튼

  - [ ] 버튼 UI 구현
  - [ ] 장바구니 추가 로직

- [ ] 장바구니 페이지

  - [ ] `app/retailer/cart/page.tsx`
  - [ ] 장바구니 목록 조회
  - [ ] 수량 수정 기능
  - [ ] 상품 삭제 기능
  - [ ] 총 금액 계산 (상품금액 + 배송비)

- [ ] "주문하기" 버튼
  - [ ] 장바구니에서 주문 생성 (결제 연동 전까지는 주문 생성만)
  - [ ] 여러 상품 → 여러 주문 생성 로직

---

## 📦 8. Week 6: 주문 관리 + 4순위 ProductVariant

### 8.1 주문 관리

- [ ] 소매 주문 생성 (장바구니 연동)

  - [ ] 주문 생성 로직
  - [ ] 주문번호 생성 (예: "ORD-20251119-001")

- [ ] 소매 주문 내역 조회

  - [ ] `app/retailer/orders/page.tsx` (주문 목록)
  - [ ] `app/retailer/orders/[id]/page.tsx` (주문 상세)
  - [ ] 주문 상태 표시

- [ ] 도매 주문 목록 조회

  - [ ] `app/wholesaler/orders/page.tsx`
  - [ ] RLS로 본인 상품 주문만 조회
  - [ ] 필터 기능 (전체/신규/출고완료)

- [ ] 도매 주문 상태 변경

  - [ ] `app/wholesaler/orders/[id]/page.tsx`
  - [ ] 상태 변경 버튼
  - [ ] pending → confirmed → shipped → completed

- [ ] 소매/도매 주문 상세 페이지
  - [ ] 주문 정보 표시
  - [ ] 상품 정보 표시
  - [ ] 배송지 정보 표시

### 8.2 4순위: ProductVariant (상품 옵션)

- [ ] product_variants 테이블 및 RLS 정책

  - [ ] 마이그레이션 파일 확인
  - [ ] RLS 정책 확인

- [ ] 도매: 상품 등록/수정 시 옵션 추가 UI

  - [ ] 옵션 추가 버튼
  - [ ] 옵션명 입력 (예: "1kg", "5kg", "10kg")
  - [ ] 옵션별 가격 설정
  - [ ] 옵션별 재고 관리

- [ ] 소매: 상품 상세에서 옵션 선택

  - [ ] 옵션 드롭다운 구현
  - [ ] 옵션 선택 시 가격 업데이트
  - [ ] 옵션 선택 시 재고 확인

- [ ] 장바구니/주문에 variant_id 포함
  - [ ] 장바구니에 variant_id 저장
  - [ ] 주문에 variant_id 저장

---

## 💳 9. Week 7: 7순위 결제 + 5순위 CS 봇

### 9.1 7순위: TossPayments 결제 연동

- [ ] TossPayments SDK 연동

  - [ ] 패키지 설치
  - [ ] SDK 초기화

- [ ] 결제 요청 페이지

  - [ ] `app/retailer/checkout/page.tsx`
  - [ ] 배송지 확인/수정
  - [ ] 결제 금액 표시
  - [ ] TossPayments 결제 위젯

- [ ] 결제 성공/실패 콜백

  - [ ] `app/api/payments/callback/route.ts`
  - [ ] 결제 성공 처리
  - [ ] 결제 실패 처리

- [ ] 결제 성공 시 처리

  - [ ] orders 테이블에 주문 생성
  - [ ] 주문 상태 자동 업데이트 (pending)
  - [ ] settlements 테이블에 정산 계산
    - [ ] 플랫폼 수수료 계산 (5%)
    - [ ] 도매 정산액 계산 (주문금액 - 수수료)
    - [ ] 정산 예정일 설정 (D+7)

- [ ] 도매: 정산 내역 조회 페이지

  - [ ] `app/wholesaler/settlements/page.tsx`
  - [ ] 정산 예정액 표시
  - [ ] 정산 예정일 표시
  - [ ] 정산 상태 표시

- [ ] ⚠️ 자동 송금은 제외 (수동 정산)

### 9.2 5순위: CS AI 봇

- [ ] cs_threads, cs_messages 테이블 및 RLS 정책

  - [ ] 마이그레이션 파일 확인
  - [ ] RLS 정책 확인

- [ ] CS 위젯 또는 페이지

  - [ ] `app/retailer/cs/page.tsx`
  - [ ] `app/wholesaler/cs/page.tsx` (선택)

- [ ] 새 문의 작성 폼

  - [ ] 문의 제목 입력
  - [ ] 문의 내용 입력

- [ ] LLM API 연동

  - [ ] `app/api/cs/chat/route.ts` 구현
  - [ ] OpenAI 또는 Gemini API 호출
  - [ ] FAQ/정책 기반 1차 자동 응답

- [ ] 주문 조회 기능

  - [ ] 주문번호 입력
  - [ ] 내부 API로 주문 조회
  - [ ] LLM에 주문 정보 전달

- [ ] "사람 상담 연결" 버튼

  - [ ] 버튼 UI 구현
  - [ ] 티켓 상태 변경 (escalated)

- [ ] 관리자: 티켓 목록 조회

  - [ ] `app/admin/cs/tickets/page.tsx`
  - [ ] escalated 상태 티켓만 표시

- [ ] 관리자: 답변 작성 및 티켓 종료
  - [ ] `app/admin/cs/tickets/[id]/page.tsx`
  - [ ] 답변 작성 폼
  - [ ] 티켓 종료 기능

---

## 📝 10. Week 8: 6순위 감사로그 + 통합 테스트 + 배포

### 10.1 6순위: 감사 로그

- [ ] audit_logs 테이블 및 RLS 정책

  - [ ] 마이그레이션 파일 확인
  - [ ] RLS 정책 확인 (관리자만 조회)

- [ ] 주요 관리자 액션 자동 로깅

  - [ ] 도매 승인/반려 시 로그 기록
  - [ ] 계정 정지/해제 시 로그 기록
  - [ ] 설정 변경 시 로그 기록
  - [ ] PII 조회 시 로그 기록

- [ ] 관리자: 감사 로그 페이지
  - [ ] `app/admin/audit-logs/page.tsx`
  - [ ] 로그 목록 표시
  - [ ] 필터 기능 (액션 유형, 날짜, 사용자)
  - [ ] 로그 상세 조회 (액션 내용, IP 주소, 대상)

### 10.2 통합 테스트

- [ ] UI/UX 전체 개선

  - [ ] 반응형 디자인 확인
  - [ ] 스타일링 일관성 확인
  - [ ] 접근성 확인

- [ ] 통합 테스트 시나리오 실행

  - [ ] **TC-001**: 소매 상품 주문 (장바구니 → 결제 → 주문 조회)
  - [ ] **TC-002**: 도매 승인 및 상품 등록 (AI 표준화, 시세 조회)
  - [ ] **TC-003**: 주문 처리 (상태 변경)
  - [ ] **TC-004**: RLS 검증
  - [ ] **TC-005**: CS 봇 (AI 응답 → 사람 상담 전환)
  - [ ] **TC-006**: 결제 및 정산 계산

- [ ] 버그 수정

  - [ ] 발견된 버그 수정
  - [ ] 에러 처리 개선

- [ ] 성능 최적화
  - [ ] 이미지 최적화
  - [ ] 쿼리 최적화
  - [ ] 번들 크기 최적화

### 10.3 배포

- [ ] Vercel 배포

  - [ ] 프로젝트 연결
  - [ ] 환경 변수 설정
  - [ ] 빌드 확인
  - [ ] 배포 완료

- [ ] 최종 점검
  - [ ] 프로덕션 환경 테스트
  - [ ] 모든 기능 동작 확인
  - [ ] 문서화 완료

---

## 📊 진행 상황 추적

### 전체 진행률

- [ ] Week 1-2: 인프라 및 인증 (0%)
- [ ] Week 3: 도매 기능 + AI 표준화 (0%)
- [ ] Week 4: 도매 상품 관리 + 시세 조회 (0%)
- [ ] Week 5: 소매 기능 + 장바구니 (0%)
- [ ] Week 6: 주문 관리 + ProductVariant (0%)
- [ ] Week 7: 결제 + CS 봇 (0%)
- [ ] Week 8: 감사로그 + 테스트 + 배포 (0%)

### 우선순위별 진행률

- [ ] 🥇 1순위: Gemini 상품명 표준화 (0%)
- [ ] 🥈 2순위: 실시간 시세 조회 (0%)
- [ ] 🥉 3순위: 장바구니 (0%)
- [ ] 4순위: ProductVariant (0%)
- [ ] 5순위: CS AI 봇 (0%)
- [ ] 6순위: 감사 로그 (0%)
- [ ] 7순위: TossPayments 결제 (0%)

---

## 📌 참고 문서

- [PRD.md](./PRD.md) - 전체 프로젝트 기획서
- [WS_Guideline.md](./Wholesaler/WS_Guideline.md) - 도매 페이지 개발 가이드라인
- [WS_TODO.md](./Wholesaler/WS_TODO.md) - 도매 페이지 개발 TODO

---

**문서 작성일**: 2025-11-20  
**최종 업데이트**: 2025-11-20
