# 👨‍💼 관리자 페이지 개발 가이드라인

> **프로젝트명**: AI 기반 B2B 도매-소매 중개 플랫폼  
> **담당**: 관리자 페이지 개발 (도매 프로젝트 내)  
> **개발 방식**: 커서 AI 바이브 코딩  
> **대상**: 초보 개발자  
> **최종 업데이트**: 2025-11-27

---

## 📋 목차

1. [개요](#1-개요)
2. [프로젝트 구조 이해](#2-프로젝트-구조-이해)
3. [구현 전략](#3-구현-전략)
4. [핵심 기능 구현](#4-핵심-기능-구현)
5. [보안 및 권한 관리](#5-보안-및-권한-관리)
6. [데이터베이스 접근](#6-데이터베이스-접근)
7. [배포 및 테스트](#7-배포-및-테스트)
8. [참고 자료](#8-참고-자료)

---

## 1. 개요

### 1.1 관리자 페이지란?

관리자가 플랫폼 전체를 관리하는 페이지입니다. 도매 프로젝트 내에 위치하지만, **도매와 소매 모두의 데이터를 관리**합니다.

### 1.2 핵심 기능 (MVP)

#### Phase 1 (필수) ✅

- ✅ **도매 승인/반려**: 도매사업자 가입 요청 처리
- ✅ **도매 문의 관리**: 도매사업자 → 관리자 문의 조회 및 답변
- ✅ **도매 계정 관리**: 계정 정지/해제
- ✅ **전체 CS 처리**: 도매와 소매의 CS 통합 관리
- ✅ **통합 감사 로그**: 모든 관리자 액션 추적

#### Phase 2 (선택) 🔵

- 🔵 **소매 계정 조회**: 소매 계정 목록 및 상세 보기
- 🔵 **전체 주문 모니터링**: 도매-소매 간 주문 현황
- 🔵 **통계 대시보드**: 플랫폼 전체 통계
- 🔵 **수수료율 설정**: 플랫폼 수수료 관리

### 1.3 접근 방식

- **URL 직접 접속**: `/admin` 경로로 직접 접속
- **로그인**: Clerk 인증을 통한 로그인
- **권한 체크**: `role='admin'`인 사용자만 접근 가능
- **보안**: 별도의 관리자 페이지 접근 버튼 없음 (URL 직접 입력)

---

## 2. 프로젝트 구조 이해

### 2.1 3개 도메인 구조

```
┌─────────────────────────────────────────────────────────┐
│                    프로젝트 분리 구조                     │
└─────────────────────────────────────────────────────────┘

1️⃣ 메인 랜딩 페이지 (별도 도메인)
   └─ www.marketlink.com
   └─ 역할 선택 및 안내

2️⃣ 도매 프로젝트 (이 프로젝트)
   └─ wholesale.marketlink.com
   ├─ /wholesaler/* (도매 페이지)
   └─ /admin/* (관리자 페이지) ⭐

3️⃣ 소매 프로젝트 (별도 팀, 별도 도메인)
   └─ retail.marketlink.com
   └─ /retailer/* (소매 페이지)

🗄️ Supabase DB (공유)
   └─ 3개 프로젝트가 동일한 DB 사용
```

### 2.2 관리자 페이지의 위치

```
현재 프로젝트 (도매 전용):
app/
├── wholesaler/        # 도매 페이지
├── admin/            # 👨‍💼 관리자 페이지 (여기!)
│   ├── layout.tsx    # 관리자 레이아웃 (권한 체크)
│   ├── dashboard/    # 대시보드
│   ├── wholesalers/  # 도매 관리
│   │   ├── pending/  # 승인 대기
│   │   └── [id]/     # 도매 상세
│   ├── cs/           # CS 통합 관리
│   └── audit-logs/   # 감사 로그
└── layout.tsx        # 루트 레이아웃
```

### 2.3 데이터 접근 방식

**⚠️ 중요**: 관리자는 **도매 프로젝트 내에 있지만, 소매 데이터도 조회**해야 합니다.

**방식 A: 직접 DB 접근** (현재 채택 ✅)

```typescript
// 관리자 페이지에서 직접 Supabase 접근
const supabase = createClerkSupabaseClient();

// 도매와 소매의 CS를 모두 조회
const { data: csThreads } = await supabase
  .from("cs_threads")
  .select("*")
  .order("created_at", { ascending: false });
```

**장점**:

- ✅ 구현이 간단함
- ✅ 이미 사용 중인 패턴
- ✅ Supabase RLS로 보안 보장
- ✅ 초보자 친화적

**단점**:

- ⚠️ 소매 팀과 DB 스키마 협의 필요
- ⚠️ 타입 정의 동기화 필요

**방식 B: 통합 API 게이트웨이** (Phase 2에서 고려 🔵)

```typescript
// 별도 API 서버를 통해 접근
const response = await fetch("http://api-gateway/admin/cs");
const csThreads = await response.json();
```

**장점**:

- ✅ 확장성 좋음
- ✅ 소매/도매 프로젝트와 완전 분리

**단점**:

- ❌ 구현 복잡도 높음
- ❌ 추가 서버 관리 필요
- ❌ 현재 기능에는 과한 투자

---

## 3. 구현 전략

### 3.1 단계적 접근

```
Phase 1: 도매 관리 + 기본 통합 기능 (2-3주)
├── ✅ 도매 승인/반려 (이미 완료)
├── [ ] 도매 계정 정지/해제
├── [ ] 전체 CS 처리
└── [ ] 통합 감사 로그

Phase 2: 확장 기능 (선택, 1-2주)
├── [ ] 소매 계정 조회
├── [ ] 전체 주문 모니터링
├── [ ] 통계 대시보드
└── [ ] 수수료율 설정

Phase 3: API 게이트웨이 (선택, 3-4주)
└── [ ] 필요 시 별도 API 서버 구축
```

### 3.2 우선순위

**🔴 최우선 (Phase 1)**:

1. 도매 승인/반려 ✅ (완료)
2. 도매 계정 정지/해제
3. 전체 CS 처리
4. 통합 감사 로그

**🟡 중요 (Phase 2)**: 5. 소매 계정 조회 6. 전체 주문 모니터링

**🔵 선택 (Phase 2+)**: 7. 통계 대시보드 8. 수수료율 설정

---

## 4. 핵심 기능 구현

### 4.1 관리자 권한 체크 ✅ (완료)

**파일**: `lib/clerk/auth.ts`

관리자 페이지의 모든 페이지는 `requireAdmin()` 함수로 보호됩니다.

```typescript
/**
 * 관리자 권한 필수 검증
 */
export async function requireAdmin(): Promise<ProfileWithDetails> {
  const profile = await requireAuth();

  if (profile.role !== "admin") {
    console.log("🚫 [auth] requireAdmin: 관리자 권한 없음, 리다이렉트");
    redirect("/");
  }

  return profile;
}
```

**사용 예시**:

```typescript
// app/admin/dashboard/page.tsx
export default async function AdminDashboard() {
  const profile = await requireAdmin(); // 관리자 체크

  // 여기서는 항상 관리자
  return <div>관리자 대시보드</div>;
}
```

---

### 4.2 관리자 레이아웃 ✅ (완료)

**파일**: `app/admin/layout.tsx`

모든 관리자 페이지를 감싸는 레이아웃으로, 레이아웃 레벨에서 권한을 체크합니다.

**주요 기능**:

- ✅ `requireAdmin()`으로 권한 체크
- ✅ 관리자 전용 네비게이션
- ✅ 깔끔한 관리자 UI

**네비게이션 메뉴**:

- 대시보드 (`/admin/dashboard`)
- 도매 승인 대기 (`/admin/wholesalers/pending`)
- 도매 문의 관리 (`/admin/inquiries`) ✅
- CS 관리 (`/admin/cs`)
- 감사 로그 (`/admin/audit-logs`)

---

### 4.3 도매 승인/반려 ✅ (완료)

#### 4.3.1 승인 대기 목록

**파일**: `app/admin/wholesalers/pending/page.tsx`

```typescript
export default async function PendingWholesalersPage() {
  await requireAdmin();

  const supabase = createClerkSupabaseClient();

  // status='pending'인 도매사업자 조회
  const { data: wholesalers, error } = await supabase
    .from("wholesalers")
    .select(
      `
      id,
      business_name,
      business_number,
      representative,
      phone,
      created_at,
      profiles!inner (
        email
      )
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // UI 렌더링...
}
```

#### 4.3.2 승인/반려 Server Action

**파일**: `actions/admin/wholesaler-approval.ts`

```typescript
"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { headers } from "next/headers";

/**
 * 도매사업자 승인
 */
export async function approveWholesaler(wholesalerId: string, adminId: string) {
  const supabase = getServiceRoleClient();
  const ipAddress = await getIpAddress();

  // 승인 처리
  await supabase
    .from("wholesalers")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", wholesalerId);

  // 감사 로그 기록
  await supabase.from("audit_logs").insert({
    user_id: adminId,
    action: "wholesaler_approve",
    target_type: "wholesaler",
    target_id: wholesalerId,
    ip_address: ipAddress,
  });

  revalidatePath("/admin/wholesalers/pending");
  redirect("/admin/wholesalers/pending");
}
```

---

### 4.4 도매 계정 정지/해제 (구현 예정)

**목적**: 문제가 있는 도매사업자의 계정을 정지하거나 해제

**파일**: `actions/admin/account-management.ts`

**커서 AI 프롬프트:**

```
도매 계정 정지/해제 Server Action을 만들어줘.

요구사항:
- suspendWholesaler() 함수: status='suspended'로 변경
- unsuspendWholesaler() 함수: status='approved'로 복구
- 정지 사유 입력 (suspension_reason)
- audit_logs에 기록
- IP 주소 추출 및 기록

파일: actions/admin/account-management.ts
```

**예상 구조**:

```typescript
"use server";

/**
 * 도매 계정 정지
 */
export async function suspendWholesaler(
  wholesalerId: string,
  adminId: string,
  suspensionReason: string,
) {
  // 1. wholesalers.status = 'suspended'
  // 2. suspension_reason 저장
  // 3. audit_logs 기록
  // 4. 리다이렉트
}

/**
 * 도매 계정 정지 해제
 */
export async function unsuspendWholesaler(
  wholesalerId: string,
  adminId: string,
) {
  // 1. wholesalers.status = 'approved'
  // 2. suspension_reason = null
  // 3. audit_logs 기록
  // 4. 리다이렉트
}
```

---

### 4.5 도매 문의 관리 ✅ (완료)

**목적**: 도매사업자가 관리자에게 보낸 문의를 조회하고 답변

#### 4.5.1 문의 목록 페이지

**파일**: `app/admin/inquiries/page.tsx`

관리자가 모든 도매사업자로부터 받은 문의를 조회하는 페이지입니다.

**주요 기능**:

- 모든 도매→관리자 문의 목록 조회 (`getInquiriesForAdmin()`)
- 상태별 필터링 (전체/미답변/답변완료/종료)
- 날짜 범위 및 검색 필터
- 문의 상세 페이지로 이동

**구현 내용**:

```typescript
// lib/supabase/queries/inquiries.ts
export async function getInquiriesForAdmin(
  options: GetInquiriesOptions = {},
): Promise<GetInquiriesResult> {
  // 관리자 권한 확인
  // inquiry_type = 'wholesaler_to_admin' 필터
  // 도매사업자 익명 코드 포함
  // 페이지네이션 및 정렬
}
```

#### 4.5.2 문의 상세 및 답변 페이지

**파일**: `app/admin/inquiries/[id]/page.tsx`

**주요 기능**:

- 문의 상세 정보 표시 (제목, 내용, 문의일, 도매사업자 익명 코드)
- 기존 답변 표시
- 답변 작성 폼 (status가 'open'인 경우만)
- 답변 작성 시 상태가 'answered'로 변경

**API 엔드포인트**:

- `GET /api/admin/inquiries/[id]`: 문의 상세 조회
- `POST /api/admin/inquiries/reply`: 답변 작성

**사용 컴포넌트**:

- `InquiryTable`: 문의 목록 테이블 (재사용)
- `InquiryFilter`: 필터 UI (재사용)
- `InquiryReplyForm`: 답변 작성 폼 (재사용, `apiEndpoint` prop으로 관리자용 API 지정)

---

### 4.6 전체 CS 처리 (구현 예정)

**목적**: 도매와 소매의 CS를 통합 관리

#### 4.5.1 CS 목록 조회

**파일**: `app/admin/cs/page.tsx`

**커서 AI 프롬프트:**

```
관리자 CS 통합 관리 페이지를 만들어줘.

요구사항:
- cs_threads 테이블에서 모든 스레드 조회
- profiles 테이블과 조인하여 사용자 정보 포함
- 상태별 필터 (open, bot_handled, escalated, closed)
- 역할별 필터 (wholesaler, retailer)
- 테이블 형태로 표시
- 각 행 클릭 시 상세 페이지로 이동

파일: app/admin/cs/page.tsx
```

**구현 예시**:

```typescript
export default async function AdminCSPage() {
  await requireAdmin();

  const supabase = createClerkSupabaseClient();

  // 모든 CS 스레드 조회
  const { data: csThreads } = await supabase
    .from("cs_threads")
    .select(
      `
      id,
      title,
      status,
      created_at,
      profiles!inner (
        id,
        email,
        role
      )
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1>CS 관리</h1>
      <CSThreadsTable threads={csThreads} />
    </div>
  );
}
```

#### 4.5.2 CS 상세 및 답변

**파일**: `app/admin/cs/[id]/page.tsx`

**기능**:

- CS 스레드 상세 조회
- 대화 이력 표시
- 관리자 답변 작성
- 티켓 상태 변경 (open → answered → closed)

---

### 4.7 통합 감사 로그 (구현 예정)

**목적**: 모든 관리자 액션을 추적하고 조회

**파일**: `app/admin/audit-logs/page.tsx`

**커서 AI 프롬프트:**

```
감사 로그 조회 페이지를 만들어줘.

요구사항:
- audit_logs 테이블에서 모든 로그 조회
- profiles 테이블과 조인하여 관리자 정보 포함
- 필터:
  - 액션 유형 (wholesaler_approve, wholesaler_reject, account_suspend 등)
  - 날짜 범위
  - 관리자 (user_id)
- 정렬: created_at DESC
- 로그 상세 보기 (details JSONB)
- IP 주소 표시

파일: app/admin/audit-logs/page.tsx
```

**구현 예시**:

```typescript
export default async function AuditLogsPage() {
  await requireAdmin();

  const supabase = createClerkSupabaseClient();

  // 감사 로그 조회
  const { data: logs } = await supabase
    .from("audit_logs")
    .select(
      `
      id,
      action,
      target_type,
      target_id,
      details,
      ip_address,
      created_at,
      profiles!inner (
        email
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1>감사 로그</h1>
      <AuditLogsTable logs={logs} />
    </div>
  );
}
```

---

## 5. 보안 및 권한 관리

### 5.1 관리자 계정 생성 (수동)

**⚠️ 중요**: 관리자 계정은 **수동으로만 생성**해야 합니다.

#### Step 1: Clerk에서 계정 생성

1. [Clerk 대시보드](https://dashboard.clerk.com) 접속
2. Users 메뉴에서 새 사용자 생성
3. 이메일/비밀번호로 계정 생성
4. 생성된 사용자의 `User ID` 복사 (예: `user_2abc123...`)

#### Step 2: Supabase에서 프로필 생성

Supabase 대시보드의 SQL Editor에서 실행:

```sql
-- 관리자 프로필 생성
INSERT INTO profiles (clerk_user_id, email, role, status)
VALUES (
  'user_2abc123...',  -- Clerk User ID
  'admin@marketlink.com',
  'admin',
  'active'
);
```

#### Step 3: 접근 테스트

1. `/admin` 경로로 접속
2. Clerk 로그인 화면에서 관리자 계정으로 로그인
3. 관리자 페이지 접근 확인

---

### 5.2 RLS 정책

**모든 관리자 쿼리는 Supabase RLS 정책으로 보호됩니다.**

#### 예시: `cs_threads` 테이블

```sql
-- 관리자는 모든 CS 스레드 조회 가능
CREATE POLICY "Admins can view all CS threads"
ON cs_threads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);

-- 관리자는 모든 CS 스레드 수정 가능
CREATE POLICY "Admins can update all CS threads"
ON cs_threads FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);
```

#### 예시: `audit_logs` 테이블

```sql
-- 관리자만 감사 로그 조회 가능
CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
    AND role = 'admin'
  )
);
```

---

### 5.3 IP 주소 추출

**모든 관리자 액션에 IP 주소를 기록합니다.**

```typescript
// actions/admin/*.ts
async function getIpAddress(): Promise<string> {
  const headersList = await headers();

  // 프록시 환경 고려
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    "unknown";

  return ipAddress;
}
```

---

## 6. 데이터베이스 접근

### 6.1 Supabase 클라이언트 선택

관리자 페이지에서는 **두 가지 클라이언트**를 사용합니다:

#### A. Clerk 인증 클라이언트 (읽기 작업)

```typescript
import { createClerkSupabaseClient } from "@/lib/supabase/server";

// RLS 정책이 적용됨 (admin 권한 체크)
const supabase = createClerkSupabaseClient();

const { data } = await supabase.from("cs_threads").select("*");
```

**사용 시점**:

- 관리자 페이지에서 데이터 조회
- RLS 정책으로 보안 보장

#### B. Service Role 클라이언트 (쓰기 작업)

```typescript
import { getServiceRoleClient } from "@/lib/supabase/service-role";

// RLS 정책 우회 (주의해서 사용)
const supabase = getServiceRoleClient();

await supabase
  .from("wholesalers")
  .update({ status: "approved" })
  .eq("id", wholesalerId);
```

**사용 시점**:

- Server Action에서 데이터 수정
- RLS 정책이 복잡할 때

**⚠️ 주의**: Service Role은 RLS를 우회하므로 신중하게 사용해야 합니다.

---

### 6.2 소매 팀과 협업

**관리자 페이지는 소매 데이터도 조회하므로, 소매 팀과 협의가 필요합니다.**

#### 협의 필요 사항

1. **테이블 스키마**:

   - `cs_threads`, `cs_messages`
   - `audit_logs`
   - `retailers` (선택)

2. **타입 정의 동기화**:

   ```typescript
   // types/cs.ts (공유)
   export interface CSThread {
     id: string;
     user_id: string;
     title: string;
     status: "open" | "bot_handled" | "escalated" | "closed";
     created_at: string;
   }
   ```

3. **RLS 정책**:
   - 소매 프로젝트에서도 관리자 권한 인식
   - `profiles.role = 'admin'` 체크

---

## 7. 배포 및 테스트

### 7.1 테스트 체크리스트

#### 기능 테스트

- [ ] 관리자 계정으로 로그인 시 관리자 페이지 접근 가능
- [ ] 비관리자 계정으로 접근 시 홈으로 리다이렉트
- [ ] 도매 승인 대기 목록이 정상적으로 표시됨
- [ ] 도매 승인/반려가 정상 작동함
- [ ] CS 목록이 도매와 소매 통합 조회됨
- [ ] 감사 로그가 정상적으로 기록됨

#### 보안 테스트

- [ ] 모든 `/admin/*` 경로가 `requireAdmin()`으로 보호됨
- [ ] Server Action에서도 권한 재확인됨
- [ ] 비관리자 접근 시 적절히 차단됨
- [ ] RLS 정책이 정상 작동함

#### 통합 테스트

- [ ] 도매사업자 승인 후 로그인 가능
- [ ] CS 답변 작성 후 사용자가 확인 가능
- [ ] 감사 로그에 모든 액션 기록됨

---

### 7.2 배포 준비

#### 환경 변수 확인

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### 프로덕션 배포 전

1. **관리자 계정 생성** (프로덕션 Clerk + Supabase)
2. **RLS 정책 확인** (모든 테이블)
3. **IP 주소 추출 테스트** (프록시 환경)
4. **감사 로그 기록 확인**

---

## 8. 참고 자료

### 8.1 관련 문서

- [도매 페이지 가이드라인](../Wholesaler/WS_Guideline.md)
- [도매 페이지 TODO](../Wholesaler/WS_TODO.md)
- [PRD 문서](../PRD.md)
- [통합 게이트웨이 설명](./통합게이트웨이.md)

### 8.2 외부 문서

- [Clerk 문서](https://clerk.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Next.js 문서](https://nextjs.org/docs)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

## 부록: 자주 묻는 질문 (FAQ)

### Q1: 소매 프로젝트와 어떻게 협업하나요?

**A**: Supabase DB를 공유하므로, 테이블 스키마와 RLS 정책을 협의해야 합니다.

1. 소매 팀에게 관리자가 접근할 테이블 목록 공유
2. RLS 정책에 `role = 'admin'` 조건 추가 요청
3. 타입 정의 파일 공유 (예: `types/cs.ts`)

### Q2: 통합 API 게이트웨이는 언제 필요한가요?

**A**: 다음 상황에서 고려하세요:

- 소매 프로젝트와 완전히 분리해야 할 때
- 트래픽이 많아져서 성능 최적화가 필요할 때
- 복잡한 비즈니스 로직을 중앙에서 관리해야 할 때

**현재는 직접 DB 접근으로 충분합니다.**

### Q3: 관리자 계정을 자동으로 생성할 수 없나요?

**A**: 보안상 권장하지 않습니다.

- 관리자 계정은 수동으로만 생성
- 프로덕션에서는 더욱 엄격하게 관리
- 필요 시 별도의 승인 프로세스 구축

---

**작성일**: 2025-11-27  
**최종 업데이트**: 2025-11-28  
**작성자**: AI Assistant  
**버전**: v1.1 (도매 문의 관리 기능 추가)
