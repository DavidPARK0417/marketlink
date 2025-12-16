# 토스페이먼츠 결제 승인 API 구현 TODO

## 📋 목적

테스트 결제 성공 후 DB에 데이터가 저장되지 않는 문제를 해결하기 위해 결제 승인 API를 구현합니다.

## 🔍 현재 상태 확인

### ✅ 이미 구현된 부분

1. **DB 스키마**

   - `orders` 테이블: `payment_key`, `paid_at` 필드 존재 ✅
   - `payments` 테이블: 모든 필수 필드 존재 ✅
   - `settlements` 테이블: 모든 필수 필드 존재 ✅

2. **기존 코드**
   - `/api/payments/callback`: 웹훅 수신용 라우트 (구현됨) ✅
   - `createSettlement()`: 정산 생성 함수 (구현됨) ✅
   - DB 저장 로직: 웹훅 콜백에 구현됨 ✅

### ❌ 부족한 부분

1. **결제 승인 API 라우트**: `/api/payments/confirm` (없음)
2. **공통 DB 저장 함수**: 웹훅과 결제 승인 API에서 재사용할 함수 (없음)
3. **결제 성공 페이지**: 소매 저장소에 구현 필요

---

## 👤 도매 페이지 담당자 (현재 사용자) 작업

### 1단계: 공통 DB 저장 함수 분리

**목적**: 웹훅 콜백과 결제 승인 API에서 동일한 로직을 재사용하기 위해 공통 함수로 분리

**작업 내용**:

- [x] **파일 생성**: `lib/payments/process-payment.ts` ✅
  - 함수명: `processPaymentAfterApproval()`
  - 파라미터:
    ```typescript
    {
      orderId: string;
      paymentKey: string;
      approvedAt: string;
      totalAmount: number;
      method?: string;
    }
    ```
  - 반환값: `{ order, settlement, payment }`
  - 기능:
    1. 주문 조회 및 검증 ✅
    2. 중복 처리 확인 (이미 처리된 결제인 경우 기존 데이터 반환) ✅
    3. 주문 상태 업데이트 (`status: 'pending'`, `payment_key`, `paid_at`) ✅
    4. 정산 데이터 생성 (`createSettlement` 호출) ✅
    5. 결제 데이터 저장 (`payments` 테이블, 실패해도 계속 진행) ✅
    6. 에러 처리 및 로깅 ✅

**참고 파일**: `app/api/payments/callback/route.ts` (117-171줄)

**구현 완료**: 2025-01-XX

---

### 2단계: 결제 승인 API 라우트 생성

**목적**: 토스페이먼츠 결제 승인 API를 호출하고 DB에 저장

**작업 내용**:

- [x] **파일 생성**: `app/api/payments/confirm/route.ts` ✅
  - 엔드포인트: `POST /api/payments/confirm`
  - 요청 본문:
    ```typescript
    {
      paymentKey: string;
      orderId: string;
      amount: number;
    }
    ```
  - 처리 흐름:
    1. 요청 본문 검증 (`paymentKey`, `orderId`, `amount` 필수)
    2. **주문 조회 및 금액 검증** (보안 필수)
       - `orders` 테이블에서 `orderId`로 주문 조회
       - 요청된 `amount`와 주문의 `total_amount` 비교
       - 불일치 시 400 에러 반환 (토스페이먼츠 문서 요구사항)
    3. 환경 변수 확인 (`TOSS_SECRET_KEY` 존재 확인)
    4. 토스페이먼츠 결제 승인 API 호출
       - URL: `https://api.tosspayments.com/v1/payments/confirm`
       - Method: `POST`
       - Headers:
         - `Authorization`: `Basic ${base64(secretKey:)}`
         - `Content-Type`: `application/json`
       - Body: `{ paymentKey, orderId, amount }`
    5. 결제 승인 API 응답 확인
       - 성공 시: `processPaymentAfterApproval()` 호출
         - `approvedAt`: 응답의 `approvedAt` 필드 사용
         - `method`: 응답의 `method` 필드 사용 (없으면 기본값 "CARD")
         - `totalAmount`: 요청의 `amount` 사용
       - 실패 시: 에러 응답 반환
    6. 응답 반환
       - 성공: `{ success: true, orderId, settlementId, paymentId }`
       - 실패: `{ error: string, details?: string }`

**환경 변수 확인**:

- [x] `.env.local`에 `TOSS_SECRET_KEY` 존재 확인 ✅
- [x] 테스트 키 형식: `test_sk_...` ✅

**에러 처리**:

- [x] 네트워크 오류 처리 (500 에러) ✅
- [x] 토스페이먼츠 API 오류 처리 ✅
  - `NOT_FOUND_PAYMENT_SESSION`: 404 (결제 시간 만료) ✅
  - `REJECT_CARD_COMPANY`: 400 (카드사 거절) ✅
  - `FORBIDDEN_REQUEST`: 403 (API 키 또는 주문번호 불일치) ✅
  - `UNAUTHORIZED_KEY`: 401 (API 키 오류) ✅
- [x] DB 저장 실패 처리 (`processPaymentAfterApproval`에서 throw된 에러 처리) ✅
- [x] 개발 환경에서만 상세 에러 메시지 포함 ✅

**보안 검증** (토스페이먼츠 문서 요구사항):

- [x] **금액 검증 필수**: 요청된 `amount`와 주문의 `total_amount` 비교 ✅
  - 불일치 시 400 에러: "결제 금액이 주문 금액과 일치하지 않습니다" ✅
  - 클라이언트에서 결제 금액 조작 방지 ✅

**토스페이먼츠 API 응답 처리**:

- [x] `method` 필드: Payment 객체에 항상 포함되지만 null일 수 있음 ✅
  - null이면 기본값 "CARD" 사용 (이미 `processPaymentAfterApproval`에서 처리됨) ✅
- [x] `approvedAt` 필드: ISO 8601 형식 (예: "2023-05-18T16:17:47+09:00") ✅
- [x] `status` 필드: "DONE"인 경우만 성공으로 처리 ✅

**재시도 전략**:

- [x] 서버 사이드 자동 재시도: **하지 않음** ✅
  - 이유: 일부 에러는 재시도 불가능 (예: `NOT_FOUND_PAYMENT_SESSION`) ✅
  - 클라이언트에서 사용자가 재시도하도록 UI 제공 권장 ✅
- [x] 재시도 가능한 에러: 네트워크 오류, 일시적 서버 오류 (5XX) ✅
- [x] 재시도 불가능한 에러: `NOT_FOUND_PAYMENT_SESSION`, `FORBIDDEN_REQUEST`, `UNAUTHORIZED_KEY` ✅

**구현 완료**: 2025-01-XX

---

### 3단계: 웹훅 콜백 리팩토링

**목적**: 기존 웹훅 콜백에서 공통 함수 사용하도록 리팩토링

**작업 내용**:

- [x] **파일 수정**: `app/api/payments/callback/route.ts` ✅
  - `processPaymentAfterApproval()` 함수 import ✅
  - 기존 DB 저장 로직을 `processPaymentAfterApproval()` 호출로 변경 ✅
  - 웹훅 데이터 형식에 맞게 파라미터 변환 ✅
    ```typescript
    processPaymentAfterApproval({
      orderId: body.data.orderId,
      paymentKey: body.data.paymentKey,
      approvedAt: body.data.approvedAt,
      totalAmount: body.data.totalAmount || undefined, // 없으면 주문의 total_amount 사용
      method: body.data.method || undefined, // 없으면 기본값 "CARD" 사용
    });
    ```
  - 불필요한 import 제거 (`getServiceRoleClient`, `createSettlement`, `Order` 타입) ✅
  - 에러 처리 개선 (에러 타입별 HTTP 상태 코드 반환) ✅
  - 웹훅 재전송 정책 고려 (10초 이내 200 응답 필수) ✅

**리팩토링 결과**:

- 코드 라인 수: 205줄 → 164줄 (약 20% 감소)
- 중복 코드 제거: DB 저장 로직이 공통 함수로 통합됨
- 유지보수성 향상: DB 저장 로직 변경 시 한 곳만 수정하면 됨

**구현 완료**: 2025-01-XX

---

### 4단계: 테스트

**목적**: 결제 승인 API가 정상 작동하는지 확인

**작업 내용**:

- [ ] **테스트용 API 엔드포인트 생성** (선택사항)

  - 파일: `app/api/test/payment-confirm/route.ts`
  - 직접 호출하여 테스트 가능하도록
  - ⚠️ 프로덕션 배포 전 삭제 필요

- [ ] **수동 테스트**
  1. Postman 또는 curl로 결제 승인 API 호출
  2. DB 확인:
     - `orders` 테이블: `payment_key`, `paid_at` 업데이트 확인
     - `settlements` 테이블: 정산 데이터 생성 확인
     - `payments` 테이블: 결제 데이터 저장 확인

**테스트 데이터 예시**:

```bash
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "paymentKey": "test_payment_key_here",
    "orderId": "existing_order_id_here",
    "amount": 10000
  }'
```

---

## 👥 소매 페이지 담당자 작업

### 1단계: 결제 성공 페이지 확인/생성

**목적**: 결제 성공 후 결제 승인 API를 호출하는 페이지

**작업 내용**:

- [ ] **파일 확인/생성**: `app/retailer/checkout/success/page.tsx` (소매 저장소)
  - URL 쿼리 파라미터에서 데이터 추출:
    - `paymentKey`: 토스페이먼츠 결제 키
    - `orderId`: 주문 ID
    - `amount`: 결제 금액
  - 결제 승인 API 호출:
    ```typescript
    const response = await fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentKey: searchParams.paymentKey,
        orderId: searchParams.orderId,
        amount: Number(searchParams.amount),
      }),
    });
    ```
  - 응답 처리:
    - 성공: 성공 메시지 표시, 주문 내역 페이지로 리다이렉트
    - 실패: 에러 메시지 표시, 재시도 버튼 제공

**주의사항**:

- 결제 승인 API는 서버 사이드에서 호출해야 함 (시크릿 키 사용)
- 클라이언트 컴포넌트에서는 서버 액션 또는 API 라우트를 통해 호출

---

### 2단계: 결제 요청 페이지 확인

**목적**: `successUrl`이 올바르게 설정되어 있는지 확인

**작업 내용**:

- [ ] **파일 확인**: `app/retailer/checkout/page.tsx` (소매 저장소)
  - TossPayments `requestPayment()` 호출 시 `successUrl` 확인
  - `successUrl` 형식: `/retailer/checkout/success?paymentKey={paymentKey}&orderId={orderId}&amount={amount}`
  - `orderId`는 주문 생성 시 생성된 UUID 사용

**확인 사항**:

- [ ] `successUrl`에 `paymentKey`, `orderId`, `amount` 파라미터 포함
- [ ] `orderId`는 실제 DB에 존재하는 주문 ID
- [ ] `amount`는 실제 결제 금액과 일치

---

### 3단계: 주문 생성 로직 확인

**목적**: 결제 전에 주문이 생성되어 있어야 함

**작업 내용**:

- [ ] **주문 생성 시점 확인**
  - 결제 요청 전에 주문 생성 API 호출
  - 주문 생성 후 받은 `orderId`를 결제 요청에 사용
  - 주문 상태: `status: 'pending'` (결제 대기)

**확인 사항**:

- [ ] 주문 생성 API가 존재하는지 확인
- [ ] 주문 생성 후 `orderId`를 결제 요청에 전달하는지 확인
- [ ] 주문 생성 실패 시 결제 요청을 막는지 확인

---

## 📝 구현 체크리스트

### 도매 담당자 (현재 사용자)

- [x] 1단계: 공통 DB 저장 함수 분리 (`lib/payments/process-payment.ts`) ✅
- [x] 2단계: 결제 승인 API 라우트 생성 (`app/api/payments/confirm/route.ts`) ✅
- [x] 3단계: 웹훅 콜백 리팩토링 (`app/api/payments/callback/route.ts`) ✅
- [ ] 4단계: 테스트 (수동 테스트 또는 테스트 엔드포인트)

### 소매 담당자

- [ ] 1단계: 결제 성공 페이지 확인/생성 (`app/retailer/checkout/success/page.tsx`)
- [ ] 2단계: 결제 요청 페이지 확인 (`app/retailer/checkout/page.tsx`)
- [ ] 3단계: 주문 생성 로직 확인

---

## 🔗 API 명세서

### POST /api/payments/confirm

**요청**:

```typescript
{
  paymentKey: string; // 토스페이먼츠 결제 키
  orderId: string; // 주문 ID (UUID)
  amount: number; // 결제 금액
}
```

**성공 응답** (200):

```typescript
{
  success: true;
  orderId: string;
  settlementId: string;
  paymentId: string;
  message: "결제 완료 및 정산 생성 완료";
}
```

**실패 응답** (400/404/500):

```typescript
{
  error: string;
  details?: string;  // 개발 환경에서만 포함
}
```

**에러 코드**:

- `400`: 필수 파라미터 누락
- `404`: 주문을 찾을 수 없음
- `500`: 서버 오류 (결제 승인 실패, DB 저장 실패 등)

---

## 🧪 테스트 시나리오

### 시나리오 1: 정상 결제 승인

1. 소매 담당자가 결제 요청 페이지에서 결제 진행
2. 결제 성공 후 `/retailer/checkout/success`로 리다이렉트
3. 결제 성공 페이지에서 `/api/payments/confirm` 호출
4. 결제 승인 API가 토스페이먼츠 API 호출
5. DB 저장:
   - `orders` 테이블: `payment_key`, `paid_at` 업데이트
   - `settlements` 테이블: 정산 데이터 생성
   - `payments` 테이블: 결제 데이터 저장
6. 성공 메시지 표시 및 주문 내역 페이지로 리다이렉트

### 시나리오 2: 결제 승인 실패

1. 결제 승인 API 호출
2. 토스페이먼츠 API 오류 응답
3. 에러 메시지 표시
4. 재시도 버튼 제공

### 시나리오 3: 주문 없음

1. 존재하지 않는 `orderId`로 결제 승인 API 호출
2. 404 에러 응답
3. 에러 메시지 표시

---

## 📚 참고 자료

- [토스페이먼츠 결제 승인 API 문서](https://docs.tosspayments.com/reference#%EA%B2%B0%EC%A0%9C-%EC%8A%B9%EC%9D%B8)
- [토스페이먼츠 웹훅 문서](https://docs.tosspayments.com/guides/webhook)
- [토스페이먼츠 결제 흐름 가이드](https://docs.tosspayments.com/guides/payment-widget/integration)

---

## ⚠️ 주의사항

1. **보안**

   - 결제 승인 API는 시크릿 키를 사용하므로 서버 사이드에서만 호출
   - 클라이언트에서 직접 호출 금지

2. **에러 처리**

   - 결제 승인 실패 시 사용자에게 명확한 에러 메시지 제공
   - 재시도 가능하도록 UI 제공

3. **중복 처리**

   - 동일한 `paymentKey`로 중복 호출 방지 (멱등성 보장)
   - 이미 결제 완료된 주문은 재처리하지 않음

4. **로깅**
   - 모든 결제 승인 시도 로깅
   - 에러 발생 시 상세 로그 기록

---

## 🎯 완료 기준

### 도매 담당자

- [ ] 결제 승인 API 라우트 구현 완료
- [ ] 공통 DB 저장 함수 분리 완료
- [ ] 웹훅 콜백 리팩토링 완료
- [ ] 수동 테스트 완료 (DB 저장 확인)

### 소매 담당자

- [ ] 결제 성공 페이지 구현 완료
- [ ] 결제 승인 API 호출 확인
- [ ] 전체 결제 플로우 테스트 완료

### 통합 테스트

- [ ] 테스트 결제 진행
- [ ] DB에 데이터 저장 확인 (`orders`, `settlements`, `payments`)
- [ ] 정산 내역 조회 확인

---

## 📞 협업 가이드

### 소매 담당자에게 전달할 내용

```
결제 승인 API가 준비되었습니다.

결제 성공 페이지(`/retailer/checkout/success`)에서
다음 API를 호출해주세요:

POST /api/payments/confirm
Content-Type: application/json

Body:
{
  "paymentKey": "토스페이먼츠에서 받은 paymentKey",
  "orderId": "주문 ID (UUID)",
  "amount": 결제금액 (number)
}

이 API는 결제 승인 후 자동으로 DB에 저장합니다.
(orders, settlements, payments 테이블)

API 명세서는 위 TODO 문서를 참고해주세요.
```

---

**작성일**: 2025-01-XX  
**작성자**: 도매 페이지 담당자  
**최종 수정일**: 2025-01-XX
