# RLS 활성화 검토 보고서

**검토 일시**: 2025-01-XX  
**검토 대상**: 제공된 RLS 정책 SQL 문서  
**검토 방법**: Supabase MCP를 통한 실제 데이터베이스 스키마 확인

---

## ✅ 검토 완료 항목

### 1. 테이블 존재 여부 확인

모든 주요 테이블이 데이터베이스에 존재함을 확인했습니다:

- ✅ profiles
- ✅ users
- ✅ wholesalers
- ✅ retailers
- ✅ products
- ✅ product_variants
- ✅ orders
- ✅ cart_items
- ✅ settlements
- ✅ payments
- ✅ inquiries
- ✅ inquiry_messages
- ✅ cs_threads
- ✅ cs_messages
- ✅ audit_logs
- ✅ announcements
- ✅ faqs
- ✅ ai_product_suggestions
- ✅ account_deletions

---

## ⚠️ 발견된 문제점

### 🔴 심각한 문제

#### 1. **`delivery_addresses` 테이블이 존재하지 않음**

- **문제**: SQL 문서에 `delivery_addresses` 테이블에 대한 RLS 활성화 및 정책이 포함되어 있음
- **실제 상황**: 데이터베이스에 해당 테이블이 존재하지 않음
- **영향**: SQL 실행 시 오류 발생
- **해결 방법**:
  - `delivery_addresses` 관련 SQL 구문 제거
  - 또는 실제로 필요한 테이블이라면 먼저 테이블 생성 후 정책 적용

#### 2. **`account_deletions` 테이블의 RLS 활성화 누락**

- **문제**: SQL 문서의 RLS 활성화 목록에 `account_deletions`가 없음
- **실제 상황**: 데이터베이스에 `account_deletions` 테이블이 존재함
- **영향**: 해당 테이블은 RLS가 비활성화된 상태로 남게 됨 (보안 취약점)
- **해결 방법**: RLS 활성화 목록에 추가 필요

---

## 📋 수정 권장 사항

### 1. Helper 함수 검토

#### `current_clerk_id()` 함수

```sql
CREATE OR REPLACE FUNCTION current_clerk_id()
RETURNS text AS $$
BEGIN
  RETURN auth.jwt() ->> 'sub';
END;
$$ LANGUAGE plpgsql STABLE;
```

- ✅ **정상**: Clerk 인증과 Supabase 통합 방식에 맞음
- **참고**: `auth.jwt() ->> 'sub'`는 Clerk의 user ID를 반환

#### `is_admin()` 함수

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE clerk_user_id = current_clerk_id()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

- ✅ **정상**: `SECURITY DEFINER`로 권한 체크 가능
- ⚠️ **주의**: `profiles.role`이 NULL일 수 있음 (타입 정의 확인)
- **권장**: NULL 체크 추가 고려
  ```sql
  AND role = 'admin' AND role IS NOT NULL
  ```

#### `current_profile_id()` 함수

```sql
CREATE OR REPLACE FUNCTION current_profile_id()
RETURNS uuid AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE clerk_user_id = current_clerk_id();
  RETURN v_profile_id;
END;
$$ LANGUAGE plpgsql STABLE;
```

- ✅ **정상**: Clerk ID로 Profile ID 조회
- ⚠️ **주의**: Profile이 없을 경우 NULL 반환 (정책에서 NULL 체크 필요)

### 2. 정책 검토

#### `profiles` 테이블 정책

- ✅ **SELECT**: 본인 또는 관리자만 조회 가능 - 적절함
- ✅ **UPDATE**: 본인만 수정 가능 - 적절함
- ✅ **INSERT**: 인증된 사용자 누구나 (회원가입) - 적절함

#### `users` 테이블 정책

- ✅ **SELECT**: 본인 또는 관리자 - 적절함
- ✅ **UPDATE/INSERT**: 본인만 - 적절함

#### `wholesalers` 테이블 정책

- ✅ **SELECT**: 인증된 사용자 모두 (상품 상세 페이지에서 도매상 정보 표시 필요) - 적절함
- ✅ **UPDATE/INSERT**: 본인만 - 적절함
- ⚠️ **주의**: 민감 정보(은행 계좌 등)는 프론트엔드에서 필터링 필요

#### `retailers` 테이블 정책

- ✅ **SELECT**: 인증된 사용자 모두 (도매상이 주문 관리 시 소매상 정보 필요) - 적절함
- ✅ **UPDATE/INSERT**: 본인만 - 적절함

#### `products` 테이블 정책

- ✅ **SELECT**: 활성 상품은 공개, 비활성은 소유자/관리자만 - 적절함
- ✅ **INSERT/UPDATE/DELETE**: 도매상 소유자만 - 적절함

#### `product_variants` 테이블 정책

- ✅ **SELECT**: 부모 상품 권한 따름 - 적절함
- ✅ **ALL**: 도매상 소유자만 관리 - 적절함

#### `cart_items` 테이블 정책

- ✅ **ALL**: 소매상 본인만 - 적절함

#### `orders` 테이블 정책

- ✅ **SELECT**: 주문한 소매상, 주문받은 도매상, 관리자 - 적절함
- ✅ **INSERT**: 소매상만 (주문 생성) - 적절함
- ✅ **UPDATE**: 도매상, 관리자, 소매상(취소) - 적절함

#### `settlements` 테이블 정책

- ✅ **SELECT**: 해당 도매상, 관리자 - 적절함
- ⚠️ **누락**: INSERT/UPDATE 정책 없음
- **권장**: 정산은 시스템에서 생성하므로 Service Role 사용 또는 관리자만 INSERT 허용

#### `payments` 테이블 정책

- ✅ **SELECT**: 관련 주문의 소매상/도매상, 관리자 - 적절함
- ⚠️ **누락**: INSERT/UPDATE 정책 없음
- **권장**: 결제는 시스템에서 생성하므로 Service Role 사용 또는 관리자만 INSERT 허용

#### `inquiries` 테이블 정책

- ✅ **SELECT**: 작성자, 수신자(도매상), 관리자 - 적절함
- ✅ **INSERT**: 인증된 사용자 - 적절함
- ✅ **UPDATE**: 작성자, 수신자, 관리자 - 적절함

#### `inquiry_messages` 테이블 정책

- ✅ **SELECT**: 부모 문의 접근 권한 있는 사람 - 적절함
- ✅ **INSERT**: 본인 메시지만 - 적절함
- ⚠️ **누락**: UPDATE 정책 없음 (수정 기능 필요 시)

#### `cs_threads` 테이블 정책

- ✅ **ALL**: 작성자, 관리자 - 적절함

#### `cs_messages` 테이블 정책

- ✅ **SELECT**: 스레드 소유자, 관리자 - 적절함
- ✅ **INSERT**: 본인 또는 관리자 - 적절함
- ⚠️ **주의**: 관리자가 INSERT 가능한 것은 적절하나, `WITH CHECK`에 관리자 체크 추가 권장

#### `audit_logs` 테이블 정책

- ✅ **SELECT**: 관리자만 - 적절함
- ⚠️ **누락**: INSERT 정책 없음 (주석에 "시스템에서 처리"라고 되어 있음)
- **권장**: Service Role 사용 또는 관리자만 INSERT 허용

#### `announcements` / `faqs` 테이블 정책

- ✅ **SELECT**: 누구나 (authenticated, anon) - 적절함
- ✅ **ALL**: 관리자만 - 적절함

#### `ai_product_suggestions` 테이블 정책

- ✅ **SELECT**: 해당 도매상 - 적절함
- ⚠️ **누락**: INSERT/UPDATE 정책 없음
- **권장**: 시스템에서 생성하므로 Service Role 사용 또는 도매상/관리자만 INSERT 허용

#### `account_deletions` 테이블 정책

- ✅ **INSERT**: 본인만 - 적절함
- ⚠️ **누락**: RLS 활성화 목록에 없음
- **권장**: RLS 활성화 목록에 추가 필요

---

## 🔧 수정된 SQL 문서

다음과 같이 수정된 SQL을 제공합니다:

### 주요 수정 사항:

1. `delivery_addresses` 관련 구문 제거
2. `account_deletions` 테이블 RLS 활성화 추가
3. 누락된 정책 추가 (settlements, payments, ai_product_suggestions INSERT/UPDATE)
4. `is_admin()` 함수에 NULL 체크 추가 권장

---

## ✅ 검증 체크리스트

실제 적용 전 다음 사항을 확인하세요:

- [ ] `delivery_addresses` 테이블이 실제로 필요한지 확인
- [ ] `account_deletions` 테이블 RLS 활성화 추가
- [ ] Helper 함수들이 올바르게 동작하는지 테스트
- [ ] 각 정책이 실제 사용 시나리오와 일치하는지 확인
- [ ] 시스템에서 자동 생성되는 레코드(settlements, payments 등)는 Service Role 사용 확인
- [ ] 프로덕션 적용 전 스테이징 환경에서 충분한 테스트 수행

---

## 📝 추가 권장 사항

### 1. 정책 테스트

각 정책이 의도한 대로 동작하는지 테스트 케이스 작성 권장:

- 소매상 사용자로 테스트
- 도매상 사용자로 테스트
- 관리자 사용자로 테스트
- 인증되지 않은 사용자로 테스트

### 2. 성능 고려

- `is_admin()` 함수는 `SECURITY DEFINER`이므로 성능 영향 최소화
- `current_profile_id()` 함수는 자주 호출되므로 인덱스 확인 필요
- `profiles.clerk_user_id`에 인덱스가 있는지 확인

### 3. 보안 강화

- 민감 정보(은행 계좌, 개인정보)는 별도 View로 분리하여 접근 제어 고려
- `audit_logs` INSERT는 반드시 Service Role 사용 권장

---

## 🎯 결론

제공된 RLS 정책은 전반적으로 잘 작성되어 있으나, 다음 수정이 필요합니다:

1. **즉시 수정 필요**: `delivery_addresses` 관련 구문 제거, `account_deletions` RLS 활성화 추가
2. **권장 수정**: 누락된 INSERT/UPDATE 정책 추가 (settlements, payments, ai_product_suggestions)
3. **테스트 권장**: 각 정책이 실제 사용 시나리오에서 올바르게 동작하는지 확인

수정된 SQL 문서는 별도로 제공됩니다.
