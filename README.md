<div align="center">
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Next.JS_15-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=black" alt="next.js" />
    <img src="https://img.shields.io/badge/-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="react" />
    <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
    <img src="https://img.shields.io/badge/-Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="tailwind" />
    <img src="https://img.shields.io/badge/-Clerk-6C47FF?style=for-the-badge&logoColor=white&logo=clerk" alt="clerk" />
    <img src="https://img.shields.io/badge/-Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="supabase" />
  </div>

  <h1 align="center">FarmToBiz</h1>
  <h3 align="center">도매-소매 중개 플랫폼</h3>

  <p align="center">
    AI 기반 도매-소매 중개 플랫폼 (도매 업체 전용 프로젝트)
  </p>
</div>

## 📋 목차

1. [소개](#소개)
2. [기술 스택](#기술-스택)
3. [주요 기능](#주요-기능)
4. [시작하기](#시작하기)
5. [추가 설정 및 팁](#추가-설정-및-팁)
6. [프로젝트 구조](#프로젝트-구조)

## 소개

FarmToBiz는 도매 업체와 소매점을 연결하는 AI 기반 중개 플랫폼입니다. 이 프로젝트는 도매 업체 전용 웹 애플리케이션으로, 상품 관리, 주문 처리, 정산 관리 등의 기능을 제공합니다.

**프로젝트 구조:**

- **도매 프로젝트** (이 프로젝트): `wholesale.farmtobiz.com` - 도매 업체 전용
- **소매 프로젝트**: `retail.farmtobiz.com` - 소매점 전용 (별도 프로젝트)
- **메인 랜딩**: `www.farmtobiz.com` - 역할 선택 및 안내 (별도 프로젝트)
- **공유 데이터베이스**: Supabase (3개 프로젝트 공유)

**핵심 특징:**

- ✨ Next.js 15 + React 19 최신 기능 활용
- 🔐 Clerk와 Supabase 네이티브 통합 (2025년 권장 방식)
- 🤖 AI 기반 상품명 표준화 (Google Gemini 2.5 Flash)
- 📊 실시간 시세 조회 (공공 API 연동)
- 🎨 Tailwind CSS v4 + shadcn/ui
- 📱 완전한 반응형 디자인
- 🌐 한국어 지원 (Clerk 한국어 로컬라이제이션)

## 기술 스택

### 프레임워크 & 라이브러리

- **[Next.js 15](https://nextjs.org/)** - React 프레임워크 (App Router, Server Components)
- **[React 19](https://react.dev/)** - UI 라이브러리
- **[TypeScript](https://www.typescriptlang.org/)** - 타입 안정성

### 인증 & 데이터베이스

- **[Clerk](https://clerk.com/)** - 사용자 인증 및 관리
  - Google, 이메일 등 다양한 로그인 방식 지원
  - 한국어 UI 지원
  - Supabase와 네이티브 통합
- **[Supabase](https://supabase.com/)** - PostgreSQL 데이터베이스
  - 실시간 데이터 동기화
  - Row Level Security (RLS)
  - 파일 스토리지

### UI & 스타일링

- **[Tailwind CSS v4](https://tailwindcss.com/)** - 유틸리티 우선 CSS 프레임워크
- **[shadcn/ui](https://ui.shadcn.com/)** - 재사용 가능한 컴포넌트 라이브러리
- **[Radix UI](https://www.radix-ui.com/)** - 접근성 높은 헤드리스 컴포넌트
- **[lucide-react](https://lucide.dev/)** - 아이콘 라이브러리

### 폼 & 검증

- **[React Hook Form](https://react-hook-form.com/)** - 폼 상태 관리
- **[Zod](https://zod.dev/)** - 스키마 검증

## 주요 기능

### 🏪 도매 업체 기능

- **회원가입 및 인증**: 사업자 정보 입력, 관리자 승인 대기
- **대시보드**: 오늘의 주문, 출고 예정, 정산 요약 보기
- **상품 관리**: 상품 등록/수정/비활성화, 이미지 업로드
- **AI 상품명 표준화**: Gemini 2.5 Flash로 상품명 자동 표준화 및 카테고리 추천
- **시세 조회**: 공공 API 연동 실시간 농수산물 경매가격 조회
- **주문 관리**: 주문 확인 및 상태 변경 (접수 → 출고 → 완료)
- **정산 관리**: 정산 예정/완료 내역 조회
- **문의 관리**: 소매점 및 관리자와의 문의 처리
- **실시간 알림**: 새 주문 알림, 승인 상태 변경 알림

### 👨‍💼 관리자 기능

- **도매 업체 승인**: 신규 도매 업체 가입 승인/거부
- **계정 관리**: 도매/소매 계정 관리 및 정지
- **CS 통합 관리**: 문의사항 통합 관리 및 답변
- **공지사항 관리**: 도매 업체 대상 공지사항 작성
- **FAQ 관리**: 자주 묻는 질문 관리
- **감사 로그**: 관리자 액션 추적 및 기록

### 🔐 인증 시스템

- Clerk를 통한 안전한 사용자 인증
- 소셜 로그인 지원 (Google 등)
- Clerk 사용자 자동으로 Supabase DB에 동기화
- 한국어 UI 지원

### 🗄️ 데이터베이스 통합

- Clerk 토큰 기반 Supabase 인증 (JWT 템플릿 불필요)
- 환경별 Supabase 클라이언트 분리:
  - Client Component용 (`useClerkSupabaseClient`)
  - Server Component용 (`createClerkSupabaseClient`)
  - 관리자 권한용 (`createServiceRoleClient`)
- SQL 마이그레이션 시스템
- Row Level Security (RLS) 정책 적용

### 🎨 UI/UX

- shadcn/ui 기반 모던 컴포넌트
- 완전한 반응형 디자인
- 다크/라이트 모드 지원 가능
- 접근성 준수 (WCAG)

### 🏗️ 아키텍처

- Server Actions 우선 사용 (`actions/` 디렉토리)
- 타입 안전성 보장 (TypeScript strict mode)
- 모듈화된 코드 구조
- Next.js 15 최신 패턴 적용

## 시작하기

### 필수 요구사항

시스템에 다음이 설치되어 있어야 합니다:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) (v18 이상)
- [pnpm](https://pnpm.io/) (권장 패키지 매니저)

```bash
# pnpm 설치
npm install -g pnpm
```

### 프로젝트 초기화

다음 단계를 순서대로 진행하세요:

#### 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속하여 로그인
2. **"New Project"** 클릭
3. Organization 선택 (없으면 새로 생성)
4. 프로젝트 정보 입력:
   - **Name**: 원하는 프로젝트 이름
   - **Database Password**: 안전한 비밀번호 생성 (기억할 필요 없음, Supabase가 관리)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 서비스용)
   - **Pricing Plan**: Free 또는 Pro 선택
5. **"Create new project"** 클릭하고 프로젝트가 준비될 때까지 대기 (~2분)

#### 2. Clerk 프로젝트 생성

1. [Clerk Dashboard](https://dashboard.clerk.com/)에 접속하여 로그인
2. **"Create application"** 클릭
3. 애플리케이션 정보 입력:
   - **Application name**: 원하는 이름 (예: `FarmToBiz`)
   - **Sign-in options**: Email, Google 등 원하는 인증 방식 선택
4. **"Create application"** 클릭
5. Quick Start 화면에서 **"Continue in Dashboard"** 클릭

#### 3. Clerk + Supabase 통합

> **중요**: 2025년 4월부터 Clerk의 네이티브 Supabase 통합을 사용합니다. JWT Template은 더 이상 필요하지 않습니다.

**3-1. Clerk Frontend API URL 확인**

1. Clerk Dashboard → **API Keys** 메뉴
2. **"Frontend API"** URL 복사 (예: `https://your-app-12.clerk.accounts.dev`)
   - 이 URL을 메모해두세요 (다음 단계에서 사용)

**3-2. Supabase에서 Clerk 인증 제공자 설정**

1. Supabase Dashboard로 돌아가기
2. 프로젝트 선택 → **Settings** → **Authentication** → **Providers**
3. 페이지 하단으로 스크롤하여 **"Third-Party Auth"** 섹션 찾기
4. **"Enable Custom Access Token"** 또는 **"Add Provider"** 클릭
5. 다음 정보 입력:

   - **Provider Name**: `Clerk` (또는 원하는 이름)
   - **JWT Issuer (Issuer URL)**:

     ```
     https://your-app-12.clerk.accounts.dev
     ```

     (`your-app-12` 부분을 실제 Clerk Frontend API URL로 교체)

   - **JWKS Endpoint (JWKS URI)**:
     ```
     https://your-app-12.clerk.accounts.dev/.well-known/jwks.json
     ```
     (동일하게 실제 URL로 교체)

6. **"Save"** 또는 **"Add Provider"** 클릭

**3-3. 통합 확인**

[Clerk 공식 통합 가이드](https://clerk.com/docs/guides/development/integrations/databases/supabase)에서 추가 정보를 확인할 수 있습니다.

#### 4. Supabase Storage 생성 및 설정

1. Supabase Dashboard → **Storage** 메뉴
2. **"New bucket"** 클릭
3. 버킷 정보 입력:
   - **Name**: `uploads` (`.env.example`과 동일하게)
   - **Public bucket**: 필요에 따라 선택
     - Public: 누구나 URL로 파일 접근 가능
     - Private: 인증된 사용자만 접근 (RLS 정책 필요)
4. **"Create bucket"** 클릭

#### 5. 데이터베이스 스키마 적용

1. Supabase Dashboard → **SQL Editor** 메뉴
2. **"New query"** 클릭
3. `supabase/migrations/setup_schema.sql` 파일 내용을 복사하여 붙여넣기
4. **"Run"** 클릭하여 실행
5. 성공 메시지 확인 (`Success. No rows returned`)
6. 추가 마이그레이션 파일들도 순서대로 적용 (필요시)

**주요 테이블:**

- `profiles`: Clerk 사용자와 동기화되는 사용자 정보 및 역할 관리
- `wholesalers`: 도매 업체 정보
- `products`: 상품 정보
- `orders`: 주문 정보
- `order_items`: 주문 상세 항목
- `settlements`: 정산 정보
- `inquiries`: 문의사항
- `announcements`: 공지사항
- `faqs`: 자주 묻는 질문
- 기타 관련 테이블들

#### 6. 환경 변수 설정

**6-1. 저장소 클론 및 의존성 설치**

```bash
git clone <your-repository-url>
cd farmtobiz
pnpm install
```

**6-2. .env 파일 생성**

```bash
cp .env.example .env
```

**6-3. Supabase 환경 변수 설정**

1. Supabase Dashboard → **Settings** → **API**
2. 다음 값들을 복사하여 `.env` 파일에 입력:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="<Project URL>"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon public key>"
   SUPABASE_SERVICE_ROLE_KEY="<service_role secret key>"
   NEXT_PUBLIC_STORAGE_BUCKET="uploads"
   ```

> **⚠️ 주의**: `service_role` 키는 모든 RLS를 우회하는 관리자 권한이므로 절대 공개하지 마세요!

**6-4. Clerk 환경 변수 설정**

1. Clerk Dashboard → **API Keys**
2. 다음 값들을 복사하여 `.env` 파일에 입력:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<Publishable Key>"
   CLERK_SECRET_KEY="<Secret Key>"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
   ```

#### 7. Cursor MCP 설정 (선택사항)

> Cursor AI를 사용하는 경우, Supabase MCP 서버를 설정하면 AI가 데이터베이스를 직접 조회하고 관리할 수 있습니다.

**7-1. Supabase Access Token 생성**

1. Supabase Dashboard → 우측 상단 프로필 아이콘 클릭
2. **Account Settings** → **Access Tokens**
3. **"Generate new token"** 클릭
4. Token name 입력 (예: `cursor-mcp`)
5. 생성된 토큰 복사 (다시 볼 수 없으므로 안전한 곳에 보관)

**7-2. .cursor/mcp.json 설정**

`.cursor/mcp.json` 파일을 열고 `your_supabase_access_token` 부분을 실제 토큰으로 교체:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      ]
    }
  }
}
```

**7-3. Cursor 재시작**

Cursor를 완전히 종료하고 다시 실행하여 MCP 서버 설정을 적용합니다.

#### 8. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

**주요 페이지:**

- `/`: 홈페이지
- `/wholesaler/dashboard`: 도매 업체 대시보드
- `/wholesaler/products`: 상품 관리
- `/wholesaler/orders`: 주문 관리
- `/wholesaler/settlements`: 정산 관리
- `/wholesaler/market-prices`: 시세 조회
- `/admin/dashboard`: 관리자 대시보드
- `/admin/wholesalers`: 도매 업체 관리
- `/admin/cs`: CS 통합 관리

**테스트 페이지:**

- `/auth-test`: Clerk + Supabase 인증 통합 테스트
- `/storage-test`: Supabase Storage 업로드 테스트

### 개발 명령어

```bash
# 개발 서버 실행 (Turbopack)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린팅
pnpm lint
```

## 추가 설정 및 팁

### Clerk 한국어 설정

프로젝트에 이미 Clerk 한국어 로컬라이제이션이 적용되어 있습니다. `app/layout.tsx`의 `ClerkProvider`에서 `koKR` locale이 설정되어 있습니다.

### Supabase RLS (Row Level Security) 정책

프로젝트의 모든 테이블에는 RLS 정책이 설정되어 있습니다. 개발 중에는 RLS를 비활성화할 수 있으나, 프로덕션에서는 반드시 활성화해야 합니다.

**RLS 정책 파일:**

- `supabase/RLS_POLICIES_FIXED.sql`: 전체 RLS 정책 정의

**주요 정책 원칙:**

- 도매 업체는 자신의 데이터만 조회/수정 가능
- 관리자는 모든 데이터 접근 가능
- 소매점 정보는 도매 업체에 노출되지 않음 (민감 정보 보호)

**개발 환경에서 RLS 비활성화:**

```sql
-- 개발 중 RLS 비활성화 (프로덕션에서는 사용 금지)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

**프로덕션 배포 전 확인사항:**

1. 모든 테이블에 RLS 활성화 확인
2. 적절한 정책이 설정되어 있는지 확인
3. 테스트 계정으로 권한 테스트 수행

### 추가 로그인 방식 설정

Clerk에서 추가 로그인 방식을 활성화하려면:

1. Clerk Dashboard → **User & Authentication** → **Social Connections**
2. 원하는 제공자 선택 (Google, GitHub, Discord 등)
3. OAuth 자격 증명 입력 (제공자 개발자 콘솔에서 생성)
4. **Enable** 클릭

## 프로젝트 구조

```
farmtobiz/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련 페이지
│   │   ├── sign-in/             # 로그인
│   │   ├── sign-up/             # 회원가입
│   │   └── wholesaler-onboarding/ # 도매 업체 온보딩
│   ├── admin/                    # 관리자 페이지
│   │   ├── dashboard/           # 관리자 대시보드
│   │   ├── wholesalers/          # 도매 업체 관리
│   │   ├── retailers/           # 소매점 관리
│   │   ├── cs/                  # CS 통합 관리
│   │   ├── announcements/       # 공지사항 관리
│   │   ├── faqs/                # FAQ 관리
│   │   └── audit-logs/          # 감사 로그
│   ├── wholesaler/               # 도매 업체 페이지
│   │   ├── dashboard/           # 도매 대시보드
│   │   ├── products/            # 상품 관리
│   │   ├── orders/              # 주문 관리
│   │   ├── settlements/         # 정산 관리
│   │   ├── market-prices/       # 시세 조회
│   │   ├── inquiries/           # 문의 관리
│   │   └── settings/            # 설정
│   ├── api/                      # API Routes
│   │   ├── sync-user/           # 사용자 동기화
│   │   ├── market-prices/       # 시세 API
│   │   ├── ai/                  # AI 표준화 API
│   │   ├── payments/            # 결제 API
│   │   └── admin/               # 관리자 API
│   ├── layout.tsx               # Root Layout
│   ├── page.tsx                 # 홈페이지
│   └── globals.css              # 전역 스타일 (Tailwind v4)
│
├── actions/                      # Server Actions
│   ├── admin/                   # 관리자 액션
│   │   ├── account-management.ts
│   │   ├── wholesaler-approval.ts
│   │   ├── announcements.ts
│   │   └── cs-reply.ts
│   └── wholesaler/              # 도매 업체 액션
│       ├── create-wholesaler.ts
│       ├── update-product.ts
│       ├── update-order-status.ts
│       └── create-inquiry.ts
│
├── components/                   # React 컴포넌트
│   ├── ui/                      # shadcn/ui 컴포넌트
│   ├── providers/               # Context Providers
│   └── [기타 컴포넌트들]
│
├── lib/                          # 유틸리티 및 설정
│   ├── supabase/                # Supabase 클라이언트들
│   │   ├── clerk-client.ts      # Client Component용
│   │   ├── server.ts            # Server Component용
│   │   ├── service-role.ts      # 관리자용
│   │   └── client.ts            # 공개 데이터용
│   ├── api/                     # 외부 API 클라이언트
│   │   └── market-prices.ts     # 시세 API
│   ├── payments/                # 결제 관련
│   ├── utils/                   # 유틸리티 함수
│   └── validation/              # 검증 스키마
│
├── hooks/                        # Custom React Hooks
│   ├── use-sync-user.ts         # 사용자 동기화
│   ├── use-wholesaler.ts        # 도매 업체 데이터
│   ├── use-market-prices.ts     # 시세 조회
│   └── useDashboardStats.ts     # 대시보드 통계
│
├── types/                        # TypeScript 타입 정의
│   ├── database.ts              # 데이터베이스 타입
│   ├── wholesaler.ts            # 도매 업체 타입
│   ├── product.ts               # 상품 타입
│   ├── order.ts                 # 주문 타입
│   └── [기타 타입들]
│
├── supabase/                     # Supabase 관련 파일
│   ├── migrations/              # 데이터베이스 마이그레이션
│   │   ├── setup_schema.sql    # 초기 스키마
│   │   └── [마이그레이션 파일들]
│   └── RLS_POLICIES_FIXED.sql  # RLS 정책 정의
│
├── docs/                         # 프로젝트 문서
│   ├── PRD.md                   # 제품 요구사항 문서
│   ├── TODO.md                   # 개발 TODO
│   ├── admin/                    # 관리자 가이드
│   └── Wholesaler/              # 도매 업체 가이드
│
├── .cursor/                      # Cursor AI 규칙
│   └── rules/                   # 개발 컨벤션 및 가이드
│
├── middleware.ts                 # Next.js 미들웨어 (Clerk)
├── AGENTS.md                     # AI 에이전트용 프로젝트 가이드
└── README.md                     # 프로젝트 README
```

### 주요 파일 설명

- **`middleware.ts`**: Clerk 인증 미들웨어 설정 및 라우트 보호
- **`app/layout.tsx`**: ClerkProvider와 SyncUserProvider 설정
- **`lib/supabase/`**: 환경별 Supabase 클라이언트 (매우 중요!)
- **`hooks/use-sync-user.ts`**: Clerk 사용자를 Supabase에 자동 동기화
- **`actions/`**: Server Actions (API Routes 대신 우선 사용)
- **`supabase/migrations/`**: 데이터베이스 마이그레이션 파일들
- **`AGENTS.md`**: Claude Code를 위한 프로젝트 가이드

## 추가 리소스

### 공식 문서

- [Next.js 15 문서](https://nextjs.org/docs)
- [Clerk 문서](https://clerk.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com/)
- [Tailwind CSS v4 문서](https://tailwindcss.com/docs)

### 프로젝트 문서

- [PRD.md](./docs/PRD.md): 제품 요구사항 문서
- [TODO.md](./docs/TODO.md): 개발 TODO 리스트
- [AGENTS.md](./AGENTS.md): 개발자 가이드
- [도매 업체 가이드](./docs/Wholesaler/WS_Guideline.md): 도매 업체 기능 가이드
- [관리자 가이드](./docs/admin/admin.md): 관리자 기능 가이드

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.
