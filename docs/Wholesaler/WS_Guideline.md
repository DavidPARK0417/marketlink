# 🏪 도매 페이지 개발 가이드라인

> **프로젝트명**: AI 기반 B2B 도매-소매 중개 플랫폼  
> **담당**: 도매 페이지 개발  
> **개발 기간**: 8주  
> **개발 방식**: 커서 AI 바이브 코딩  
> **대상**: 초보 개발자  
> **최종 업데이트**: 2025-11-20 (PRD.md, SQL2.sql 기준)

---

## ⚠️ 주요 변경사항 (2025-11-20)

이 문서는 최신 PRD.md와 SQL2.sql을 기반으로 업데이트되었습니다.

### 🔴 중요한 구조 변경

1. **주문 구조 변경 (필수 확인!)**

   - ❌ `order_items` 테이블 **제거됨**
   - ✅ `orders` 테이블에 `product_id`, `variant_id` 직접 포함
   - ✅ 1개 주문(order) = 1개 상품
   - ✅ 장바구니 → 여러 주문 생성 방식

2. **wholesalers 테이블 필드명 변경**

   - `contact_name` → `representative` (대표자명)
   - `contact_phone` → `phone` (연락처)
   - `contact_email` → 제거 (profiles.email 사용)
   - `region_sido`, `region_sigungu` → 제거 (address로 통합)

3. **익명 코드 형식**

   - "V-001" → "VENDOR-001"

4. **정산 프로세스 확정**
   - 생성 시점: 결제 완료(paid_at) 직후 자동 생성
   - 수수료율: 5% (환경 변수: `NEXT_PUBLIC_PLATFORM_FEE_RATE`)
   - 정산 예정일: D+7 (결제일 + 7일)
   - MVP 범위: 정산 계산 및 조회만 (자동 송금은 Phase 2)

### 📋 추가 내용

- LLM API 환경 변수 추가 (CS 봇용)
- 주문 구조 상세 설명 추가 (7.5.0)
- 배치 표준화 함수 (선택 기능) 명시

---

## 📋 목차

1. [개요](#1-개요)
2. [팀 구조 및 협업](#2-팀-구조-및-협업)
3. [기술 스택](#3-기술-스택)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [데이터베이스 설계](#5-데이터베이스-설계)
6. [8주 개발 로드맵](#6-8주-개발-로드맵)
7. [페이지별 구현 가이드](#7-페이지별-구현-가이드)
8. [커서 AI 활용 가이드](#8-커서-ai-활용-가이드)
9. [디자이너 협업 가이드](#9-디자이너-협업-가이드)
10. [보안 및 주의사항](#10-보안-및-주의사항)
11. [트러블슈팅](#11-트러블슈팅)
12. [체크리스트](#12-체크리스트)

---

## 1. 개요

### 1.1 도매 페이지란?

도매 사업자 전용 플랫폼입니다. 소매점에 판매할 상품을 등록하고, 들어온 주문을 처리하며, 정산을 관리하는 시스템입니다.

**⚠️ 프로젝트 분리 구조:**

- **메인 랜딩 페이지**: 별도 도메인(`www.marketlink.com`)에서 관리
- **도매 프로젝트**: 이 프로젝트 (`wholesale.marketlink.com`) - 순수 도매 기능만
- **소매 프로젝트**: 별도 도메인/프로젝트 (`retail.marketlink.com`) - 팀원 담당
- **Supabase DB**: 통합 사용 (3개 프로젝트 공유)

### 1.2 핵심 기능 (MVP)

- ✅ **회원가입/인증**: 사업자 정보 입력, 관리자 승인 대기 (⚠️ 역할 선택 단계 없음 - 도매 전용)
- ✅ **대시보드**: 오늘의 주문, 출고 예정, 정산 요약 보기
- ✅ **상품 관리**: 상품 등록/수정/비활성화
- ✅ **AI 상품명 표준화**: Gemini 2.5 Flash로 상품명 자동 표준화 및 카테고리 추천
- ✅ **시세 조회**: 공공 API 연동 실시간 농수산물 경매가격 조회
- ✅ **주문 관리**: 주문 확인 및 상태 변경 (접수 → 출고 → 완료)
- ✅ **정산 관리**: 정산 예정/완료 내역 조회
- ✅ **실시간 알림**: 새 주문 알림, 승인 상태 변경 알림

### 1.3 핵심 원칙

⚠️ **절대 원칙**: 도매 업체의 민감 정보(상호명, 연락처, 사업자번호, 계좌정보)는 소매 페이지에 **절대 노출 금지**

---

## 2. 팀 구조 및 협업

### 2.1 팀 구성

| 역할        | 인원       | 담당 업무                               |
| ----------- | ---------- | --------------------------------------- |
| PM          | 1명        | 전체 기획, DB 초기 세팅, 일정 관리      |
| 도매 개발자 | 1명 (본인) | 도매 페이지 + 관리자 페이지 개발        |
| 소매 개발자 | 1명        | 소매 페이지 개발 (별도 도메인/프로젝트) |
| 디자이너    | 1명        | UI/UX 디자인 (피그마)                   |
| 마케팅      | 1명        | 콘텐츠, 홍보                            |

**⚠️ 프로젝트 분리 구조:**

- 도매 프로젝트와 소매 프로젝트는 **별도 코드베이스**
- **Supabase DB만 공유** (테이블 구조 협의 필요)
- 각자 독립적으로 배포 및 개발

### 2.2 협업이 필요한 시점

#### 🔹 Week 1: PM과 협업

- **DB 스키마 확정**: 테이블 구조, 컬럼, RLS 정책
- **개발 환경 확인**: Supabase, Clerk 키 확인

#### 🔹 Week 1-2: 소매 개발자와 협업

**⚠️ 중요: 프로젝트가 분리되어 있으므로, Supabase DB 테이블 구조에 대해서만 협의합니다.**

- **데이터 구조 합의**:
  - `products` 테이블 구조 (상품명, 가격, 카테고리 등)
  - `orders` 상태 플로우 (pending → confirmed → shipped → completed)
  - 카테고리 목록 (공통으로 사용)
  - 지역 코드 (시/도, 시/군/구)
  - **Supabase DB는 공유, 코드베이스는 별도**

#### 🔹 Week 2-8: 디자이너와 협업

- **Week 2**: 대시보드 디자인
- **Week 3-4**: 상품 관리 디자인
- **Week 5-6**: 주문 관리 디자인
- **Week 7**: 정산 페이지 디자인

### 2.3 주간 회의

- **월요일 아침**: 주간 목표 설정
- **금요일 오후**: 진행 상황 공유 및 다음 주 계획

---

## 3. 기술 스택

### 3.1 기본 스택 (이미 세팅됨)

```
Frontend: Next.js 15 + React + TypeScript
인증: Clerk
DB/Backend: Supabase (PostgreSQL + RLS)
스타일: Tailwind CSS
```

### 3.2 추가 설치할 라이브러리

```bash
# UI 컴포넌트 (shadcn/ui)
npx shadcn@latest init
npx shadcn@latest add button input card table badge dialog tabs toast dropdown-menu select form

# 폼 관리
pnpm add react-hook-form zod @hookform/resolvers

# 날짜 처리
pnpm add date-fns

# 테이블
pnpm add @tanstack/react-table

# 차트 (시세 조회용)
pnpm add recharts

# 아이콘
pnpm add lucide-react
```

### 3.3 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Clerk (인증)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (데이터베이스)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...

# Google Gemini API (AI 상품명 표준화)
GEMINI_API_KEY=AIza...

# 공공데이터포털 API (시세 조회)
NEXT_PUBLIC_MARKET_API_KEY=your_service_key_here

# LLM for CS Bot (5순위)
LLM_API_KEY=sk-... or AIza...
LLM_PROVIDER=openai  # or 'gemini'

# 기타
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PLATFORM_FEE_RATE=0.05  # 5% 플랫폼 수수료
```

**API 키 발급 방법:**

1. **Clerk**: https://clerk.com → Dashboard → API Keys
2. **Supabase**: https://supabase.com → Project Settings → API
3. **Gemini API**: https://aistudio.google.com → Get API Key
4. **공공데이터포털**: https://www.data.go.kr → 회원가입 → 활용신청

---

## 4. 프로젝트 구조

### 4.1 도매 전용 프로젝트 구조

> **⚠️ 중요 변경사항**:
>
> - 소매 페이지는 **별도 프로젝트/도메인**에서 관리
> - 이 프로젝트는 **도매 + 관리자 기능만** 포함
> - 메인 랜딩 페이지도 **별도 도메인**
> - **역할 선택 페이지 제거됨**

#### 📁 도매 프로젝트 구조

```
app/
├── (auth)/                      # 인증 관련 (도매 전용)
│   ├── sign-in/
│   │   ├── [[...rest]]/         # Clerk 인증 엔진 (필수!)
│   │   └── wholesaler/          # 🚪 도매 로그인 (외부 진입점)
│   ├── sign-up/[[...rest]]/     # 회원가입
│   ├── wholesaler-onboarding/   # 도매 사업자 정보 입력
│   └── pending-approval/        # 승인 대기
│
├── wholesaler/                  # 🏭 도매 페이지 (메인 작업 영역)
│   ├── layout.tsx               # 도매 전용 레이아웃
│   ├── suspended/               # 계정 정지 페이지
│   ├── dashboard/               # 대시보드
│   ├── products/                # 상품 관리
│   │   ├── page.tsx             # 상품 목록
│   │   ├── new/                 # 상품 등록 (AI 표준화, 시세 조회)
│   │   └── [id]/edit/           # 상품 수정
│   ├── market-prices/           # 시세 조회
│   ├── orders/                  # 주문 관리
│   │   ├── page.tsx             # 주문 목록
│   │   └── [id]/                # 주문 상세
│   ├── settlements/             # 정산 관리
│   └── inquiries/               # 문의 관리 (선택)
│
├── admin/                       # 👨‍💼 관리자 페이지 (도매 개발자 담당)
│   ├── layout.tsx
│   ├── dashboard/
│   ├── wholesalers/             # 도매 승인/관리
│   ├── users/                   # 계정 관리
│   ├── cs/                      # CS 티켓 (5순위)
│   └── audit-logs/              # 감사 로그 (6순위)
│
├── layout.tsx                   # 루트 레이아웃
├── page.tsx                     # 루트 → /sign-in/wholesaler 리다이렉트
└── globals.css

❌ **제거된 부분** (별도 프로젝트로 분리):
- `app/retailer/` - 소매 페이지 전체
- `app/(auth)/role-selection/` - 역할 선택 페이지
- `app/(auth)/retailer-onboarding/` - 소매 온보딩
- `app/(auth)/sign-in/retailer/` - 소매 로그인
- `components/retailer/` - 소매 컴포넌트
- `stores/cart-store.ts` - 소매 장바구니 스토어

components/
├── ui/                          # shadcn/ui 컴포넌트 (공통)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── ...
│
├── common/                      # 전체 공통 컴포넌트
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   └── PageHeader.tsx
│
├── admin/                       # 관리자 전용 컴포넌트
│   ├── AdminSidebar.tsx
│   ├── WholesalerApprovalForm.tsx
│   └── WholesalerTableRow.tsx
│
├── auth/                        # 인증 관련 컴포넌트
│   └── sign-in-with-redirect.tsx
│
├── providers/                   # React Context 프로바이더
│   ├── query-provider.tsx
│   └── sync-user-provider.tsx
│
├── Navbar.tsx                   # 글로벌 네비게이션 바
│
└── wholesaler/                  # 도매 전용 컴포넌트 (🎯 메인 작업 영역)
    ├── Layout/
    │   ├── Sidebar.tsx          # 사이드바
    │   └── Header.tsx           # 헤더
    ├── Dashboard/               # 대시보드 컴포넌트
    │   ├── StatCard.tsx         # 통계 카드
    │   └── RecentOrders.tsx     # 최근 주문
    ├── Products/
    │   ├── ProductForm.tsx      # 상품 등록/수정 폼
    │   ├── ProductTable.tsx     # 상품 테이블
    │   └── ProductTableSkeleton.tsx
    ├── MarketPrices/            # 시세 조회 컴포넌트
    │   ├── PriceTable.tsx       # 시세 테이블
    │   ├── PriceTrendChart.tsx  # 시세 차트
    │   └── PriceFilter.tsx      # 시세 검색 필터
    ├── Orders/
    │   ├── OrderTable.tsx       # 주문 테이블
    │   ├── OrderDateRangePicker.tsx
    │   └── OrderStatusBadge.tsx # 주문 상태 뱃지
    └── Settlements/             # 정산 컴포넌트

❌ **제거된 부분**:
- `components/shared/` - 소매/도매 공통 (별도 프로젝트로 분리)
- `components/retailer/` - 소매 전용 컴포넌트
- `components/role-selection-header.tsx` - 역할 선택 헤더

lib/
├── supabase/
│   ├── clerk-client.ts           # Client Component용 (Clerk 인증)
│   ├── client.ts                 # 공개 데이터용 (anon key)
│   ├── server.ts                 # Server Component용
│   ├── service-role.ts           # 관리자 권한 작업용
│   ├── storage.ts                # Storage 업로드 함수
│   ├── realtime.ts               # 실시간 구독
│   └── queries/                  # 쿼리 함수들
│       ├── products.ts           # 상품 쿼리 (도매 전용)
│       └── orders.ts             # 주문 쿼리 (도매 전용)
│
├── clerk/
│   └── auth.ts                   # 인증 유틸리티
│
├── api/
│   ├── ai-standardize.ts         # AI 상품명 표준화 (Gemini)
│   └── market-prices.ts          # 농수산물 시세 API
│
├── validation/
│   ├── product.ts                # 상품 유효성 검증
│   └── wholesaler.ts             # 도매 사업자 정보 유효성 검증
│
├── gemini.ts                     # Gemini AI 클라이언트
├── market-api.ts                 # 시장 가격 API
└── utils/
    ├── format.ts                 # 포맷 유틸 (날짜, 금액)
    ├── constants.ts              # 상수 (은행 목록, 지역 목록, 주문 상태)
    └── cart-validation.ts        # 장바구니 유효성 검사

types/
├── database.ts                   # Supabase 타입 정의
├── product.ts                    # 상품 타입
├── order.ts                      # 주문 타입
├── cart.ts                       # 장바구니 타입
├── inquiry.ts                    # 문의 타입
├── wholesaler.ts                 # 도매점 타입
└── settlement.ts                 # 정산 타입

hooks/
├── use-sync-user.ts              # Clerk → Supabase 사용자 동기화

❌ **제거된 부분**:
- `lib/validation/retailer.ts` - 소매 유효성 검증
- `lib/supabase/queries/retailer-products.ts` - 소매 상품 쿼리
- `stores/cart-store.ts` - 소매 장바구니 스토어
```

#### 🎯 도매 담당자가 할 작업

**✅ 현재 상태 (이미 구현됨)**

프로젝트가 도매 전용으로 정리되었으므로, 기본 구조는 이미 갖춰져 있습니다:

1. **app 폴더**: 도매 + 관리자 페이지만 포함
2. **components/**: 도매, 관리자, 공통 컴포넌트만 포함
3. **lib/**: 도매 전용 유틸리티 함수
4. **types/**: 도매 관련 타입 정의

**⚠️ 주의사항**

- **소매 관련 파일 제거 완료**: `app/retailer/`, `components/retailer/` 등
- **역할 선택 페이지 제거**: 도매 전용이므로 불필요
- **루트 페이지 리다이렉트**: `/` → `/sign-in/wholesaler`
- **진입점**: 외부 메인 랜딩 페이지에서 링크로 접근

**📝 앞으로 추가할 것**

- 각 기능별 페이지 및 컴포넌트 구현
- 타입 정의 보완
- 비즈니스 로직 함수
- 테스트 코드

#### 🤝 팀 협업 가이드 (별도 프로젝트 환경)

**⚠️ 프로젝트 분리 구조:**

- 도매 프로젝트와 소매 프로젝트는 **별도 코드베이스**
- **Supabase DB만 공유** (테이블 구조 협의 필요)

**DB 테이블 구조 협의 필요 (소매 개발자와)**

프로젝트가 분리되어 있어도 DB는 공유하므로, 다음 테이블 구조는 소매 개발자와 합의 필요:

1. **`products` 테이블**: 상품 정보
   - 컬럼 추가/수정 시 소매 팀에 영향
   - 예: 새 필드 추가, 타입 변경
2. **`orders` 테이블**: 주문 정보

   - 상태 플로우 변경 시 협의 필요
   - 예: 새 상태 추가, 필드 변경

3. **`wholesalers` 테이블**: 도매점 정보

   - `anonymous_code` 형식 변경 시 소매 팀에 영향
   - 예: "VENDOR-001" → 다른 형식

4. **공통 타입**: `types/product.ts`, `types/order.ts`, `types/database.ts`
   - DB 구조 변경 시 양쪽 프로젝트 타입 정의 동기화 필요

**도매 전용 영역 (자유롭게 작업 가능)**

- `app/wholesaler/` - 모든 도매 페이지
- `app/admin/` - 모든 관리자 페이지
- `components/wholesaler/` - 도매 컴포넌트
- `components/admin/` - 관리자 컴포넌트
- `lib/validation/wholesaler.ts` - 도매 유효성 검증
- `types/wholesaler.ts`, `types/settlement.ts` - 도매 전용 타입

### 4.2 프로젝트 정리 완료 ✅

**✅ 소매 관련 파일 제거 완료:**

이미 다음 파일/폴더들이 정리되었습니다:

```
제거된 항목:
- app/retailer/                           ← 소매 페이지
- app/(auth)/sign-in/retailer/           ← 소매 로그인
- app/(auth)/retailer-onboarding/        ← 소매 온보딩
- app/(auth)/role-selection/             ← 역할 선택 페이지
- components/retailer/                    ← 소매 컴포넌트
- components/role-selection-header.tsx   ← 역할 선택 헤더
- actions/retailer/                       ← 소매 액션
- types/소매만/                           ← 소매 Figma 데이터
- lib/validation/retailer.ts             ← 소매 유효성 검사
- lib/supabase/queries/retailer-products.ts
- stores/cart-store.ts                    ← 소매 장바구니 스토어
```

**✅ 수정된 파일:**

```
- app/page.tsx → 도매 로그인으로 리다이렉트
- components/Navbar.tsx → 로고 클릭 핸들러 수정
- app/layout.tsx → 도매 전용 메타데이터
- lib/clerk/auth.ts → role-selection 참조 제거
```

#### 📝 현재 프로젝트 구조

도매 + 관리자 기능만 포함된 깔끔한 구조로 정리되었습니다:

- ✅ 진입점: `/` → `/sign-in/wholesaler` (자동 리다이렉트)
- ✅ 도매 전용 페이지 및 컴포넌트만 유지
- ✅ 관리자 페이지 포함
- ✅ 빌드 성공 확인 완료

---

## 5. 데이터베이스 설계

### 5.1 핵심 테이블

#### 📦 `wholesalers` - 도매점 정보

```sql
CREATE TABLE wholesalers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,            -- 사업자명 (암호화)
  business_number TEXT UNIQUE NOT NULL,   -- 사업자번호 (암호화)
  representative TEXT NOT NULL,           -- 대표자명 (암호화)
  phone TEXT NOT NULL,                    -- 연락처 (암호화)
  address TEXT NOT NULL,                  -- 주소
  bank_account TEXT NOT NULL,             -- 계좌번호 (암호화)
  anonymous_code TEXT UNIQUE NOT NULL,    -- 소매에 노출용 (예: "VENDOR-001")
  status TEXT DEFAULT 'pending',          -- pending/approved/rejected/suspended
  rejection_reason TEXT,                  -- 반려 사유 (status가 rejected일 때)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);
```

**컬럼 설명:**

- `user_id`: profiles 테이블 참조 (UUID)
- `representative`: 대표자명 (contact_name에서 변경됨)
- `phone`: 연락처 (contact_phone에서 변경됨)
- `address`: 사업장 주소
- `bank_account`: 계좌번호 (은행명 포함하여 저장)
- `status`: 관리자 승인 상태
  - `pending`: 승인 대기
  - `approved`: 승인 완료
  - `rejected`: 승인 반려
  - `suspended`: 계정 정지
- `rejection_reason`: 관리자가 승인을 반려한 경우 사유 입력
- `anonymous_code`: 소매 페이지에 표시될 익명 코드 (예: "VENDOR-001", 서버에서 자동 생성)
- `approved_at`: 승인 완료 시간

⚠️ **중요**: 이메일은 profiles 테이블의 email 필드를 사용합니다.

#### 📦 `products` - 상품

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_id UUID NOT NULL REFERENCES wholesalers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                     -- 상품명
  category TEXT NOT NULL,                 -- 카테고리
  description TEXT,                       -- 상품 설명
  price NUMERIC(10, 2) NOT NULL,          -- 가격
  moq INTEGER DEFAULT 1,                  -- 최소주문수량 (Minimum Order Quantity)
  stock INTEGER DEFAULT 0,                -- 재고
  unit TEXT DEFAULT 'ea',                 -- 단위 (ea, kg, box 등)
  delivery_fee NUMERIC(10, 2) DEFAULT 0,  -- 배송비
  delivery_method TEXT DEFAULT 'courier', -- 배송 방법 (courier: 택배, direct: 직배송, quick: 퀵서비스, freight: 화물, pickup: 픽업)
  lead_time TEXT,                         -- 납기 (예: "익일배송", "2-3일")
  images TEXT[],                          -- 이미지 URL 배열
  specifications JSONB,                   -- 규격 정보 (무게, 크기, 원산지 등)
  is_active BOOLEAN DEFAULT true,         -- 활성화 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**specifications 예시:**

```json
{
  "weight": "1kg",
  "size": "10cm x 10cm",
  "origin": "국내산",
  "storage": "냉장보관"
}
```

#### 📦 `orders` - 주문

⚠️ **중요 구조 변경**:

- **order_items 테이블 없음**
- 1개 주문(order) = 1개 상품
- 장바구니에서 여러 상품 주문 시 → 도매별로 별도 주문 생성

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,      -- 주문번호 (예: ORD-20250118-001)
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE RESTRICT,
  wholesaler_id UUID NOT NULL REFERENCES wholesalers(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,              -- 수량
  unit_price INTEGER NOT NULL,            -- 주문 당시 단가
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,          -- unit_price * quantity + shipping_fee
  delivery_address TEXT NOT NULL,         -- 배송지 정보
  request_note TEXT,                      -- 배송 요청사항
  status TEXT DEFAULT 'pending',          -- 주문 상태
  payment_method TEXT,                    -- 'card', 'transfer' 등
  payment_key TEXT,                       -- TossPayments 결제 키
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**주문 상태 플로우:**

```
pending (신규주문)
  ↓
confirmed (접수확인) - 도매가 확인
  ↓
shipped (출고완료) - 도매가 출고 처리
  ↓
completed (배송완료) - 자동 또는 수동
  ↓
cancelled (취소)
```

**장바구니 → 주문 변환 예시:**

```
장바구니:
- 도매A 사과 (1kg 옵션) x 2개
- 도매A 배 (5kg 옵션) x 1개
- 도매B 포도 (기본) x 3개

→ 주문 생성:
- ORD-001: 도매A, 사과 1kg, 수량 2
- ORD-002: 도매A, 배 5kg, 수량 1
- ORD-003: 도매B, 포도, 수량 3
```

#### 📦 `settlements` - 정산

```sql
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  wholesaler_id UUID NOT NULL REFERENCES wholesalers(id) ON DELETE RESTRICT,
  order_amount INTEGER NOT NULL,              -- 주문 총액
  platform_fee_rate DECIMAL(5, 4) NOT NULL,   -- 수수료율 (예: 0.0500 = 5%)
  platform_fee INTEGER NOT NULL,              -- 수수료 금액
  wholesaler_amount INTEGER NOT NULL,         -- 도매 정산액
  status TEXT DEFAULT 'pending',              -- 정산 상태 (pending/completed)
  scheduled_payout_at TIMESTAMPTZ NOT NULL,   -- 정산 예정일 (D+7)
  completed_at TIMESTAMPTZ,                   -- 정산 완료일
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**정산 계산 (자동):**

```typescript
const orderAmount = order.total_amount;
const platformFeeRate = 0.05; // 5% (환경 변수에서 가져옴)
const platformFee = Math.floor(orderAmount * platformFeeRate);
const wholesalerAmount = orderAmount - platformFee;
const scheduledPayoutAt = new Date(order.paid_at);
scheduledPayoutAt.setDate(scheduledPayoutAt.getDate() + 7); // D+7
```

**예시:**

- 주문 금액: 100,000원
- 수수료율: 5% (0.05)
- 플랫폼 수수료: 5,000원 (100,000 × 0.05)
- 도매 정산액: 95,000원 (100,000 - 5,000)
- 정산 예정일: 주문일 + 7일

⚠️ **MVP 범위**: 정산 계산 및 조회만. 자동 송금은 Phase 2

### 5.2 RLS (Row Level Security) 정책

**중요**: 도매는 자신의 데이터만 볼 수 있어야 합니다!

```sql
-- 도매는 자신의 상품만 조회/수정
CREATE POLICY "products_select_own" ON products
FOR SELECT USING (
  wholesaler_id IN (
    SELECT id FROM wholesalers WHERE user_id = auth.jwt() ->> 'sub'
  )
);

-- 도매는 자신의 주문만 조회
CREATE POLICY "orders_select_own" ON orders
FOR SELECT USING (
  wholesaler_id IN (
    SELECT id FROM wholesalers WHERE user_id = auth.jwt() ->> 'sub'
  )
);
```

### 5.3 PM에게 요청할 내용

```markdown
## DB 세팅 요청사항

### ⚠️ 필수 확인 사항 (Week 1 중 반드시 완료)

1. **profiles 테이블 구조 확인 및 확정**

   - 테이블 존재 여부 확인
   - 컬럼 구조: user_id, role, status, created_at 등
   - wholesalers 테이블과의 관계 (user_id 외래키)
   - RLS 정책 설정 확인

2. **Supabase Storage RLS 정책 설정**
   - product-images 버킷 RLS 활성화
   - 업로드 정책: 자신의 wholesaler_id 폴더만 업로드 가능
   - 조회 정책: 모든 사용자 조회 가능 (public)
   - 삭제 정책: 자신의 파일만 삭제 가능

### 테이블 생성 요청

다음 테이블 생성 및 RLS 정책 설정을 요청드립니다:

1. profiles (Clerk 연동)
2. retailers
3. wholesalers
4. products
5. product_variants (상품 옵션)
6. cart_items (장바구니)
7. orders (⚠️ order_items 없음, orders에 product_id 직접 포함)
8. settlements
9. cs_threads
10. cs_messages
11. audit_logs
12. ai_product_suggestions
13. inquiries (선택)

각 테이블의 RLS 정책:

- 도매는 자신의 wholesaler_id와 연결된 데이터만 조회/수정 가능
- 소매는 도매의 민감 정보 조회 불가
- 관리자는 모든 데이터 조회 가능

Realtime 활성화:

- orders 테이블 (실시간 주문 알림용)
- products 테이블 (재고 변경 알림용)

### Anonymous Code 자동 생성

도매 익명 코드(V-001, V-002 등) 자동 생성 방법 협의:

- Option 1: Supabase Edge Function (권장)
- Option 2: Database Trigger
- Option 3: 클라이언트 사이드 (보안상 비권장)

형식: VENDOR-001, VENDOR-002, VENDOR-003 (3자리 숫자 패딩)
```

---

## 6. 8주 개발 로드맵

### 📅 Week 1-2: 기반 구축 및 설계

**목표**: 프로젝트 구조 잡기 + 팀 협업 기반 마련

#### Week 1

**Day 1-2: 환경 세팅**

```bash
# 1. shadcn/ui 설치
npx shadcn@latest init

# 질문 답변:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes

# 2. 기본 컴포넌트 추가
npx shadcn@latest add button input card table badge dialog tabs toast

# 3. 추가 라이브러리 설치
pnpm add react-hook-form zod @hookform/resolvers date-fns @tanstack/react-table recharts lucide-react
```

**Day 3-4: 팀 협업**

- [ ] PM과 DB 스키마 최종 확정
- [ ] 소매 개발자와 데이터 구조 논의
  - products 테이블 구조
  - orders 상태 플로우
  - 카테고리 목록
- [ ] 디자이너에게 디자인 가이드 전달

**Day 5-7: 기본 구조 + 인증/온보딩**

- [x] 폴더 구조 생성 ✅
- [x] 타입 정의 파일 작성 ✅
- [x] Supabase 클라이언트 설정 ✅
- [x] Clerk 인증 미들웨어 설정 ✅
- [x] ~~역할 선택 페이지 구현~~ (❌ 불필요 - 도매 전용)
- [x] 사업자 정보 입력 폼 구현 ✅
- [x] 승인 대기 페이지 구현 ✅
- [x] 루트 페이지 리다이렉트 ✅

#### Week 2

**Day 1-3: 레이아웃 구현**

- [ ] 도매 전용 레이아웃 (`app/wholesaler/layout.tsx`)
- [ ] 사이드바 컴포넌트
- [ ] 헤더 컴포넌트
- [ ] 빈 페이지들 생성

**Day 4-5: 유틸리티 함수**

- [ ] 날짜 포맷 함수
- [ ] 금액 포맷 함수
- [ ] 상수 정의 (주문 상태, 카테고리 등)

**산출물:**

- 완전한 인증 및 온보딩 플로우 (사업자 정보 입력 → 승인 대기) ✅
- 완성된 레이아웃 (사이드바, 헤더)
- 모든 페이지로 이동 가능한 네비게이션
- 공통 컴포넌트 (LoadingSpinner, EmptyState 등)
- 승인 상태 확인 로직 (실시간 구독)

---

### 📅 Week 3-4: 상품 관리 + 시세 조회

**목표**: 상품 CRUD 완성 + 실시간 시세 조회 기능

#### Week 3

**Day 1-2: 상품 목록**

- [ ] 상품 목록 페이지 UI
- [ ] Supabase에서 상품 데이터 가져오기
- [ ] 테이블 뷰 구현 (TanStack Table)
- [ ] 필터 기능 (카테고리, 활성/비활성)

**Day 3-5: 상품 등록**

- [ ] 상품 등록 폼 UI
- [ ] react-hook-form + zod 유효성 검증
- [ ] 이미지 업로드 (Supabase Storage)
- [ ] 상품 등록 API 연동

#### Week 4

**Day 1-3: 상품 수정/삭제**

- [ ] 상품 수정 폼
- [ ] 기존 데이터 불러오기
- [ ] 수정 API 연동
- [ ] 활성화/비활성화 토글

**Day 4-5: 테스트 및 버그 수정**

- [ ] 이미지 업로드 테스트
- [ ] 데이터 유효성 검증 테스트
- [ ] 소매 페이지와 데이터 연동 확인

**Day 4-5: 시세 조회 페이지 (필수 MVP 기능)**

- [ ] 공공데이터포털 API 키 발급 (전국 공영도매시장 실시간 경매정보)
- [ ] 시세 조회 API 함수 작성 (`lib/api/market-prices.ts`)
- [ ] 시세 조회 페이지 UI (`app/wholesaler/market-prices/page.tsx`)
- [ ] 시세 테이블 컴포넌트 (PriceTable)
- [ ] 시세 검색 필터 컴포넌트 (PriceFilter)
- [ ] 가격 추이 차트 구현 (recharts)
- [ ] 상품 등록 페이지에 "시세 참고" 버튼 추가

**참고:**

- 공공데이터포털 API는 즉시 승인되어 빠르게 개발 가능
- 도매업자의 가격 책정에 필수적인 기능
- 실시간 경매 정보로 시장 트렌드 파악 가능

**산출물:**

- 완전한 상품 관리 시스템
- 상품 목록, 등록, 수정, 비활성화 기능
- 실시간 시세 조회 기능 (도매시장 경매가격)

---

### 📅 Week 5-6: 주문 관리

**목표**: 주문 처리 플로우 완성

#### Week 5

**Day 1-2: 주문 목록**

- [ ] 주문 목록 페이지 UI
- [ ] 상태별 탭 (신규/처리중/완료)
- [ ] 주문 데이터 가져오기
- [ ] 필터 (날짜, 상태, 금액)

**Day 3-5: 주문 상세**

- [ ] 주문 상세 페이지 UI
- [ ] 주문 정보 표시
- [ ] 주문 상품 목록
- [ ] 배송지 정보 (소매점 정보는 익명)

#### Week 6

**Day 1-3: 주문 상태 변경**

- [ ] 상태 변경 버튼
- [ ] 상태 변경 API
- [ ] 타임스탬프 기록 (confirmed_at, shipped_at 등)
- [ ] 일괄 처리 기능 (체크박스)

**Day 4-5: 실시간 알림**

- [ ] Supabase Realtime 구독 설정
- [ ] 새 주문 알림 (Toast)
- [ ] 주문 카운트 실시간 업데이트

**산출물:**

- 완전한 주문 관리 시스템
- 실시간 알림 기능

---

### 📅 Week 7: 대시보드 + 정산

**목표**: 대시보드 실제 데이터 연동 + 정산 페이지

#### Day 1-3: 대시보드

- [ ] 통계 카드 (오늘 주문, 출고 예정, 정산 예정)
- [ ] 실제 데이터 연동
- [ ] 최근 주문 목록
- [ ] 재고 부족 알림

#### Day 4-5: 정산 관리

- [ ] 정산 목록 페이지
- [ ] 정산 예정/완료 탭
- [ ] 정산 계산 로직 검증
- [ ] 정산 상세 정보

**산출물:**

- 작동하는 대시보드
- 정산 페이지

---

### 📅 Week 8: 테스트 + 버그 수정 + 최적화

**목표**: 배포 준비

#### Day 1-2: 통합 테스트

- [ ] 전체 기능 테스트
- [ ] 소매 페이지와 통합 테스트
- [ ] RLS 보안 테스트

#### Day 3-4: 성능 최적화

- [ ] 이미지 최적화
- [ ] 로딩 속도 개선
- [ ] 에러 핸들링 보완

#### Day 5: 문서화

- [ ] README 작성
- [ ] 주요 함수 주석 추가
- [ ] 배포 가이드 작성

**산출물:**

- 배포 가능한 MVP

---

## 7. 페이지별 구현 가이드

### 7.0 인증 및 회원가입 플로우 (Authentication & Onboarding)

#### 7.0.1 도매 회원가입 플로우 (별도 도메인 구조)

도매 사업자의 회원가입은 다음 단계로 진행됩니다:

**플로우:**

```
1. 외부 메인 랜딩 페이지 (www.marketlink.com)
   ↓ "도매업자로 시작하기" 버튼 클릭
2. wholesale.marketlink.com/sign-in/wholesaler 접속
   ↓
3. Clerk 회원가입 또는 로그인
   ↓
4. 도매 사업자 정보 입력 (/wholesaler-onboarding)
   ↓
5. 관리자 승인 대기 (/pending-approval)
   ↓
6. 승인 후 대시보드 접근 (/wholesaler/dashboard)
```

**⚠️ 역할 선택 단계 없음:**

- 도매 전용 도메인이므로 역할이 이미 결정됨
- 소매 사용자는 다른 도메인(`retail.marketlink.com`) 사용

**구현 완료된 페이지:**

1. ✅ **루트 리다이렉트** (`app/page.tsx`) - `/` → `/sign-in/wholesaler`
2. ✅ **사업자 정보 입력 폼** (`app/(auth)/wholesaler-onboarding/page.tsx`)
3. ✅ **승인 대기 페이지** (`app/(auth)/pending-approval/page.tsx`)

---

#### 7.0.2 루트 페이지 리다이렉트 (구현 완료 ✅)

**목적:**

도매 전용 프로젝트이므로 루트 페이지(`/`)는 도매 로그인으로 자동 리다이렉트됩니다.

**구현 완료:**

```typescript
// app/page.tsx
import { redirect } from "next/navigation";

/**
 * @file app/page.tsx
 * @description 도매 프로젝트 루트 페이지 - 로그인으로 리다이렉트
 *
 * 이 프로젝트는 도매 사업자 전용 플랫폼입니다.
 * 메인 랜딩 페이지는 별도 도메인(www.marketlink.com)에서 관리되므로,
 * 루트 경로(/)에 접근 시 도매 로그인 페이지로 자동 리다이렉트합니다.
 */
export default function RootPage() {
  redirect("/sign-in/wholesaler");
}
```

**진입점:**

- 외부 링크: `www.marketlink.com` → "도매업자로 시작하기" 클릭 → `wholesale.marketlink.com/sign-in/wholesaler`
- 루트 접근: `/` → `/sign-in/wholesaler` (자동 리다이렉트)
- 북마크/직접 접속: `/sign-in/wholesaler`

---

#### 7.0.3 사업자 정보 입력 폼

**커서 AI 프롬프트:**

```
도매 사업자 정보 입력 폼을 만들어줘.

요구사항:
- react-hook-form + zod 유효성 검증
- 필드:
  - 사업자명 (필수)
  - 사업자번호 (필수, 10자리 숫자)
  - 대표자명 (필수)
  - 연락처 (필수, 전화번호 형식)
  - 주소 (필수)
  - 계좌번호 (필수, 은행명 포함하여 입력)
- 제출 시 wholesalers 테이블에 저장
- status는 'pending'으로 자동 설정
- anonymous_code는 서버에서 자동 생성
- 제출 후 승인 대기 페이지로 이동
- 단계별 진행 표시 (1/3 단계)

파일: app/(auth)/wholesaler-onboarding/page.tsx
```

**유효성 검증 스키마:**

```typescript
// lib/validation/wholesaler.ts
import { z } from "zod";

export const wholesalerOnboardingSchema = z.object({
  business_name: z.string().min(2, "사업자명은 2글자 이상이어야 합니다"),
  business_number: z
    .string()
    .regex(/^\d{10}$/, "사업자번호는 10자리 숫자여야 합니다"),
  representative: z.string().min(2, "대표자명은 2글자 이상이어야 합니다"),
  phone: z
    .string()
    .regex(
      /^010-\d{4}-\d{4}$/,
      "전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)",
    ),
  address: z.string().min(5, "주소를 입력해주세요"),
  bank_account: z.string().min(5, "계좌번호를 입력해주세요 (은행명 포함)"),
});

export type WholesalerOnboardingFormData = z.infer<
  typeof wholesalerOnboardingSchema
>;
```

**주요 은행 목록:**

```typescript
// lib/utils/constants.ts
// lib/utils/constants.ts

// 은행 목록 (계좌번호 입력 시 참고용)
export const BANKS = [
  "KB국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "NH농협은행",
  "IBK기업은행",
  "SC제일은행",
  "카카오뱅크",
  "토스뱅크",
  "케이뱅크",
];

// 주문 상태 (orders.status)
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// 도매 승인 상태 (wholesalers.status)
export const WHOLESALER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
} as const;

// 배송 방법 (products.delivery_method)
export const DELIVERY_METHODS = {
  COURIER: { value: "courier", label: "택배" },
  DIRECT: { value: "direct", label: "직배송" },
  QUICK: { value: "quick", label: "퀵서비스" },
  FREIGHT: { value: "freight", label: "화물" },
  PICKUP: { value: "pickup", label: "픽업" },
} as const;
```

---

#### 7.0.4 승인 대기 페이지

**커서 AI 프롬프트:**

```
도매 사업자 승인 대기 페이지를 만들어줘.

요구사항:
- 승인 대기 중 메시지 표시
- 승인 상태 실시간 확인 (Supabase Realtime)
- 승인 완료 시 자동으로 대시보드로 이동
- 반려 시 사유 표시 및 재신청 버튼
- 로딩 스피너 또는 애니메이션
- 예상 승인 시간 안내 (1-2영업일)

파일: app/wholesaler/pending-approval/page.tsx
```

**예상 코드:**

```typescript
// app/wholesaler/pending-approval/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@clerk/nextjs";

export default function PendingApprovalPage() {
  const { user } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    // 현재 승인 상태 확인
    const checkStatus = async () => {
      const { data } = await supabase
        .from("wholesalers")
        .select("status, rejection_reason")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setStatus(data.status);
        setRejectionReason(data.rejection_reason);

        if (data.status === "approved") {
          router.push("/wholesaler/dashboard");
        }
      }
    };

    checkStatus();

    // 실시간 구독 (승인 상태 변경 감지)
    const channel = supabase
      .channel("wholesaler-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wholesalers",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          setStatus(newStatus);

          if (newStatus === "approved") {
            // 승인되면 대시보드로 이동
            setTimeout(() => {
              router.push("/wholesaler/dashboard");
            }, 2000);
          } else if (newStatus === "rejected") {
            setRejectionReason(payload.new.rejection_reason);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, router]);

  if (status === "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">승인 완료! 🎉</h2>
            <p className="text-gray-600 mb-4">도매 페이지로 이동합니다...</p>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-center text-2xl">승인 반려</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              죄송합니다. 관리자가 회원가입을 반려했습니다.
            </p>
            {rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-red-800 mb-1">
                  반려 사유:
                </p>
                <p className="text-sm text-red-700">{rejectionReason}</p>
              </div>
            )}
            <Button
              onClick={() => router.push("/wholesaler/onboarding")}
              className="w-full"
            >
              정보 수정 후 재신청
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md">
        <CardHeader>
          <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <CardTitle className="text-center text-2xl">승인 대기 중</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            관리자가 회원가입을 검토하고 있습니다.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              📌 예상 승인 시간: <strong>1-2 영업일</strong>
            </p>
            <p className="text-xs text-blue-600 mt-2">
              승인이 완료되면 자동으로 대시보드로 이동합니다.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>실시간으로 상태를 확인하고 있습니다...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

#### 7.0.5 로그인 시 승인 상태 확인 (Middleware)

도매 사용자가 로그인할 때마다 승인 상태를 확인해야 합니다.

**커서 AI 프롬프트:**

```
도매 레이아웃에 승인 상태 확인 로직을 추가해줘.

요구사항:
- 로그인한 사용자의 wholesaler 정보 조회
- status가 'pending'이면 승인 대기 페이지로 리다이렉트
- status가 'rejected'이면 승인 대기 페이지로 리다이렉트
- status가 'approved'인 경우에만 대시보드 접근 허용
- wholesaler 정보가 없으면 온보딩 페이지로 리다이렉트

파일: app/wholesaler/layout.tsx
```

**예상 코드:**

```typescript
// app/wholesaler/layout.tsx
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/wholesaler/Layout/Sidebar";
import { Header } from "@/components/wholesaler/Layout/Header";

export default async function WholesalerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = createClient();

  // wholesaler 정보 확인
  const { data: wholesaler } = await supabase
    .from("wholesalers")
    .select("status")
    .eq("user_id", userId)
    .single();

  // wholesaler 정보가 없으면 온보딩으로
  if (!wholesaler) {
    redirect("/wholesaler/onboarding");
  }

  // 승인 대기/반려 상태면 승인 대기 페이지로
  if (wholesaler.status === "pending" || wholesaler.status === "rejected") {
    redirect("/wholesaler/pending-approval");
  }

  // 정지된 계정
  if (wholesaler.status === "suspended") {
    redirect("/wholesaler/suspended");
  }

  // approved인 경우에만 접근 허용
  return (
    <div className="flex h-screen">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

#### 7.0.6 체크리스트

**인증 및 온보딩 구현:**

- [x] ~~역할 선택 페이지~~ (❌ 불필요 - 도매 전용 프로젝트)
- [x] 사업자 정보 입력 폼 (`app/(auth)/wholesaler-onboarding/page.tsx`) ✅
- [x] 유효성 검증 스키마 (`lib/validation/wholesaler.ts`) ✅
- [x] 승인 대기 페이지 (`app/(auth)/pending-approval/page.tsx`) ✅
- [ ] 실시간 승인 상태 확인 (Supabase Realtime)
- [ ] 도매 레이아웃에서 승인 상태 확인 (`app/wholesaler/layout.tsx`)
- [x] ⚠️ **정지된 계정 페이지 (`app/wholesaler/suspended/page.tsx`)** ✅
  - [x] 계정 정지 안내 메시지 ✅
  - [x] 정지 사유 표시 ✅
  - [x] 고객센터 연락처 ✅
  - [x] 로그아웃 버튼 ✅
- [x] 루트 페이지 리다이렉트 (`app/page.tsx` → `/sign-in/wholesaler`) ✅

**Anonymous Code 자동 생성 (필수):**

- [ ] ⚠️ PM과 구현 방법 협의 (Edge Function/Trigger/클라이언트)
- [ ] 생성 형식 확정 (VENDOR-001, VENDOR-002 등)
- [ ] 중복 방지 로직
- [ ] 테스트 (동시 가입 시 중복 확인)

**테스트:**

- [ ] 도매 회원가입 → 사업자 정보 입력 → 승인 대기
- [ ] 관리자가 승인 시 자동으로 대시보드 접근
- [ ] 관리자가 반려 시 재신청 가능
- [ ] 승인 전 대시보드 접근 차단
- [ ] Anonymous Code 자동 생성 확인

---

### 7.1 레이아웃 (Layout)

#### 7.1.1 사이드바

**커서 AI 프롬프트:**

```
도매 관리 페이지의 사이드바를 만들어줘.

요구사항:
- Next.js App Router 사용
- 메뉴: 대시보드, 상품 관리, 시세 조회, 주문 관리, 정산 관리, 문의 관리 (선택)
- 현재 경로 하이라이트
- lucide-react 아이콘 사용
- Tailwind CSS로 스타일링
```

**예상 코드 구조:**

```typescript
// components/wholesaler/Layout/Sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  MessageSquare,
} from "lucide-react";

const menuItems = [
  { href: "/wholesaler/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/wholesaler/products", label: "상품 관리", icon: Package },
  { href: "/wholesaler/market-prices", label: "시세 조회", icon: TrendingUp },
  { href: "/wholesaler/orders", label: "주문 관리", icon: ShoppingCart },
  { href: "/wholesaler/settlements", label: "정산 관리", icon: DollarSign },
  { href: "/wholesaler/inquiries", label: "문의 관리", icon: MessageSquare }, // 선택 기능
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white border-r">
      {/* 로고 */}
      <div className="p-6">
        <h1 className="text-xl font-bold">도매 관리</h1>
      </div>

      {/* 메뉴 */}
      <nav className="px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

#### 7.1.2 헤더

**커서 AI 프롬프트:**

```
도매 관리 페이지의 헤더를 만들어줘.

요구사항:
- 오른쪽에 사용자 드롭다운 메뉴 (프로필, 로그아웃)
- Clerk의 UserButton 사용
- 알림 아이콘 (실시간 주문 알림 표시)
```

#### 7.1.3 레이아웃 통합

**커서 AI 프롬프트:**

```
도매 페이지 레이아웃을 만들어줘.

요구사항:
- app/wholesaler/layout.tsx 파일
- Clerk로 인증 확인
- 역할이 'wholesaler'인지 확인
- 아니면 /unauthorized로 리다이렉트
- 사이드바 + 헤더 + 메인 컨텐츠 구조
```

---

### 7.2 대시보드 (Dashboard)

#### 7.2.1 통계 카드

**커서 AI 프롬프트:**

```
대시보드 통계 카드 컴포넌트를 만들어줘.

요구사항:
- 제목, 값, 아이콘을 받음
- shadcn/ui Card 사용
- 증감 표시 (선택적)
- 로딩 상태

예시:
- 오늘 주문: 15건
- 출고 예정: 8건
- 이번 주 정산 예정: 1,250,000원
```

**예상 코드:**

```typescript
// components/wholesaler/Dashboard/StatCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  isLoading,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="w-4 h-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p
            className={`text-xs ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last
            week
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 7.2.2 대시보드 페이지

**커서 AI 프롬프트:**

```
도매 대시보드 페이지를 만들어줘.

요구사항:
- 통계 카드 4개 (오늘 주문, 출고 예정, 정산 예정, 전체 상품)
- Supabase에서 실제 데이터 가져오기
- 최근 주문 목록 (최대 5개)
- 재고 부족 상품 알림
- 실시간 업데이트 (새 주문 알림)
```

---

### 7.3 상품 관리 (Products)

#### 7.3.1 상품 목록

**커서 AI 프롬프트:**

```
상품 목록 페이지를 만들어줘.

요구사항:
- TanStack Table 사용
- 컬럼: 이미지, 상품명, 카테고리, 가격, 재고, 상태, 액션
- 필터: 카테고리, 활성/비활성
- 검색: 상품명
- 페이지네이션
- 활성화/비활성화 토글
- 수정/삭제 버튼
```

**테이블 컬럼 예시:**
| 이미지 | 상품명 | 카테고리 | 가격 | 재고 | 상태 | 액션 |
|--------|--------|----------|------|------|------|------|
| 🖼️ | 양파 1kg | 농산물 | 3,000원 | 50 | 🟢 활성 | 수정/비활성 |

#### 7.3.2 상품 등록 폼

**커서 AI 프롬프트:**

```
상품 등록 폼을 만들어줘.

요구사항:
- react-hook-form + zod 유효성 검증
- 필드:
  - 상품명 (필수)
  - 카테고리 (선택 박스)
  - 가격 (숫자, 최소 0)
  - 최소주문수량 (숫자, 최소 1)
  - 재고 (숫자, 최소 0)
  - 단위 (텍스트: kg, box 등)
  - 배송비 (숫자)
  - 배송 방법 (선택: 택배/직배송/퀵서비스/화물/픽업)
  - 납기 (텍스트: 익일배송 등)
  - 상품 설명 (텍스트 에리어)
  - 이미지 업로드 (최대 5개)
  - 규격 정보 (무게, 크기, 원산지, 보관방법)
- Supabase Storage에 이미지 업로드
- 성공 시 상품 목록으로 이동
```

**유효성 검증 스키마:**

```typescript
// lib/validation/product.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "상품명은 2글자 이상이어야 합니다"),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  description: z.string().optional(),
  price: z.number().min(0, "가격은 0 이상이어야 합니다"),
  moq: z.number().int().min(1, "최소주문수량은 1 이상이어야 합니다"),
  stock: z.number().int().min(0, "재고는 0 이상이어야 합니다"),
  unit: z.string().default("ea"),
  delivery_fee: z.number().min(0, "배송비는 0 이상이어야 합니다"),
  delivery_method: z
    .enum(["courier", "direct", "quick", "freight", "pickup"], {
      errorMap: () => ({ message: "배송 방법을 선택해주세요" }),
    })
    .default("courier"),
  lead_time: z.string().optional(),
  specifications: z
    .object({
      weight: z.string().optional(),
      size: z.string().optional(),
      origin: z.string().optional(),
      storage: z.string().optional(),
    })
    .optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
```

#### 7.3.3 이미지 업로드

**커서 AI 프롬프트:**

```
Supabase Storage에 상품 이미지를 업로드하는 함수를 만들어줘.

요구사항:
- 버킷 이름: 'product-images'
- 경로: wholesaler_id/product_id/filename
- 허용 포맷: jpg, jpeg, png, webp
- 최대 크기: 5MB
- 업로드 후 public URL 반환
```

**예상 코드:**

```typescript
// lib/supabase/storage.ts
import { createClient } from "@/lib/supabase/client";

export async function uploadProductImage(
  file: File,
  wholesalerId: string,
  productId: string,
): Promise<string> {
  const supabase = createClient();

  // 파일 검증
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error("지원하지 않는 이미지 형식입니다.");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("이미지 크기는 5MB 이하여야 합니다.");
  }

  // 파일명 생성
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${wholesalerId}/${productId}/${fileName}`;

  // 업로드
  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file);

  if (error) throw error;

  // Public URL 가져오기
  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
```

#### 7.3.4 AI 상품명 표준화

**목적**: 도매업자가 입력한 상품명을 AI(Gemini 2.5 Flash)가 분석하여 표준화된 상품명을 제안, 소매점의 검색 효율을 높이고 카테고리 분류를 개선

**주요 기능**:

- 상품 등록/수정 시 입력한 상품명을 AI로 분석
- 표준화된 상품명 제안 (예: "양파1kg특" → "양파 1kg (특급)")
- 카테고리 자동 추천
- 주요 키워드 추출 (검색 최적화)
- 표준화 신뢰도(confidence) 표시

**커서 AI 프롬프트:**

```
AI 상품명 표준화 기능을 구현해줘.

요구사항:
- 도매가 입력한 상품명을 받아서 Gemini 2.5 Flash API로 분석
- 표준화된 상품명, 추천 카테고리, 키워드 추출
- 상품 등록 폼에서 "AI 표준화" 버튼 클릭 시 실행
- 결과를 모달로 표시
- 사용자가 제안을 수락하거나 거부 가능
- 로딩 상태 및 에러 처리
- TypeScript 사용

파일:
- lib/api/ai-standardize.ts (Gemini API 호출)
- components/wholesaler/Products/AIStandardizeButton.tsx (버튼 컴포넌트)
```

**API 구현:**

```typescript
// lib/api/ai-standardize.ts

interface StandardizeResult {
  originalName: string;
  standardizedName: string;
  suggestedCategory: string;
  keywords: string[];
  confidence: number; // 0-1
}

export async function standardizeProductName(
  productName: string,
): Promise<StandardizeResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API 키가 설정되지 않았습니다.");
  }

  const prompt = `
다음 상품명을 분석하여 표준화된 형태로 변환해주세요:

입력: "${productName}"

다음 형식으로 JSON 응답을 주세요 (JSON만 응답하고 다른 텍스트는 포함하지 마세요):
{
  "standardizedName": "표준화된 상품명",
  "suggestedCategory": "추천 카테고리",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "confidence": 0.95
}

규칙:
- 단위는 띄어쓰기로 구분 (예: 1kg → 1kg 또는 1 kg)
- 등급은 괄호로 표시 (예: 특 → (특급), 상 → (상급))
- 불필요한 기호 제거
- 카테고리는 다음 중 하나로 분류: 채소류, 과일류, 곡물류, 수산물, 축산물, 가공식품, 기타
- 키워드는 3-5개 추출 (검색에 유용한 단어들)
- confidence는 표준화 신뢰도 (0.8 이상 권장)
`;

  try {
    // Gemini API 엔드포인트
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: "application/json", // JSON 응답 강제
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API 에러:", errorData);
      throw new Error(`Gemini API 호출 실패: ${response.status}`);
    }

    const data = await response.json();

    // Gemini 응답 구조에서 텍스트 추출
    const textContent = data.candidates[0]?.content?.parts[0]?.text;

    if (!textContent) {
      throw new Error("Gemini로부터 응답을 받지 못했습니다.");
    }

    // JSON 파싱 (Gemini가 JSON 형식으로 반환)
    let result;
    try {
      result = JSON.parse(textContent);
    } catch (parseError) {
      // JSON 파싱 실패 시 텍스트에서 JSON 추출 시도
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON 형식의 응답을 파싱할 수 없습니다.");
      }
    }

    return {
      originalName: productName,
      standardizedName: result.standardizedName || productName,
      suggestedCategory: result.suggestedCategory || "기타",
      keywords: result.keywords || [],
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    console.error("상품명 표준화 오류:", error);
    throw error;
  }
}

// 여러 상품을 한 번에 표준화 (배치 처리) - ⚠️ 선택 기능
export async function standardizeProductNamesBatch(
  productNames: string[],
): Promise<StandardizeResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API 키가 설정되지 않았습니다.");
  }

  const prompt = `
다음 상품명들을 각각 분석하여 표준화된 형태로 변환해주세요:

${productNames.map((name, idx) => `${idx + 1}. ${name}`).join("\n")}

다음 형식으로 JSON 배열로 응답해주세요:
[
  {
    "originalName": "원본 상품명1",
    "standardizedName": "표준화된 상품명1",
    "suggestedCategory": "카테고리1",
    "keywords": ["키워드1", "키워드2"],
    "confidence": 0.95
  },
  ...
]

규칙:
- 단위는 띄어쓰기로 구분
- 등급은 괄호로 표시
- 카테고리: 채소류, 과일류, 곡물류, 수산물, 축산물, 가공식품, 기타
`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.candidates[0]?.content?.parts[0]?.text;

    return JSON.parse(textContent);
  } catch (error) {
    console.error("배치 표준화 오류:", error);
    throw error;
  }
}
```

**컴포넌트 구현:**

```typescript
// components/wholesaler/Products/AIStandardizeButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { standardizeProductName } from "@/lib/api/ai-standardize";

interface AIStandardizeButtonProps {
  currentName: string;
  onAccept: (result: { name: string; category: string }) => void;
}

export function AIStandardizeButton({
  currentName,
  onAccept,
}: AIStandardizeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStandardize = async () => {
    if (!currentName.trim()) {
      alert("상품명을 먼저 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    setError(null);

    try {
      const data = await standardizeProductName(currentName);
      setResult(data);
    } catch (error) {
      console.error("AI 표준화 오류:", error);
      setError("AI 표준화 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (result) {
      onAccept({
        name: result.standardizedName,
        category: result.suggestedCategory,
      });
      setIsOpen(false);
      setResult(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
    setError(null);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleStandardize}
        disabled={!currentName.trim()}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        AI 표준화
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI 상품명 표준화
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">
                Gemini AI가 상품명을 분석하고 있습니다...
              </p>
              <p className="text-sm text-gray-400 mt-2">잠시만 기다려주세요</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <div className="text-red-500 mb-4">⚠️ {error}</div>
              <Button onClick={handleClose} variant="outline">
                닫기
              </Button>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* 원본 상품명 */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  원본 상품명
                </label>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
                  {result.originalName}
                </p>
              </div>

              {/* 표준화된 상품명 */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  표준화된 상품명
                </label>
                <p className="text-xl font-bold text-blue-600 bg-blue-50 p-3 rounded-md">
                  {result.standardizedName}
                </p>
              </div>

              {/* 추천 카테고리 */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  추천 카테고리
                </label>
                <Badge className="bg-green-100 text-green-800 text-base px-3 py-1">
                  {result.suggestedCategory}
                </Badge>
              </div>

              {/* 주요 키워드 */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  검색 키워드
                </label>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((keyword: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-sm px-3 py-1"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 신뢰도 */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  표준화 신뢰도
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        result.confidence >= 0.8
                          ? "bg-green-500"
                          : result.confidence >= 0.6
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                {result.confidence < 0.8 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ℹ️ 신뢰도가 낮습니다. 수동으로 확인해주세요.
                  </p>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleAccept} className="flex-1" size="lg">
                  <Check className="w-4 h-4 mr-2" />
                  표준화된 이름 적용하기
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  size="lg"
                >
                  <X className="w-4 h-4 mr-2" />
                  취소
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**상품 등록 폼에 통합:**

```typescript
// app/wholesaler/products/new/page.tsx (일부)

import { AIStandardizeButton } from "@/components/wholesaler/Products/AIStandardizeButton";

export default function NewProductPage() {
  const form = useForm({
    /* ... */
  });

  const handleAIAccept = (result: { name: string; category: string }) => {
    form.setValue("name", result.name);
    form.setValue("category", result.category);
  };

  return (
    <form>
      {/* 상품명 입력 필드 */}
      <div className="space-y-2">
        <label>상품명</label>
        <div className="flex gap-2">
          <input
            {...form.register("name")}
            className="flex-1"
            placeholder="예: 양파1kg특"
          />
          <AIStandardizeButton
            currentName={form.watch("name")}
            onAccept={handleAIAccept}
          />
        </div>
        <p className="text-sm text-gray-500">
          💡 AI 표준화를 사용하면 검색 최적화된 상품명으로 자동 변환됩니다
        </p>
      </div>

      {/* 나머지 폼 필드들... */}
    </form>
  );
}
```

**환경 변수 설정:**

```env
# .env.local

# Google Gemini API
GEMINI_API_KEY=AIza...your_api_key_here
```

**Gemini API 키 발급 방법:**

1. **Google AI Studio** 접속: https://aistudio.google.com/
2. Google 계정으로 로그인
3. 좌측 메뉴에서 **"Get API Key"** 클릭
4. **"Create API Key"** 버튼 클릭
5. API 키 복사 후 `.env.local`에 추가

**Gemini 2.5 Flash 특징:**

| 항목           | 내용                                   |
| -------------- | -------------------------------------- |
| 속도           | 매우 빠름 (Flash 모델)                 |
| 비용           | 저렴 (무료 할당량 큼)                  |
| 한국어 성능    | 우수                                   |
| JSON 모드      | 지원 (`responseMimeType`)              |
| 무료 할당량    | 분당 15 요청, 월 1500 요청             |
| 유료 플랜 가격 | 입력 $0.075/1M 토큰, 출력 $0.3/1M 토큰 |

**주의사항:**

⚠️ **Rate Limit**: 무료 플랜은 분당 15 요청 제한  
⚠️ **API 키 보안**: 서버 사이드에서만 사용 (클라이언트 노출 금지)  
⚠️ **에러 핸들링**: 네트워크 오류, API 한도 초과 등 대비  
⚠️ **신뢰도 확인**: confidence가 낮은 경우 수동 검토 권장  
⚠️ **비용 모니터링**: Google Cloud Console에서 사용량 추적

**필수 구현 사항:**

⚠️ **API Rate Limiting 처리 (필수)**

- 429 에러 (Too Many Requests) 처리
- 사용자에게 "잠시 후 다시 시도해주세요" 메시지
- 재시도 버튼 제공
- 호출 간 최소 딜레이 추가 (분당 15회 제한 고려)

```typescript
// Rate Limiting 처리 예시
try {
  const result = await standardizeProductName(productName);
  return result;
} catch (error) {
  if (error.response?.status === 429) {
    // Too Many Requests
    throw new Error("잠시 후 다시 시도해주세요. (API 호출 한도 초과)");
  }
  throw error;
}
```

**테스트 예시:**

```typescript
// 테스트 코드 예시
const testCases = [
  "양파1kg특", // → "양파 1kg (특급)"
  "사과5kg상품", // → "사과 5kg (상품)"
  "배추10포기", // → "배추 10포기"
  "고추가루500g", // → "고추가루 500g"
];

for (const testCase of testCases) {
  const result = await standardizeProductName(testCase);
  console.log(`${testCase} → ${result.standardizedName}`);
}
```

---

### 7.4 시세 조회 (Market Prices)

#### 7.4.1 페이지 개요

**목적**: 도매업자가 상품 등록 전 실시간 농수산물 경매가격을 조회하여 적정 가격 책정에 참고

**주요 기능**:

- 품목별 시세 검색
- 지역별 가격 비교
- 일자별 가격 추이 차트
- 즐겨찾기 품목 관리

#### 7.4.2 시세 조회 페이지

**커서 AI 프롬프트:**

```
농수산물 시세 조회 페이지를 만들어줘.

요구사항:
- 전국 공영도매시장 실시간 경매정보 API를 호출해서 농산물 가격 정보 가져오기
- 품목명, 카테고리, 지역으로 검색 가능
- 검색 결과를 테이블로 표시 (품목명, 단위, 현재가, 전일대비, 등락률)
- 가격 추이를 차트로 시각화 (최근 7일)
- shadcn/ui 컴포넌트 사용
- TypeScript 사용
- 로딩 상태와 에러 처리
```

**예상 코드 구조:**

```typescript
// app/wholesaler/market-prices/page.tsx
import { PriceTable } from "@/components/wholesaler/MarketPrices/PriceTable";
import { PriceChart } from "@/components/wholesaler/MarketPrices/PriceChart";
import { PriceFilter } from "@/components/wholesaler/MarketPrices/PriceFilter";

export default function MarketPricesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">시세 조회</h1>

      {/* 검색 필터 */}
      <PriceFilter />

      {/* 시세 테이블 */}
      <PriceTable />

      {/* 가격 추이 차트 */}
      <PriceChart />
    </div>
  );
}
```

#### 7.4.3 API 연동

**사용할 공공 API:**

**한국농수산식품유통공사\_전국 공영도매시장 실시간 경매정보**

- 전국 공영도매시장의 실시간 경매 가격 정보 제공
- API 키 필요 (공공데이터포털에서 무료 발급)
- 품목명, 도매시장, 날짜별 조회 가능
- 실시간 경매 정보로 가장 최신 시세 확인 가능
- 신청: https://www.data.go.kr (검색: "한국농수산식품유통공사 경매정보")

**기타 참고 가능한 API:**

- **수산물 유통정보 (FIS)**: 수산물 경매가격 정보
- **KAMIS**: 일별 농산물 도소매가격 정보 (대안)

**환경 변수 설정 (.env.local):**

```env
# 공공데이터포털 API 키 (전국 공영도매시장 실시간 경매정보)
NEXT_PUBLIC_MARKET_API_KEY=your_service_key_here
```

**API 호출 함수:**

```typescript
// lib/api/market-prices.ts

interface MarketPriceParams {
  itemName?: string; // 품목명 (예: "사과", "배추")
  marketName?: string; // 도매시장명 (예: "서울가락", "부산엄궁")
  date?: string; // 조회 날짜 (YYYYMMDD 형식)
  numOfRows?: number; // 한 페이지 결과 수 (기본 100)
  pageNo?: number; // 페이지 번호 (기본 1)
}

interface PriceItem {
  itemName: string; // 품목명
  kindName: string; // 품종명
  rank: string; // 등급 (특, 상, 중, 하)
  unit: string; // 단위 (kg, 박스 등)
  price: number; // 현재 경매가격 (원)
  previousPrice: number; // 전일 경매가격 (원)
  changeRate: number; // 등락률 (%)
  marketName: string; // 도매시장명
  auctionDate: string; // 경매일자
}

export async function getMarketPrices(
  params: MarketPriceParams = {},
): Promise<PriceItem[]> {
  const serviceKey = process.env.NEXT_PUBLIC_MARKET_API_KEY;

  if (!serviceKey) {
    throw new Error("공공데이터포털 API 키가 설정되지 않았습니다.");
  }

  // API 엔드포인트 (공공데이터포털)
  const baseUrl =
    "http://apis.data.go.kr/B552895/openapi/service/AuctionPriceService/getAuctionPriceInfo";

  // 기본 파라미터 설정
  const queryParams = new URLSearchParams({
    serviceKey: decodeURIComponent(serviceKey),
    numOfRows: params.numOfRows?.toString() || "100",
    pageNo: params.pageNo?.toString() || "1",
    type: "json", // JSON 형식으로 받기
  });

  // 선택적 파라미터 추가
  if (params.itemName) {
    queryParams.append("itemName", params.itemName);
  }
  if (params.marketName) {
    queryParams.append("marketName", params.marketName);
  }
  if (params.date) {
    queryParams.append("date", params.date);
  }

  try {
    const response = await fetch(`${baseUrl}?${queryParams}`, {
      cache: "no-store", // 실시간 데이터이므로 캐싱 안함
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = await response.json();

    // API 응답 확인
    if (!data.response?.body?.items?.item) {
      console.warn("경매 데이터가 없습니다.");
      return [];
    }

    const items = Array.isArray(data.response.body.items.item)
      ? data.response.body.items.item
      : [data.response.body.items.item];

    // API 응답 데이터를 PriceItem 형태로 변환
    return items.map((item: any) => {
      const currentPrice = parseFloat(item.currentPrice || "0");
      const prevPrice = parseFloat(item.previousPrice || "0");
      const changeRate =
        prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;

      return {
        itemName: item.itemName || "",
        kindName: item.kindName || "",
        rank: item.rank || "보통",
        unit: item.unit || "kg",
        price: Math.round(currentPrice),
        previousPrice: Math.round(prevPrice),
        changeRate: parseFloat(changeRate.toFixed(2)),
        marketName: item.marketName || "",
        auctionDate: item.saleDate || "",
      };
    });
  } catch (error) {
    console.error("도매시장 경매정보 API 호출 오류:", error);
    throw error;
  }
}

// 일주일 시세 추이 조회
export async function getPriceTrend(
  itemName: string,
  marketName?: string,
  days: number = 7,
): Promise<{ date: string; price: number }[]> {
  const results = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // YYYYMMDD 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}${month}${day}`;

    try {
      const prices = await getMarketPrices({
        itemName,
        marketName,
        date: dateString,
        numOfRows: 10,
      });

      if (prices.length > 0) {
        // 같은 품목의 평균 가격 계산
        const avgPrice =
          prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
        results.push({
          date: `${year}-${month}-${day}`,
          price: Math.round(avgPrice),
        });
      }
    } catch (error) {
      console.error(`${dateString} 데이터 조회 실패:`, error);
    }
  }

  return results.reverse(); // 오래된 날짜부터 정렬
}

// 주요 도매시장 목록
export const majorMarkets = [
  "서울가락",
  "부산엄궁",
  "대구북부",
  "광주각화",
  "대전오정",
  "강릉",
  "수원",
  "안양",
  "구리",
];

// 주요 품목 카테고리
export const itemCategories = {
  채소류: ["배추", "무", "고추", "마늘", "양파", "대파"],
  과일류: ["사과", "배", "포도", "감귤", "딸기", "수박"],
  축산물: ["쇠고기", "돼지고기", "닭고기"],
};
```

#### 7.4.4 시세 테이블 컴포넌트

**커서 AI 프롬프트:**

```
시세 테이블 컴포넌트를 만들어줘.

요구사항:
- 품목명, 품종, 등급, 단위, 현재가, 전일가, 등락률, 도매시장, 경매일자 표시
- 등락률에 따라 색상 변경 (상승: 빨강, 하락: 파랑)
- 정렬 기능
- shadcn/ui Table 사용
- 실시간 경매정보 표시
```

**예상 코드:**

```typescript
// components/wholesaler/MarketPrices/PriceTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PriceTableProps {
  data: PriceItem[];
}

export function PriceTable({ data }: PriceTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const getChangeIcon = (changeRate: number) => {
    if (changeRate > 0) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else if (changeRate < 0) {
      return <TrendingDown className="w-4 h-4 text-blue-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>품목명</TableHead>
          <TableHead>품종</TableHead>
          <TableHead>등급</TableHead>
          <TableHead>단위</TableHead>
          <TableHead className="text-right">현재가</TableHead>
          <TableHead className="text-right">전일가</TableHead>
          <TableHead className="text-right">등락률</TableHead>
          <TableHead>도매시장</TableHead>
          <TableHead>경매일자</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.itemName}</TableCell>
            <TableCell>{item.kindName}</TableCell>
            <TableCell>{item.rank}</TableCell>
            <TableCell>{item.unit}</TableCell>
            <TableCell className="text-right font-bold">
              {formatPrice(item.price)}
            </TableCell>
            <TableCell className="text-right text-gray-500">
              {formatPrice(item.previousPrice)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {getChangeIcon(item.changeRate)}
                <span
                  className={
                    item.changeRate > 0
                      ? "text-red-500"
                      : item.changeRate < 0
                      ? "text-blue-500"
                      : "text-gray-500"
                  }
                >
                  {Math.abs(item.changeRate).toFixed(1)}%
                </span>
              </div>
            </TableCell>
            <TableCell>{item.marketName}</TableCell>
            <TableCell className="text-sm text-gray-500">
              {item.auctionDate}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**PriceFilter 컴포넌트 예시:**

```typescript
// components/wholesaler/MarketPrices/PriceFilter.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { majorMarkets, itemCategories } from "@/lib/api/market-prices";

interface PriceFilterProps {
  onSearch: (filters: { itemName: string; marketName: string }) => void;
}

export function PriceFilter({ onSearch }: PriceFilterProps) {
  const [itemName, setItemName] = useState("");
  const [marketName, setMarketName] = useState("");

  const handleSearch = () => {
    onSearch({ itemName, marketName });
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 품목명 입력 */}
        <div>
          <label className="text-sm font-medium mb-2 block">품목명</label>
          <Input
            placeholder="예: 배추, 사과"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* 도매시장 선택 */}
        <div>
          <label className="text-sm font-medium mb-2 block">도매시장</label>
          <Select value={marketName} onValueChange={setMarketName}>
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              {majorMarkets.map((market) => (
                <SelectItem key={market} value={market}>
                  {market}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 검색 버튼 */}
        <div className="flex items-end">
          <Button onClick={handleSearch} className="w-full">
            <Search className="w-4 h-4 mr-2" />
            조회
          </Button>
        </div>
      </div>

      {/* 빠른 검색 (인기 품목) */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">인기 품목:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(itemCategories).map(([category, items]) =>
            items.slice(0, 3).map((item) => (
              <Button
                key={item}
                variant="outline"
                size="sm"
                onClick={() => {
                  setItemName(item);
                  onSearch({ itemName: item, marketName });
                }}
              >
                {item}
              </Button>
            )),
          )}
        </div>
      </div>
    </div>
  );
}
```

#### 7.4.5 상품 등록 페이지와 연동

상품 등록 페이지에 "시세 참고하기" 기능 추가:

```typescript
// app/wholesaler/products/new/page.tsx 일부

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewProductPage() {
  return (
    <div>
      {/* 상품 등록 폼 */}
      <form>
        {/* 가격 입력 필드 옆에 시세 조회 링크 추가 */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label>판매 가격</label>
            <input type="number" name="price" />
          </div>
          <Link href="/wholesaler/market-prices" target="_blank">
            <Button type="button" variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              시세 참고
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
```

#### 7.4.6 주의사항

**⚠️ API 호출 제한 및 캐싱 (필수):**

- 공공데이터포털 API는 일일 호출 횟수 제한이 있습니다 (트래픽 제한)
- **필수**: 적절한 캐싱 전략 구현 (예: 30분 캐싱)
- 실시간 경매 데이터이므로 너무 자주 호출하지 않도록 주의

**캐싱 전략 구현 (필수):**

```typescript
// 캐싱 예시 (localStorage 사용)
const CACHE_KEY_PREFIX = "market_prices_";
const CACHE_DURATION = 30 * 60 * 1000; // 30분

export async function getMarketPricesWithCache(params: MarketPriceParams) {
  const cacheKey = `${CACHE_KEY_PREFIX}${JSON.stringify(params)}`;

  // 캐시 확인
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      console.log("📦 캐시에서 데이터 반환");
      return data;
    }
  }

  // API 호출
  console.log("🌐 API 호출");
  const data = await getMarketPrices(params);

  // 캐시 저장
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );

  return data;
}
```

**UI에 캐시 상태 표시:**

- 캐시 만료 시간 표시 (예: "5분 전 데이터")
- "새로고침" 버튼 제공
- 로딩 중 캐시 데이터 먼저 표시 (Stale-While-Revalidate)

**API 키 발급:**

1. https://www.data.go.kr 접속
2. 회원가입 및 로그인
3. "한국농수산식품유통공사 전국 공영도매시장 실시간 경매정보" 검색
4. 활용신청 클릭 (즉시 승인)
5. 마이페이지 > 인증키에서 서비스 키 확인

**에러 처리:**

- API 타임아웃 처리
- API 키 만료 또는 유효하지 않은 경우
- 경매 데이터가 없는 경우 (주말, 공휴일)
- 네트워크 오류

**최적화:**

- 서버 컴포넌트에서 데이터 fetching (Next.js 15 권장)
- React Query 또는 SWR 사용 고려 (클라이언트 캐싱)
- 차트 라이브러리: `recharts` 추천 (Next.js와 호환성 좋음)
- 날짜별 조회 시 너무 많은 요청 보내지 않기 (순차 처리)

---

### 7.5 주문 관리 (Orders)

#### 7.5.0 주문 구조 이해하기 ⚠️ (필수)

**핵심 원칙:**

- ✅ 1개 orders 레코드 = 1개 상품
- ❌ order_items 테이블 **없음**
- ✅ 장바구니에서 여러 상품 주문 시 → 여러 orders 레코드 생성

**장바구니 → 주문 변환 로직:**

```typescript
// app/retailer/checkout/page.tsx 예시
async function createOrdersFromCart(cartItems: CartItem[]) {
  const orders = [];

  for (const item of cartItems) {
    const orderNumber = generateOrderNumber(); // ORD-20250120-001

    const order = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        retailer_id: currentRetailerId,
        wholesaler_id: item.product.wholesaler_id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.variant?.price || item.product.price,
        shipping_fee: item.product.shipping_fee,
        total_amount:
          (item.variant?.price || item.product.price) * item.quantity +
          item.product.shipping_fee,
        delivery_address: deliveryAddress,
        status: "pending",
      })
      .select()
      .single();

    orders.push(order);
  }

  return orders;
}
```

**주문 조회 예시:**

```typescript
// ❌ 잘못된 예시 (order_items 사용)
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

**UX 고려사항:**

사용자에게 여러 주문이 생성되었음을 명확히 안내:

```tsx
// 결제 완료 후
<div>
  <h2>주문이 완료되었습니다!</h2>
  <p>총 {orders.length}개의 주문이 생성되었습니다.</p>
  <ul>
    {orders.map((order) => (
      <li key={order.id}>
        {order.order_number} - {order.product.name}
      </li>
    ))}
  </ul>
</div>
```

#### 7.5.1 주문 목록

**커서 AI 프롬프트:**

```
주문 목록 페이지를 만들어줘.

요구사항:
- 탭: 신규 (pending), 처리중 (confirmed/shipped), 완료 (completed)
- TanStack Table 사용
- 컬럼: 주문번호, 주문일, 상품명, 옵션, 수량, 금액, 상태, 액션
- 필터: 날짜 범위, 상태
- 검색: 주문번호
- 페이지네이션
- 실시간 업데이트 (Supabase Realtime)
- ⚠️ 주의: 1 주문 = 1 상품 (같은 시간에 여러 주문 생성될 수 있음)
```

**주문 상태 뱃지:**

```typescript
// components/wholesaler/Orders/OrderStatusBadge.tsx
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  pending: { label: "신규주문", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "접수확인", color: "bg-blue-100 text-blue-800" },
  preparing: { label: "준비중", color: "bg-purple-100 text-purple-800" },
  shipped: { label: "출고완료", color: "bg-green-100 text-green-800" },
  completed: { label: "배송완료", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "취소", color: "bg-red-100 text-red-800" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;

  return <Badge className={config.color}>{config.label}</Badge>;
}
```

#### 7.5.2 주문 상세

**커서 AI 프롬프트:**

```
주문 상세 페이지를 만들어줘.

요구사항:
- 주문 정보: 주문번호, 주문일, 상태
- 배송지 정보 (배송 처리에 필요)
- 상품 정보: 상품명, 옵션명, 수량, 단가 (1개 주문 = 1개 상품)
- 금액 정보: 상품 금액, 배송비, 총 금액
- 상태 변경 버튼
- 타임라인 (주문 → 확인 → 출고 → 완료)
```

**주의사항:**

```typescript
// ❌ 절대 표시하면 안 되는 정보 (소매 정보)
retailer.business_name; // 사업자명
retailer.phone; // 연락처
profiles.email; // 이메일

// ✅ 표시해도 되는 정보
order.order_number; // 주문번호
order.delivery_address; // 배송지 (주문 처리에 필요)
order.quantity; // 수량
order.total_amount; // 금액
order.request_note; // 요청사항
```

#### 7.5.3 주문 상태 변경

**커서 AI 프롬프트:**

```
주문 상태를 변경하는 함수를 만들어줘.

요구사항:
- 현재 상태에 따라 다음 상태로 변경
- pending → confirmed (접수 확인)
- confirmed → shipped (출고 처리)
- shipped → completed (완료)
- updated_at은 트리거가 자동 업데이트
- 낙관적 업데이트 (Optimistic Update)
```

**예상 코드:**

```typescript
// lib/supabase/queries/orders.ts
import { createClient } from "@/lib/supabase/client";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: newStatus,
      // updated_at은 트리거가 자동으로 업데이트
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

#### 7.5.4 실시간 주문 알림

**커서 AI 프롬프트:**

```
Supabase Realtime을 사용해 새 주문 알림을 구현해줘.

요구사항:
- orders 테이블의 INSERT 이벤트 구독
- 현재 도매점의 주문만 필터링
- Toast 알림 표시
- 주문 카운트 실시간 업데이트
```

**예상 코드:**

```typescript
// lib/supabase/realtime.ts
import { createClient } from "@/lib/supabase/client";

export function subscribeToNewOrders(
  wholesalerId: string,
  onNewOrder: (order: any) => void,
) {
  const supabase = createClient();

  const channel = supabase
    .channel("new-orders")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
        filter: `wholesaler_id=eq.${wholesalerId}`,
      },
      (payload) => {
        onNewOrder(payload.new);
      },
    )
    .subscribe();

  // 구독 해제 함수 반환
  return () => {
    supabase.removeChannel(channel);
  };
}
```

**사용 예시 (⚠️ Cleanup 필수!):**

```typescript
// app/wholesaler/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { subscribeToNewOrders } from "@/lib/supabase/realtime";

export default function DashboardPage() {
  const { toast } = useToast();
  const wholesalerId = "your-wholesaler-id"; // 실제로는 useWholesaler() 훅에서 가져옴

  useEffect(() => {
    const unsubscribe = subscribeToNewOrders(wholesalerId, (order) => {
      // 토스트 알림 표시
      toast({
        title: "새 주문이 들어왔습니다! 🎉",
        description: `주문번호: ${order.order_number}`,
        action: (
          <Button onClick={() => router.push(`/wholesaler/orders/${order.id}`)}>
            확인하기
          </Button>
        ),
      });

      // 주문 카운트 업데이트 등 추가 작업
    });

    // ⚠️ 필수: Cleanup 함수로 구독 해제 (메모리 누수 방지)
    return () => {
      console.log("🧹 Cleaning up order subscription");
      unsubscribe();
    };
  }, [wholesalerId]);

  return <div>{/* 대시보드 내용 */}</div>;
}
```

**⚠️ Realtime Cleanup 중요성:**

메모리 누수를 방지하기 위해 **모든 Realtime 구독**에서 반드시 cleanup 함수를 구현해야 합니다.

**Cleanup이 없을 때 발생하는 문제:**

- 페이지 이동 후에도 구독이 유지됨
- 메모리 사용량 증가
- 중복 알림 발생
- 장시간 사용 시 앱 크래시

**테스트 방법:**

1. Chrome DevTools > Performance > Memory
2. 페이지 이동 후 구독 해제 확인
3. 콘솔에서 cleanup 로그 확인
4. 장시간 사용 시 메모리 사용량 모니터링

---

### 7.6 정산 관리 (Settlements)

#### 7.6.0 정산 데이터 생성 프로세스 (확정됨 ✅)

**정산 데이터 자동 생성:**

결제 완료 직후 settlements 레코드가 자동으로 생성됩니다.

```typescript
// /api/payments/callback에서 결제 성공 시
async function createSettlement(order: Order) {
  const platformFeeRate = parseFloat(
    process.env.NEXT_PUBLIC_PLATFORM_FEE_RATE || "0.05",
  );
  const platformFee = Math.floor(order.total_amount * platformFeeRate);
  const wholesalerAmount = order.total_amount - platformFee;

  // 정산 예정일: 결제일 + 7일 (D+7)
  const scheduledPayoutAt = new Date(order.paid_at);
  scheduledPayoutAt.setDate(scheduledPayoutAt.getDate() + 7);

  await supabase.from("settlements").insert({
    order_id: order.id,
    wholesaler_id: order.wholesaler_id,
    order_amount: order.total_amount,
    platform_fee_rate: platformFeeRate,
    platform_fee: platformFee,
    wholesaler_amount: wholesalerAmount,
    status: "pending",
    scheduled_payout_at: scheduledPayoutAt.toISOString(),
  });
}
```

**확정된 정책:**

1. **생성 시점**: 결제 완료(paid_at) 직후
2. **수수료율**: 5% 고정 (환경 변수: `NEXT_PUBLIC_PLATFORM_FEE_RATE`)
3. **정산 예정일**: 결제일 + 7일 (D+7)
4. **정산 완료**: MVP에서는 관리자가 수동 처리 (자동 송금은 Phase 2)

**테스트 데이터 생성:**

```sql
-- 테스트용 정산 데이터 생성 (Supabase SQL Editor)
INSERT INTO settlements (
  order_id,
  wholesaler_id,
  order_amount,
  platform_fee_rate,
  platform_fee,
  wholesaler_amount,
  status,
  scheduled_payout_at
) VALUES (
  'order_uuid_here',
  'wholesaler_uuid_here',
  100000,
  0.05,
  5000,
  95000,
  'pending',
  NOW() + INTERVAL '7 days'
);
```

#### 7.6.1 정산 목록

**커서 AI 프롬프트:**

```
정산 관리 페이지를 만들어줘.

요구사항:
- 탭: 정산 예정 (scheduled), 정산 완료 (completed)
- 테이블 컬럼: 주문번호, 주문일, 정산 예정일, 주문 금액, 수수료, 정산 금액, 상태
- 필터: 날짜 범위, 상태
- 총 정산 예정 금액 표시
- 정산 상세 모달
```

**정산 계산 예시:**

```typescript
// 주문 금액: 100,000원
// 수수료율: 5% (0.05)
// 수수료 금액: 100,000 × 0.05 = 5,000원
// 정산 금액: 100,000 - 5,000 = 95,000원
```

---

### 7.7 문의 관리 (Inquiries) - ⚠️ 선택 기능

#### 7.7.0 문의 구조 이해하기 (필수 확인)

**데이터베이스 구조:**

현재 데이터베이스에는 두 가지 문의 관련 테이블이 있습니다:

1. **`inquiries` 테이블**: 간단한 Q&A 형태 (게시판 스타일)

   - `user_id` → `users.id` 참조
   - `status`: 'open', 'answered', 'closed'
   - `admin_reply`: 관리자 답변 (텍스트)
   - 구조: 1:1 문의-답변

2. **`cs_threads` + `cs_messages`**: 채팅 형태 (CS 봇 통합 가능)
   - `user_id` → `users.id` 참조
   - `status`: 'open', 'bot_handled', 'escalated', 'closed'
   - `sender_type`: 'user', 'bot', 'admin'
   - 구조: 1:N 대화형 (여러 메시지)

**⚠️ PM과 협의 필요:**

- [ ] 도매 페이지에서 어떤 테이블 사용할지 결정
  - Option A: `inquiries` 테이블 (간단한 Q&A)
  - Option B: `cs_threads` + `cs_messages` (CS 봇 통합)
  - Option C: 둘 다 지원
- [ ] 문의 유형 구분
  - 소매점 → 도매점 문의 (상품, 주문 관련)
  - 도매점 → 관리자 문의 (계정, 정산, 기술 지원)
- [ ] `user_id` 참조 확인 (`users` vs `profiles`)
- [ ] RLS 정책 설정 요청

**문의 유형 예시:**

```
소매점 → 도매점:
- "이 상품 재고 언제 들어오나요?"
- "주문 배송 언제 오나요?"
- "상품 사양이 다른 것 같은데요"

도매점 → 관리자:
- "정산이 늦게 들어왔어요"
- "계정 승인이 안 되었어요"
- "기술 지원이 필요해요"
```

#### 7.7.1 문의 목록 페이지

**커서 AI 프롬프트:**

```
문의 목록 페이지를 만들어줘.

요구사항:
- inquiries 테이블 사용 (또는 cs_threads)
- 탭: 미답변 (open), 답변완료 (answered), 종료 (closed)
- 테이블 컬럼: 문의일, 제목, 문의자(익명 코드), 상태, 액션
- 필터: 날짜 범위, 상태
- 검색: 제목, 내용
- 페이지네이션
- 실시간 업데이트 (새 문의 알림)
- ⚠️ 문의자 정보는 익명 코드만 표시 (소매점 정보 노출 금지)

파일: app/wholesaler/inquiries/page.tsx
```

**예상 코드 구조:**

```typescript
// app/wholesaler/inquiries/page.tsx
import { InquiryTable } from "@/components/wholesaler/Inquiries/InquiryTable";
import { InquiryFilter } from "@/components/wholesaler/Inquiries/InquiryFilter";

export default function InquiriesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">문의 관리</h1>

      {/* 필터 */}
      <InquiryFilter />

      {/* 문의 테이블 */}
      <InquiryTable />
    </div>
  );
}
```

#### 7.7.2 문의 상세 및 답변

**커서 AI 프롬프트:**

```
문의 상세 페이지를 만들어줘.

요구사항:
- 문의 내용 표시 (제목, 내용, 문의일)
- 문의자 정보는 익명 코드만 표시
- 답변 작성 폼 (관리자 또는 도매점만)
- 답변 완료 시 상태 변경 (open → answered)
- 답변 시간 기록 (replied_at)
- ⚠️ 소매점 실명/연락처 절대 노출 금지

파일: app/wholesaler/inquiries/[id]/page.tsx
```

**예상 코드 구조:**

```typescript
// app/wholesaler/inquiries/[id]/page.tsx
export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getInquiryById(id);

  return (
    <div className="p-6">
      {/* 문의 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>{inquiry.title}</CardTitle>
          <CardDescription>
            문의자: {inquiry.user.anonymous_code} {/* 익명 코드만 */}
            문의일: {formatDate(inquiry.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{inquiry.content}</p>
        </CardContent>
      </Card>

      {/* 답변 섹션 */}
      {inquiry.status === "open" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>답변 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <InquiryReplyForm inquiryId={id} />
          </CardContent>
        </Card>
      )}

      {/* 기존 답변 표시 */}
      {inquiry.admin_reply && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>답변</CardTitle>
            <CardDescription>
              답변일: {formatDate(inquiry.replied_at)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{inquiry.admin_reply}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

#### 7.7.3 실시간 알림

**커서 AI 프롬프트:**

```
문의 실시간 알림을 구현해줘.

요구사항:
- Supabase Realtime 구독 (inquiries 테이블 INSERT)
- 현재 도매점 관련 문의만 필터링
- Toast 알림 표시
- 헤더에 알림 아이콘 추가
- ⚠️ Cleanup 함수 필수 구현

파일: lib/supabase/realtime.ts (확장)
```

**예상 코드:**

```typescript
// lib/supabase/realtime.ts (기존 파일에 추가)
export function subscribeToNewInquiries(
  wholesalerId: string,
  onNewInquiry: (inquiry: any) => void,
) {
  const supabase = createClient();

  const channel = supabase
    .channel("new-inquiries")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "inquiries",
        // 필터: 자신의 상품/주문과 관련된 문의만
      },
      (payload) => {
        onNewInquiry(payload.new);
      },
    )
    .subscribe();

  // ⚠️ 필수: Cleanup 함수 반환
  return () => {
    console.log("🧹 Cleaning up inquiry subscription");
    supabase.removeChannel(channel);
  };
}
```

#### 7.7.4 RLS 정책 확인

**⚠️ 필수 확인 사항:**

- [ ] `inquiries` 테이블 RLS 정책 설정 확인
- [ ] 도매는 자신에게 온 문의만 조회 가능
- [ ] 관리자는 모든 문의 조회 가능
- [ ] 소매점 정보는 익명 코드만 표시

**예상 RLS 정책:**

```sql
-- 도매는 자신에게 온 문의만 조회
-- (문의가 자신의 상품/주문과 관련된 경우)
CREATE POLICY "wholesalers_select_own_inquiries" ON inquiries
FOR SELECT USING (
  -- 문의자가 자신의 상품을 구매한 소매점인 경우
  -- 또는 문의자가 자신인 경우 (도매 → 관리자)
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.wholesaler_id = (
      SELECT id FROM wholesalers
      WHERE user_id = (SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub')
    )
    AND o.retailer_id = inquiries.user_id
  )
  OR
  inquiries.user_id = (
    SELECT id FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- 도매는 답변 작성 가능 (자신에게 온 문의만)
CREATE POLICY "wholesalers_reply_inquiries" ON inquiries
FOR UPDATE USING (
  -- 위와 동일한 조건
) WITH CHECK (
  -- 답변 작성 시 상태 변경
  status IN ('answered', 'closed')
);
```

**주의사항:**

- ⚠️ **소매점 정보 노출 금지**: 문의자 정보는 익명 코드만 표시
- ⚠️ **RLS 정책 필수**: 다른 도매점의 문의는 조회 불가
- ⚠️ **Realtime Cleanup**: 메모리 누수 방지를 위해 반드시 cleanup 함수 구현

---

## 8. 커서 AI 활용 가이드

### 8.1 효과적인 프롬프트 작성법

#### ✅ 좋은 프롬프트 예시

```
상품 등록 폼을 만들어줘.

요구사항:
- react-hook-form + zod 사용
- 필드: 상품명, 카테고리, 가격, 재고, 설명
- 유효성 검증: 상품명 2글자 이상, 가격 0 이상
- 제출 시 Supabase에 저장
- shadcn/ui 컴포넌트 사용
- 에러 메시지 표시
- 로딩 상태 처리

파일: components/wholesaler/Products/ProductForm.tsx
```

**좋은 이유:**

- 구체적인 요구사항
- 사용할 라이브러리 명시
- 파일 경로 명시
- 필요한 기능 나열

#### ❌ 나쁜 프롬프트 예시

```
상품 폼 만들어줘
```

**나쁜 이유:**

- 너무 모호함
- 어떤 라이브러리를 사용할지 모름
- 어떤 필드가 필요한지 모름

### 8.2 단계별 개발 방법

#### 1단계: 큰 구조부터 시작

```
도매 페이지의 전체 레이아웃을 만들어줘.
- 사이드바 (왼쪽)
- 헤더 (상단)
- 메인 컨텐츠 (중앙)
```

#### 2단계: 세부 컴포넌트 개발

```
사이드바 컴포넌트를 만들어줘.
- 메뉴: 대시보드, 상품 관리, 주문 관리, 정산 관리
- 현재 경로 하이라이트
```

#### 3단계: 데이터 연동

```
Supabase에서 상품 목록을 가져오는 함수를 만들어줘.
- 현재 도매점의 상품만 가져오기
- 페이지네이션 지원
- 카테고리 필터
```

#### 4단계: 에러 처리 및 최적화

```
상품 목록 페이지에 에러 처리와 로딩 상태를 추가해줘.
- 로딩 중: 스켈레톤 표시
- 데이터 없음: EmptyState 표시
- 에러 발생: 에러 메시지 + 재시도 버튼
```

### 8.3 자주 사용할 프롬프트 템플릿

#### 페이지 생성

```
[페이지명]을 만들어줘.

요구사항:
- [구체적인 요구사항 나열]
- [사용할 라이브러리]
- [데이터 연동]

파일: app/wholesaler/[경로]/page.tsx
```

#### 컴포넌트 생성

```
[컴포넌트명] 컴포넌트를 만들어줘.

Props:
- [props 나열]

기능:
- [기능 나열]

파일: components/wholesaler/[경로]/[컴포넌트명].tsx
```

#### 함수 생성

```
[함수 기능 설명] 함수를 만들어줘.

매개변수:
- [매개변수 나열]

반환값:
- [반환값 설명]

에러 처리:
- [에러 케이스]

파일: lib/[경로]/[파일명].ts
```

### 8.4 커서 AI로 디버깅하기

#### 에러 발생 시

```
다음 에러가 발생했어:

[에러 메시지 붙여넣기]

파일: [파일 경로]

코드:
[에러 발생 코드 붙여넣기]

어떻게 고치면 될까?
```

#### 코드 리뷰 요청

```
다음 코드를 리뷰해줘:

[코드 붙여넣기]

확인할 점:
- 성능 문제
- 보안 이슈
- 베스트 프랙티스
- 개선 제안
```

### 8.5 컨텍스트 활용

커서 AI에게 파일을 참조시키려면:

```
@파일명 을 참고해서 비슷한 구조로 주문 목록 페이지를 만들어줘.

@components/wholesaler/Products/ProductTable.tsx
```

---

## 9. 디자이너 협업 가이드

### 9.1 디자이너에게 전달할 정보

#### 디자인 시스템 가이드

```markdown
# 디자인 가이드

## 컬러 팔레트

Primary (메인):

- primary-500: #3B82F6 (버튼, 링크)
- primary-600: #2563EB (hover)

Secondary:

- green-500: #10B981 (성공, 완료)
- yellow-500: #F59E0B (경고, 대기)
- red-500: #EF4444 (에러, 취소)

Gray Scale:

- gray-50: #F9FAFB (배경)
- gray-100: #F3F4F6 (카드 배경)
- gray-200: #E5E7EB (테두리)
- gray-500: #6B7280 (보조 텍스트)
- gray-900: #111827 (메인 텍스트)

## 타이포그래피

- H1: 24px, Bold
- H2: 20px, Bold
- H3: 18px, SemiBold
- Body: 14px, Regular
- Caption: 12px, Regular

## 간격 (Spacing)

4px 단위 사용: 4, 8, 12, 16, 24, 32, 48, 64px

## 컴포넌트

버튼:

- Primary: 파란 배경, 흰색 텍스트
- Secondary: 회색 테두리, 회색 텍스트
- Danger: 빨간 배경, 흰색 텍스트

카드:

- 배경: 흰색
- 테두리: 1px solid gray-200
- 둥근 모서리: 8px
- 그림자: shadow-sm

테이블:

- 헤더: 회색 배경 (gray-50)
- 행 구분: 테두리 (gray-200)
- hover: 밝은 회색 (gray-50)
```

### 9.2 레퍼런스 사이트

디자이너와 함께 보면 좋은 사이트:

1. **shadcn/ui 예시**: https://ui.shadcn.com/examples/dashboard
2. **Linear**: https://linear.app (프로젝트 관리)
3. **Stripe Dashboard**: https://dashboard.stripe.com (결제 대시보드)
4. **Vercel**: https://vercel.com/dashboard (배포 대시보드)
5. **Notion**: https://notion.so (노션 페이지)

### 9.3 피그마 핸드오프

디자이너가 디자인을 완성하면:

1. **피그마 링크 받기**
2. **Inspect 모드**로 CSS 값 확인:
   - 컬러: Hex 코드
   - 간격: px 값
   - 폰트: 크기, 굵기
3. **Tailwind 클래스로 변환**:
   - `#3B82F6` → `bg-blue-500`
   - `16px` → `p-4`
   - `24px font bold` → `text-2xl font-bold`

### 9.4 주간 디자인 리뷰

**금요일 오후 (30분)**

체크리스트:

- [ ] 이번 주 구현된 페이지 확인
- [ ] 디자인과 실제 구현 비교
- [ ] 수정 사항 논의
- [ ] 다음 주 디자인 우선순위 결정

---

## 10. 보안 및 주의사항

### 10.1 도매 정보 노출 금지 ⚠️

**절대 소매 페이지에 노출하면 안 되는 정보:**

```typescript
// ❌ 절대 금지!
wholesaler.business_name; // 사업자명
wholesaler.business_number; // 사업자번호
wholesaler.representative; // 대표자명
wholesaler.phone; // 연락처
wholesaler.address; // 주소
wholesaler.bank_account; // 계좌번호
profiles.email; // 이메일
```

**소매 페이지에 표시할 수 있는 정보:**

```typescript
// ✅ 허용
wholesaler.anonymous_code; // 익명 코드 (예: "VENDOR-001")
product.name; // 상품명
product.price; // 가격
product.shipping_fee; // 배송비
product.specification; // 규격
```

### 10.2 RLS 정책 확인

모든 쿼리에서 RLS가 작동하는지 확인:

```typescript
// Supabase 쿼리 시 자동으로 현재 사용자의 데이터만 조회됨
const { data } = await supabase.from("products").select("*");
// RLS 정책에 의해 자동으로 wholesaler_id 필터링됨
```

**RLS 테스트:**

1. 도매 A 계정으로 로그인
2. 도매 B의 상품을 조회하려고 시도
3. 조회되지 않아야 함 (RLS 정책 작동)

### 10.3 인증 확인

모든 페이지에서 인증 확인:

```typescript
// app/wholesaler/layout.tsx
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function WholesalerLayout({ children }) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // TODO: 역할 확인
  // const role = await getUserRole(userId);
  // if (role !== 'wholesaler') {
  //   redirect('/unauthorized');
  // }

  return <div>{children}</div>;
}
```

### 10.4 입력값 검증

모든 사용자 입력은 검증:

```typescript
// zod 스키마로 검증
const productSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().min(0),
  stock: z.number().int().min(0),
});

// 프론트엔드에서 검증
const form = useForm({
  resolver: zodResolver(productSchema),
});

// 백엔드에서도 검증 (Supabase Edge Function)
```

### 10.5 에러 메시지

사용자에게 친절한 에러 메시지:

```typescript
// ❌ 나쁜 예
throw new Error("Database query failed");

// ✅ 좋은 예
throw new Error(
  "상품을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
);
```

---

## 11. 트러블슈팅

### 11.1 자주 발생하는 문제

#### 문제 1: Supabase RLS 오류

**증상:**

```
Error: new row violates row-level security policy
```

**원인:** RLS 정책이 INSERT/UPDATE를 허용하지 않음

**해결:**

```sql
-- INSERT 정책 추가
CREATE POLICY "products_insert_own" ON products
FOR INSERT WITH CHECK (
  wholesaler_id IN (
    SELECT id FROM wholesalers WHERE user_id = auth.jwt() ->> 'sub'
  )
);
```

#### 문제 2: 이미지 업로드 실패

**증상:**

```
Error: Failed to upload image
```

**원인:** Storage 버킷이 없거나 권한 없음

**해결:**

1. Supabase Dashboard → Storage → Create Bucket
2. Bucket name: `product-images`
3. Public bucket: Yes
4. RLS 정책 설정

#### 문제 3: Realtime 구독 작동 안 함

**증상:** 새 주문 알림이 표시되지 않음

**원인:** Realtime이 활성화되지 않음

**해결:**

```sql
-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### 11.2 디버깅 팁

#### console.log 활용

```typescript
console.log("🔍 디버그:", {
  wholesalerId,
  products,
  error,
});
```

#### Supabase 쿼리 디버깅

```typescript
const { data, error } = await supabase
  .from("products")
  .select("*")
  .eq("wholesaler_id", wholesalerId);

console.log("📊 Supabase 응답:", { data, error });
```

#### React DevTools

- Chrome 확장 프로그램 설치
- 컴포넌트 props/state 확인
- 성능 프로파일링

### 11.3 도움 받기

#### 1. 커서 AI에게 질문

```
다음 에러가 발생했어:
[에러 메시지]

코드:
[코드 붙여넣기]

어떻게 해결하면 될까?
```

#### 2. 팀원에게 질문

- 소매 개발자: 데이터 구조 관련
- PM: DB 스키마 관련
- 디자이너: UI/UX 관련

#### 3. 공식 문서 확인

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Clerk: https://clerk.com/docs
- shadcn/ui: https://ui.shadcn.com

---

## 12. 체크리스트

### 12.1 Week 1-2 체크리스트

**⚠️ 필수 항목 (반드시 완료):**

- [ ] **profiles 테이블 구조 PM과 확정**
- [ ] **Anonymous Code 자동 생성 로직 구현**
- [ ] **Supabase Storage RLS 정책 설정 완료**
- [ ] **정지된 계정 페이지 구현**

**환경 세팅:**

- [ ] shadcn/ui 설치
- [ ] 필수 라이브러리 설치
- [ ] 폴더 구조 생성

**팀 협업:**

- [ ] PM과 DB 스키마 확정
- [ ] profiles 테이블 구조 확인
- [ ] Supabase Storage RLS 정책 요청
- [ ] Anonymous Code 생성 방법 협의
- [ ] 소매 개발자와 DB 테이블 구조 협의 (⚠️ DB만 공유, 프로젝트는 별도)
- [ ] 디자이너에게 가이드 전달

**인증 및 온보딩:**

- [x] ~~역할 선택 페이지 구현~~ (❌ 불필요 - 도매 전용 프로젝트)
- [x] 사업자 정보 입력 폼 구현 ✅
- [x] 유효성 검증 스키마 작성 ✅
- [x] 승인 대기 페이지 구현 ✅
- [ ] 실시간 승인 상태 확인 기능
- [ ] 도매 레이아웃에서 승인 상태 확인 로직 추가
- [x] 정지된 계정 페이지 구현 ✅
- [x] 루트 페이지 리다이렉트 구현 (`/` → `/sign-in/wholesaler`) ✅

**레이아웃:**

- [ ] 사이드바 완성
- [ ] 헤더 완성
- [ ] 레이아웃 통합
- [ ] 빈 페이지 생성

**유틸리티:**

- [ ] 날짜 포맷 함수
- [ ] 금액 포맷 함수
- [ ] 상수 정의 (은행 목록, 지역 목록 포함)

### 12.2 Week 3-4 체크리스트

**⚠️ 필수 항목 (반드시 완료):**

- [ ] **Gemini API Rate Limiting 처리 구현**
- [ ] **공공데이터 API 캐싱 전략 구현**

**상품 목록:**

- [ ] 테이블 UI
- [ ] 데이터 조회
- [ ] 필터 기능
- [ ] 검색 기능
- [ ] 페이지네이션

**상품 등록:**

- [ ] 폼 UI
- [ ] 유효성 검증
- [ ] 이미지 업로드
- [ ] API 연동

**상품 수정:**

- [ ] 폼 UI
- [ ] 기존 데이터 불러오기
- [ ] API 연동

**테스트:**

- [ ] CRUD 동작 확인
- [ ] 이미지 업로드 확인
- [ ] 소매 페이지와 연동 확인

**시세 조회 (필수 기능):**

- [ ] 공공데이터포털 API 키 발급 (전국 공영도매시장 실시간 경매정보)
- [ ] API 함수 작성 (`lib/api/market-prices.ts`)
- [ ] **캐싱 전략 구현 (30분 캐싱)**
- [ ] 시세 조회 페이지 UI (`app/wholesaler/market-prices/page.tsx`)
- [ ] 시세 테이블 컴포넌트 (PriceTable)
- [ ] 시세 검색 필터 컴포넌트 (PriceFilter)
- [ ] 가격 추이 차트 (recharts)
- [ ] 상품 등록 페이지에 "시세 참고" 버튼
- [ ] 캐시 만료 시간 표시 UI

**AI 상품명 표준화 (필수 기능):**

- [ ] Google AI Studio에서 Gemini API 키 발급
- [ ] 환경 변수에 GEMINI_API_KEY 설정
- [ ] AI 표준화 API 함수 작성 (`lib/api/ai-standardize.ts`)
- [ ] **Rate Limiting 처리 (429 에러)**
- [ ] AIStandardizeButton 컴포넌트 구현
- [ ] 상품 등록/수정 폼에 AI 표준화 버튼 통합
- [ ] 표준화 결과 모달 UI 구현
- [ ] 신뢰도(confidence) 표시 기능
- [ ] 에러 처리 및 로딩 상태 구현
- [ ] **재시도 버튼 제공**
- [ ] 배치 표준화 기능 - `standardizeProductNamesBatch()` (선택 기능)
- [ ] AI 표준화 사용량 모니터링 설정

### 12.3 Week 5-6 체크리스트

**⚠️ 필수 항목 (반드시 완료):**

- [ ] **모든 Realtime 구독에서 cleanup 함수 구현**
- [ ] **메모리 누수 테스트 완료**
- [ ] **주문 구조 이해**: 1 order = 1 product (order_items 없음)
- [ ] **장바구니 → 주문 변환 로직 구현**
  - [ ] 장바구니 상품들을 순회
  - [ ] 각 상품마다 별도 order 생성
  - [ ] order_number 생성 로직 (중복 방지)
  - [ ] 여러 주문 생성 안내 UI

**주문 목록:**

- [ ] 테이블 UI
- [ ] 상태별 탭
- [ ] 데이터 조회
- [ ] 필터 기능

**주문 상세:**

- [ ] 상세 페이지 UI
- [ ] 주문 정보 표시
- [ ] 배송지 정보 표시

**주문 상태 변경:**

- [ ] 상태 변경 버튼
- [ ] API 연동
- [ ] 타임스탬프 기록

**실시간 알림:**

- [ ] Realtime 구독 설정
- [ ] **useEffect cleanup 함수 구현**
- [ ] Toast 알림
- [ ] 카운트 업데이트
- [ ] **구독 해제 로그 추가 (디버깅용)**
- [ ] **메모리 누수 테스트**

### 12.4 Week 7 체크리스트

**⚠️ 필수 항목 (개발 전 반드시 확인):**

- [ ] **PM과 정산 데이터 생성 프로세스 확정**
- [ ] **platform_fee_rate 값 확인**
- [ ] **scheduled_payout_at 계산 로직 확정**
- [ ] **테스트 데이터 생성 방법 확인**

**대시보드:**

- [ ] 통계 카드
- [ ] 실제 데이터 연동
- [ ] 최근 주문 목록
- [ ] 재고 부족 알림

**정산:**

- [ ] 정산 목록 UI
- [ ] 정산 예정/완료 탭
- [ ] 정산 데이터 조회 (결제 완료 시 자동 생성됨)
- [ ] 정산 계산 로직 확인:
  - [ ] platform_fee_rate: 5% (환경 변수)
  - [ ] scheduled_payout_at: D+7
  - [ ] wholesaler_amount = order_amount - platform_fee
- [ ] ⚠️ 자동 송금 기능 제외 (MVP 범위 밖)

### 12.5 Week 8 체크리스트

**⚠️ 필수 테스트:**

- [ ] **반응형 디자인 테스트 (모바일, 태블릿, 데스크톱)**
- [ ] **Realtime 메모리 누수 테스트**
- [ ] **실제 디바이스 테스트 (iPhone, Android)**

**테스트:**

- [ ] 인증 플로우 테스트 (회원가입 → 승인 대기 → 로그인)
- [ ] 승인 전 대시보드 접근 차단 확인
- [ ] 실시간 승인 알림 동작 확인
- [ ] 전체 기능 테스트
- [ ] 소매 페이지와 통합 테스트
- [ ] RLS 보안 테스트
- [ ] 에러 핸들링 확인

**반응형 디자인 테스트 (필수):**

- [ ] **모바일 (375px ~ 640px)**
  - [ ] 사이드바 햄버거 메뉴
  - [ ] 테이블 가로 스크롤 또는 카드형
  - [ ] 터치 친화적 버튼 크기
- [ ] **태블릿 (768px ~ 1024px)**
  - [ ] 2열 그리드 레이아웃
  - [ ] 축소 가능한 사이드바
- [ ] **데스크톱 (1280px 이상)**
  - [ ] 전체 레이아웃 정상 표시
- [ ] **실제 디바이스 테스트**
  - [ ] iPhone (Safari)
  - [ ] Android (Chrome)
  - [ ] iPad (Safari)

**메모리 관리 테스트:**

- [ ] Chrome DevTools > Memory 프로파일링
- [ ] 페이지 이동 후 구독 해제 확인
- [ ] cleanup 로그 확인
- [ ] 장시간 사용 시 메모리 증가 확인

**최적화:**

- [ ] 이미지 최적화 (Next.js Image)
- [ ] 로딩 속도 개선 (3초 이내)
- [ ] 코드 스플리팅
- [ ] 코드 정리

**문서화:**

- [ ] README 작성
- [ ] 주석 추가 (주요 함수)
- [ ] 배포 가이드

---

## 📚 참고 자료

### 공식 문서

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Clerk Docs](https://clerk.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Table](https://tanstack.com/table/latest)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Google Gemini API](https://ai.google.dev/docs) - AI 상품명 표준화
- [Google AI Studio](https://aistudio.google.com) - API 키 발급
- [공공데이터포털](https://www.data.go.kr) - 농수산물 시세 API

### 튜토리얼

- [Next.js + Supabase 튜토리얼](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Clerk + Next.js 튜토리얼](https://clerk.com/docs/quickstarts/nextjs)
- [shadcn/ui 시작하기](https://ui.shadcn.com/docs)

### 커뮤니티

- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com)

---

## 🎯 마지막 팁

### ⚠️ 반드시 확인할 사항 (개발 시작 전)

**Week 1에 반드시 확인:**

- [ ] profiles 테이블 구조 PM과 확정
- [ ] Anonymous Code 자동 생성 방법 결정
- [ ] Supabase Storage RLS 정책 설정 확인
- [ ] 모든 환경 변수 설정 완료

**각 주차 시작 전 확인:**

- [ ] **Week 3**: Gemini API 키 발급 및 Rate Limit 이해
- [ ] **Week 4**: 공공데이터 API 키 발급 및 캐싱 계획
- [ ] **Week 5**: Realtime cleanup 패턴 숙지
- [ ] **Week 7**: PM과 정산 프로세스 확정

### 1. 작은 단위로 개발하기

한 번에 큰 기능을 만들지 말고, 작은 단위로 나눠서 개발하세요.

```
❌ 한 번에: 상품 관리 전체
✅ 단계별:
1. 상품 목록 UI만
2. 데이터 연동
3. 필터 기능
4. 검색 기능
```

### 2. 자주 커밋하기

작은 단위로 자주 커밋하세요.

```bash
git add .
git commit -m "feat: 상품 목록 UI 추가"
git push origin your-branch
```

### 3. 막히면 물어보기

30분 이상 막혔다면 팀원이나 커서 AI에게 질문하세요!

### 4. 휴식 취하기

50분 작업 → 10분 휴식 (포모도로 기법)

### 5. 즐기기! 🎉

처음 만드는 프로젝트는 배우는 과정입니다. 완벽하지 않아도 괜찮아요!

---

**이 가이드를 참고하면서 하나씩 진행해보세요. 화이팅! 💪**
