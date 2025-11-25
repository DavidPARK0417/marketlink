# 도매 페이지 개발 TODO 리스트

> **프로젝트**: AI 기반 B2B 도매-소매 중개 플랫폼  
> **개발 기간**: 8주  
> **개발 방식**: 커서 AI 바이브 코딩  
> **최종 업데이트**: 2025-11-20 (PRD.md, SQL2.sql 기준)

---

## ⚠️ 주요 변경사항 (필수 확인!)

### 🔴 중요: 주문 구조 변경

- **order_items 테이블 제거됨**
- orders 테이블에 product_id, variant_id 직접 포함
- 1개 주문(order) = 1개 상품
- 장바구니 → 여러 주문 생성 방식

### 🔴 중요: wholesalers 테이블 필드명 변경

- `contact_name` → `representative`
- `contact_phone` → `phone`
- `contact_email` → 제거 (profiles.email 사용)
- `region_sido`, `region_sigungu` → 제거 (address로 통합)

### 🔴 중요: 익명 코드 형식 변경

- "V-001" → "VENDOR-001"

### 🔴 중요: 주문 상태 플로우 간소화

- preparing 단계 제거
- pending → confirmed → shipped → completed

### 📋 기타 변경사항

- 정산 프로세스 확정: 결제 완료 시 자동 생성, D+7, 5% 수수료
- LLM API 환경 변수 추가 (CS 봇용)

---

## 📋 Week 1-2: 기반 구축 및 설계

### 🔧 환경 세팅 (Day 1-2)

- [x] **프로젝트 초기화**

  - [x] Next.js 15 프로젝트 확인 ✅ (15.5.6)
  - [x] TypeScript 설정 확인 ✅ (v5)
  - [x] Tailwind CSS 설정 확인 ✅ (v4)

- [x] **shadcn/ui 설치 및 설정**

  - [x] `npx shadcn@latest init` 실행 ✅ (components.json 존재)
  - [x] 기본 컴포넌트 추가 ✅
    - ✅ 설치 완료: button, input, dialog, form, accordion, label, textarea, card, table, badge, tabs, sonner (toast 대체), dropdown-menu, select

- [x] **추가 라이브러리 설치**

  - [x] `pnpm add react-hook-form zod @hookform/resolvers` (폼 관리)
  - [x] `pnpm add date-fns` (날짜 처리)
  - [x] `pnpm add @tanstack/react-table` (테이블)
  - [x] `pnpm add recharts` (차트 - 시세 조회용)
  - [x] `pnpm add lucide-react` (아이콘)

- [x] **환경 변수 설정 (.env.local)**
  - [x] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 설정
  - [x] `CLERK_SECRET_KEY` 설정
  - [x] `NEXT_PUBLIC_SUPABASE_URL` 설정
  - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
  - [x] `SUPABASE_SERVICE_ROLE_KEY` 설정
  - [x] `GEMINI_API_KEY` 발급 및 설정 (Google AI Studio)
  - [x] `NEXT_PUBLIC_MARKET_API_KEY` 발급 및 설정 (공공데이터포털)
  - [x] `LLM_API_KEY` 설정 (CS 봇용 - OpenAI 또는 Gemini)
  - [x] `LLM_PROVIDER` 설정 (openai 또는 gemini)
  - [x] `NEXT_PUBLIC_PLATFORM_FEE_RATE` 설정 (0.05 = 5%)
  - [x] `NEXT_PUBLIC_APP_URL` 설정

### 👥 팀 협업 (Day 3-4)

- [ ] **PM과 협업**

  - [ ] DB 스키마 최종 확정 (wholesalers, products, orders, settlements - ⚠️ order_items 없음!)
  - [ ] **⚠️ 주문 구조 확인 (필수)**
    - [ ] orders 테이블에 product_id, variant_id 직접 포함 확인
    - [ ] 1개 주문 = 1개 상품 구조 이해
    - [ ] 장바구니 → 여러 주문 생성 로직 확인
  - [ ] **⚠️ `profiles` 테이블 구조 확인 (필수)**
    - [ ] 테이블 존재 여부 확인
    - [ ] 컬럼 구조 확인 (clerk_user_id, email, role, status)
    - [ ] wholesalers 테이블과의 관계 (user_id 외래키)
    - [ ] RLS 정책 확인
  - [ ] **⚠️ 문의 관리 구조 확인 (선택 기능)**
    - [ ] `inquiries` vs `cs_threads` 사용 결정
    - [ ] 문의 유형 구분 (소매→도매, 도매→관리자)
    - [ ] `user_id` 참조 확인 (`users` vs `profiles`)
    - [ ] RLS 정책 요청
  - [ ] RLS 정책 확인 및 요청
  - [ ] Realtime 활성화 요청 (orders, products, inquiries 테이블)
  - [ ] Supabase Storage 버킷 생성 요청 (product-images)
  - [ ] **⚠️ Supabase Storage RLS 정책 설정 요청 (필수)**
    - [ ] product-images 버킷 RLS 활성화
    - [ ] 업로드 정책: 자신의 wholesaler_id 폴더만 업로드 가능
    - [ ] 조회 정책: 모든 사용자 조회 가능 (public)
    - [ ] 삭제 정책: 자신의 파일만 삭제 가능

- [ ] **소매 개발자와 협업**

  - [ ] `products` 테이블 구조 합의
  - [ ] **⚠️ `orders` 상태 플로우 합의** (pending → confirmed → shipped → completed)
    - [ ] preparing 단계 제거됨
  - [ ] **⚠️ 주문 생성 로직 합의**
    - [ ] 장바구니 → 여러 orders 생성 로직
    - [ ] 각 상품/도매별로 별도 order 생성
  - [ ] 카테고리 목록 공유 (채소류, 과일류, 곡물류, 수산물, 축산물, 가공식품, 기타)
  - [ ] 익명 코드 형식 합의 (VENDOR-001, RETAILER-001)

- [ ] **디자이너와 협업**
  - [ ] 디자인 시스템 가이드 전달
  - [ ] 레퍼런스 사이트 공유 (shadcn/ui, Linear, Stripe)
  - [ ] Week 2-8 디자인 일정 확인

### 📁 통합 폴더 구조 생성 (Day 5-7)

> **⚠️ 중요**: 프로젝트 초기에 소매/도매/관리자를 모두 고려한 통합 폴더 구조를 생성합니다.  
> 이렇게 하면 팀원 간 구조 일관성을 유지하고, 공통 영역을 효율적으로 관리할 수 있습니다.

#### 🎯 작업 원칙

- **빈 폴더만 생성**: 실제 파일(`page.tsx`, 컴포넌트 등)은 만들지 않기
- **전체 구조 생성**: 소매/도매/관리자 모두 포함
- **공통 영역 포함**: `components/shared/`, 공통 쿼리 등 구조만 생성

#### 📋 폴더 구조 생성 체크리스트

- [x] **app 폴더 구조 생성** (빈 폴더만)

  - [x] `app/(auth)/` 디렉토리 생성

    - [x] `sign-in/` 폴더
    - [x] `sign-up/` 폴더
    - [x] `role-selection/` 폴더
    - [x] `wholesaler-onboarding/` 폴더
    - [x] `retailer-onboarding/` 폴더 (소매 담당, 빈 폴더만)

  - [x] `app/retailer/` 디렉토리 생성 (소매 담당, 빈 폴더만)

    - [x] `dashboard/` 폴더
    - [x] `products/` 폴더
    - [x] `products/[id]/` 폴더
    - [x] `cart/` 폴더
    - [x] `checkout/` 폴더
    - [x] `orders/` 폴더
    - [x] `orders/[id]/` 폴더
    - [x] `cs/` 폴더

  - [x] `app/wholesaler/` 디렉토리 생성 (🎯 도매 담당)

    - [x] `pending-approval/` 폴더
    - [x] `dashboard/` 폴더
    - [x] `products/` 폴더
    - [x] `products/new/` 폴더
    - [x] `products/[id]/edit/` 폴더
    - [x] `market-prices/` 폴더
    - [x] `orders/` 폴더
    - [x] `orders/[id]/` 폴더
    - [x] `settlements/` 폴더

  - [x] `app/admin/` 디렉토리 생성 (관리자 담당, 빈 폴더만)

    - [x] `dashboard/` 폴더
    - [x] `wholesalers/` 폴더
    - [x] `users/` 폴더
    - [x] `cs/` 폴더
    - [x] `audit-logs/` 폴더

  - [x] `app/api/` 디렉토리 생성 (API 라우트)
    - [x] `api/ai/standardize/` 폴더 (🥇 1순위: Gemini 상품명 표준화)
    - [x] `api/ai/market-price/` 폴더 (🥈 2순위: 공공데이터 시세 조회)
    - [ ] `api/payments/callback/` 폴더 (7순위: 나중에 생성)
    - [ ] `api/cs/chat/` 폴더 (5순위: 나중에 생성)

- [x] **components 폴더 구조 생성** (빈 폴더만)

  - [x] `components/ui/` 디렉토리 (shadcn/ui 컴포넌트는 나중에 설치)
  - [x] `components/common/` 디렉토리 생성
  - [x] `components/shared/` 디렉토리 생성 (소매/도매 공통 컴포넌트)
  - [x] `components/retailer/` 디렉토리 생성 (소매 담당, 빈 폴더만)
    - [x] `Layout/` 폴더
    - [x] `Products/` 폴더
    - [x] `Cart/` 폴더
    - [x] `Checkout/` 폴더
    - [x] `Orders/` 폴더
  - [x] `components/wholesaler/` 디렉토리 생성 (🎯 도매 담당)
    - [x] `Layout/` 폴더
    - [x] `Dashboard/` 폴더
    - [x] `Products/` 폴더
    - [x] `MarketPrices/` 폴더
    - [x] `Orders/` 폴더
    - [x] `Settlements/` 폴더

- [x] **lib 폴더 구조 생성** (빈 폴더만)

  - [x] `lib/supabase/` 디렉토리 생성
    - [x] `queries/` 폴더 생성
      - [ ] `products.ts` 파일은 나중에 (공통 쿼리)
      - [ ] `orders.ts` 파일은 나중에 (공통 쿼리)
      - [ ] `wholesalers.ts` 파일은 나중에 (도매 전용)
      - [ ] `retailers.ts` 파일은 나중에 (소매 전용)
      - [ ] `settlements.ts` 파일은 나중에 (도매 전용)
  - [x] `lib/clerk/` 디렉토리 생성
  - [x] `lib/api/` 디렉토리 생성
  - [x] `lib/validation/` 디렉토리 생성
  - [x] `lib/utils/` 디렉토리 생성
  - [x] `lib/gemini.ts` 파일 생성 (🥇 1순위: AI 표준화)
  - [x] `lib/market-api.ts` 파일 생성 (🥈 2순위: 시세 조회)

- [x] **types 폴더 생성** (빈 폴더만)

  - [x] `types/` 디렉토리 생성
  - [ ] 파일들은 나중에 필요할 때 생성

- [x] **hooks 폴더 생성** (빈 폴더만)

  - [x] `hooks/` 디렉토리 생성
  - [ ] 파일들은 나중에 필요할 때 생성

#### ⚠️ 주의사항

1. **빈 폴더만 생성**: 실제 파일은 만들지 않기
2. **소매/관리자 영역**: 폴더 구조만 생성하고, 실제 파일은 해당 팀원이 생성
3. **공통 영역**: `components/shared/`, `lib/supabase/queries/products.ts` 등은 구조만 생성
4. **팀원과 공유**: 폴더 구조 생성 후 소매 담당자와 관리자 담당자에게 공유

#### 📝 폴더 생성 방법

**방법 1: 터미널 명령어 사용 (권장)**

프로젝트 루트에서 다음 명령어를 실행:

```bash
# app 폴더 구조
mkdir -p app/\(auth\)/sign-in
mkdir -p app/\(auth\)/sign-up
mkdir -p app/\(auth\)/role-selection
mkdir -p app/\(auth\)/wholesaler-onboarding
mkdir -p app/\(auth\)/retailer-onboarding

mkdir -p app/retailer/dashboard
mkdir -p app/retailer/products/\[id\]
mkdir -p app/retailer/cart
mkdir -p app/retailer/checkout
mkdir -p app/retailer/orders/\[id\]
mkdir -p app/retailer/cs

mkdir -p app/wholesaler/pending-approval
mkdir -p app/wholesaler/dashboard
mkdir -p app/wholesaler/products/new
mkdir -p app/wholesaler/products/\[id\]/edit
mkdir -p app/wholesaler/market-prices
mkdir -p app/wholesaler/orders/\[id\]
mkdir -p app/wholesaler/settlements

mkdir -p app/admin/dashboard
mkdir -p app/admin/wholesalers
mkdir -p app/admin/users
mkdir -p app/admin/cs
mkdir -p app/admin/audit-logs

# components 폴더 구조
mkdir -p components/ui
mkdir -p components/common
mkdir -p components/shared
mkdir -p components/retailer/Layout
mkdir -p components/retailer/Products
mkdir -p components/retailer/Cart
mkdir -p components/retailer/Checkout
mkdir -p components/retailer/Orders
mkdir -p components/wholesaler/Layout
mkdir -p components/wholesaler/Dashboard
mkdir -p components/wholesaler/Products
mkdir -p components/wholesaler/MarketPrices
mkdir -p components/wholesaler/Orders
mkdir -p components/wholesaler/Settlements

# lib 폴더 구조
mkdir -p lib/supabase/queries
mkdir -p lib/clerk
mkdir -p lib/api
mkdir -p lib/validation
mkdir -p lib/utils

# types, hooks 폴더
mkdir -p types
mkdir -p hooks
```

**방법 2: VS Code에서 수동 생성**

1. VS Code에서 프로젝트 열기
2. 좌측 파일 탐색기에서 `app` 폴더 우클릭
3. "New Folder" 선택하여 폴더 생성
4. 위 구조대로 하나씩 생성

**방법 3: Cursor AI에게 요청**

```
프로젝트 루트에 통합 폴더 구조를 생성해줘.
빈 폴더만 생성하고, 실제 파일은 만들지 마.
```

#### ✅ 생성 확인

폴더 생성 후 다음을 확인:

- [x] `app/retailer/`, `app/wholesaler/`, `app/admin/` 폴더 존재
- [x] `components/shared/` 폴더 존재
- [x] `lib/supabase/queries/` 폴더 존재
- [x] `types/`, `hooks/` 폴더 존재
- [x] `app/api/ai/standardize/` 폴더 존재 (🥇 1순위)
- [x] `app/api/ai/market-price/` 폴더 존재 (🥈 2순위)
- [x] `lib/gemini.ts` 파일 존재 (🥇 1순위)
- [x] `lib/market-api.ts` 파일 존재 (🥈 2순위)

#### 📝 다음 단계

폴더 구조 생성 완료 후:

- 실제 파일은 작업할 때마다 필요에 따라 생성
- 도매 관련 파일부터 시작 (`app/wholesaler/`, `components/wholesaler/`)
- 공통 영역 수정 시 반드시 소매 담당자와 확인
- 폴더 구조 생성 완료를 소매 담당자와 관리자 담당자에게 공유

- [x] **타입 정의 파일 작성**

  - [x] `types/database.ts` - Supabase 타입 정의
  - [x] `types/wholesaler.ts` - 도매점 타입 정의
    ```typescript
    interface Wholesaler {
      id: string;
      user_id: string; // profiles 테이블 참조
      business_name: string;
      business_number: string;
      representative: string; // ⚠️ contact_name → representative
      phone: string; // ⚠️ contact_phone → phone
      address: string; // ⚠️ region_sido, region_sigungu → address
      bank_account: string; // 은행명 포함하여 저장
      anonymous_code: string; // VENDOR-001 형식
      status: "pending" | "approved" | "rejected" | "suspended";
      rejection_reason?: string;
      created_at: string;
      approved_at?: string;
    }
    ```
  - [x] `types/product.ts` - 상품 타입 정의
  - [x] `types/order.ts` - 주문 타입 정의
  - [x] `types/settlement.ts` - 정산 타입 정의
  - [x] `types/inquiry.ts` - 문의 타입 정의

- [x] **Supabase 클라이언트 설정**

  - [x] `lib/supabase/client.ts` 작성 (클라이언트 사이드용)
  - [x] `lib/supabase/server.ts` 작성 (서버 사이드용)
  - [x] `lib/supabase/realtime.ts` 작성 (실시간 구독용)

- [x] **Clerk 인증 설정**

  - [x] `lib/clerk/auth.ts` 작성
  - [x] Clerk 미들웨어 설정 확인

- [x] **유틸리티 함수 작성**
  - [x] `lib/utils/format.ts` 작성
    - [x] 날짜 포맷 함수 (`formatDate`, `formatDateTime`)
    - [x] 금액 포맷 함수 (`formatCurrency`)
    - [x] 전화번호 포맷 함수 (`formatPhone`)
  - [x] `lib/utils/constants.ts` 작성
    - [x] 은행 목록 정의 (`BANKS`)
    - [x] 주문 상태 정의 (`ORDER_STATUS` - pending/confirmed/shipped/completed/cancelled)
    - [x] 도매 승인 상태 정의 (`WHOLESALER_STATUS`)
    - [x] 배송 방법 정의 (`DELIVERY_METHODS` - courier/direct/quick/freight/pickup)
    - [x] 카테고리 목록 정의 (`CATEGORIES`)
    - [x] 단위 목록 정의 (`UNITS`)
    - [x] 문의 상태 정의 (`INQUIRY_STATUS` - open/answered/closed) (선택)
    - [x] ⚠️ REGIONS는 제거 (address 필드로 통합)

### 🔐 인증 및 온보딩 구현

#### 1. 역할 선택 페이지

- [x] **`app/(auth)/role-selection/page.tsx` 구현**
  - [x] UI 구현 (소매점/도매점 선택 카드)
  - [x] Clerk `useUser()` 훅 연동
  - [x] 역할 선택 시 `profiles` 테이블에 저장
  - [x] 소매 선택 시 `/retailer/dashboard`로 리다이렉트
  - [x] 도매 선택 시 `/wholesaler/onboarding`으로 리다이렉트
  - [x] 로딩 상태 처리
  - [x] 에러 처리

#### 2. 사업자 정보 입력 폼

- [x] **유효성 검증 스키마 작성**

  - [x] `lib/validation/wholesaler.ts` 작성
  - [x] `wholesalerOnboardingSchema` 정의
    - [x] 사업자명 검증 (2글자 이상)
    - [x] 사업자번호 검증 (10자리 숫자)
    - [x] 대표자명 검증 (2글자 이상) - ⚠️ contact_name → representative
    - [x] 연락처 검증 (010-####-#### 형식) - ⚠️ contact_phone → phone
    - [x] 주소 검증 (5글자 이상) - ⚠️ region → address
    - [x] 계좌번호 검증 (5글자 이상, 은행명 포함)
    - [x] ⚠️ 이메일 검증 제거 (profiles.email 사용)

- [x] **`app/(auth)/wholesaler-onboarding/page.tsx` 구현**
  - [x] react-hook-form 설정
  - [x] zod 스키마 연동
  - [x] 폼 UI 구현
    - [x] 사업자명 입력 필드
    - [x] 사업자번호 입력 필드
    - [x] 대표자명 입력 필드 (representative)
    - [x] 연락처 입력 필드 (phone, 하이픈 자동 추가)
    - [x] 주소 입력 필드 (address, 우편번호 검색 기능 선택)
    - [x] 계좌번호 입력 필드 (은행명 포함, 예: "국민은행 123-456-789")
  - [x] 폼 제출 처리
    - [x] `wholesalers` 테이블에 INSERT
    - [x] `status` = 'pending' 자동 설정
    - [x] `anonymous_code` 서버에서 자동 생성 (예: VENDOR-001)
  - [x] 제출 후 `/wholesaler/pending-approval`로 리다이렉트
  - [x] 진행 표시 (1/3, 2/3, 3/3 단계)
  - [x] 에러 처리 및 토스트 알림

#### 3. 승인 대기 페이지

- [x] **`app/wholesaler/pending-approval/page.tsx` 구현**
  - [x] 승인 대기 UI 구현
    - [x] 로딩 애니메이션 (Hourglass 아이콘)
    - [x] 안내 메시지 표시
    - [x] 예상 승인 시간 안내 (1-2 영업일)
  - [x] 현재 승인 상태 조회
    - [x] Supabase에서 `wholesalers` 테이블 조회
    - [x] `status`, `rejection_reason` 확인
  - [x] 실시간 승인 상태 확인 (Supabase Realtime)
    - [x] `wholesalers` 테이블 UPDATE 이벤트 구독
    - [x] `status` 변경 감지
  - [x] 승인 완료 시 (`status` = 'approved')
    - [x] 축하 메시지 표시
    - [x] 즉시 `/wholesaler/dashboard`로 자동 이동 (2초 대기 없이)
  - [x] 승인 반려 시 (`status` = 'rejected')
    - [x] 반려 사유 표시
    - [x] 재신청 버튼 (온보딩 페이지로 이동)
  - [x] 로딩 스피너 및 에러 처리

#### 4. 도매 레이아웃에서 승인 상태 확인

- [x] **`app/wholesaler/layout.tsx` 구현**
  - [x] Clerk 인증 확인 (`auth()`)
  - [x] 로그인하지 않은 경우 `/sign-in`으로 리다이렉트
  - [x] Supabase에서 `wholesalers` 정보 조회
  - [x] `wholesaler` 정보가 없으면 `/wholesaler-onboarding`으로 리다이렉트
  - [x] `status` = 'pending' 또는 'rejected'이면 `/wholesaler/pending-approval`로 리다이렉트
  - [x] `status` = 'suspended'이면 `/wholesaler/suspended`로 리다이렉트
  - [x] `status` = 'approved'인 경우에만 대시보드 접근 허용
  - [x] 레이아웃 구조 설정 (Sidebar + Header + Main Content)

#### 5. 정지된 계정 페이지 (필수)

- [x] **⚠️ `app/wholesaler/suspended/page.tsx` 구현**
  - [x] 계정 정지 안내 메시지
  - [x] 정지 사유 표시 (wholesalers.rejection_reason 또는 별도 필드)
  - [x] 고객센터 연락처 표시
  - [x] 로그아웃 버튼
  - [x] 경고 아이콘 (XCircle)

#### 6. Anonymous Code 자동 생성 (필수)

- [x] **⚠️ Anonymous Code 자동 생성 로직 구현**
  - [x] PM과 구현 방법 협의
    - [ ] Option 1: Supabase Edge Function (권장)
    - [x] Option 2: Database Trigger ✅ 선택됨
    - [ ] Option 3: 클라이언트 사이드 (보안상 비권장)
  - [x] 생성 형식 확정
    - [x] 형식: `VENDOR-001`, `VENDOR-002`, `VENDOR-003` (순차 증가)
    - [x] 3자리 숫자 패딩 (001, 002, ..., 999)
  - [x] 구현 세부사항
    - [x] wholesalers 테이블 INSERT 시 자동 생성 (Database Trigger로 구현)
    - [x] 중복 방지 로직 (UNIQUE 제약 + advisory lock 사용)
    - [x] 최대 번호 조회 후 +1 증가
  - [ ] 테스트
    - [ ] 여러 계정 동시 생성 시 중복 없는지 확인
    - [ ] 온보딩 완료 후 anonymous_code 확인

**커서 AI 프롬프트:**

```
Anonymous Code 자동 생성 로직을 구현해줘.

요구사항:
- PM과 협의한 구현 방법에 따라 구현 (Edge Function 또는 Database Trigger)
- 생성 형식: VENDOR-001, VENDOR-002, VENDOR-003 (순차 증가)
- 3자리 숫자 패딩 (001, 002, ..., 999)
- wholesalers 테이블 INSERT 시 자동 생성
- 중복 방지 로직 (UNIQUE 제약 또는 트랜잭션 처리)
- 최대 번호 조회 후 +1 증가
- 동시성 처리 (여러 계정 동시 생성 시 중복 방지)

⚠️ 구현 방법은 PM과 협의 후 결정하세요. Edge Function, Database Trigger, 또는 다른 방법 중 선택합니다.

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

### 🎨 레이아웃 구현 (Week 2)

#### 1. 사이드바 컴포넌트

- [ ] **`components/wholesaler/Layout/Sidebar.tsx` 구현**
  - [ ] 로고 영역
  - [ ] 메뉴 아이템 정의
    - [ ] 대시보드 (`/wholesaler/dashboard`, LayoutDashboard 아이콘)
    - [ ] 상품 관리 (`/wholesaler/products`, Package 아이콘)
    - [ ] 시세 조회 (`/wholesaler/market-prices`, TrendingUp 아이콘)
    - [ ] 주문 관리 (`/wholesaler/orders`, ShoppingCart 아이콘)
    - [ ] 정산 관리 (`/wholesaler/settlements`, DollarSign 아이콘)
    - [ ] 문의 관리 (`/wholesaler/inquiries`, MessageSquare 아이콘) - 선택
  - [ ] 현재 경로 하이라이트 (usePathname 활용)
  - [ ] hover 효과
  - [ ] Tailwind CSS 스타일링

#### 2. 헤더 컴포넌트

- [ ] **`components/wholesaler/Layout/Header.tsx` 구현**
  - [ ] 페이지 제목 영역
  - [ ] 알림 아이콘 (새 주문 알림 표시)
  - [ ] 사용자 드롭다운 메뉴 (Clerk `UserButton` 사용)
  - [ ] 반응형 디자인 (모바일 대응)

#### 3. 공통 컴포넌트

- [x] **`components/common/LoadingSpinner.tsx` 구현**

  - [x] 로딩 스피너 애니메이션
  - [x] 크기 옵션 (sm, md, lg)

**커서 AI 프롬프트:**

```
로딩 스피너 컴포넌트를 만들어줘.

요구사항:
- 로딩 스피너 애니메이션 (회전 애니메이션)
- 크기 옵션: sm, md, lg (props로 받기)
- Tailwind CSS 스타일링
- 접근성: aria-label 추가

파일: components/common/LoadingSpinner.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

- [ ] **`components/common/EmptyState.tsx` 구현**

  - [ ] 빈 상태 일러스트레이션
  - [ ] 메시지 표시
  - [ ] 액션 버튼 (선택적)

**커서 AI 프롬프트:**

```
빈 상태 컴포넌트를 만들어줘.

요구사항:
- 빈 상태 일러스트레이션 (아이콘 또는 일러스트)
- 메시지 표시 (props로 받기)
- 액션 버튼 (선택적, props로 받기)
- 재사용 가능한 컴포넌트
- Tailwind CSS 스타일링

파일: components/common/EmptyState.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

- [ ] **`components/common/PageHeader.tsx` 구현**
  - [ ] 페이지 제목
  - [ ] 설명 (선택적)
  - [ ] 액션 버튼 영역 (선택적)

**커서 AI 프롬프트:**

```
페이지 헤더 컴포넌트를 만들어줘.

요구사항:
- 페이지 제목 (필수)
- 설명 (선택적, props로 받기)
- 액션 버튼 영역 (선택적, ReactNode로 받기)
- 재사용 가능한 컴포넌트
- Tailwind CSS 스타일링

파일: components/common/PageHeader.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

### 📄 빈 페이지 생성

- [ ] `app/wholesaler/dashboard/page.tsx` 생성 (빈 페이지)
- [ ] `app/wholesaler/products/page.tsx` 생성 (빈 페이지)
- [ ] `app/wholesaler/market-prices/page.tsx` 생성 (빈 페이지)
- [ ] `app/wholesaler/orders/page.tsx` 생성 (빈 페이지)
- [ ] `app/wholesaler/settlements/page.tsx` 생성 (빈 페이지)
- [ ] `app/wholesaler/inquiries/page.tsx` 생성 (빈 페이지 - 선택)

### ✅ Week 1-2 완료 체크

- [ ] **필수 항목 확인**
  - [ ] ⚠️ profiles 테이블 구조 PM과 확정
  - [ ] ⚠️ Anonymous Code 자동 생성 로직 구현 완료
  - [ ] ⚠️ Supabase Storage RLS 정책 설정 완료
  - [ ] ⚠️ 정지된 계정 페이지 구현 완료
- [ ] 전체 네비게이션이 작동하는지 확인
- [ ] 모든 페이지로 이동 가능한지 확인
- [ ] 인증 플로우 테스트 (역할 선택 → 온보딩 → 승인 대기)
- [ ] 실시간 승인 알림 테스트
- [ ] 코드 리뷰 및 리팩토링

---

## 📦 Week 3-4: 상품 관리 + AI 표준화 + 시세 조회

### 🛍️ 상품 관리 기능 (Week 3)

#### 1. 상품 목록 페이지

- [ ] **Supabase 쿼리 함수 작성**

  - [ ] `lib/supabase/queries/products.ts` 작성
  - [ ] `getProducts()` 함수 구현
    - [ ] 현재 도매점의 상품만 조회 (RLS 정책 활용)
    - [ ] 페이지네이션 지원
    - [ ] 정렬 지원 (최신순, 가격순 등)
  - [ ] `getProductsByCategory()` 함수 구현
  - [ ] `searchProducts()` 함수 구현

- [ ] **`app/wholesaler/products/page.tsx` 구현**

  - [ ] 페이지 헤더 (제목 + "상품 등록" 버튼)
  - [ ] 필터 UI
    - [ ] 카테고리 선택 (Select)
    - [ ] 활성/비활성 필터 (Tabs)
    - [ ] 검색 입력 필드 (상품명)
  - [ ] 상품 테이블 컴포넌트 렌더링
  - [ ] 로딩 상태 (스켈레톤)
  - [ ] 빈 상태 (EmptyState)
  - [ ] 에러 처리

- [ ] **`components/wholesaler/Products/ProductTable.tsx` 구현**
  - [ ] TanStack Table 설정
  - [ ] 테이블 컬럼 정의
    - [ ] 이미지 (썸네일)
    - [ ] 상품명
    - [ ] 카테고리
    - [ ] 가격
    - [ ] 재고
    - [ ] 상태 (활성/비활성 뱃지)
    - [ ] 액션 (수정/비활성화 버튼)
  - [ ] 정렬 기능
  - [ ] 페이지네이션
  - [ ] 활성화/비활성화 토글 함수

#### 2. 상품 등록 폼

- [ ] **유효성 검증 스키마 작성**

  - [ ] `lib/validation/product.ts` 작성
  - [ ] `productSchema` 정의
    - [ ] 상품명 (2글자 이상)
    - [ ] 카테고리 (필수)
    - [ ] 가격 (0 이상)
    - [ ] 최소주문수량 (1 이상)
    - [ ] 재고 (0 이상)
    - [ ] 단위 (기본값: ea)
    - [ ] 배송비 (0 이상)
    - [ ] 배송 방법 (enum: courier/direct/quick/freight/pickup, 기본값: courier)
    - [ ] 납기 (선택)
    - [ ] 규격 정보 (무게, 크기, 원산지, 보관방법)

- [ ] **이미지 업로드 함수 작성**

  - [ ] `lib/supabase/storage.ts` 작성
  - [ ] `uploadProductImage()` 함수 구현
    - [ ] 파일 타입 검증 (jpg, jpeg, png, webp)
    - [ ] 파일 크기 검증 (최대 5MB)
    - [ ] Supabase Storage에 업로드
    - [ ] Public URL 반환
  - [ ] `deleteProductImage()` 함수 구현

- [ ] **`app/wholesaler/products/new/page.tsx` 구현**

  - [ ] react-hook-form 설정
  - [ ] zod 스키마 연동
  - [ ] 폼 UI 구현
    - [ ] 상품명 입력 필드 + AI 표준화 버튼
    - [ ] 카테고리 선택 (Select)
    - [ ] 가격 입력 필드 + 시세 참고 버튼
    - [ ] 최소주문수량 입력 필드
    - [ ] 재고 입력 필드
    - [ ] 단위 선택 (Select: ea, kg, box 등)
    - [ ] 배송비 입력 필드
    - [ ] 배송 방법 선택 (Select: 택배/직배송/퀵서비스/화물/픽업)
    - [ ] 납기 입력 필드
    - [ ] 상품 설명 (Textarea)
    - [ ] 이미지 업로드 (최대 5개)
      - [ ] 드래그 앤 드롭 지원
      - [ ] 미리보기 표시
      - [ ] 삭제 버튼
    - [ ] 규격 정보 입력 (무게, 크기, 원산지, 보관방법)
  - [ ] 폼 제출 처리
    - [ ] 이미지 업로드
    - [ ] `products` 테이블에 INSERT
    - [ ] 성공 시 상품 목록으로 이동 + 토스트 알림
  - [ ] 로딩 상태 처리
  - [ ] 에러 처리 및 토스트 알림

- [ ] **`components/wholesaler/Products/ProductForm.tsx` 구현**
  - [ ] 재사용 가능한 폼 컴포넌트
  - [ ] mode prop으로 등록/수정 모드 구분

**커서 AI 프롬프트:**

```
상품 폼 컴포넌트를 만들어줘.

요구사항:
- 재사용 가능한 폼 컴포넌트
- mode prop: 'create' | 'edit' (등록/수정 모드 구분)
- react-hook-form + zod 스키마 사용
- 모든 상품 입력 필드 포함 (상품명, 카테고리, 가격, 재고 등)
- 이미지 업로드 기능 포함
- AI 표준화 버튼, 시세 참고 버튼 포함
- 등록 모드: 빈 폼, 수정 모드: 기존 데이터로 초기화
- 에러 처리 및 토스트 알림

파일: components/wholesaler/Products/ProductForm.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

#### 3. 상품 수정 기능

- [ ] **`app/wholesaler/products/[id]/edit/page.tsx` 구현**
  - [ ] 상품 ID로 기존 데이터 조회
  - [ ] ProductForm 컴포넌트 재사용
  - [ ] 기존 데이터로 폼 초기화
  - [ ] 수정 API 연동
  - [ ] 성공 시 상품 목록으로 이동

**커서 AI 프롬프트:**

```
상품 수정 페이지를 만들어줘.

요구사항:
- 상품 ID로 기존 데이터 조회 (Next.js 15: await params)
- ProductForm 컴포넌트 재사용 (mode='edit')
- 기존 데이터로 폼 초기화
- 수정 API 연동 (Server Action 또는 API Route)
- 성공 시 /wholesaler/products로 리다이렉트 + 토스트 알림
- 로딩 상태 및 에러 처리
- 존재하지 않는 상품 ID 처리 (notFound())

파일: app/wholesaler/products/[id]/edit/page.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

### 🤖 AI 상품명 표준화 (Week 3 후반)

#### 1. Gemini API 연동

- [ ] **Google AI Studio에서 API 키 발급**

  - [ ] https://aistudio.google.com 접속
  - [ ] "Get API Key" 클릭
  - [ ] API 키 복사 후 `.env.local`에 추가

- [ ] **`lib/api/ai-standardize.ts` 구현**
  - [ ] `standardizeProductName()` 함수 구현
    - [ ] Gemini 2.5 Flash API 호출
    - [ ] 프롬프트 작성 (상품명 표준화 규칙 포함)
    - [ ] JSON 응답 파싱
    - [ ] 반환값: `{ standardizedName, suggestedCategory, keywords, confidence }`
  - [ ] `standardizeProductNamesBatch()` 함수 구현 (⚠️ 선택 기능)
    - [ ] 여러 상품을 한 번에 표준화
    - [ ] 배치 처리로 API 호출 최적화
  - [ ] 에러 처리 (API 한도 초과, 네트워크 오류 등)
  - [ ] Rate limit 처리

#### 2. AI 표준화 컴포넌트

- [ ] **`components/wholesaler/Products/AIStandardizeButton.tsx` 구현**
  - [ ] "AI 표준화" 버튼 UI
  - [ ] 버튼 클릭 시 모달 열기
  - [ ] 로딩 상태 (Gemini AI 분석 중)
  - [ ] 결과 모달 UI
    - [ ] 원본 상품명 표시
    - [ ] 표준화된 상품명 표시 (강조)
    - [ ] 추천 카테고리 표시 (Badge)
    - [ ] 검색 키워드 표시 (Badge 배열)
    - [ ] 신뢰도 표시 (Progress Bar + 퍼센트)
    - [ ] 신뢰도 낮을 시 경고 메시지
  - [ ] "적용하기" 버튼
    - [ ] 표준화된 이름을 폼에 자동 입력
    - [ ] 추천 카테고리를 폼에 자동 입력
  - [ ] "취소" 버튼
  - [ ] 에러 처리 및 재시도
  - [ ] **⚠️ API Rate Limiting 처리 (필수)**
    - [ ] 429 에러 (Too Many Requests) 처리
    - [ ] 사용자에게 "잠시 후 다시 시도해주세요" 메시지
    - [ ] 재시도 버튼 제공
    - [ ] 호출 간 최소 딜레이 추가 (분당 15회 제한 고려)

#### 3. 상품 등록 폼에 통합

- [ ] **상품명 입력 필드 옆에 AI 표준화 버튼 추가**

  - [ ] 버튼 위치: 상품명 입력 필드 옆
  - [ ] 도움말 텍스트: "💡 AI 표준화를 사용하면 검색 최적화된 상품명으로 자동 변환됩니다"
  - [ ] `onAccept` 콜백으로 폼 값 업데이트

- [ ] **테스트**
  - [ ] "양파1kg특" → "양파 1kg (특급)" 변환 확인
  - [ ] "사과5kg상품" → "사과 5kg (상품)" 변환 확인
  - [ ] 카테고리 자동 추천 확인
  - [ ] 키워드 추출 확인
  - [ ] 신뢰도 표시 확인

### 📈 실시간 시세 조회 (Week 4)

#### 1. 공공데이터포털 API 연동

- [ ] **공공데이터포털에서 API 키 발급**

  - [ ] https://www.data.go.kr 접속
  - [ ] 회원가입 및 로그인
  - [ ] "한국농수산식품유통공사 전국 공영도매시장 실시간 경매정보" 검색
  - [ ] 활용신청 클릭 (즉시 승인)
  - [ ] 서비스 키 복사 후 `.env.local`에 추가

- [ ] **`lib/api/market-prices.ts` 구현**
  - [ ] `getMarketPrices()` 함수 구현
    - [ ] 공공데이터포털 API 호출
    - [ ] 파라미터: itemName, marketName, date, numOfRows, pageNo
    - [ ] 반환값: `PriceItem[]`
  - [ ] `getPriceTrend()` 함수 구현
    - [ ] 일주일 시세 추이 조회
    - [ ] 날짜별 평균 가격 계산
    - [ ] 차트용 데이터 반환
  - [ ] 주요 도매시장 목록 정의 (`majorMarkets`)
  - [ ] 주요 품목 카테고리 정의 (`itemCategories`)
  - [ ] 에러 처리
  - [ ] **⚠️ 캐싱 전략 구현 (필수)**
    - [ ] 30분 캐싱 적용 (동일 품목/시장 조회)
    - [ ] localStorage 또는 React Query 사용
    - [ ] 캐시 만료 시간 표시
    - [ ] "새로고침" 버튼 제공
    - [ ] API 호출 제한 방지 (일일 한도 고려)

#### 2. 시세 조회 페이지

- [ ] **`app/wholesaler/market-prices/page.tsx` 구현**

  - [ ] 페이지 헤더 (제목 + 설명)
  - [ ] 시세 검색 필터 컴포넌트
  - [ ] 시세 테이블 컴포넌트
  - [ ] 가격 추이 차트 컴포넌트
  - [ ] 데이터 조회 및 상태 관리
  - [ ] 로딩 상태
  - [ ] 빈 상태
  - [ ] 에러 처리

- [ ] **`components/wholesaler/MarketPrices/PriceFilter.tsx` 구현**

  - [ ] 품목명 입력 필드
  - [ ] 도매시장 선택 (Select)
  - [ ] 조회 버튼
  - [ ] 인기 품목 빠른 검색 버튼 (배추, 무, 사과, 배 등)
  - [ ] Enter 키로 검색 실행

- [ ] **`components/wholesaler/MarketPrices/PriceTable.tsx` 구현**

  - [ ] 테이블 컬럼
    - [ ] 품목명
    - [ ] 품종
    - [ ] 등급
    - [ ] 단위
    - [ ] 현재가 (강조)
    - [ ] 전일가
    - [ ] 등락률 (색상: 상승 빨강, 하락 파랑)
    - [ ] 도매시장
    - [ ] 경매일자
  - [ ] 정렬 기능
  - [ ] 등락률 아이콘 (TrendingUp, TrendingDown, Minus)

- [ ] **`components/wholesaler/MarketPrices/PriceChart.tsx` 구현**
  - [ ] recharts 라이브러리 사용
  - [ ] 선 그래프 (Line Chart)
  - [ ] X축: 날짜
  - [ ] Y축: 가격
  - [ ] 툴팁 표시
  - [ ] 반응형 디자인

#### 3. 상품 등록 페이지와 연동

- [ ] **가격 입력 필드 옆에 "시세 참고" 버튼 추가**
  - [ ] 버튼 클릭 시 시세 조회 페이지를 새 탭으로 열기
  - [ ] 버튼 아이콘: TrendingUp
  - [ ] 버튼 텍스트: "시세 참고"

### ✅ Week 3-4 완료 체크

- [ ] **필수 항목 확인**
  - [ ] ⚠️ Gemini API Rate Limiting 처리 구현
  - [ ] ⚠️ 공공데이터 API 캐싱 전략 구현
- [ ] 상품 CRUD 전체 기능 테스트
- [ ] 이미지 업로드/삭제 테스트
- [ ] AI 상품명 표준화 기능 테스트
- [ ] Gemini API 사용량 모니터링 설정
- [ ] 실시간 시세 조회 기능 테스트
- [ ] 공공데이터 API 호출 한도 확인
- [ ] 소매 페이지에서 상품 데이터 연동 확인
- [ ] 코드 리뷰 및 리팩토링

---

## 📦 Week 5-6: 주문 관리

### 📋 주문 관리 기능 (Week 5)

#### 0. ⚠️ 주문 구조 이해 (필수 확인!)

- [ ] **주문 구조 확인**
  - [ ] ❌ order_items 테이블 **없음**
  - [ ] ✅ orders 테이블에 product_id, variant_id 직접 포함
  - [ ] ✅ 1개 orders 레코드 = 1개 상품
  - [ ] ✅ 장바구니에서 여러 상품 주문 시 → 여러 orders 레코드 생성
- [ ] **주문 조회 예시 확인**

  ```typescript
  // ❌ 잘못된 예시
  const orderItems = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  // ✅ 올바른 예시
  const order = await supabase
    .from("orders")
    .select(
      `
      *,
      products(*),
      product_variants(*),
      wholesalers(anonymous_code)
    `,
    )
    .eq("id", orderId)
    .single();
  ```

#### 1. Supabase 쿼리 함수

- [ ] **`lib/supabase/queries/orders.ts` 작성**
  - [ ] `getOrders()` 함수 구현
    - [ ] 현재 도매점의 주문만 조회 (RLS 정책)
    - [ ] 상태별 필터링
    - [ ] 날짜 범위 필터링
    - [ ] 페이지네이션
    - [ ] 정렬 (최신순, 금액순)
    - [ ] ⚠️ products, product_variants 조인 (order_items 아님!)
  - [ ] `getOrderById()` 함수 구현
    - [ ] 주문 상세 정보 조회
    - [ ] ⚠️ product_id, variant_id로 상품 정보 조인
  - [ ] `updateOrderStatus()` 함수 구현
    - [ ] 주문 상태 변경
    - [ ] ⚠️ updated_at은 트리거가 자동 업데이트
  - [ ] `getOrderStats()` 함수 구현 (대시보드용)

#### 2. 주문 목록 페이지

- [ ] **`app/wholesaler/orders/page.tsx` 구현**

  - [ ] 페이지 헤더 (제목)
  - [ ] 탭 UI
    - [ ] 신규 (pending)
    - [ ] 처리중 (confirmed, shipped) - ⚠️ preparing 제거됨
    - [ ] 완료 (completed)
  - [ ] 필터 UI
    - [ ] 날짜 범위 선택 (DateRangePicker)
    - [ ] 상태 선택 (Select)
    - [ ] 검색 (주문번호)
  - [ ] 주문 테이블 컴포넌트 렌더링
  - [ ] 실시간 업데이트 (Realtime 구독)
  - [ ] 로딩 상태
  - [ ] 빈 상태
  - [ ] 에러 처리

- [ ] **`components/wholesaler/Orders/OrderTable.tsx` 구현**

  - [ ] TanStack Table 설정
  - [ ] 테이블 컬럼
    - [ ] 체크박스 (일괄 처리용)
    - [ ] 주문번호
    - [ ] 주문일
    - [ ] 상품명 (1 주문 = 1 상품)
    - [ ] 옵션 (variant_id 있으면 표시)
    - [ ] 수량
    - [ ] 금액
    - [ ] 상태 (OrderStatusBadge)
    - [ ] 액션 (상세보기 버튼)
    - [ ] ⚠️ 같은 시간에 여러 주문 생성될 수 있음 (장바구니 → 주문)
  - [ ] 정렬 기능
  - [ ] 페이지네이션
  - [ ] 일괄 상태 변경 버튼

- [ ] **`components/wholesaler/Orders/OrderStatusBadge.tsx` 구현**
  - [ ] 상태별 뱃지 색상
    - [ ] pending: 노란색 (신규 주문)
    - [ ] confirmed: 파란색 (접수 확인)
    - [ ] shipped: 초록색 (출고 완료)
    - [ ] completed: 회색 (배송 완료)
    - [ ] cancelled: 빨간색 (취소)
    - [ ] ⚠️ preparing 제거됨

#### 3. 주문 상세 페이지

- [ ] **`app/wholesaler/orders/[id]/page.tsx` 구현**

  - [ ] 주문 ID로 데이터 조회
  - [ ] 페이지 헤더 (주문번호 + 상태)
  - [ ] 주문 정보 섹션
    - [ ] 주문번호
    - [ ] 주문일
    - [ ] 현재 상태
  - [ ] 소매점 정보 섹션
    - [ ] ⚠️ 익명 코드만 표시 (예: R-001)
    - [ ] ❌ 실명/연락처 절대 노출 금지
  - [ ] 배송지 정보 섹션
    - [ ] 배송지 주소
    - [ ] 배송 요청사항
  - [ ] 주문 상품 정보
    - [ ] ⚠️ 1 주문 = 1 상품 (테이블 불필요, 카드형으로 표시)
    - [ ] 이미지
    - [ ] 상품명
    - [ ] 옵션명 (variant 있으면)
    - [ ] 단가 (unit_price)
    - [ ] 수량 (quantity)
    - [ ] 합계 (unit_price \* quantity)
  - [ ] 금액 정보
    - [ ] 상품 금액
    - [ ] 배송비
    - [ ] 총 금액
  - [ ] 주문 타임라인
    - [ ] 주문 접수 (created_at)
    - [ ] 접수 확인 (status = confirmed)
    - [ ] 출고 완료 (status = shipped)
    - [ ] 배송 완료 (status = completed)
    - [ ] ⚠️ updated_at만 자동 업데이트됨 (트리거)
  - [ ] 상태 변경 버튼
    - [ ] pending → "접수 확인" 버튼
    - [ ] confirmed → "출고 처리" 버튼 (⚠️ preparing 단계 제거)
    - [ ] shipped → "완료 처리" 버튼
  - [ ] 로딩 상태
  - [ ] 에러 처리

- [ ] **`components/wholesaler/Orders/OrderDetail.tsx` 구현**
  - [ ] 재사용 가능한 주문 상세 컴포넌트

### 🔔 실시간 알림 (Week 6)

#### 1. Realtime 구독 설정

- [ ] **`lib/supabase/realtime.ts` 구현**
  - [ ] `subscribeToNewOrders()` 함수 구현
    - [ ] `orders` 테이블 INSERT 이벤트 구독
    - [ ] 현재 도매점의 주문만 필터링
    - [ ] 콜백 함수 실행
    - [ ] 구독 해제 함수 반환
  - [ ] `subscribeToOrderUpdates()` 함수 구현
    - [ ] `orders` 테이블 UPDATE 이벤트 구독
  - [ ] **⚠️ Cleanup 로직 필수 포함**
    - [ ] 모든 구독 함수에서 unsubscribe 함수 반환
    - [ ] 주석으로 cleanup 중요성 명시
    - [ ] 예시 코드:
      ```typescript
      // 반드시 cleanup 함수 반환 (메모리 누수 방지)
      return () => {
        supabase.removeChannel(channel);
      };
      ```

#### 2. 새 주문 알림

- [ ] **대시보드에서 Realtime 구독 설정**

  - [ ] `useEffect`로 구독 시작
  - [ ] 새 주문 도착 시 토스트 알림 표시
  - [ ] 주문 카운트 실시간 업데이트
  - [ ] 알림 클릭 시 주문 상세 페이지로 이동
  - [ ] **⚠️ 컴포넌트 언마운트 시 구독 해제 (필수)**

    - [ ] useEffect의 return 함수에서 unsubscribe 호출
    - [ ] 메모리 누수 방지
    - [ ] 디버그 로그 추가 (개발 환경)
    - [ ] 예시:

      ```typescript
      useEffect(() => {
        const unsubscribe = subscribeToNewOrders(...);

        return () => {
          console.log('🧹 Cleaning up order subscription');
          unsubscribe();
        };
      }, [wholesalerId]);
      ```

- [ ] **헤더에 알림 아이콘 추가**
  - [ ] 벨 아이콘 (Bell)
  - [ ] 새 주문 있을 시 빨간 점 표시
  - [ ] 클릭 시 최근 알림 목록 드롭다운

#### 3. 주문 상태 변경 처리

- [ ] **상태 변경 함수 구현**

  - [ ] 낙관적 업데이트 (Optimistic Update)
  - [ ] API 호출
  - [ ] 타임스탬프 자동 기록
  - [ ] 성공 시 토스트 알림
  - [ ] 실패 시 롤백 및 에러 알림

- [ ] **일괄 상태 변경 기능**
  - [ ] 체크박스로 여러 주문 선택
  - [ ] "일괄 접수 확인" 버튼
  - [ ] "일괄 출고 처리" 버튼
  - [ ] 처리 중 로딩 표시
  - [ ] 성공/실패 개수 표시

### ✅ Week 5-6 완료 체크

- [ ] **필수 항목 확인**
  - [ ] ⚠️ 모든 Realtime 구독에서 cleanup 함수 구현
  - [ ] ⚠️ 메모리 누수 테스트 완료
- [ ] 주문 목록 조회 테스트
- [ ] 주문 상태 변경 테스트
- [ ] 실시간 알림 동작 확인
- [ ] 일괄 처리 기능 테스트
- [ ] 소매 페이지에서 주문 생성 후 도매 페이지 확인
- [ ] RLS 정책 테스트 (다른 도매점 주문 접근 차단)
- [ ] 코드 리뷰 및 리팩토링

---

## 💰 Week 7: 대시보드 + 정산

### 📊 대시보드 (Week 7 전반)

#### 1. 대시보드 컴포넌트

- [ ] **`components/wholesaler/Dashboard/StatCard.tsx` 구현**

  - [ ] Props: title, value, icon, trend (선택)
  - [ ] 카드 UI (shadcn/ui Card 사용)
  - [ ] 아이콘 표시
  - [ ] 증감률 표시 (선택)
  - [ ] 로딩 상태 (스켈레톤)

**커서 AI 프롬프트:**

```
대시보드 통계 카드 컴포넌트를 만들어줘.

요구사항:
- Props: title, value, icon, trend (선택)
- shadcn/ui Card 컴포넌트 사용
- 아이콘 표시 (lucide-react)
- 증감률 표시 (선택, trend prop 있을 때만)
- 로딩 상태: 스켈레톤 UI
- Tailwind CSS 스타일링

파일: components/wholesaler/Dashboard/StatCard.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

- [ ] **`components/wholesaler/Dashboard/RecentOrders.tsx` 구현**
  - [ ] 최근 주문 5개 표시
  - [ ] 주문번호, 주문일, 상태, 금액
  - [ ] "전체 보기" 버튼 (주문 목록으로 이동)

**커서 AI 프롬프트:**

```
최근 주문 컴포넌트를 만들어줘.

요구사항:
- 최근 주문 5개 표시
- 컬럼: 주문번호, 주문일, 상태(뱃지), 금액
- "전체 보기" 버튼 (/wholesaler/orders로 이동)
- 로딩 상태: 스켈레톤 UI
- 빈 상태: EmptyState 컴포넌트

파일: components/wholesaler/Dashboard/RecentOrders.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

#### 2. 대시보드 페이지

- [ ] **`app/wholesaler/dashboard/page.tsx` 구현**

  - [ ] 통계 카드 4개
    - [ ] 오늘 주문 (건수)
    - [ ] 출고 예정 (건수)
    - [ ] 이번 주 정산 예정 (금액)
    - [ ] 전체 상품 (개수)
  - [ ] Supabase에서 실제 데이터 조회
    - [ ] 오늘 주문: `orders` 테이블 COUNT (created_at = 오늘)
    - [ ] 출고 예정: `orders` 테이블 COUNT (status = confirmed) - ⚠️ preparing 제거
    - [ ] 정산 예정: `settlements` 테이블 SUM (status = pending)
    - [ ] 전체 상품: `products` 테이블 COUNT (is_active = true)
  - [ ] 최근 주문 목록 컴포넌트
  - [ ] 재고 부족 알림 섹션
    - [ ] 재고 10개 이하 상품 표시
    - [ ] "재고 추가" 버튼
  - [ ] 실시간 업데이트 (Realtime 구독)
  - [ ] 로딩 상태
  - [ ] 에러 처리

**커서 AI 프롬프트:**

```
도매 대시보드 페이지를 만들어줘.

요구사항:
- 통계 카드 4개: 오늘 주문(건수), 출고 예정(건수), 이번 주 정산 예정(금액), 전체 상품(개수)
- Supabase에서 실제 데이터 조회
  - 오늘 주문: orders 테이블 COUNT (created_at = 오늘)
  - 출고 예정: orders 테이블 COUNT (status = confirmed)
  - 정산 예정: settlements 테이블 SUM (status = pending)
  - 전체 상품: products 테이블 COUNT (is_active = true)
- RecentOrders 컴포넌트 (최근 주문 5개)
- 재고 부족 알림 섹션 (재고 10개 이하 상품)
- Supabase Realtime 구독 (새 주문 알림)
- ⚠️ Realtime cleanup 함수 필수 포함
- 로딩 상태 및 에러 처리

파일: app/wholesaler/dashboard/page.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

- [ ] **훅 구현**
  - [ ] `hooks/useWholesaler.ts` 구현
    - [ ] 현재 도매점 정보 조회
    - [ ] Clerk user_id로 wholesaler 정보 가져오기
  - [ ] `hooks/useDashboardStats.ts` 구현
    - [ ] 대시보드 통계 데이터 조회
    - [ ] 실시간 업데이트

### 💸 정산 관리 (Week 7 후반)

#### 0. 정산 데이터 생성 프로세스 (✅ 확정됨)

- [ ] **정산 프로세스 이해 (확정 사항)**
  - [ ] ✅ 생성 시점: 결제 완료(paid_at) 직후 **자동 생성**
  - [ ] ✅ `platform_fee_rate`: **5% 고정** (환경 변수: `NEXT_PUBLIC_PLATFORM_FEE_RATE`)
  - [ ] ✅ `scheduled_payout_at`: 결제일 + 7일 (**D+7**)
  - [ ] ✅ 정산 완료 처리: MVP에서는 **관리자 수동 처리** (자동 송금은 Phase 2)
- [ ] **정산 계산 로직**

  ```typescript
  const platformFeeRate = parseFloat(
    process.env.NEXT_PUBLIC_PLATFORM_FEE_RATE || "0.05",
  );
  const platformFee = Math.floor(order.total_amount * platformFeeRate);
  const wholesalerAmount = order.total_amount - platformFee;
  const scheduledPayoutAt = new Date(order.paid_at);
  scheduledPayoutAt.setDate(scheduledPayoutAt.getDate() + 7); // D+7
  ```

- [ ] **테스트 데이터 생성**
  ```sql
  -- Supabase SQL Editor에서 실행
  INSERT INTO settlements (
    order_id, wholesaler_id, order_amount,
    platform_fee_rate, platform_fee, wholesaler_amount,
    status, scheduled_payout_at
  ) VALUES (
    'order_uuid', 'wholesaler_uuid', 100000,
    0.05, 5000, 95000,
    'pending', NOW() + INTERVAL '7 days'
  );
  ```

#### 1. Supabase 쿼리 함수

- [ ] **`lib/supabase/queries/settlements.ts` 작성**
  - [ ] `getSettlements()` 함수 구현
    - [ ] 현재 도매점의 정산 내역 조회
    - [ ] 상태별 필터링 (pending, completed)
    - [ ] 날짜 범위 필터링
    - [ ] 페이지네이션
  - [ ] `getSettlementById()` 함수 구현
  - [ ] ⚠️ 정산 데이터는 결제 완료 시 자동 생성됨 (조회만 담당)

**커서 AI 프롬프트:**

```
정산 조회 쿼리 함수를 만들어줘.

요구사항:
- getSettlements(): 현재 도매점의 정산 내역 조회
  - RLS 정책 활용 (wholesaler_id 필터)
  - 상태별 필터링 (status: pending, completed)
  - 날짜 범위 필터링 (scheduled_payout_at)
  - 페이지네이션 (page, limit)
  - 정렬 (scheduled_payout_at ASC)
- getSettlementById(): 정산 상세 정보 조회
- ⚠️ 정산 데이터는 결제 완료 시 자동 생성됨 (조회만 담당)

파일: lib/supabase/queries/settlements.ts

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

#### 2. 정산 관리 페이지

- [ ] **`app/wholesaler/settlements/page.tsx` 구현**

  - [ ] 페이지 헤더 (제목 + 총 정산 예정 금액)
  - [ ] 탭 UI
    - [ ] 정산 예정 (pending)
    - [ ] 정산 완료 (completed)
  - [ ] 필터 UI
    - [ ] 날짜 범위 선택
    - [ ] 상태 선택
  - [ ] 정산 테이블 컴포넌트
  - [ ] 로딩 상태
  - [ ] 빈 상태
  - [ ] 에러 처리

**커서 AI 프롬프트:**

```
정산 관리 페이지를 만들어줘.

요구사항:
- 페이지 헤더: 제목 + 총 정산 예정 금액 표시
- 탭 UI: 정산 예정(pending), 정산 완료(completed)
- 필터 UI: 날짜 범위 선택, 상태 선택
- SettlementTable 컴포넌트 렌더링
- 로딩 상태: 스켈레톤 UI
- 빈 상태: EmptyState 컴포넌트
- 에러 처리 및 토스트 알림

파일: app/wholesaler/settlements/page.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

- [ ] **`components/wholesaler/Settlements/SettlementTable.tsx` 구현**

  - [ ] 테이블 컬럼
    - [ ] 주문번호
    - [ ] 주문일
    - [ ] 정산 예정일
    - [ ] 주문 금액
    - [ ] 수수료 (플랫폼)
    - [ ] 정산 금액 (도매 몫, 강조)
    - [ ] 상태 (Badge)
    - [ ] 액션 (상세보기)
  - [ ] 정렬 기능
  - [ ] 페이지네이션
  - [ ] 총 정산 예정 금액 표시 (하단)

**커서 AI 프롬프트:**

```
정산 테이블 컴포넌트를 만들어줘.

요구사항:
- 테이블 컬럼: 주문번호, 주문일, 정산 예정일, 주문 금액, 수수료, 정산 금액(강조), 상태(뱃지), 액션(상세보기)
- 정렬 기능 (정산 예정일, 정산 금액)
- 페이지네이션
- 총 정산 예정 금액 표시 (하단)
- 상세보기 버튼 클릭 시 Dialog 모달 열기
- 반응형 디자인 (모바일에서는 카드형으로 전환)

파일: components/wholesaler/Settlements/SettlementTable.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

- [ ] **정산 상세 모달**
  - [ ] Dialog 컴포넌트 사용
  - [ ] 주문 정보
  - [ ] 정산 계산 내역 (자동 계산됨)
    - [ ] 주문 금액 (order_amount)
    - [ ] 수수료율 (5% 고정, platform_fee_rate)
    - [ ] 수수료 금액 (platform_fee)
    - [ ] 정산 금액 (wholesaler_amount = order_amount - platform_fee)
  - [ ] 정산 예정일 (scheduled_payout_at = paid_at + 7일)
  - [ ] 정산 완료일 (completed_at, 완료된 경우)
  - [ ] ⚠️ MVP에서는 조회만 가능 (자동 송금은 Phase 2)

### ✅ Week 7 완료 체크

- [ ] **필수 항목 확인**
  - [ ] ✅ 정산 데이터 생성 프로세스 확정됨 (결제 완료 시 자동)
  - [ ] ✅ platform_fee_rate: 5% 고정 (환경 변수)
  - [ ] ✅ scheduled_payout_at: D+7 확정
- [ ] 대시보드 통계 데이터 정확성 확인
- [ ] 실시간 업데이트 동작 확인
- [ ] 정산 계산 로직 검증
  - [ ] 수수료 5% 계산 확인
  - [ ] 정산 예정일 D+7 확인
  - [ ] wholesaler_amount = order_amount - platform_fee 확인
- [ ] 정산 예정/완료 데이터 표시 확인
- [ ] 코드 리뷰 및 리팩토링

---

## 📬 Week 7-8: 문의 관리 (선택 기능)

### 📬 문의 관리 기능

#### 0. 문의 구조 결정 (필수 - Week 1-2에 협의)

- [ ] **PM과 협의**
  - [ ] `inquiries` vs `cs_threads` 사용 결정
  - [ ] 문의 유형 구분 (소매→도매, 도매→관리자)
  - [ ] `user_id` 참조 확인 (`users` vs `profiles`)
  - [ ] RLS 정책 요청
  - [ ] 문의 유형 필드 추가 여부 결정

#### 1. Supabase 쿼리 함수

- [ ] **`lib/supabase/queries/inquiries.ts` 작성**
  - [ ] `getInquiries()` 함수 구현
    - [ ] 현재 도매점 관련 문의만 조회
    - [ ] 상태별 필터링 (open, answered, closed)
    - [ ] 날짜 범위 필터링
    - [ ] 페이지네이션
    - [ ] 정렬 (최신순)
  - [ ] `getInquiryById()` 함수 구현
    - [ ] 문의 상세 정보 조회
    - [ ] 문의자 정보는 익명 코드만 포함
  - [ ] `replyToInquiry()` 함수 구현
    - [ ] 답변 작성 (`admin_reply` 업데이트)
    - [ ] 상태 변경 (open → answered)
    - [ ] `replied_at` 기록
  - [ ] `getInquiryStats()` 함수 구현 (대시보드용)
    - [ ] 미답변 문의 카운트

**커서 AI 프롬프트:**

```
문의 조회 쿼리 함수를 만들어줘.

요구사항:
- getInquiries(): 현재 도매점 관련 문의만 조회
  - RLS 정책 활용
  - 상태별 필터링 (status: open, answered, closed)
  - 날짜 범위 필터링 (created_at)
  - 페이지네이션 (page, limit)
  - 정렬 (created_at DESC)
- getInquiryById(): 문의 상세 정보 조회
  - 문의자 정보는 익명 코드만 포함
- replyToInquiry(): 답변 작성
  - admin_reply 업데이트
  - status 변경 (open → answered)
  - replied_at 기록
- getInquiryStats(): 대시보드용 (미답변 문의 카운트)

파일: lib/supabase/queries/inquiries.ts

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

#### 2. 문의 목록 페이지

- [ ] **`app/wholesaler/inquiries/page.tsx` 구현**

  - [ ] 페이지 헤더 (제목 + "새 문의" 버튼 - 선택)
  - [ ] 탭 UI (미답변/답변완료/종료)
  - [ ] 필터 UI
    - [ ] 날짜 범위 선택 (DateRangePicker)
    - [ ] 상태 선택 (Select)
    - [ ] 검색 입력 필드 (제목, 내용)
  - [ ] 문의 테이블 컴포넌트 렌더링
  - [ ] 실시간 업데이트 (Realtime 구독)
  - [ ] 로딩 상태 (스켈레톤)
  - [ ] 빈 상태 (EmptyState)
  - [ ] 에러 처리

**커서 AI 프롬프트:**

```
문의 목록 페이지를 만들어줘.

요구사항:
- 페이지 헤더: 제목 + "새 문의" 버튼 (선택)
- 탭 UI: 미답변(open), 답변완료(answered), 종료(closed)
- 필터 UI: 날짜 범위, 상태 선택, 검색(제목/내용)
- InquiryTable 컴포넌트 렌더링
- Supabase Realtime 구독 (새 문의 알림)
- ⚠️ Realtime cleanup 함수 필수 포함
- 로딩 상태: 스켈레톤 UI
- 빈 상태: EmptyState 컴포넌트
- 에러 처리 및 토스트 알림

파일: app/wholesaler/inquiries/page.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

- [ ] **`components/wholesaler/Inquiries/InquiryTable.tsx` 구현**

  - [ ] TanStack Table 설정
  - [ ] 테이블 컬럼
    - [ ] 문의일 (created_at)
    - [ ] 제목 (title)
    - [ ] 문의자 (익명 코드만 표시)
    - [ ] 상태 (Badge: open/answered/closed)
    - [ ] 액션 (상세보기 버튼)
  - [ ] 정렬 기능
  - [ ] 페이지네이션
  - [ ] 클릭 시 상세 페이지로 이동

- [ ] **`components/wholesaler/Inquiries/InquiryFilter.tsx` 구현**
  - [ ] 날짜 범위 선택
  - [ ] 상태 필터
  - [ ] 검색 입력
  - [ ] 필터 초기화 버튼

#### 3. 문의 상세 및 답변

- [ ] **`app/wholesaler/inquiries/[id]/page.tsx` 구현**

  - [ ] 문의 ID로 데이터 조회
  - [ ] 페이지 헤더 (제목 + 상태 뱃지)
  - [ ] 문의 정보 섹션
    - [ ] 제목 (title)
    - [ ] 내용 (content)
    - [ ] 문의일 (created_at)
    - [ ] 문의자 (익명 코드만 표시)
    - [ ] ⚠️ 소매점 실명/연락처 절대 노출 금지
  - [ ] 답변 섹션
    - [ ] 기존 답변 표시 (있는 경우)
      - [ ] 답변 내용 (admin_reply)
      - [ ] 답변일 (replied_at)
    - [ ] 답변 작성 폼 (status가 'open'인 경우만)
      - [ ] Textarea 컴포넌트
      - [ ] 답변 제출 버튼
      - [ ] 유효성 검증 (최소 10자)
  - [ ] 상태 변경 기능
    - [ ] 답변 완료 시 'answered'로 변경
    - [ ] 종료 버튼 (선택)
  - [ ] 로딩 상태
  - [ ] 에러 처리
  - [ ] 성공 시 토스트 알림

**커서 AI 프롬프트:**

```
문의 상세 페이지를 만들어줘.

요구사항:
- 문의 ID로 데이터 조회 (Next.js 15: await params)
- 페이지 헤더: 제목 + 상태 뱃지
- 문의 정보: 제목, 내용, 문의일, 문의자(익명 코드만)
  - ⚠️ 소매점 실명/연락처 절대 노출 금지
- 답변 섹션:
  - 기존 답변 표시 (admin_reply, replied_at)
  - 답변 작성 폼 (status='open'인 경우만)
    - Textarea 컴포넌트
    - 유효성 검증 (최소 10자)
    - 답변 제출 버튼
- 상태 변경: 답변 완료 시 'answered'로 변경
- 로딩 상태 및 에러 처리
- 성공 시 토스트 알림

파일: app/wholesaler/inquiries/[id]/page.tsx

⚠️ 추가로 필요한 작업이나 수정사항이 있으면 사용자에게 먼저 질문해주세요.
```

- [ ] **`components/wholesaler/Inquiries/InquiryReplyForm.tsx` 구현**
  - [ ] react-hook-form 설정
  - [ ] Textarea 입력 필드
  - [ ] 유효성 검증 (zod)
  - [ ] 제출 처리
  - [ ] 로딩 상태

#### 4. 실시간 알림

- [ ] **Realtime 구독 설정**

  - [ ] `lib/supabase/realtime.ts`에 `subscribeToNewInquiries()` 추가
  - [ ] `inquiries` 테이블 INSERT 이벤트 구독
  - [ ] 현재 도매점 관련 문의만 필터링
  - [ ] ⚠️ Cleanup 함수 구현 (메모리 누수 방지)
  - [ ] 구독 해제 로그 추가 (디버깅용)

- [ ] **대시보드/헤더에 알림 추가**
  - [ ] 새 문의 도착 시 Toast 알림
  - [ ] 헤더에 알림 아이콘 (Bell)
  - [ ] 미답변 문의 카운트 표시
  - [ ] 알림 클릭 시 문의 목록으로 이동

#### 5. 보안 확인

- [ ] **RLS 정책 테스트**

  - [ ] 도매 A는 자신의 문의만 조회 가능
  - [ ] 도매 B의 문의는 조회 불가
  - [ ] 관리자는 모든 문의 조회 가능
  - [ ] 소매점 정보는 익명 코드만 표시

- [ ] **민감 정보 노출 방지**
  - [ ] 소매점 실명 미노출 확인
  - [ ] 소매점 연락처 미노출 확인
  - [ ] 소매점 이메일 미노출 확인
  - [ ] 익명 코드만 표시 확인

### ✅ 문의 관리 완료 체크

- [ ] 문의 목록 조회 테스트
- [ ] 문의 상세 조회 테스트
- [ ] 답변 작성 테스트
- [ ] 상태 변경 테스트
- [ ] 실시간 알림 동작 확인
- [ ] RLS 정책 테스트
- [ ] 민감 정보 노출 방지 확인
- [ ] Realtime cleanup 함수 확인
- [ ] 코드 리뷰 및 리팩토링

---

## 🧪 Week 8: 테스트 + 버그 수정 + 최적화

### 🧪 통합 테스트 (Day 1-2)

#### 1. 인증 및 온보딩 플로우 테스트

- [ ] **회원가입 플로우**

  - [ ] Clerk로 회원가입
  - [ ] 역할 선택 (도매 선택)
  - [ ] 사업자 정보 입력
  - [ ] 유효성 검증 동작 확인
  - [ ] 데이터베이스에 저장 확인
  - [ ] 승인 대기 페이지로 이동 확인

- [ ] **승인 프로세스**

  - [ ] 승인 대기 페이지 표시 확인
  - [ ] Realtime 구독 동작 확인
  - [ ] 관리자가 승인 시 자동 리다이렉트 확인
  - [ ] 관리자가 반려 시 사유 표시 및 재신청 가능 확인

- [ ] **로그인 플로우**
  - [ ] 로그인 후 역할 확인
  - [ ] 승인 전 계정: 승인 대기 페이지 리다이렉트 확인
  - [ ] 승인 완료 계정: 대시보드 접근 확인
  - [ ] 정지된 계정: 정지 페이지 리다이렉트 확인

#### 2. 상품 관리 테스트

- [ ] **상품 등록**

  - [ ] 폼 유효성 검증 동작 확인
  - [ ] 이미지 업로드 성공 확인
  - [ ] AI 상품명 표준화 동작 확인
  - [ ] 시세 참고 버튼 동작 확인
  - [ ] 데이터베이스에 저장 확인
  - [ ] 소매 페이지에서 상품 표시 확인

- [ ] **상품 수정**

  - [ ] 기존 데이터 불러오기 확인
  - [ ] 이미지 수정/삭제 확인
  - [ ] 수정 사항 저장 확인

- [ ] **상품 비활성화**
  - [ ] 활성화/비활성화 토글 확인
  - [ ] 비활성화된 상품은 소매 페이지에서 미노출 확인

#### 3. 주문 관리 테스트

- [ ] **주문 조회**

  - [ ] 주문 목록 표시 확인
  - [ ] 상태별 필터링 확인
  - [ ] 검색 기능 확인
  - [ ] 주문 상세 페이지 확인

- [ ] **주문 상태 변경**

  - [ ] pending → confirmed 변경 확인
  - [ ] confirmed → preparing 변경 확인
  - [ ] preparing → shipped 변경 확인
  - [ ] shipped → completed 변경 확인
  - [ ] 타임스탬프 기록 확인

- [ ] **실시간 알림**
  - [ ] 소매에서 주문 생성 시 도매에 알림 확인
  - [ ] 토스트 알림 표시 확인
  - [ ] 주문 카운트 실시간 업데이트 확인

#### 4. 정산 관리 테스트

- [ ] 정산 계산 로직 확인 (수수료율 5% 기준)
- [ ] 정산 예정/완료 데이터 표시 확인
- [ ] 정산 상세 모달 동작 확인

#### 5. 보안 테스트

- [ ] **RLS 정책 테스트**

  - [ ] 도매 A 계정으로 로그인
  - [ ] 도매 B의 상품 조회 시도 (실패해야 함)
  - [ ] 도매 B의 주문 조회 시도 (실패해야 함)
  - [ ] 자신의 데이터만 조회 가능 확인

- [ ] **민감 정보 노출 방지**

  - [ ] 소매 페이지에서 도매 실명 미노출 확인
  - [ ] 소매 페이지에서 도매 연락처 미노출 확인
  - [ ] 익명 코드만 표시 확인

- [ ] **인증 확인**
  - [ ] 로그아웃 상태에서 도매 페이지 접근 시 로그인 페이지로 리다이렉트 확인
  - [ ] 역할이 소매인 계정으로 도매 페이지 접근 시 차단 확인

#### 6. 반응형 디자인 테스트 (필수)

- [ ] **⚠️ 모바일 레이아웃 (375px ~ 640px)**

  - [ ] 사이드바가 햄버거 메뉴로 전환
  - [ ] 테이블이 가로 스크롤 또는 카드형으로 전환
  - [ ] 폼 입력 필드가 세로로 배치
  - [ ] 버튼 크기 터치 친화적
  - [ ] 이미지가 모바일에 맞게 리사이징

- [ ] **태블릿 레이아웃 (768px ~ 1024px)**

  - [ ] 사이드바 표시 (축소 가능)
  - [ ] 2열 그리드 레이아웃
  - [ ] 테이블 가로 스크롤

- [ ] **데스크톱 레이아웃 (1280px 이상)**

  - [ ] 전체 레이아웃 정상 표시
  - [ ] 사이드바 고정
  - [ ] 3-4열 그리드 가능

- [ ] **브레이크포인트 확인**

  - [ ] sm: 640px
  - [ ] md: 768px
  - [ ] lg: 1024px
  - [ ] xl: 1280px
  - [ ] 2xl: 1536px

- [ ] **실제 디바이스 테스트 (권장)**
  - [ ] iPhone (Safari)
  - [ ] Android (Chrome)
  - [ ] iPad (Safari)

#### 7. Realtime 메모리 누수 테스트

- [ ] **메모리 누수 확인**
  - [ ] Chrome DevTools > Performance > Memory
  - [ ] 페이지 이동 후 구독 해제 확인
  - [ ] 콘솔에서 cleanup 로그 확인
  - [ ] 장시간 사용 시 메모리 사용량 모니터링

### 🚀 성능 최적화 (Day 3-4)

#### 1. 이미지 최적화

- [ ] **Next.js Image 컴포넌트 사용**

  - [ ] 모든 `<img>` 태그를 `<Image>`로 변경
  - [ ] width, height 속성 추가
  - [ ] `priority` 속성 설정 (중요 이미지)
  - [ ] `loading="lazy"` 설정 (하단 이미지)

- [ ] **이미지 크기 최적화**
  - [ ] 업로드 전 이미지 리사이징 (클라이언트 측)
  - [ ] WebP 포맷 변환 고려
  - [ ] 썸네일 생성 (목록용)

#### 2. 로딩 속도 개선

- [ ] **서버 컴포넌트 활용**

  - [ ] 가능한 컴포넌트를 서버 컴포넌트로 변경
  - [ ] 'use client' 최소화

- [ ] **코드 스플리팅**

  - [ ] 동적 import 사용 (무거운 컴포넌트)
  - [ ] Route-based 코드 스플리팅 확인

- [ ] **데이터 페칭 최적화**
  - [ ] 불필요한 컬럼 제외 (SELECT \*)
  - [ ] 필요한 데이터만 조회
  - [ ] 페이지네이션 적용
  - [ ] 캐싱 전략 적용 (공공 API 등)

#### 3. 에러 핸들링 보완

- [ ] **에러 바운더리 추가**

  - [ ] `app/error.tsx` 구현
  - [ ] `app/wholesaler/error.tsx` 구현
  - [ ] 에러 페이지 UI 개선

- [ ] **로딩 상태 개선**

  - [ ] `app/loading.tsx` 구현
  - [ ] 스켈레톤 UI 추가
  - [ ] 로딩 인디케이터 개선

- [ ] **사용자 친화적 에러 메시지**
  - [ ] 기술적 에러 메시지를 사용자 친화적 메시지로 변환
  - [ ] 재시도 버튼 추가
  - [ ] 에러 로깅 (Sentry 등 고려)

#### 4. 접근성 개선

- [ ] **키보드 네비게이션**

  - [ ] Tab 키로 모든 인터랙티브 요소 접근 가능 확인
  - [ ] Focus 스타일 추가

- [ ] **ARIA 속성 추가**
  - [ ] `aria-label` 추가 (아이콘 버튼)
  - [ ] `aria-describedby` 추가 (폼 필드)
  - [ ] `role` 속성 추가 (커스텀 컴포넌트)

### 📝 문서화 (Day 5)

#### 1. README 작성

- [ ] **프로젝트 소개**

  - [ ] 프로젝트 개요
  - [ ] 주요 기능
  - [ ] 기술 스택

- [ ] **설치 및 실행 방법**

  - [ ] 환경 변수 설정
  - [ ] 의존성 설치
  - [ ] 개발 서버 실행
  - [ ] 빌드 방법

- [ ] **폴더 구조 설명**
  - [ ] 주요 디렉토리 설명
  - [ ] 파일 명명 규칙

#### 2. 코드 주석 추가

- [ ] **중요 함수에 JSDoc 주석 추가**

  - [ ] 함수 설명
  - [ ] 매개변수 설명
  - [ ] 반환값 설명
  - [ ] 예시 코드

- [ ] **복잡한 로직에 설명 주석 추가**
  - [ ] 정산 계산 로직
  - [ ] RLS 정책 관련 쿼리
  - [ ] Realtime 구독 로직

#### 3. 배포 가이드 작성

- [ ] **Vercel 배포 가이드**

  - [ ] 프로젝트 연결
  - [ ] 환경 변수 설정
  - [ ] 빌드 설정
  - [ ] 배포 확인

- [ ] **도메인 설정**
  - [ ] 커스텀 도메인 연결
  - [ ] HTTPS 설정

### ✅ Week 8 최종 체크리스트

- [ ] **기능 완성도**

  - [ ] 모든 MVP 기능 동작 확인
  - [ ] 인증 및 온보딩 플로우 완성
  - [ ] 상품 관리 (CRUD) 완성
  - [ ] AI 상품명 표준화 기능 완성
  - [ ] 실시간 시세 조회 기능 완성
  - [ ] 주문 관리 완성
  - [ ] 실시간 알림 완성
  - [ ] 대시보드 완성
  - [ ] 정산 관리 완성

- [ ] **보안**

  - [ ] RLS 정책 테스트 완료
  - [ ] 민감 정보 노출 방지 확인
  - [ ] 인증 확인 로직 완성

- [ ] **성능**

  - [ ] 로딩 속도 3초 이내 확인
  - [ ] 이미지 최적화 완료
  - [ ] 코드 스플리팅 적용

- [ ] **반응형 디자인 (필수)**

  - [ ] ⚠️ 모바일 레이아웃 테스트 완료
  - [ ] ⚠️ 태블릿 레이아웃 테스트 완료
  - [ ] ⚠️ 데스크톱 레이아웃 테스트 완료
  - [ ] ⚠️ 실제 디바이스 테스트 (iPhone, Android)

- [ ] **메모리 관리**

  - [ ] ⚠️ Realtime cleanup 함수 전체 확인
  - [ ] ⚠️ 메모리 누수 테스트 완료

- [ ] **문서화**

  - [ ] README 작성 완료
  - [ ] 주요 함수 주석 추가
  - [ ] 배포 가이드 작성

- [ ] **배포 준비**
  - [ ] 환경 변수 확인
  - [ ] 빌드 에러 없음
  - [ ] 프로덕션 모드 테스트

---

## 📚 참고 자료 및 리소스

### API 키 발급

- [ ] **Clerk**: https://clerk.com → Dashboard → API Keys
- [ ] **Supabase**: https://supabase.com → Project Settings → API
- [ ] **Gemini API**: https://aistudio.google.com → Get API Key
- [ ] **공공데이터포털**: https://www.data.go.kr → 회원가입 → 활용신청

### 공식 문서

- [ ] [Next.js Docs](https://nextjs.org/docs)
- [ ] [Supabase Docs](https://supabase.com/docs)
- [ ] [Clerk Docs](https://clerk.com/docs)
- [ ] [shadcn/ui](https://ui.shadcn.com)
- [ ] [React Hook Form](https://react-hook-form.com)
- [ ] [Zod](https://zod.dev)
- [ ] [Google Gemini API](https://ai.google.dev/docs)
- [ ] [공공데이터포털 API](https://www.data.go.kr)

### 디자인 레퍼런스

- [ ] [shadcn/ui Examples](https://ui.shadcn.com/examples/dashboard)
- [ ] [Linear](https://linear.app)
- [ ] [Stripe Dashboard](https://dashboard.stripe.com)
- [ ] [Vercel Dashboard](https://vercel.com/dashboard)

---

## 🎯 개발 팁

### ⚠️ 반드시 확인할 사항 (개발 시작 전)

- [ ] **Week 1에 반드시 확인**

  - [ ] profiles 테이블 구조 PM과 확정
  - [ ] Anonymous Code 자동 생성 방법 결정
  - [ ] Supabase Storage RLS 정책 설정 확인
  - [ ] 모든 환경 변수 설정 완료

- [ ] **각 주차 시작 전 확인**
  - [ ] Week 3: Gemini API 키 발급 및 Rate Limit 이해
  - [ ] Week 4: 공공데이터 API 키 발급 및 캐싱 계획
  - [ ] Week 5: Realtime cleanup 패턴 숙지
  - [ ] Week 7: PM과 정산 프로세스 확정

### 커서 AI 활용

- [ ] 구체적인 요구사항을 명시하여 프롬프트 작성
- [ ] 파일 경로를 명확히 지정
- [ ] 한 번에 작은 단위로 개발
- [ ] 막히면 30분 이내에 질문

### Git 커밋

- [ ] 작은 단위로 자주 커밋
- [ ] 의미 있는 커밋 메시지 작성
- [ ] feat, fix, docs, style, refactor 등 prefix 사용

### 팀 협업

- [ ] 주간 회의 참석 (월요일, 금요일)
- [ ] 진행 상황 공유
- [ ] 막히는 부분 질문
- [ ] 디자이너/소매 개발자와 소통

### 휴식

- [ ] 50분 작업 → 10분 휴식
- [ ] 하루 8시간 이상 작업 지양
- [ ] 주말 휴식 필수

---

## 🏁 완료!

이 TODO 리스트를 하나씩 체크하면서 진행하세요.  
완벽하지 않아도 괜찮습니다. 배우는 과정을 즐기세요! 💪🎉
