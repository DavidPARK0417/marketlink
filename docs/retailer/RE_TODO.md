# TODO - 소매점(Retailer) 기능 개발

> **프로젝트:** MarketLink 소매점 사이트
> **업데이트:** 2024-11-26 (상품 검색 기능 구현 완료: 데이터베이스 스키마, 검색/필터링, 페이지네이션)
> **참조:** PRD.md (Section 3)

---

## 📋 개발 우선순위

```
Phase 1: 인증 & 기본 구조 (1-2주)
Phase 2: 상품 탐색 & 장바구니 (2-3주)
Phase 3: 주문 & 결제 (2-3주)
Phase 4: 마이페이지 & 거래 관리 (1-2주)
Phase 5: AI 기능 & 최적화 (2-3주)
```

---

## Phase 1: 인증 & 기본 구조 🔐

### 1.1 인증 시스템 (R.AUTH.01-03)

- [X] **Clerk 인증 설정**

  - [X] Clerk 프로젝트 생성 및 환경변수 설정
  - [X] 한국어 로컬라이제이션 적용
  - [X] 로그인/회원가입 페이지 구현 (`/app/sign-in`, `/app/sign-up`)
  - [X] 소매점 사용자 역할(role) 구분 로직 추가
  - [X] 역할 선택 페이지 구현 (`/role-selection`) - 디자인 레이아웃 적용 완료
- [X] **초기 리다이렉트 구현 (R.AUTH.02)**

  - [X] 로그인 성공 시 `/retailer/dashboard` 자동 이동
  - [X] 미인증 사용자 접근 시 로그인 페이지로 리다이렉트
  - [X] `middleware.ts`에서 경로 보호 설정
- [ ] **Supabase RLS 권한 설정 (R.AUTH.03)**

  - [ ] 소매점 사용자가 본인 데이터만 조회하도록 RLS 정책 작성
  - [ ] 도매점 개인정보(PII) 접근 차단 정책 추가
  - [ ] 테스트 계정으로 권한 검증

### 1.2 레이아웃 & 네비게이션

- [X] **공통 레이아웃 구조**

  - [X] `/app/retailer/layout.tsx` 생성
    - 소매점 권한 확인 (`requireRetailer()`)
    - 헤더 컴포넌트 통합
    - 공통 레이아웃 구조 완성
  - [X] 헤더 컴포넌트 (`components/retailer/header.tsx`)
    - [X] 로고 (FarmToBiz 로고 이미지 및 텍스트)
    - [X] 로고 클릭 시 홈페이지(`/`)로 이동
    - [X] 사용자 메뉴 (Clerk UserButton)
    - [X] 로그아웃 버튼 (UserButton 내장 기능)
    - [X] 반응형 디자인 적용
    - [X] 주요 페이지 네비게이션 링크 추가 (대시보드, 상품, 장바구니, 주문내역)
    - [X] 현재 페이지 하이라이트 기능
    - [X] 모바일 하단 네비게이션 바
  - [X] **Navbar 숨김 처리**
    - [X] 소매점 페이지(`/retailer/*`)에서 Navbar 숨김 처리
    - [X] `components/Navbar.tsx` 수정
  - [ ] 사이드바 네비게이션 (`components/retailer/sidebar.tsx`)
    - 대시보드 링크
    - 상품 검색 링크
    - 주문 내역 링크
    - 마이페이지 링크
  - [ ] 모바일 반응형 네비게이션 (햄버거 메뉴)
- [ ] **다크 모드 지원**

  - [ ] next-themes 설정 확인 (이미 설치됨)
  - [ ] 테마 토글 버튼 추가
  - [ ] 다크 모드 색상 팔레트 정의

---

## Phase 2: 상품 탐색 & 장바구니 🛒

### 2.1 대시보드 (R.DASH.01-04)

- [X] **Bento Grid 레이아웃 (R.DASH.01)**

  - [X] `/app/retailer/dashboard/page.tsx` 생성
  - [X] Bento Grid 컴포넌트 구현 (`components/retailer/bento-grid.tsx`)
  - [X] 모바일/태블릿/데스크톱 레이아웃 최적화
  - [X] Tailwind CSS로 반응형 스타일링
- [X] **AI 추천 상품 모듈 기본 구조 (R.DASH.02)**

  - [X] AI 추천 상품 카드 컴포넌트 (`components/retailer/ai-recommendation-card.tsx`)
  - [X] "지금 구매해야 할 상품" 리스트 UI (`components/retailer/ai-recommendation-list.tsx`)
  - [X] 제철 농산물 배지 표시
  - [X] 재고 부족 예상 알림 UI
  - [X] 대시보드에 통합 완료
  - [ ] AI 추천 로직 API 연동 (백엔드 필요)
- [X] **최근 주문 요약 (R.DASH.03)**

  - [X] 최근 주문 3건 요약 컴포넌트 (`components/retailer/recent-orders-summary.tsx`)
  - [X] 주문 상태별 색상/아이콘 표시
  - [X] 배송 상태 표시 (새벽 배송 준비 중, 일반 배송 중)
  - [X] 상세 페이지로 이동하는 링크
  - [X] 대시보드에 통합 완료
- [X] **긴급 알림/공지 (R.DASH.04)**

  - [X] 알림 컴포넌트 (`components/retailer/urgent-alerts.tsx`)
  - [X] 재고 부족 알림 표시
  - [X] 플랫폼 공지사항 표시
  - [X] 알림 타입별 색상/아이콘 구분
  - [X] 다크 모드 최적화
  - [X] 대시보드에 통합 완료
- [X] **대시보드 UI 개선**

  - [X] 대시보드 제목 변경 ("실시간 시세와 재고, 주문 알림을 한눈에!" / "AI가 똑똑하게 알려드립니다.")
  - [X] 제목 위 빈 공간 제거 및 글자 크기 확대
  - [X] 하단 이벤트/프로모션 배너 추가
    - [X] 현재 진행 중인 할인 이벤트 배너 (연말 특가 할인)
    - [X] 시즌 특가 배너 (첫 구매자/단골고객 전용)
    - [X] 테두리 강조 스타일 적용 (대시보드 디자인과 일관성 유지)

### 2.2 상품 검색 & 탐색 (R.SEARCH.01-05)

- [X] **데이터베이스 스키마**

  - [X] `products` 테이블 마이그레이션 생성
    - [X] AI 표준화 상품명 필드 (`standardized_name`) - 기존 필드
    - [X] 원본 상품명 필드 (`original_name`) - 추가 완료
    - [X] 카테고리 필드 (`category`: 엽채류, 근채류 등) - 기존 필드
    - [X] 가격 필드 (`price`) - 기존 필드
    - [X] 재고 필드 (`stock`) - 추가 완료
    - [X] 배송 옵션 필드 (`delivery_options`) - JSONB 타입으로 추가 완료
    - [X] 도매상 ID 필드 (`wholesaler_id`) - 기존 필드
    - [X] 한국어 텍스트 검색 지원 (`pg_trgm` 확장 설치 및 인덱스 생성)
  - [X] `wholesalers` 테이블에 익명 식별자 필드 추가
    - 익명 ID (`anonymous_id`: Partner #F2B-01 형식)
    - 대략적 지역 (`region`: 시/구 단위)
  - [X] 배송 옵션 관련 필드 추가
    - 새벽 배송 가능 여부 (`is_dawn_delivery_available`)
    - 배송 시간대 (`delivery_time_slots`)
- [X] **Smart Search - Command Palette (R.SEARCH.01)**

  - [X] `cmdk` 라이브러리 설치
  - [X] Command Palette 컴포넌트 구현 (`components/retailer/command-palette.tsx`)
  - [X] Cmd+K (또는 Ctrl+K) 단축키 등록
  - [X] 상품명 검색 기능
  - [X] 카테고리 필터 (엽채류, 근채류 등)
  - [X] 주문 내역 검색 기능 (기본 구조 완료, API 연동 필요)
  - [X] AI 질의 모드 통합 (Phase 5) (기본 구조 완료, Phase 5에서 구현 예정)
- [X] **상품 리스트 페이지 기본 구조 (R.SEARCH.02, R.SEARCH.03)**

  - [X] `/app/retailer/products/page.tsx` 생성
  - [X] 상품 카드 그리드 레이아웃
    - AI 표준화 상품명 표시
    - 익명 판매자 정보 (Partner #XXX)
    - 가격 표시
    - 배송 옵션 배지 (새벽 배송 가능, 제철)
  - [X] 검색창 UI
  - [X] 필터 버튼 및 필터 칩 UI
  - [X] 필터링 기능 구현 (API 연동 완료)
    - [X] 카테고리 필터
    - [X] 새벽 배송 가능 필터 (R.SEARCH.03)
    - [ ] 가격 범위 필터 (추후 구현)
  - [X] 정렬 옵션 (최신순, 가격순, 이름순)
  - [X] 페이지네이션 구현
  - [X] 서버 컴포넌트를 사용한 데이터 페칭 (`lib/supabase/queries/retailer-products.ts`)
  - [X] 검색 및 필터 클라이언트 컴포넌트 (`components/retailer/product-search-client.tsx`)
- [X] **상품 상세 페이지 기본 구조 (R.SEARCH.04, R.SEARCH.05)**

  - [X] `/app/retailer/products/[id]/page.tsx` 생성
  - [X] 상품 이미지 표시 (Next.js Image 컴포넌트 사용)
  - [X] AI 표준화 상품명 & 규격 표시
  - [X] 익명 판매자 정보 표시
    - 익명 식별자 (Partner #F2B-01)
    - 대략적 지역 (시/구 단위)
  - [X] 배송 옵션 정보 표시
    - 새벽 배송 / 일반 배송 안내
    - 배송비 정보
  - [X] 수량 선택 UI
  - [X] 장바구니 담기 버튼 (R.SEARCH.05)
  - [X] 바로 구매 버튼
  - [X] 상세 정보 탭 기능 구현
- [X] **카테고리별 상품 목록 페이지**

  - [X] `/app/retailer/categories/[category]/page.tsx` 생성
  - [X] 필터 사이드바 UI (데스크톱)
  - [X] 모바일 필터 버튼
  - [X] 정렬 옵션 UI
  - [ ] 필터 기능 구현 (API 연동 필요)
- [X] **도매 정보 익명화 UI 구현 (R.SEARCH.04)**

  - [X] 익명 식별자 표시 (Partner #F2B-01 형식)
  - [X] 대략적 지역만 노출 (시/구 단위)
  - [ ] 익명 식별자 생성 로직 구현 (백엔드 필요)
    - 해시 기반 고유 ID 생성 (Partner #F2B-01 형식)
  - [ ] 상세 상호명 마스킹 함수 작성 (`lib/utils/mask-wholesaler-info.ts`)

### 2.3 장바구니 (R.CART.01-04)

- [ ] **장바구니 상태 관리 (R.CART.01)**

  - [ ] Zustand 스토어 생성 (`stores/cart-store.ts`)
    - 장바구니 아이템 배열
    - 총 금액 계산
  - [ ] 장바구니 추가 액션 (`addToCart`)
  - [ ] 장바구니 수정 액션 (`updateCartItem`)
  - [ ] 장바구니 삭제 액션 (`removeFromCart`)
  - [ ] 로컬 스토리지 연동 (페이지 새로고침 대응)
- [X] **장바구니 페이지 기본 구조 (R.CART.02, R.CART.03)**

  - [X] `/app/retailer/cart/page.tsx` 생성
  - [X] 상품 목록 카드 뷰
    - 상품 이미지
    - AI 표준화 상품명
    - 익명 판매자
    - 단가 및 수량
    - 소계
  - [X] 전체 선택 체크박스
  - [X] 수량 증가/감소 버튼 UI (R.CART.02)
  - [X] 개별 상품 삭제 버튼 UI (R.CART.02)
  - [X] 선택 삭제 버튼
  - [X] 빈 장바구니 상태 UI 준비
  - [X] 반응형 레이아웃 개선 완료 (모바일/태블릿/데스크톱 최적화)
  - [X] 대시보드/상품 페이지와 일관된 레이아웃 패턴 적용
  - [ ] 수량/삭제 기능 구현 (API 연동 필요)
- [X] **가격 계산 로직 UI (R.CART.03)**

  - [X] 상품별 소계 계산 표시
  - [X] 배송비 계산 표시 (도매상별)
  - [X] 총 결제 금액 계산 표시
  - [X] 예상 총합계 표시 (Sticky Footer)
  - [ ] 실시간 금액 업데이트 기능 구현 (상태 관리 필요)
- [ ] **주문 검증 (R.CART.04)**

  - [ ] 최소 주문 수량 체크
  - [ ] 재고 확인
  - [ ] 도매상 마감 시간 체크
  - [ ] Validation 에러 메시지 표시
  - [ ] '주문하기' 버튼 활성화/비활성화 로직

---

## Phase 3: 주문 & 결제 💳

### 3.1 주문서 작성 (R.ORDER.01-02)

- [ ] **데이터베이스 스키마**

  - [ ] `orders` 테이블 마이그레이션
    - 주문 ID (`id`)
    - 소매점 사용자 ID (`retailer_user_id`)
    - 주문 상태 (`status`: 접수, 준비, 배송 중, 완료, 취소)
    - 배송 옵션 (`delivery_option`: 새벽, 일반)
    - 배송 예정 시간 (`delivery_scheduled_time`)
    - 배송지 정보 (`delivery_address`)
    - 총 금액 (`total_amount`)
    - 결제 정보 (`payment_info`)
    - 생성일 (`created_at`)
  - [ ] `order_items` 테이블 마이그레이션
    - 주문 아이템 ID (`id`)
    - 주문 ID (`order_id`)
    - 상품 ID (`product_id`)
    - 수량 (`quantity`)
    - 단가 (`unit_price`)
    - 소계 (`subtotal`)
- [X] **주문서 페이지 기본 구조 (R.ORDER.01, R.ORDER.02)**

  - [X] `/app/retailer/checkout/page.tsx` 생성
  - [X] 주문 상품 목록 요약
    - 상품명, 수량, 가격
  - [X] 배송 정보 표시 UI
    - 받는 분, 연락처, 주소
    - 배송 정보 변경 버튼
  - [X] 배송 요청사항 입력
- [X] **배송 옵션 선택 UI (R.ORDER.01)**

  - [X] 새벽 배송 / 일반 배송 라디오 버튼
  - [X] 옵션별 배송비 표시
  - [X] 선택한 옵션에 따른 UI 변경
  - [ ] 도매상이 설정한 옵션만 표시 (API 연동 필요)
- [X] **배송 시간 지정 UI (R.ORDER.02)**

  - [X] 배송 시간 선택 드롭다운
  - [ ] Wheel Time Picker 컴포넌트 구현 (`components/retailer/time-picker.tsx`)
  - [ ] 도매상이 설정한 시간대 필터링 (API 연동 필요)
  - [ ] 선택한 시간 미리보기
  - [ ] 가게 오픈 시간에 맞춘 배송 시간 선택

### 3.2 결제 (R.ORDER.03-05)

- [X] **결제 수단 선택 UI (R.ORDER.03)**

  - [X] 결제 수단 선택 UI
    - 토스페이먼츠
    - 신용/체크카드
    - 계좌이체
  - [X] 최종 결제 금액 표시
  - [X] 결제하기 버튼
  - [X] 수취인 플랫폼 표시 (Farm to Biz)
- [ ] **Toss Payments SDK 연동 (R.ORDER.03)**

  - [ ] `@tosspayments/payment-sdk` 설치
  - [ ] 환경변수 설정 (테스트/프로덕션 키)
    - `NEXT_PUBLIC_TOSS_CLIENT_KEY`
    - `TOSS_SECRET_KEY`
  - [ ] 결제 요청 컴포넌트 (`components/retailer/payment-button.tsx`)
- [ ] **결제 처리 로직 (R.ORDER.04, R.ORDER.05)**

  - [ ] 주문 생성 Server Action (`actions/create-order.ts`)
  - [ ] 결제 승인 API 라우트 (`/app/api/payments/approve/route.ts`)
  - [ ] 결제 실패 처리 (`/app/api/payments/fail/route.ts`)
  - [ ] 수취인을 플랫폼 명의로 설정 (R.ORDER.04)
  - [ ] 결제 성공 시 주문 상태 업데이트
- [ ] **데이터 무결성 검증 (R.ORDER.05)**

  - [ ] 클라이언트 금액과 서버 금액 대조
  - [ ] 재고 재확인
  - [ ] 가격 변동 체크
  - [ ] 검증 실패 시 사용자에게 알림
  - [ ] 트랜잭션 처리로 데이터 일관성 보장
- [ ] **결제 완료 페이지**

  - [ ] `/app/retailer/checkout/success/page.tsx` 생성
  - [ ] 주문 번호 및 상세 정보 표시
  - [ ] 주문 내역 페이지로 이동 버튼
  - [ ] 영수증 다운로드 기능 (선택사항)

---

## Phase 4: 마이페이지 & 거래 관리 📦

### 4.1 주문 내역 (R.MY.01-02)

- [X] **주문 목록 페이지 기본 구조 (R.MY.01)**

  - [X] `/app/retailer/orders/page.tsx` 생성
  - [X] 주문 목록 카드 뷰
    - 주문 번호
    - 주문 날짜
    - 상품명 (대표 상품 + N개)
    - 주문 상태 배지
    - 총 금액
  - [X] 상태별 필터 칩 UI (전체, 주문 완료, 배송 중, 배송 완료, 주문 취소)
  - [X] 검색창 UI (주문 번호, 상품명)
  - [X] 조회 기간 설정 버튼
  - [X] 상세 보기 링크
  - [X] 구매 확정 버튼 UI (배송 완료 시)
  - [X] 재주문 버튼 UI
  - [X] 반응형 레이아웃 개선 완료 (모바일/태블릿/데스크톱 최적화)
  - [X] 대시보드/상품 페이지와 일관된 레이아웃 패턴 적용
  - [ ] 필터/검색 기능 구현 (API 연동 필요)
  - [ ] 페이지네이션
  - [ ] React Query를 사용한 데이터 페칭
- [X] **주문 상세 페이지 (R.MY.01, R.MY.02)**

  - [X] `/app/retailer/orders/[id]/page.tsx` 생성
  - [X] 주문 정보 요약
    - 주문 번호
    - 주문 날짜
    - 주문 상태
    - 총 금액
  - [X] 주문 상품 목록
    - 상품명, 수량, 단가, 소계
    - 익명 판매자 정보
  - [X] 배송지 정보
  - [X] 배송 예정 시간 표시
  - [X] 결제 정보
- [X] **배송 타임라인 UI (R.MY.02)**

  - [X] 타임라인 UI 구현 (주문 상세 페이지 내)
  - [X] 주문 접수 → 확인 → 준비 → 배송 중 → 완료 단계 표시
  - [X] 선택한 배송 예정 시간 강조
  - [X] 각 단계별 타임스탬프 표시
  - [X] 현재 진행 중인 단계 하이라이트
  - [X] 완료된 단계는 체크 표시

### 4.2 구매 확정 (R.MY.03)

- [ ] **구매 확정 기능**

  - [X] '배송 완료' 상태 주문에 구매 확정 버튼 표시 (주문 상세 페이지)
  - [ ] 구매 확정 확인 모달 (`components/retailer/confirm-purchase-modal.tsx`)
  - [ ] 구매 확정 Server Action (`actions/confirm-purchase.ts`)
  - [ ] 정산 로직 트리거 (도매상에게 정산 시작)
  - [ ] Supabase Edge Function으로 정산 알림 전송
- [ ] **구매 확정 후 처리**

  - [ ] 주문 상태를 '구매 확정'으로 업데이트
  - [ ] 리뷰 작성 유도 UI (선택 사항)
  - [ ] 재구매 버튼 제공
  - [ ] 구매 확정 완료 토스트 메시지

### 4.3 마이페이지

- [ ] **프로필 페이지**

  - [ ] `/app/retailer/profile/page.tsx` 생성
  - [ ] 사용자 정보 표시 (Clerk 연동)
    - 이름
    - 이메일
    - 프로필 이미지
  - [ ] 배송지 관리
    - 배송지 목록
    - 배송지 추가/수정/삭제
    - 기본 배송지 설정
  - [ ] 알림 설정
    - 주문 상태 변경 알림
    - 프로모션 알림
    - 재고 알림
- [ ] **통계 대시보드**

  - [ ] 이번 달 구매 금액
  - [ ] 자주 구매한 상품 Top 5
  - [ ] 거래한 도매상 수
  - [ ] 월별 구매 추이 차트 (선택사항)

---

## Phase 5: AI 기능 & 최적화 🤖

### 5.1 통합 AI 인터페이스 (R.AI.01-04)

- [ ] **AI 챗봇 UI (R.AI.01)**

  - [ ] Floating Action Button 컴포넌트 (`components/retailer/ai-chat-fab.tsx`)
  - [ ] 채팅 인터페이스 모달/사이드바 (`components/retailer/ai-chat-interface.tsx`)
  - [ ] 메시지 입력 및 전송
  - [ ] 대화 히스토리 표시
  - [ ] 타이핑 인디케이터
  - [ ] 모든 페이지 하단에 FAB 표시
- [ ] **Command Palette 통합 (R.AI.02)**

  - [ ] Cmd+K에서 AI 질의 모드 추가
  - [ ] 상품 검색 모드와 AI 모드 전환
  - [ ] 검색 결과와 AI 답변 통합 표시
  - [ ] 모드 전환 UI 개선
- [ ] **AI 백엔드 구현 (R.AI.03, R.AI.04)**

  - [ ] AI 질의 처리 Edge Function (`supabase/functions/ai-query/index.ts`)
  - [ ] 배송 가능 여부 조회 로직
    - 도매점 배송 설정 데이터 조회
    - 익명화된 정보만 사용
  - [ ] 도매점 데이터 조회 (익명화된 정보만)
  - [ ] PII 마스킹 처리 (R.AI.04)
    - 상호명 마스킹
    - 연락처 마스킹
    - 상세 주소 마스킹
  - [ ] Gemini API 연동
    - `GEMINI_API_KEY` 사용
    - 프롬프트 엔지니어링
- [ ] **AI 응답 최적화**

  - [ ] 응답 템플릿 작성
    - 배송 가능 여부 응답 템플릿
    - 상품 추천 응답 템플릿
    - 주문 관련 응답 템플릿
  - [ ] 컨텍스트 유지 로직
  - [ ] 오류 처리 및 fallback 메시지
  - [ ] 응답 속도 최적화 (스트리밍)

### 5.2 성능 최적화

- [ ] **이미지 최적화**

  - [ ] Next.js Image 컴포넌트 사용 확인
  - [ ] 이미지 lazy loading 적용
  - [ ] WebP 포맷 변환
  - [ ] 적절한 이미지 사이즈 설정 (width, height)
  - [ ] priority 속성 사용 (Above the fold 이미지)
- [ ] **코드 스플리팅**

  - [ ] 페이지별 동적 import
  - [ ] 컴포넌트 lazy loading
  - [ ] 번들 크기 최적화
  - [ ] Next.js Bundle Analyzer 사용
- [ ] **캐싱 전략**

  - [ ] React Query 캐싱 설정
    - staleTime, cacheTime 최적화
  - [ ] Supabase 쿼리 최적화
    - 필요한 컬럼만 조회 (select)
    - 적절한 인덱스 추가
  - [ ] 정적 페이지 생성 (ISR)
    - 상품 목록 페이지
    - 카테고리 페이지

### 5.3 테스트 & QA

- [ ] **E2E 테스트**

  - [ ] Playwright 설치 및 설정
  - [ ] 테스트 시나리오 작성
    - 로그인 → 상품 검색 → 장바구니 → 주문 플로우
    - 배송 옵션 선택 테스트
    - 결제 프로세스 테스트 (테스트 결제)
    - AI 챗봇 상호작용 테스트
  - [ ] CI/CD 파이프라인에 테스트 추가
- [ ] **접근성 (A11y)**

  - [ ] 키보드 네비게이션 검증
    - Tab 키로 모든 요소 접근 가능
    - Enter/Space로 버튼 활성화
  - [ ] 스크린 리더 호환성
    - 의미 있는 aria-label 추가
    - alt 텍스트 작성
  - [ ] 색상 대비 검증
    - WCAG AA 레벨 준수
  - [ ] ARIA 속성 추가
    - role, aria-* 속성
- [ ] **반응형 테스트**

  - [ ] 모바일 (375px, 414px)
  - [ ] 태블릿 (768px, 1024px)
  - [ ] 데스크톱 (1280px, 1920px)
  - [ ] 가로/세로 모드 테스트
  - [ ] 다양한 브라우저 테스트 (Chrome, Safari, Firefox)

---

## 📊 진행 상황 추적

| Phase                           | 진행률 | 상태    | 시작일     | 완료 예정일 | 최근 업데이트 |
| ------------------------------- | ------ | ------- | ---------- | ----------- | ------------- |
| Phase 1: 인증 & 기본 구조       | 80%    | 진행 중 | 2024-11-24 | -           | 2024-11-25    |
| Phase 2: 상품 탐색 & 장바구니   | 85%    | 진행 중 | 2024-11-24 | -           | 2024-11-26    |
| Phase 3: 주문 & 결제            | 50%    | 진행 중 | 2024-11-25 | -           | 2024-11-25    |
| Phase 4: 마이페이지 & 거래 관리 | 65%    | 진행 중 | 2024-11-25 | -           | 2024-11-25    |
| Phase 5: AI 기능 & 최적화       | 0%     | 대기 중 | -          | -           | -             |

---

## 🚨 중요 주의사항

### ⛔ 절대 금지 사항 - 도매 관련 기능 구현 금지

- ❌ **도매 페이지 기능 절대 구현 금지**
  - `/app/wholesale/` 경로의 모든 파일 수정/생성 금지
  - `Wholesaler/` 폴더의 모든 파일 수정/생성 금지
  - 도매 페이지용 컴포넌트, 훅, 유틸리티 생성 금지
  - 도매 페이지용 API 라우트 생성 금지
- ❌ **도매 페이지 관련 TODO 항목이 있다면 무시하고 구현하지 않기**
- ✅ **이 TODO.md는 오직 소매점(Retailer) 기능만 다룹니다**

### 팀 협업 규칙

- ✅ **소매 페이지만 작업** (`/app/retailer/` 경로, `Retailer/` 폴더)
- ❌ **도매 페이지 수정 금지** (`/app/wholesale/` 경로, `Wholesaler/` 폴더)
- ⚠️ **공통 컴포넌트 수정 시 팀원과 협의 필수** (`/components/ui/`, `/lib/`, `/hooks/`)

### 보안 요구사항 (매우 중요!)

- 🔒 **도매점 개인정보(PII) 절대 노출 금지**
  - 상호명 마스킹
  - 연락처 마스킹
  - 상세 주소 마스킹
- 🔒 **익명 식별자로만 도매상 표시** (Partner #F2B-01 형식)
- 🔒 **Supabase RLS 정책 철저히 적용**
  - 소매점은 본인 데이터만 조회
  - 도매점 민감 정보 접근 차단

### 코딩 컨벤션

- 📝 **커밋 메시지는 한글로 작성**
  - 예: `feat(cart): 장바구니 담기 기능 추가`
  - 예: `fix(auth): 로그인 리다이렉트 오류 수정`
- 🎨 **Tailwind CSS 우선 사용** (인라인 style 금지)
- 📦 **파일명은 kebab-case** (예: `product-card.tsx`, `use-cart.ts`)
- 🔧 **TypeScript strict mode 준수**
- 🧩 **컴포넌트는 PascalCase** (예: `ProductCard`, `CartButton`)

---

## 📚 참고 문서

- [PRD.md](./PRD.md) - 제품 요구사항 정의서
- [AGENTS.md](./AGENTS.md) - 프로젝트 아키텍처 및 기술 스택
- [.cursor/rules/](./.cursor/rules/) - 코딩 규칙 및 가이드라인
- [README.md](./README.md) - 프로젝트 개요 및 설정 가이드

---

## 💡 개발 팁

### 데이터베이스 작업

- 각 Phase 시작 전에 관련 데이터베이스 스키마를 먼저 설계하세요.
- 마이그레이션 파일은 `supabase/migrations/` 폴더에 작성하세요.
- RLS 정책은 개발 초기에는 비활성화하되, 프로덕션에서는 반드시 활성화하세요.

### UI 개발

- AI 기능은 마지막에 추가하되, UI는 미리 만들어두면 좋습니다.
- 반응형 디자인은 모바일 우선(Mobile First)으로 작업하세요.
- 다크 모드를 고려하여 색상을 선택하세요.

### 결제 연동

- 결제 연동은 반드시 테스트 환경에서 충분히 검증하세요.
- Toss Payments 테스트 카드 번호를 사용하세요.
- 결제 실패 시나리오도 반드시 테스트하세요.

### 성능 최적화

- 성능 최적화는 기능 구현이 완료된 후 진행하세요.
- Lighthouse를 사용하여 성능 점수를 측정하세요.
- 불필요한 리렌더링을 방지하세요 (React.memo, useMemo, useCallback).

---

**작성일:** 2024-11-24
**다음 업데이트:** Phase 1 완료 시
**담당자:** 소매 페이지 개발팀
