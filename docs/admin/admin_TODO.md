# 👨‍💼 관리자 페이지 개발 TODO 리스트

> **프로젝트**: AI 기반 B2B 도매-소매 중개 플랫폼 - **도매 전용 + 관리자**  
> **개발 방식**: 커서 AI 바이브 코딩  
> **최종 업데이트**: 2025-11-28  
> **참고 문서**: [관리자 페이지 가이드라인](./admin.md)

---

## 🎯 목표

관리자가 도매 사업자를 관리하고, 도매와 소매의 CS를 통합 관리하며, 모든 관리자 액션을 추적할 수 있도록 합니다.

---

## 📊 전체 진행 현황

```
Phase 1 (필수): ██████████░░░░░░ 50% (3/6 완료)
Phase 2 (선택): ░░░░░░░░░░░░░░░░  0% (0/4 완료)

전체: █████░░░░░░░░░░░░░░░ 30% (3/10 완료)
```

---

## 🚀 Phase 1: 필수 기능 (2-3주)

### 1단계: 관리자 계정 생성 (수동) 🔴 최우선 ✅ 완료

**목적**: 관리자 페이지에 접근할 수 있는 계정 생성

- [x] **Clerk에서 관리자 계정 생성**

  - [x] Clerk 대시보드 접속
  - [x] Users 메뉴에서 새 사용자 생성
  - [x] 이메일/비밀번호로 계정 생성
  - [x] 생성된 사용자의 `User ID` 복사
  - [x] 관리자 이메일 및 비밀번호 기록 (보안 관리)

- [x] **Supabase에서 프로필 생성**

  - [x] Supabase 대시보드의 SQL Editor 접속
  - [x] SQL 실행:
    ```sql
    INSERT INTO profiles (clerk_user_id, email, role, status)
    VALUES (
      'user_2abc123...',
      'admin@farmtobiz.com',
      'admin',
      'active'
    );
    ```
  - [x] 프로필 생성 확인

- [x] **관리자 계정 접근 테스트**
  - [x] `/admin` 경로로 접속 시도
  - [x] Clerk 로그인 화면 표시 확인
  - [x] 관리자 계정으로 로그인
  - [x] 관리자 페이지 접근 확인

---

### 2단계: 관리자 권한 체크 함수 추가 ✅ 완료

**목적**: 관리자만 접근할 수 있도록 권한 체크 함수 구현

**파일**: `lib/clerk/auth.ts`

- [x] **requireAdmin() 함수 추가**
  - [x] `requireAuth()`를 먼저 호출하여 인증 확인
  - [x] `role`이 `'admin'`이 아니면 홈(`'/'`)으로 리다이렉트
  - [x] 관리자인 경우 `ProfileWithDetails` 반환
  - [x] JSDoc 주석 추가
  - [x] 에러 처리 및 로깅

**테스트**:

- [x] 관리자 계정으로 로그인 시 함수가 정상 작동하는지 확인
- [x] 비관리자 계정으로 접근 시 홈으로 리다이렉트되는지 확인

---

### 3단계: 관리자 레이아웃 생성 ✅ 완료

**목적**: 모든 관리자 페이지를 보호하는 레이아웃 생성

**파일**: `app/admin/layout.tsx`

- [x] **레이아웃 기본 구조 생성**

  - [x] `requireAdmin()`으로 관리자 권한 체크
  - [x] 헤더 컴포넌트 (관리자 페이지 타이틀)
  - [x] 네비게이션 메뉴
  - [x] 메인 컨텐츠 영역 (`{children}`)

- [x] **네비게이션 메뉴**
  - [x] "대시보드" 링크 (`/admin/dashboard`)
  - [x] "도매 승인 대기" 링크 (`/admin/wholesalers/pending`)
  - [x] "CS 관리" 링크 (`/admin/cs`)
  - [x] "감사 로그" 링크 (`/admin/audit-logs`)

**테스트**:

- [x] 관리자 계정으로 `/admin` 접근 시 레이아웃이 표시되는지 확인
- [x] 비관리자 계정으로 접근 시 홈으로 리다이렉트되는지 확인

---

### 4단계: 도매 승인/반려 기능 ✅ 완료

#### 4.1 도매 승인 대기 목록 페이지 ✅

**파일**: `app/admin/wholesalers/pending/page.tsx`

- [x] **페이지 기본 구조**

  - [x] `requireAdmin()`으로 권한 체크
  - [x] 페이지 타이틀

- [x] **데이터 조회**

  - [x] `status='pending'` 조회
  - [x] `profiles` 테이블과 조인
  - [x] 정렬: `created_at DESC`

- [x] **UI 구현**
  - [x] 테이블 형태로 표시
  - [x] 빈 목록 처리

#### 4.2 도매 상세 페이지 ✅

**파일**: `app/admin/wholesalers/[id]/page.tsx`

- [x] **페이지 기본 구조**

  - [x] `requireAdmin()`으로 권한 체크
  - [x] Next.js 15 동적 파라미터 처리

- [x] **데이터 조회**

  - [x] 도매사업자 전체 정보 조회
  - [x] 이미 승인/반려된 경우 리다이렉트

- [x] **사업자 정보 표시**

  - [x] 모든 필드 표시

- [x] **승인/반려 폼 연결**
  - [x] `WholesalerApprovalForm` 컴포넌트

#### 4.3 승인/반려 Server Action ✅

**파일**: `actions/admin/wholesaler-approval.ts`

- [x] **IP 주소 추출 함수**
- [x] **approveWholesaler() 함수**
- [x] **rejectWholesaler() 함수**
- [x] **감사 로그 기록**

#### 4.4 승인/반려 폼 컴포넌트 ✅

**파일**: `components/admin/WholesalerApprovalForm.tsx`

- [x] **승인 버튼**
- [x] **반려 버튼 및 모달**
- [x] **react-hook-form + zod**

**테스트**:

- [x] 승인 기능이 정상 작동하는지 확인
- [x] 반려 기능이 정상 작동하는지 확인
- [x] 감사 로그가 정상적으로 기록되는지 확인

---

### 5단계: 도매 문의 관리 ✅ 완료

**목적**: 도매사업자가 관리자에게 보낸 문의를 조회하고 답변

#### 5.1 문의 목록 페이지 ✅

**파일**: `app/admin/inquiries/page.tsx`

- [x] **페이지 기본 구조** ✅

  - [x] `requireAdmin()`으로 권한 체크 ✅
  - [x] 페이지 타이틀 ✅

- [x] **데이터 조회** ✅

  - [x] `getInquiriesForAdmin()` 함수 구현 ✅
  - [x] `inquiry_type = 'wholesaler_to_admin'` 필터 ✅
  - [x] 도매사업자 익명 코드 포함 ✅
  - [x] 정렬: `created_at DESC` ✅
  - [x] 페이지네이션 ✅

- [x] **필터 기능** ✅

  - [x] 상태별 필터 (전체/미답변/답변완료/종료) ✅
  - [x] 날짜 범위 필터 ✅
  - [x] 검색 기능 (제목/내용) ✅

- [x] **UI 구현** ✅
  - [x] 탭 UI (전체/미답변/답변완료/종료) ✅
  - [x] `InquiryTable` 컴포넌트 재사용 ✅
  - [x] `InquiryFilter` 컴포넌트 재사용 ✅
  - [x] 빈 목록 처리 ✅
  - [x] 로딩 상태 처리 ✅

#### 5.2 문의 상세 및 답변 페이지 ✅

**파일**: `app/admin/inquiries/[id]/page.tsx`

- [x] **페이지 기본 구조** ✅

  - [x] `requireAdmin()`으로 권한 체크 ✅
  - [x] "목록으로" 링크 ✅
  - [x] Next.js 15 동적 파라미터 처리 ✅

- [x] **데이터 조회** ✅

  - [x] `getInquiryById()` 함수로 문의 상세 조회 ✅
  - [x] 도매→관리자 문의만 조회 가능 ✅
  - [x] 존재하지 않는 경우 에러 처리 ✅

- [x] **문의 정보 표시** ✅

  - [x] 제목, 내용, 문의일 표시 ✅
  - [x] 도매사업자 익명 코드 표시 ✅
  - [x] 상태 뱃지 표시 ✅

- [x] **첨부 이미지 표시** ✅

  - [x] `attachment_urls` 필드가 있는 경우 이미지 표시 ✅
  - [x] 그리드 레이아웃 (2-3열, 반응형) ✅
  - [x] Next.js Image 컴포넌트 사용 ✅
  - [x] 이미지 클릭 시 모달로 확대 보기 ✅
  - [x] 이미지 간 네비게이션 (이전/다음 버튼) ✅
  - [x] 이미지 다운로드 기능 ✅
  - [x] 빈 이미지 처리 (첨부 이미지가 없는 경우) ✅
  - [x] 이미지 로딩 상태 처리 ✅

- [x] **답변 기능** ✅
  - [x] 기존 답변 표시 (있는 경우) ✅
  - [x] 답변 작성 폼 (status가 'open'인 경우만) ✅
  - [x] `InquiryReplyForm` 컴포넌트 재사용 ✅
  - [x] 관리자용 API 엔드포인트 지정 (`/api/admin/inquiries/reply`) ✅

#### 5.3 쿼리 함수 및 API ✅

**파일**: `lib/supabase/queries/inquiries.ts`

- [x] **getInquiriesForAdmin() 함수** ✅

  - [x] 관리자 권한 확인 ✅
  - [x] `inquiry_type = 'wholesaler_to_admin'` 필터 ✅
  - [x] 도매사업자 익명 코드 조회 ✅
  - [x] 페이지네이션 및 정렬 ✅

- [x] **getInquiryById() 함수 확장** ✅
  - [x] 도매→관리자 문의 조회 지원 ✅
  - [x] 관리자 권한 확인 ✅
  - [x] 도매사업자는 자신의 문의만 조회 가능 ✅

**파일**: `app/api/admin/inquiries/route.ts`

- [x] **POST /api/admin/inquiries** ✅
  - [x] 관리자용 문의 목록 조회 API ✅
  - [x] 필터 파라미터 처리 ✅

**파일**: `app/api/admin/inquiries/[id]/route.ts`

- [x] **GET /api/admin/inquiries/[id]** ✅
  - [x] 관리자용 문의 상세 조회 API ✅
  - [x] 권한 확인 ✅

**파일**: `app/api/admin/inquiries/reply/route.ts`

- [x] **POST /api/admin/inquiries/reply** ✅
  - [x] 관리자용 답변 작성 API ✅
  - [x] `replyToInquiry()` 함수 호출 ✅

#### 5.4 사이드바 메뉴 추가 ✅

**파일**: `components/admin/AdminSidebar.tsx`

- [x] **"도매 문의 관리" 메뉴 추가** ✅
  - [x] `/admin/inquiries` 링크 ✅
  - [x] `MessageSquare` 아이콘 사용 ✅

#### 5.5 첨부 이미지 기능 구현 ✅ 완료

**목적**: 도매사업자가 문의 작성 시 이미지를 첨부하고, 관리자가 이미지를 확인할 수 있도록 함

**데이터베이스 마이그레이션**:

- [x] `inquiries` 테이블에 `attachment_urls TEXT[]` 필드 추가 ✅
- [x] 마이그레이션 파일 생성 (`20251128160431_add_inquiry_attachments.sql`) ✅

**타입 정의**:

- [x] `types/inquiry.ts`에 `attachment_urls?: string[]` 필드 추가 ✅
- [x] `CreateInquiryRequest` 인터페이스 업데이트 ✅

**문의 작성 폼 (도매사업자)**:

**파일**: `components/wholesaler/Support/InquiryCreateForm.tsx`

- [x] 이미지 업로드 UI 추가 ✅
  - [x] 파일 선택 버튼 ✅
  - [x] 미리보기 표시 (썸네일) ✅
  - [x] 이미지 삭제 기능 ✅
  - [x] 최대 5개 제한 표시 ✅
  - [x] 파일 크기 검증 (5MB) ✅
- [x] 이미지 업로드 함수 (`lib/supabase/storage.ts`) ✅
  - [x] `uploadInquiryAttachment()` 함수 추가 ✅
  - [x] 경로: `{clerk_user_id}/inquiries/{timestamp}-{filename}` ✅
  - [x] `product-images` 버킷 사용 ✅
- [x] Server Action 수정 (`actions/wholesaler/create-inquiry.ts`) ✅
  - [x] `attachment_urls` 배열 저장 로직 추가 ✅

**관리자 페이지**:

**파일**: `app/admin/inquiries/[id]/page.tsx`

- [x] 첨부 이미지 표시 섹션 추가 ✅
  - [x] 이미지가 있는 경우에만 표시 ✅
  - [x] 그리드 레이아웃 (2-3열) ✅
  - [x] Next.js Image 컴포넌트 사용 ✅
- [x] 이미지 확대 모달 컴포넌트 (`components/admin/InquiryImageModal.tsx`) ✅
  - [x] 클릭 시 모달 열기 ✅
  - [x] 원본 크기 표시 ✅
  - [x] 이전/다음 네비게이션 ✅
  - [x] 닫기 버튼 ✅
- [x] 이미지 다운로드 기능 ✅
  - [x] 각 이미지에 다운로드 버튼 ✅
  - [x] 파일명 처리 (타임스탬프 기반) ✅

**도매사업자 페이지**:

**파일**: `app/wholesaler/inquiries/[id]/page.tsx`

- [x] 내 문의 상세 페이지에도 첨부 이미지 표시 추가 ✅
  - [x] 관리자 페이지와 동일한 UI 패턴 사용 ✅
  - [x] 이미지 확대 모달 지원 ✅

**테스트**:

- [x] 관리자 문의 목록이 정상적으로 표시되는지 확인 ✅
- [x] 상태별 필터가 정상 작동하는지 확인 ✅
- [x] 문의 상세 페이지가 정상 표시되는지 확인 ✅
- [x] 첨부 이미지가 정상적으로 표시되는지 확인 ✅
- [x] 이미지 확대 보기가 정상 작동하는지 확인 ✅
- [x] 이미지 다운로드가 정상 작동하는지 확인 ✅
- [x] 관리자 답변이 정상적으로 저장되는지 확인 ✅
- [x] 답변 작성 후 상태가 'answered'로 변경되는지 확인 ✅

---

### 6단계: 계정 정지/해제 (도매 + 소매) 🔴 진행 예정

**목적**: 문제가 있는 도매사업자 및 소매사업자의 계정을 정지하거나 해제

#### 6.1 데이터베이스 마이그레이션 (필수)

**파일**: `supabase/migrations/YYYYMMDDHHmmss_add_retailer_status.sql`

- [ ] **retailers 테이블에 status, suspension_reason 필드 추가**
  - [ ] `status TEXT DEFAULT 'active'` (active, suspended)
  - [ ] `suspension_reason TEXT NULL`
  - [ ] 기존 데이터는 모두 'active'로 설정

#### 6.2 도매 계정 정지/해제

**파일**: `actions/admin/account-management.ts`

- [ ] **suspendWholesaler() Server Action**

  - [ ] `wholesalers.status`를 `'suspended'`로 변경
  - [ ] `suspension_reason` 저장 (wholesalers 테이블에 suspension_reason 필드 추가 필요 시 마이그레이션)
  - [ ] `audit_logs`에 기록 (action: 'wholesaler_suspend')
  - [ ] IP 주소 기록
  - [ ] 에러 처리 및 로깅

- [ ] **unsuspendWholesaler() Server Action**
  - [ ] `wholesalers.status`를 `'approved'`로 복구
  - [ ] `suspension_reason`을 `null`로 설정
  - [ ] `audit_logs`에 기록 (action: 'wholesaler_unsuspend')
  - [ ] IP 주소 기록
  - [ ] 에러 처리 및 로깅

**파일**: `app/admin/wholesalers/[id]/page.tsx` (수정)

- [ ] **정지/해제 버튼 추가**
  - [ ] 정지 버튼 (정지 사유 입력 모달)
  - [ ] 해제 버튼 (확인 모달)
  - [ ] 현재 상태에 따라 버튼 표시

**파일**: `components/admin/WholesalerSuspensionForm.tsx`

- [ ] **정지 폼 컴포넌트**
  - [ ] 정지 사유 입력 (최소 10자)
  - [ ] react-hook-form + zod
  - [ ] Server Action 호출
  - [ ] 에러 처리

#### 6.3 소매 계정 정지/해제

**파일**: `actions/admin/account-management.ts` (동일 파일에 추가)

- [ ] **suspendRetailer() Server Action**

  - [ ] `retailers.status`를 `'suspended'`로 변경
  - [ ] `suspension_reason` 저장
  - [ ] `audit_logs`에 기록 (action: 'retailer_suspend')
  - [ ] IP 주소 기록
  - [ ] 에러 처리 및 로깅

- [ ] **unsuspendRetailer() Server Action**
  - [ ] `retailers.status`를 `'active'`로 복구
  - [ ] `suspension_reason`을 `null`로 설정
  - [ ] `audit_logs`에 기록 (action: 'retailer_unsuspend')
  - [ ] IP 주소 기록
  - [ ] 에러 처리 및 로깅

**파일**: `app/admin/retailers/[id]/page.tsx` (수정 또는 생성)

- [ ] **소매 상세 페이지에 정지/해제 버튼 추가**
  - [ ] 정지 버튼 (정지 사유 입력 모달)
  - [ ] 해제 버튼 (확인 모달)
  - [ ] 현재 상태에 따라 버튼 표시
  - [ ] 소매 상세 페이지가 없는 경우 생성 필요

**파일**: `components/admin/RetailerSuspensionForm.tsx`

- [ ] **정지 폼 컴포넌트**
  - [ ] 정지 사유 입력 (최소 10자)
  - [ ] react-hook-form + zod
  - [ ] Server Action 호출
  - [ ] 에러 처리
  - [ ] `WholesalerSuspensionForm`과 유사한 구조로 재사용 가능하게 구현

**커서 AI 프롬프트:**

```
도매 및 소매 계정 정지/해제 기능을 만들어줘.

요구사항:
도매 계정:
- suspendWholesaler() 함수: wholesalers.status='suspended', suspension_reason 저장
- unsuspendWholesaler() 함수: wholesalers.status='approved', suspension_reason=null

소매 계정:
- suspendRetailer() 함수: retailers.status='suspended', suspension_reason 저장
- unsuspendRetailer() 함수: retailers.status='active', suspension_reason=null

공통:
- audit_logs 테이블에 기록 (action: 'wholesaler_suspend', 'wholesaler_unsuspend', 'retailer_suspend', 'retailer_unsuspend')
- IP 주소 추출 및 기록
- 정지 사유 입력 모달 (최소 10자)
- 에러 처리 및 로깅

데이터베이스:
- retailers 테이블에 status, suspension_reason 필드 추가 필요 (마이그레이션 파일 생성)

파일:
- actions/admin/account-management.ts
- components/admin/WholesalerSuspensionForm.tsx
- components/admin/RetailerSuspensionForm.tsx
- supabase/migrations/YYYYMMDDHHmmss_add_retailer_status.sql
```

**테스트**:

- [ ] 도매 계정 정지 기능이 정상 작동하는지 확인
- [ ] 도매 계정 해제 기능이 정상 작동하는지 확인
- [ ] 소매 계정 정지 기능이 정상 작동하는지 확인
- [ ] 소매 계정 해제 기능이 정상 작동하는지 확인
- [ ] 정지된 계정으로 로그인 시 접근 차단되는지 확인 (도매 + 소매)
- [ ] 감사 로그가 정상적으로 기록되는지 확인 (도매 + 소매)

---

### 7단계: 전체 CS 처리 🔴 진행 예정

**목적**: 도매와 소매의 CS를 통합 관리

#### 6.1 CS 목록 페이지

**파일**: `app/admin/cs/page.tsx`

- [x] **페이지 기본 구조**

  - [x] `requireAdmin()`으로 권한 체크
  - [x] 페이지 타이틀

- [x] **데이터 조회**

  - [x] `cs_threads` 테이블에서 모든 스레드 조회
  - [x] `profiles` 테이블과 조인하여 사용자 정보 포함
  - [x] 정렬: `created_at DESC`
  - [x] 에러 처리

- [x] **필터 기능**

  - [x] 상태별 필터 (open, bot_handled, escalated, closed)
  - [x] 역할별 필터 (wholesaler, retailer)
  - [ ] 날짜 범위 필터 (선택) - 향후 구현 예정

- [x] **UI 구현**
  - [x] 테이블 형태로 표시
    - [x] 제목
    - [x] 사용자 (이메일 + 역할)
    - [x] 상태
    - [x] 생성일
    - [x] 액션 (상세보기 링크)
  - [x] 빈 목록 처리
  - [x] 로딩 상태 처리 (Server Component이므로 Next.js가 자동 처리)

**커서 AI 프롬프트:**

```
관리자 CS 통합 관리 페이지를 만들어줘.

요구사항:
- cs_threads 테이블에서 모든 스레드 조회
- profiles 테이블과 조인하여 사용자 정보 포함
- 상태별 필터 (open, bot_handled, escalated, closed)
- 역할별 필터 (wholesaler, retailer)
- 테이블 형태로 표시 (제목, 사용자, 상태, 생성일)
- 각 행 클릭 시 상세 페이지로 이동
- 정렬: created_at DESC

파일: app/admin/cs/page.tsx
```

#### 6.2 CS 상세 페이지

**파일**: `app/admin/cs/[id]/page.tsx`

- [x] **페이지 기본 구조**

  - [x] `requireAdmin()`으로 권한 체크
  - [x] "목록으로" 링크

- [x] **데이터 조회**

  - [x] CS 스레드 정보 조회
  - [x] `cs_messages` 테이블에서 대화 이력 조회
  - [x] 존재하지 않는 경우 `notFound()` 처리

- [x] **대화 이력 표시**

  - [x] 사용자/봇/관리자 메시지 구분
  - [x] 시간 순 표시
  - [x] 메시지 스타일링

- [x] **관리자 답변 폼**

  - [x] 답변 입력 텍스트 영역
  - [x] 제출 버튼
  - [x] 에러 처리

- [x] **티켓 상태 변경**
  - [x] "답변 완료" 버튼 (status = 'answered')
  - [x] "티켓 종료" 버튼 (status = 'closed')

**커서 AI 프롬프트:**

```
CS 상세 및 답변 페이지를 만들어줘.

요구사항:
- CS 스레드 정보 조회
- cs_messages 테이블에서 대화 이력 조회
- 사용자/봇/관리자 메시지 구분 표시
- 관리자 답변 작성 폼
- 티켓 상태 변경 (answered, closed)
- 에러 처리

파일: app/admin/cs/[id]/page.tsx
```

#### 6.3 CS 답변 Server Action

**파일**: `actions/admin/cs-reply.ts`

- [x] **replyToCS() 함수**

  - [x] `cs_messages` 테이블에 답변 삽입
    - [x] `thread_id`: CS 스레드 ID
    - [x] `sender_type`: `'admin'`
    - [x] `sender_id`: 관리자 ID
    - [x] `content`: 답변 내용
  - [x] `cs_threads.status`를 `'answered'`로 업데이트
  - [x] `audit_logs`에 기록
  - [x] IP 주소 기록
  - [x] 에러 처리 및 로깅

- [x] **closeCSThread() 함수**
  - [x] `cs_threads.status`를 `'closed'`로 업데이트
  - [x] `closed_at` 현재 시간으로 설정
  - [x] `audit_logs`에 기록
  - [x] IP 주소 기록
  - [x] 에러 처리 및 로깅

**커서 AI 프롬프트:**

```
CS 답변 및 티켓 종료 Server Action을 만들어줘.

요구사항:
- replyToCS() 함수: cs_messages 테이블에 답변 삽입, status='answered'
- closeCSThread() 함수: status='closed', closed_at 설정
- audit_logs 테이블에 기록
- IP 주소 추출 및 기록
- 에러 처리 및 로깅

파일: actions/admin/cs-reply.ts
```

**테스트**:

- [ ] CS 목록이 도매와 소매 통합 조회되는지 확인
- [ ] 상태별/역할별 필터가 정상 작동하는지 확인
- [ ] CS 상세 페이지가 정상 표시되는지 확인
- [ ] 관리자 답변이 정상적으로 저장되는지 확인
- [ ] 티켓 상태 변경이 정상 작동하는지 확인
- [ ] 감사 로그가 정상적으로 기록되는지 확인

---

### 8단계: 통합 감사 로그 ✅ 완료

**목적**: 모든 관리자 액션을 추적하고 조회

**파일**: `app/admin/audit-logs/page.tsx`

- [x] **페이지 기본 구조**

  - [x] `requireAdmin()`으로 권한 체크
  - [x] 페이지 타이틀

- [x] **데이터 조회**

  - [x] `audit_logs` 테이블에서 모든 로그 조회
  - [x] `profiles` 테이블과 조인하여 관리자 정보 포함
  - [x] 정렬: `created_at DESC`
  - [x] 페이지네이션 (limit 20, TODO에는 100으로 명시되어 있으나 실제 구현은 20)

- [x] **필터 기능**

  - [x] 액션 유형 필터 (동적으로 모든 액션 타입 지원)
    - [x] wholesaler_approve
    - [x] wholesaler_reject
    - [x] account_suspend
    - [x] account_unsuspend
    - [x] cs_reply
    - [x] cs_close
  - [x] 날짜 범위 필터
  - [x] 관리자 필터 (user_id)

- [x] **UI 구현**

  - [x] 테이블 형태로 표시
    - [x] 관리자 (이메일)
    - [x] 액션
    - [x] 대상 타입
    - [x] 대상 ID
    - [x] IP 주소
    - [x] 날짜/시간
    - [x] 상세 보기 (행 클릭으로 구현, 별도 페이지로 이동)
  - [x] 빈 목록 처리
  - [x] 로딩 상태 처리 (에러 처리 포함)

- [x] **로그 상세 페이지** (모달이 아닌 별도 페이지로 구현)
  - [x] `details` JSONB 내용 표시
  - [x] JSON 포맷팅
  - [x] 페이지 닫기 (뒤로가기 버튼)

**커서 AI 프롬프트:**

```
감사 로그 조회 페이지를 만들어줘.

요구사항:
- audit_logs 테이블에서 모든 로그 조회
- profiles 테이블과 조인하여 관리자 정보 포함
- 필터:
  - 액션 유형 (wholesaler_approve, account_suspend 등)
  - 날짜 범위
  - 관리자 (user_id)
- 정렬: created_at DESC
- 페이지네이션 (limit 100)
- 로그 상세 보기 모달 (details JSONB)
- IP 주소 표시

파일: app/admin/audit-logs/page.tsx
```

**테스트**:

- [ ] 감사 로그 목록이 정상적으로 표시되는지 확인
- [ ] 액션 유형별 필터가 정상 작동하는지 확인
- [ ] 날짜 범위 필터가 정상 작동하는지 확인
- [ ] 로그 상세 모달이 정상 표시되는지 확인
- [ ] 모든 관리자 액션이 기록되는지 확인

---

## 🎯 Phase 2: 확장 기능 (선택, 1-2주)

### 9단계: 소매 계정 조회 🔵 선택

**목적**: 관리자가 소매 계정 정보를 조회할 수 있음

**파일**: `app/admin/retailers/page.tsx`

- [ ] **페이지 기본 구조**

  - [ ] `requireAdmin()`으로 권한 체크
  - [ ] 페이지 타이틀

- [ ] **데이터 조회**

  - [ ] `retailers` 테이블에서 모든 소매 계정 조회
  - [ ] `profiles` 테이블과 조인
  - [ ] 정렬: `created_at DESC`

- [ ] **UI 구현**
  - [ ] 테이블 형태로 표시
    - [ ] 상호명
    - [ ] 이메일
    - [ ] 연락처
    - [ ] 주소
    - [ ] 가입일
    - [ ] 상세보기 링크
  - [ ] 검색 기능 (상호명, 이메일)
  - [ ] 페이지네이션

**파일**: `app/admin/retailers/[id]/page.tsx`

- [ ] **소매 상세 정보 조회**
  - [ ] 소매 계정 전체 정보
  - [ ] 주문 이력 (최근 10건)
  - [ ] CS 이력
  - [ ] 통계 (총 주문 수, 총 주문 금액)

**커서 AI 프롬프트:**

```
소매 계정 조회 페이지를 만들어줘.

요구사항:
- retailers 테이블에서 모든 계정 조회
- profiles 테이블과 조인
- 테이블 형태로 표시 (상호명, 이메일, 연락처, 가입일)
- 검색 기능 (상호명, 이메일)
- 상세 페이지에서 주문 이력 및 통계 표시
- 읽기 전용 (수정 불가)

파일:
- app/admin/retailers/page.tsx
- app/admin/retailers/[id]/page.tsx
```

**⚠️ 주의사항**:

- 소매 팀과 `retailers` 테이블 스키마 협의 필요
- RLS 정책에 `admin` 권한 추가 필요
- 타입 정의 동기화 필요

**테스트**:

- [ ] 소매 계정 목록이 정상적으로 표시되는지 확인
- [ ] 검색 기능이 정상 작동하는지 확인
- [ ] 소매 상세 정보가 정상적으로 표시되는지 확인

---

### 10단계: 전체 주문 모니터링 🔵 선택

**목적**: 관리자가 도매-소매 간 주문 현황을 모니터링

**파일**: `app/admin/orders/page.tsx`

- [ ] **페이지 기본 구조**

  - [ ] `requireAdmin()`으로 권한 체크
  - [ ] 페이지 타이틀

- [ ] **데이터 조회**

  - [ ] `orders` 테이블에서 모든 주문 조회
  - [ ] `retailers`, `wholesalers`, `products` 테이블과 조인
  - [ ] 정렬: `created_at DESC`

- [ ] **필터 기능**

  - [ ] 상태별 필터 (pending, confirmed, shipped, completed)
  - [ ] 날짜 범위 필터
  - [ ] 도매/소매별 필터

- [ ] **UI 구현**
  - [ ] 테이블 형태로 표시
    - [ ] 주문번호
    - [ ] 소매 상호명
    - [ ] 도매 상호명
    - [ ] 상품명
    - [ ] 주문금액
    - [ ] 상태
    - [ ] 주문일
    - [ ] 상세보기 링크
  - [ ] 페이지네이션

**커서 AI 프롬프트:**

```
전체 주문 모니터링 페이지를 만들어줘.

요구사항:
- orders 테이블에서 모든 주문 조회
- retailers, wholesalers, products 테이블과 조인
- 상태별 필터 (pending, confirmed, shipped, completed)
- 날짜 범위 필터
- 테이블 형태로 표시 (주문번호, 소매, 도매, 상품, 금액, 상태)
- 페이지네이션
- 읽기 전용 (상태 변경 불가)

파일: app/admin/orders/page.tsx
```

**테스트**:

- [ ] 전체 주문 목록이 정상적으로 표시되는지 확인
- [ ] 필터가 정상 작동하는지 확인
- [ ] 페이지네이션이 정상 작동하는지 확인

---

### 11단계: 통계 대시보드 🔵 선택

**목적**: 플랫폼 전체 통계를 한눈에 보기

**파일**: `app/admin/dashboard/page.tsx`

- [ ] **통계 카드**

  - [ ] 전체 도매 수 (승인/대기/반려)
  - [ ] 전체 소매 수
  - [ ] 총 주문 수 (오늘/이번 주/이번 달)
  - [ ] 총 주문 금액
  - [ ] 오픈 CS 티켓 수

- [ ] **차트**
  - [ ] 일별 주문 추이 (최근 30일)
  - [ ] 카테고리별 주문 분포
  - [ ] 도매별 매출 순위 (Top 10)

**커서 AI 프롬프트:**

```
관리자 통계 대시보드를 만들어줘.

요구사항:
- 통계 카드:
  - 전체 도매 수 (상태별)
  - 전체 소매 수
  - 총 주문 수 및 금액
  - 오픈 CS 티켓 수
- 차트:
  - 일별 주문 추이 (Recharts)
  - 카테고리별 주문 분포
- 깔끔한 카드 레이아웃

파일: app/admin/dashboard/page.tsx
```

**테스트**:

- [ ] 모든 통계가 정확하게 표시되는지 확인
- [ ] 차트가 정상적으로 렌더링되는지 확인

---

### 12단계: 수수료율 설정 🔵 선택

**목적**: 플랫폼 수수료율을 관리자가 설정

**파일**: `app/admin/settings/page.tsx`

- [ ] **현재 수수료율 조회**

  - [ ] `platform_settings` 테이블 또는 환경 변수

- [ ] **수수료율 변경 폼**

  - [ ] 현재 수수료율 표시
  - [ ] 새 수수료율 입력 (0.0000 ~ 0.5000)
  - [ ] 변경 사유 입력
  - [ ] 확인 모달

- [ ] **변경 이력 표시**
  - [ ] `audit_logs`에서 수수료율 변경 이력 조회

**커서 AI 프롬프트:**

```
수수료율 설정 페이지를 만들어줘.

요구사항:
- 현재 수수료율 조회 및 표시
- 새 수수료율 입력 폼 (0.0000 ~ 0.5000)
- 변경 사유 입력 (필수)
- 확인 모달
- audit_logs에 변경 이력 기록
- 변경 이력 표시

파일: app/admin/settings/page.tsx
```

**⚠️ 주의사항**:

- 수수료율 변경은 매우 민감한 작업
- 반드시 이중 확인 필요
- 감사 로그 필수

---

## ✅ 최종 테스트 체크리스트

### 기능 테스트

**Phase 1 (필수)**:

- [ ] 관리자 계정으로 로그인 시 관리자 페이지 접근 가능
- [ ] 비관리자 계정으로 접근 시 홈으로 리다이렉트
- [ ] 도매 승인 대기 목록이 정상적으로 표시됨
- [ ] 도매 승인/반려가 정상 작동함
- [x] 도매 문의 목록이 정상적으로 표시됨 ✅
- [x] 도매 문의 상세 및 답변이 정상 작동함 ✅
- [ ] 도매 계정 정지/해제가 정상 작동함
- [ ] 소매 계정 정지/해제가 정상 작동함
- [ ] CS 목록이 도매와 소매 통합 조회됨
- [ ] CS 답변 작성 및 티켓 종료가 정상 작동함
- [ ] 감사 로그가 정상적으로 기록 및 조회됨

**Phase 2 (선택)**:

- [ ] 소매 계정 목록이 정상적으로 표시됨
- [ ] 전체 주문 모니터링이 정상 작동함
- [ ] 통계 대시보드가 정확하게 표시됨
- [ ] 수수료율 변경이 정상 작동함

---

### 보안 테스트

- [ ] 모든 `/admin/*` 경로가 `requireAdmin()`으로 보호됨
- [ ] Server Action에서도 권한 재확인됨
- [ ] 비관리자 접근 시 적절히 차단됨
- [ ] RLS 정책이 정상 작동함
- [ ] IP 주소가 정상적으로 기록됨

---

### 통합 테스트

- [ ] 도매사업자 승인 후 로그인 가능
- [ ] 도매사업자 정지 후 로그인 차단
- [ ] 소매사업자 정지 후 로그인 차단
- [ ] CS 답변 작성 후 사용자가 확인 가능
- [ ] 감사 로그에 모든 액션 기록됨 (도매 + 소매 계정 정지/해제 포함)
- [ ] 소매 팀과 DB 스키마 협의 완료 (Phase 2)

---

## 📊 소매 팀과 협업 체크리스트

**⚠️ Phase 1에서 필요**:

- [ ] `cs_threads` 테이블 스키마 협의
- [ ] `cs_messages` 테이블 스키마 협의
- [ ] `audit_logs` 테이블 스키마 협의
- [ ] RLS 정책에 `admin` 권한 추가 요청
- [ ] 타입 정의 공유 (`types/cs.ts`, `types/audit.ts`)

**🔵 Phase 2에서 필요**:

- [ ] `retailers` 테이블 스키마 협의
- [ ] `orders` 테이블 조인 쿼리 협의
- [ ] 추가 RLS 정책 협의

---

## 📝 참고 사항

### 구현 시 주의사항

1. **관리자 계정은 수동으로만 생성**

   - 자동 생성 기능은 보안상 위험
   - 프로덕션에서는 반드시 수동 생성

2. **감사 로그는 필수**

   - 모든 관리자 액션 기록
   - 나중에 문제 발생 시 추적 가능

3. **RLS 정책 철저히 적용**

   - 모든 테이블에 `admin` 권한 체크
   - Service Role 클라이언트는 신중하게 사용

4. **소매 팀과 긴밀히 협업**

   - DB 스키마 변경 시 반드시 협의
   - 타입 정의 동기화

5. **프로덕션 배포 전**
   - 관리자 권한 체크 테스트
   - 모든 기능 테스트
   - 감사 로그 기록 확인

---

## 🔗 관련 문서

- [관리자 페이지 가이드라인](./admin.md) - 상세 구현 가이드
- [도매 페이지 가이드라인](../Wholesaler/WS_Guideline.md)
- [도매 페이지 TODO](../Wholesaler/WS_TODO.md)
- [PRD 문서](../PRD.md)
- [통합 게이트웨이 설명](./통합게이트웨이.md)

---

**작성일**: 2025-11-27  
**최종 업데이트**: 2025-11-28  
**버전**: v1.1 (도매 문의 관리 기능 추가)
