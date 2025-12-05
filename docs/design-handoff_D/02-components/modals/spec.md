# Modal 컴포넌트 명세서

## 개요

Modal은 사용자의 주의를 집중시켜 특정 작업을 수행하거나 중요한 정보를 전달하는 컴포넌트입니다. 백드롭(Backdrop), 컨테이너(Container), 헤더(Header), 바디(Body), 푸터(Footer)로 구성됩니다.

### Modal 구조

```
Modal (fixed inset-0)
├── Backdrop (absolute inset-0)
│   └── bg-black/50 backdrop-blur-sm
├── Container (relative z-10)
│   ├── Header
│   │   ├── Title
│   │   └── Close Button
│   ├── Body
│   │   └── Content (scrollable)
│   └── Footer
│       └── Action Buttons
```

---

## Variants (변형)

Modal은 콘텐츠의 양과 용도에 따라 4가지 크기로 구분됩니다.

### 1. Small (작음)
- **Max Width**: `max-w-sm` (24rem)
- **사용 처**: 간단한 확인, 선택지 제시
- **예시**: 삭제 확인, 간단한 알림

```css
.modal-small {
  max-width: 28rem; /* 448px */
}
```

### 2. Medium (중간)
- **Max Width**: `max-w-md` (28rem) ~ `max-w-lg` (32rem)
- **사용 처**: 일반적인 폼, 짧은 설명
- **예시**: 로그인, 회원가입

```css
.modal-medium {
  max-width: 32rem; /* 512px */
}
```

### 3. Large (크름)
- **Max Width**: `max-w-2xl` (42rem) ~ `max-w-3xl` (48rem)
- **사용 처**: 복잡한 폼, 상세 정보 표시
- **예시**: EditProductModal (상품 편집)

```css
.modal-large {
  max-width: 42rem; /* 672px */
}
```

### 4. Full Screen (전체 화면)
- **Max Width**: `w-full` (100%)
- **Max Height**: `max-h-[90vh]` (최대 90% 뷰포트 높이)
- **사용 처**: 이미지 갤러리, 상세 뷰
- **모바일**: 모바일 기기에서는 자동으로 Full Screen으로 표시

```css
.modal-fullscreen {
  width: 100%;
  max-height: 90vh;
}
```

---

## States (상태)

Modal의 생명주기는 4가지 상태로 구분됩니다.

### 1. Closed (닫힘)
- `isOpen: false`
- `isVisible: false`
- DOM에서 제거됨 (`return null`)
- 애니메이션 클래스 미적용

```typescript
// Closed 상태
if (!isVisible && !isOpen) return null;
```

### 2. Opening (열리는 중)
- `isOpen: true`
- `isVisible: true`
- 애니메이션 시작
- 트렌지션: 300ms

**클래스**:
```css
opacity-0 → opacity-100
scale-95 translate-y-4 → scale-100 translate-y-0
```

### 3. Open (열림)
- `isOpen: true`
- `isVisible: true`
- 완전히 표시됨
- `document.body.style.overflow: 'hidden'` 적용 (스크롤 방지)

```css
.modal-open {
  opacity: 1;
  transform: scale(1) translateY(0);
}
```

### 4. Closing (닫히는 중)
- `isOpen: false`
- `isVisible: true` (트렌지션 완료까지)
- 애니메이션 진행 중
- 트렌지션: 300ms 후 DOM에서 제거

```typescript
setTimeout(() => setIsVisible(false), 300);
```

---

## Props 정의

### Modal Component Props

```typescript
interface ModalProps {
  // 상태 제어
  isOpen: boolean;              // Modal 열림/닫힘 상태
  onClose: () => void;          // 모달 닫기 콜백

  // 컨텐츠
  title?: string;               // Modal 제목 (Header)
  children?: React.ReactNode;   // Modal Body 컨텐츠
  footer?: React.ReactNode;     // Footer 컨텐츠 (선택사항)

  // 스타일 (선택사항)
  size?: 'sm' | 'md' | 'lg' | 'full';  // Modal 크기 (기본값: 'lg')
  className?: string;           // 커스텀 CSS 클래스

  // 동작 (선택사항)
  closeOnBackdropClick?: boolean;  // 백드롭 클릭 시 닫기 (기본값: true)
  closeOnEscKey?: boolean;         // ESC 키 눌렀을 때 닫기 (기본값: true)

  // 접근성 (선택사항)
  role?: 'dialog' | 'alertdialog';  // ARIA role (기본값: 'dialog')
  ariaLabelledBy?: string;          // Header ID
  ariaDescribedBy?: string;         // Body ID
}
```

### 기존 Modal 컴포넌트 Props

#### EditProductModal Props
```typescript
interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => void;
}
```

#### TermsModal Props
```typescript
interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}
```

#### PriceChartModal Props
```typescript
interface PriceChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}
```

---

## 스타일 명세 (Style Specification)

### Backdrop

```css
.modal-backdrop {
  /* 위치 및 레이아웃 */
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem; /* p-4 */

  /* 트렌지션 */
  transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-backdrop--open {
  opacity: 1;
}

.modal-backdrop--closing {
  opacity: 0;
}

/* 반투명 검은색 오버레이 */
.modal-backdrop::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5); /* bg-black/50 */
  backdrop-filter: blur(4px); /* backdrop-blur-sm */
  cursor: pointer;
}
```

### Container (Modal Box)

```css
.modal-container {
  /* 위치 및 레이아웃 */
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;

  /* 크기 */
  width: 100%;
  max-height: 90vh;

  /* 테두리 및 그림자 */
  border-radius: 1rem; /* rounded-2xl */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04); /* shadow-2xl */

  /* 트렌지션 */
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-container--open {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.modal-container--closing {
  opacity: 0;
  transform: scale(0.95) translateY(1rem);
}

/* 크기 변형 */
.modal-sm {
  max-width: 28rem; /* 448px */
}

.modal-md {
  max-width: 32rem; /* 512px */
}

.modal-lg {
  max-width: 42rem; /* 672px */
}

.modal-xl {
  max-width: 48rem; /* 768px */
}

.modal-full {
  width: 100%;
  max-height: 90vh;
}
```

### Header

```css
.modal-header {
  /* 레이아웃 */
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* 패딩 및 테두리 */
  padding: 1.5rem; /* p-6 */
  border-bottom: 1px solid #f3f4f6; /* border-gray-100 */

  /* 배경색 */
  background-color: #ffffff;
}

.modal-header__title {
  font-size: 1.25rem; /* text-xl */
  font-weight: 700;
  color: #111827; /* gray-900 */
  margin: 0;
  padding: 0;
}

.modal-header__close {
  display: flex;
  align-items: center;
  justify-content: center;

  /* 크기 */
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem; /* p-2 */

  /* 스타일 */
  background-color: transparent;
  border: none;
  border-radius: 9999px; /* rounded-full */
  cursor: pointer;
  color: #6b7280; /* text-gray-500 */

  /* 트렌지션 */
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-header__close:hover {
  background-color: #f3f4f6; /* bg-gray-100 */
  color: #374151; /* text-gray-700 */
}

.modal-header__close:active {
  transform: scale(0.95);
}
```

### Body

```css
.modal-body {
  /* 레이아웃 */
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  /* 패딩 */
  padding: 1.5rem; /* p-6 */

  /* 배경색 */
  background-color: #ffffff;

  /* 스크롤바 스타일 (Webkit 브라우저) */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f3f4f6; /* bg-gray-100 */
}

.modal-body::-webkit-scrollbar-thumb {
  background: #d1d5db; /* bg-gray-300 */
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #9ca3af; /* bg-gray-400 */
}

/* 컨텐츠 여백 */
.modal-body > *:not(:last-child) {
  margin-bottom: 1.5rem; /* space-y-6 */
}
```

### Footer

```css
.modal-footer {
  /* 레이아웃 */
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem; /* gap-3 */

  /* 패딩 및 테두리 */
  padding: 1.5rem; /* p-6 */
  border-top: 1px solid #f3f4f6; /* border-gray-100 */

  /* 배경색 */
  background-color: #f9fafb; /* bg-gray-50 */

  /* 테두리 반경 */
  border-bottom-left-radius: 1rem; /* rounded-b-2xl */
  border-bottom-right-radius: 1rem;
}

.modal-footer__button {
  /* 패딩 */
  padding: 0.625rem 1.5rem; /* py-2.5 px-6 */

  /* 폰트 */
  font-weight: 600;
  font-size: 1rem;

  /* 테두리 및 반경 */
  border: none;
  border-radius: 0.75rem; /* rounded-xl */

  /* 커서 */
  cursor: pointer;

  /* 트렌지션 */
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Primary Button (확인, 저장) */
.modal-footer__button--primary {
  background-color: #10b981; /* bg-[#10B981] */
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); /* shadow-sm */
}

.modal-footer__button--primary:hover {
  background-color: #059669; /* hover:bg-[#059669] */
}

.modal-footer__button--primary:active {
  transform: scale(0.95);
}

/* Secondary Button (취소) */
.modal-footer__button--secondary {
  background-color: transparent;
  color: #374151; /* text-gray-700 */
  border: 1px solid #d1d5db; /* border-gray-300 */
}

.modal-footer__button--secondary:hover {
  background-color: #f3f4f6; /* hover:bg-gray-100 */
}

.modal-footer__button--secondary:active {
  transform: scale(0.95);
}
```

### Scroll Lock

Modal이 열릴 때 배경 스크롤 방지:

```css
body.modal-open {
  overflow: hidden;
}
```

---

## Animation Specs (애니메이션 명세)

### 1. Fade In/Out (페이드 인/아웃)

**목적**: 모달의 나타남과 사라짐을 부드럽게 표현

**적용 대상**: Modal Container + Backdrop

**Timing Function**: `cubic-bezier(0.4, 0, 0.2, 1)` (easeInOutQuart)

**Duration**: `300ms`

```css
.modal-fade-enter {
  opacity: 0;
  animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.modal-fade-exit {
  opacity: 1;
  animation: fadeOut 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
```

### 2. Scale (크기 변화)

**목적**: 모달의 확대/축소로 입장/퇴장 효과 표현

**적용 대상**: Modal Container

**Timing Function**: `cubic-bezier(0.4, 0, 0.2, 1)`

**Duration**: `300ms`

```css
.modal-scale-enter {
  animation: scaleIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.modal-scale-exit {
  animation: scaleOut 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
}

@keyframes scaleOut {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0.95);
  }
}
```

### 3. Slide Up (위로 슬라이드)

**목적**: 모달이 아래에서 위로 올라오는 효과 표현

**적용 대상**: Modal Container

**Timing Function**: `cubic-bezier(0.4, 0, 0.2, 1)`

**Duration**: `300ms`

```css
.modal-slide-enter {
  animation: slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.modal-slide-exit {
  animation: slideDown 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(1rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(1rem);
    opacity: 0;
  }
}
```

### 4. Combined Animation (조합 애니메이션)

현재 구현에서는 Fade + Scale 조합을 사용:

```css
.modal-enter {
  animation:
    fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1),
    scaleIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-exit {
  animation:
    fadeOut 300ms cubic-bezier(0.4, 0, 0.2, 1),
    scaleOut 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Tailwind CSS 클래스 매핑

```css
/* 페이드 인/아웃 */
.opacity-0 { opacity: 0; }
.opacity-100 { opacity: 1; }
.transition-opacity { transition-property: opacity; }

/* 크기 및 위치 변화 */
.scale-95 { transform: scale(0.95); }
.scale-100 { transform: scale(1); }
.translate-y-0 { transform: translateY(0); }
.translate-y-4 { transform: translateY(1rem); }
.transform { transform: rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)); }

/* 트렌지션 */
.transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.duration-300 { transition-duration: 300ms; }
```

---

## 사용 예시 (Usage Examples)

### 1. EditProductModal - 상품 편집 폼

**목적**: 농산물 상품의 정보를 편집하는 복잡한 폼을 모달에 표시

**타입**: Large Modal (max-w-2xl)

**구성 요소**:
- **Header**: 제목 ("상품 정보 수정") + 닫기 버튼
- **Body**:
  - 이미지 업로드 영역
  - 상품명 입력 + AI 표준화 버튼
  - 카테고리 선택 드롭다운
  - 가격/재고 입력 필드 (그리드 2열)
  - 단위/원산지 입력 필드 (그리드 2열)
  - 판매 상태 선택 드롭다운
- **Footer**: 취소 버튼 + 수정 완료 버튼

**Props**:
```typescript
<EditProductModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  product={selectedProduct}
  onSave={handleSaveProduct}
/>
```

**특징**:
- 스크롤 가능한 바디 (긴 폼 내용)
- AI 표준화 기능 통합
- 이미지 미리보기 기능
- 실시간 폼 유효성 검사
- 스크롤 시 헤더/푸터 고정

**파일 경로**: `/Users/kimsoyeon/Desktop/farmtobiz_di_D/farmtobiz/components/EditProductModal.tsx`

---

### 2. TermsModal - 약관 및 개인정보처리방침 표시

**목적**: 서비스 약관이나 개인정보처리방침을 읽을 수 있는 모달

**타입**: Large Modal (max-w-3xl)

**구성 요소**:
- **Header**: 동적 제목 (title prop 사용) + 닫기 버튼
- **Body**: 마크다운 또는 HTML로 된 약관 컨텐츠
  - 텍스트 기반 긴 컨텐츠
  - 스크롤 가능한 영역
  - 좋은 가독성을 위한 간격
- **Footer**: 확인 버튼 (하나만)

**Props**:
```typescript
<TermsModal
  isOpen={isTermsOpen}
  onClose={() => setTermsOpen(false)}
  title="이용약관"
  content={<div>약관 내용...</div>}
/>

// 또는 개인정보처리방침
<TermsModal
  isOpen={isPrivacyOpen}
  onClose={() => setPrivacyOpen(false)}
  title="개인정보처리방침"
  content={privacyContent}
/>
```

**특징**:
- 읽기 전용 컨텐츠
- 순수 텍스트 기반 인터페이스
- 스크롤바 최소화 디자인
- 모바일 친화적 (긴 컨텐츠 대응)
- 최소한의 상호작용 (확인 버튼만)

**파일 경로**: `/Users/kimsoyeon/Desktop/farmtobiz_di_D/farmtobiz/components/TermsModal.tsx`

---

### 3. PriceChartModal - 시세 조회 차트 표시

**목적**: 선택한 상품의 최근 7일간 시세 추이를 차트로 시각화

**타입**: Large Modal (max-w-3xl)

**구성 요소**:
- **Header**:
  - 제목 ("시세 조회") + 부제목
  - 닫기 버튼
- **Body**:
  - 상품명 및 단위 표시
  - Recharts LineChart 컴포넌트
    - X축: 날짜 (date)
    - Y축: 가격 (price)
    - 그리드, 툴팁, 라인 스타일
  - 통계 정보 카드 (그리드 3열)
    - 평균 가격 (bg-blue-50)
    - 최고 가격 (bg-green-50)
    - 최저 가격 (bg-red-50)
- **Footer**: 닫기 버튼

**Props**:
```typescript
<PriceChartModal
  isOpen={isPriceChartOpen}
  onClose={() => setPriceChartOpen(false)}
  productName="감자(수미)"
/>
```

**특징**:
- 데이터 시각화 (Recharts 라이브러리)
- 통계 정보 표시
- 동적 데이터 바인딩 (productName 기반)
- 색상 코드: #10B981 (녹색) - 상품/긍정적 지표
- 반응형 차트 컴포넌트
- 호버 상호작용 (activeDot)

**파일 경로**: `/Users/kimsoyeon/Desktop/farmtobiz_di_D/farmtobiz/components/PriceChartModal.tsx`

---

### 구현 패턴 비교 표

| 요소 | EditProductModal | TermsModal | PriceChartModal |
|------|------------------|------------|-----------------|
| **크기** | max-w-2xl | max-w-3xl | max-w-3xl |
| **높이** | max-h-[90vh] | max-h-[85vh] | max-h-[90vh] |
| **헤더** | 단순 제목 | 동적 제목 | 제목 + 부제목 |
| **바디** | 폼 필드 | 텍스트 | 차트 + 통계 |
| **푸터** | 취소 + 저장 | 확인만 | 닫기만 |
| **스크롤** | 필요 | 필요 | 차트로 인해 가능 |
| **인터랙션** | 높음 | 낮음 | 중간 |

---

## Accessibility (접근성)

### Focus Management (포커스 관리)

**요구 사항**: Modal 열릴 때 포커스를 Modal로 이동, 닫힐 때 이전 요소로 복원

```typescript
// Focus Trap 구현
useEffect(() => {
  if (isOpen) {
    // Modal 열릴 때 포커스 저장
    const previousActiveElement = document.activeElement as HTMLElement;

    // Modal 내 첫 번째 포커스 가능 요소로 이동
    const modal = document.querySelector('[role="dialog"]') as HTMLElement;
    const firstFocusable = modal?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    firstFocusable?.focus();

    return () => {
      // Modal 닫힐 때 이전 포커스 복원
      previousActiveElement?.focus();
    };
  }
}, [isOpen]);
```

### Keyboard Navigation (키보드 네비게이션)

#### ESC 키로 모달 닫기

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen && closeOnEscKey) {
      onClose();
    }
  };

  if (isOpen) {
    window.addEventListener('keydown', handleKeyDown);
  }

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [isOpen, onClose, closeOnEscKey]);
```

#### Tab 키 포커스 트래핑

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements && focusableElements.length > 0) {
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (e.shiftKey) {
        // Shift + Tab: 역방향
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: 정방향
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }
};
```

### Backdrop Click (백드롭 클릭 처리)

**동작**: 백드롭을 클릭하면 모달 닫기 (선택사항)

```typescript
const handleBackdropClick = (e: React.MouseEvent) => {
  // 백드롭 요소만 클릭했을 때만 닫기 (버블링 방지)
  if (e.target === e.currentTarget && closeOnBackdropClick) {
    onClose();
  }
};

<div
  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
  onClick={handleBackdropClick}
/>
```

### ARIA Attributes (ARIA 속성)

```typescript
// Modal 컨테이너
<div
  role="dialog"                    // 대화상자 역할
  aria-modal="true"                // 모달임을 명시
  aria-labelledby="modal-title"    // 제목으로 레이블 설정
  aria-describedby="modal-body"    // 내용으로 설명 설정
  aria-hidden={!isOpen}            // 닫혔을 때 숨김
>
  <div id="modal-title" className="modal-header__title">
    {title}
  </div>

  <div id="modal-body" className="modal-body">
    {children}
  </div>
</div>
```

### Screen Reader Support (스크린 리더 지원)

```css
/* 시각적으로 숨겨진 요소를 스크린 리더에서는 읽도록 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 접근성 체크리스트

- [x] Modal에 `role="dialog"` 설정
- [x] ESC 키로 모달 닫기 지원
- [x] 포커스 트래핑 (Tab 키 순환)
- [x] 백드롭 클릭으로 닫기 지원
- [x] ARIA 레이블 설정 (aria-labelledby, aria-describedby)
- [x] 닫기 버튼에 명확한 레이블
- [x] 배경 스크롤 방지 (body overflow: hidden)
- [x] 컬러 콘트라스트 충족 (WCAG 2.1 AA 이상)
- [x] 포커스 지시자 명확함
- [x] 키보드 네비게이션 지원

---

## 배경 스크롤 방지 (Scroll Lock)

Modal이 열릴 때 배경 문서의 스크롤을 방지합니다.

```typescript
useEffect(() => {
  if (isOpen && product) {
    setIsVisible(true);
    // 배경 스크롤 방지
    document.body.style.overflow = 'hidden';
  } else {
    setTimeout(() => setIsVisible(false), 300);
    // 배경 스크롤 복원
    document.body.style.overflow = 'unset';
  }

  return () => {
    // 언마운트 시에도 스크롤 복원
    document.body.style.overflow = 'unset';
  };
}, [isOpen, product]);
```

---

## 반응형 디자인 (Responsive Design)

### 모바일 기기 (< 640px)

```css
@media (max-width: 640px) {
  .modal-container {
    width: 100%;
    max-height: 100vh;
    border-radius: 1rem 1rem 0 0; /* 상단만 둥글게 */
    max-height: calc(100vh - 2rem);
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
    gap: 0.5rem;
    flex-direction: column;
  }

  .modal-footer__button {
    width: 100%;
  }

  /* 그리드 컬럼 조정 */
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }

  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
```

### 태블릿 기기 (640px - 1024px)

```css
@media (min-width: 640px) and (max-width: 1024px) {
  .modal-lg {
    max-width: 36rem; /* max-w-2xl 축소 */
  }

  .modal-xl {
    max-width: 42rem;
  }
}
```

---

## 색상 팔레트 (Color Palette)

| 용도 | 색상 코드 | Tailwind 클래스 | RGB | 설명 |
|------|---------|----------------|-----|------|
| Primary Button | #10B981 | `bg-[#10B981]` | rgb(16, 185, 129) | 확인, 저장, 실행 |
| Primary Hover | #059669 | `hover:bg-[#059669]` | rgb(5, 150, 105) | Primary 호버 상태 |
| Secondary Button | - | `border-gray-300` | rgb(209, 213, 219) | 취소 버튼 |
| Backdrop | rgba(0, 0, 0, 0.5) | `bg-black/50` | - | 반투명 검은색 |
| Backdrop Blur | - | `backdrop-blur-sm` | - | 4px 블러 효과 |
| Border | #F3F4F6 | `border-gray-100` | rgb(243, 244, 246) | 헤더/푸터 구분선 |
| Text Primary | #111827 | `text-gray-900` | rgb(17, 24, 39) | 제목, 중요 텍스트 |
| Text Secondary | #6B7280 | `text-gray-500` | rgb(107, 114, 128) | 보조 텍스트 |
| Background | #FFFFFF | `bg-white` | rgb(255, 255, 255) | 모달 배경 |
| Background Alt | #F9FAFB | `bg-gray-50` | rgb(249, 250, 251) | 푸터 배경 |

---

## 그림자 (Shadow)

```css
.modal-container {
  /* box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  /* shadow-2xl */
}
```

| 이름 | 값 | 용도 |
|------|----|----|
| shadow-sm | 0 1px 2px 0 rgba(0, 0, 0, 0.05) | 버튼, 작은 요소 |
| shadow-md | 0 4px 6px -1px rgba(0, 0, 0, 0.1) | 입력 필드 |
| shadow-lg | 0 10px 15px -3px rgba(0, 0, 0, 0.1) | 카드 |
| shadow-xl | 0 20px 25px -5px rgba(0, 0, 0, 0.1) | 드롭다운 |
| shadow-2xl | 0 25px 50px -12px rgba(0, 0, 0, 0.25) | **모달 컨테이너** |

---

## Border Radius (테두리 반경)

```css
.modal-container {
  border-radius: 1rem; /* rounded-2xl */
}
```

| 이름 | 값 | px | 용도 |
|------|----|----|------|
| rounded-lg | 0.5rem | 8px | 입력 필드 |
| rounded-xl | 0.75rem | 12px | 버튼 |
| **rounded-2xl** | **1rem** | **16px** | **모달 컨테이너** |
| rounded-full | 9999px | - | 원형 (아이콘 버튼) |

---

## Z-Index (레이어)

```css
.modal-backdrop {
  z-index: 100;
  position: fixed;
}

.modal-container {
  z-index: 10; /* backdrop 내에서 상대 위치 */
  position: relative;
}
```

| 요소 | Z-Index | 설명 |
|------|---------|------|
| Backdrop | 100 | 최상단 |
| Container | 10 | Backdrop 내 상대 위치 |
| 일반 요소 | 0 | 기본값 |

---

## 성능 최적화 (Performance)

### 렌더링 최적화

```typescript
// 불필요한 리렌더링 방지
const handleClose = useCallback(() => {
  onClose();
}, [onClose]);

const handleSave = useCallback((data: Product) => {
  onSave(data);
  handleClose();
}, [onSave, handleClose]);
```

### 메모리 누수 방지

```typescript
useEffect(() => {
  // 이벤트 리스너 정리
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (isOpen) {
    window.addEventListener('keydown', handleKeyDown);
  }

  return () => {
    // 컴포넌트 언마운트 시 리스너 제거
    window.removeEventListener('keydown', handleKeyDown);
    // 스크롤 복원
    document.body.style.overflow = 'unset';
  };
}, [isOpen, onClose]);
```

### 애니메이션 최적화

```css
/* GPU 가속 사용 */
.modal-container {
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* 트렌지션 종료 후 제거 */
.modal-container--closing {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 테스트 가이드 (Testing Guide)

### Unit Tests

```typescript
describe('EditProductModal', () => {
  it('should render when isOpen is true', () => {
    const { getByText } = render(
      <EditProductModal
        isOpen={true}
        onClose={jest.fn()}
        product={mockProduct}
        onSave={jest.fn()}
      />
    );
    expect(getByText('상품 정보 수정')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    const { getByRole } = render(
      <EditProductModal
        isOpen={true}
        onClose={onClose}
        product={mockProduct}
        onSave={jest.fn()}
      />
    );
    fireEvent.click(getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('should close modal when ESC key is pressed', () => {
    const onClose = jest.fn();
    render(
      <EditProductModal
        isOpen={true}
        onClose={onClose}
        product={mockProduct}
        onSave={jest.fn()}
      />
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
```

### E2E Tests

```typescript
describe('Modal E2E', () => {
  it('should open and close modal', () => {
    cy.visit('/products');
    cy.get('[data-testid="edit-button"]').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[data-testid="close-button"]').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should submit form and close modal', () => {
    cy.visit('/products');
    cy.get('[data-testid="edit-button"]').click();
    cy.get('[data-testid="product-name"]').clear().type('새로운 상품명');
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[role="dialog"]').should('not.exist');
  });
});
```

---

## 참고사항 (References)

### 관련 파일
- EditProductModal: `/Users/kimsoyeon/Desktop/farmtobiz_di_D/farmtobiz/components/EditProductModal.tsx`
- TermsModal: `/Users/kimsoyeon/Desktop/farmtobiz_di_D/farmtobiz/components/TermsModal.tsx`
- PriceChartModal: `/Users/kimsoyeon/Desktop/farmtobiz_di_D/farmtobiz/components/PriceChartModal.tsx`

### 라이브러리 및 도구
- **UI Framework**: React 18.x
- **Styling**: Tailwind CSS 3.x
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animation**: CSS Transitions (300ms)

### 접근성 표준
- **WCAG 2.1** Level AA 준수
- **ARIA** 속성 활용
- **키보드 네비게이션** 완전 지원

---

**마지막 업데이트**: 2025년 12월 4일
**문서 버전**: 1.0
**작성자**: Design & Engineering Team
