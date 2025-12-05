# Card Component 명세서

## 개요

Card 컴포넌트는 컨텐츠를 담아내는 기본 컨테이너 역할을 하는 컴포넌트입니다. 상품 정보, 주문 내역, 통계 등 다양한 정보를 시각적으로 정렬되고 그룹화된 형태로 표시합니다.

Farm to Biz 도매 플랫폼에서는 세 가지 주요 Card 변형을 제공하며, 모든 카드는 반응형 디자인을 지원합니다.

### 특징
- 깔끔한 레이아웃과 일관된 스타일
- 호버 시 상승 애니메이션 효과
- 다양한 상태 표현 (기본, 호버, 활성, 비활성)
- 반응형 패딩 (모바일: p-4, 데스크톱: lg:p-6)
- 대비되는 그림자 효과로 시각적 깊이 제공

---

## Variants

### 1. Basic Card (기본 카드)

표준적인 정보를 표시하는 기본 카드 타입입니다. 상품 정보, 사용자 프로필, 간단한 정보 박스 등에 사용됩니다.

**스타일 특성:**
- Border Radius: rounded-2xl (16px)
- Shadow: shadow-md (기본)
- Hover Shadow: shadow-xl (호버 시)
- Transition: transition-all duration-300

**상태:**
- Default: shadow-md
- Hover: shadow-xl + -translate-y-1 (위로 4px 이동)
- Disabled: opacity-50

**사용 사례:**
- 상품 카드 (상품 이미지, 제목, 가격)
- 판매자 정보 카드
- 통계 정보 박스
- 기본 정보 섹션

---

### 2. 3D Effect Card (3D 효과 카드)

초록색 그림자와 함께 입체감을 강조하는 프리미엄 카드 타입입니다. 주요 상품, 특별 프로모션, 주목할 만한 콘텐츠에 사용됩니다.

**스타일 특성:**
- Border Radius: rounded-3xl (24px)
- Shadow: 0 20px 50px rgba(16, 185, 129, 0.15) (초록색 그림자)
- Hover Shadow: 0 20px 50px rgba(16, 185, 129, 0.2) (호버 시 강화)
- Shadow Color: Primary Color (#10B981) 기반
- Transition: transition-all duration-300

**상태:**
- Default: 20px 떨어진 위치의 초록 그림자
- Hover: 그림자 강화 + -translate-y-2 (위로 8px 이동)
- Active: 그림자 유지

**사용 사례:**
- 추천 상품 카드
- 프리미엄 상품 전시
- 핵심 메트릭 카드
- CTA (Call To Action) 포함 카드

---

### 3. Status Card (상태 카드)

주문 상태, 배송 상태, 결제 상태 등을 표시하는 카드입니다. 상태에 따라 색상과 아이콘이 변합니다.

**스타일 특성:**
- Border Radius: rounded-2xl (16px)
- Shadow: shadow-md (기본)
- Left Border: 좌측 4px 색상 테두리
- Border Color: 상태에 따라 변경
- Transition: transition-all duration-300

**상태 색상:**
- Pending (대기중): #FBBF24 (호박색)
- Confirmed (확인됨): #3B82F6 (파란색)
- Shipped (배송중): #8B5CF6 (보라색)
- Completed (완료): #10B981 (초록색)
- Inactive (비활성): #6B7280 (회색)

**상태:**
- Default: 해당 색상의 좌측 테두리
- Hover: shadow-lg + 배경색 변경
- Disabled: opacity-50

**사용 사례:**
- 주문 상태 표시
- 배송 추적 카드
- 결제 상태 알림
- 작업 진행률 표시

---

## States (상태)

모든 Card 컴포넌트는 다음 상태를 지원합니다:

| 상태 | 설명 | 스타일 |
|------|------|--------|
| **Default** | 기본 상태 | shadow-md, normal opacity |
| **Hover** | 마우스 호버 상태 | shadow-xl/shadow-lg, -translate-y-1/-translate-y-2 |
| **Active** | 활성화 상태 | 배경색 변경 (optional) |
| **Disabled** | 비활성화 상태 | opacity-50, cursor-not-allowed |
| **Focus** | 포커스 상태 | ring-2 ring-[#10B981] ring-offset-2 (상호작용 시) |

---

## Props 정의

### CardProps (기본 카드)

```typescript
interface CardProps {
  // 기본 속성
  children: React.ReactNode;
  className?: string;

  // 스타일 커스터마이징
  variant?: 'basic' | '3d' | 'status';

  // 호버 효과 (상태 카드 제외)
  hoverable?: boolean;

  // 상호작용 속성
  onClick?: () => void;
  disabled?: boolean;

  // 패딩 옵션
  padding?: 'sm' | 'md' | 'lg';
}
```

### Card3DProps (3D 효과 카드)

```typescript
interface Card3DProps extends CardProps {
  variant: '3d';

  // 3D 효과 강도 (선택사항)
  intensity?: 'normal' | 'strong';
}
```

### StatusCardProps (상태 카드)

```typescript
interface StatusCardProps extends CardProps {
  variant: 'status';

  // 상태 종류 (필수)
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'inactive';

  // 상태 아이콘 (선택사항)
  icon?: React.ReactNode;

  // 상태 레이블
  label?: string;
}
```

---

## 스타일 명세

### 기본 스타일

```css
/* Border Radius */
.card-basic {
  border-radius: 1rem; /* 16px (rounded-2xl) */
}

.card-3d {
  border-radius: 1.5rem; /* 24px (rounded-3xl) */
}

/* Shadow - Default State */
.card-basic {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.card-3d {
  box-shadow: 0 20px 50px rgba(16, 185, 129, 0.15);
}

/* Shadow - Hover State */
.card-basic:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 8px 10px -6px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.card-3d:hover {
  box-shadow: 0 20px 50px rgba(16, 185, 129, 0.2);
  transform: translateY(-8px);
}

/* Transition */
.card {
  transition: all 300ms cubic-bezier(0, 0, 0.2, 1);
}
```

### Responsive Padding

```css
/* 모바일 (p-4) */
.card {
  padding: 1rem; /* 16px */
}

/* 데스크톱 이상 (lg:p-6) */
@media (min-width: 1024px) {
  .card {
    padding: 1.5rem; /* 24px */
  }
}
```

### 상태 카드 특화 스타일

**좌측 테두리 색상:**

```css
.card-status.status-pending {
  border-left: 4px solid #FBBF24; /* Amber */
  background-color: #FEF3C7;
}

.card-status.status-confirmed {
  border-left: 4px solid #3B82F6; /* Blue */
  background-color: #DBEAFE;
}

.card-status.status-shipped {
  border-left: 4px solid #8B5CF6; /* Purple */
  background-color: #EDE9FE;
}

.card-status.status-completed {
  border-left: 4px solid #10B981; /* Green */
  background-color: #D1FAE5;
}

.card-status.status-inactive {
  border-left: 4px solid #6B7280; /* Gray */
  background-color: #F3F4F6;
}
```

### Tailwind CSS 클래스

| 상황 | Tailwind 클래스 |
|------|-----------------|
| 기본 카드 | `rounded-2xl shadow-md bg-white p-4 lg:p-6` |
| 기본 카드 호버 | `hover:shadow-xl hover:-translate-y-1` |
| 3D 카드 | `rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.15)] bg-white p-4 lg:p-6` |
| 3D 카드 호버 | `hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)] hover:-translate-y-2` |
| 공통 전환 | `transition-all duration-300` |
| 비활성 상태 | `opacity-50 cursor-not-allowed` |

---

## 사용 예시

### 1. 기본 카드

```tsx
<Card variant="basic" hoverable>
  <div className="flex items-center gap-4">
    <img src="product.jpg" alt="상품" className="w-16 h-16 rounded-lg" />
    <div>
      <h3 className="font-bold text-gray-900">상품명</h3>
      <p className="text-sm text-gray-600">상품 설명</p>
      <p className="mt-2 font-semibold text-emerald-600">¥50,000</p>
    </div>
  </div>
</Card>
```

### 2. 3D 효과 카드

```tsx
<Card variant="3d" hoverable>
  <div className="text-center">
    <img src="premium-product.jpg" alt="프리미엄 상품" className="w-full rounded-lg mb-4" />
    <h3 className="text-xl font-bold text-gray-900 mb-2">추천 상품</h3>
    <p className="text-gray-600 mb-4">이 달의 최고 인기 상품입니다</p>
    <button className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700">
      자세히 보기
    </button>
  </div>
</Card>
```

### 3. 상태 카드

```tsx
<Card
  variant="status"
  status="shipped"
  label="배송 중"
>
  <div className="flex items-center justify-between">
    <div>
      <h4 className="font-bold text-gray-900">주문번호: #12345</h4>
      <p className="text-sm text-gray-600">예상 배송: 2024-12-10</p>
    </div>
    <div className="text-2xl">📦</div>
  </div>
</Card>
```

---

## 접근성 (Accessibility)

- 모든 상호작용 카드는 `cursor-pointer` 클래스 포함
- Focus 상태에서 `ring-2 ring-[#10B981] ring-offset-2` 적용
- 비활성 카드는 `cursor-not-allowed` 및 `aria-disabled="true"` 사용
- 충분한 색상 대비비율 준수 (WCAG AA 이상)
- 키보드 네비게이션 지원 (Tab, Enter 키)

---

## 마이그레이션 가이드

기존 카드 구현에서 이 명세로 마이그레이션할 때:

1. `className` 속성에서 수동 스타일 제거
2. `variant` prop으로 카드 타입 지정
3. 호버 효과 자동 적용 (hoverable={true})
4. 반응형 패딩 자동 적용
5. 상태 카드는 `status` prop으로 색상 관리

---

## 버전 정보

- **버전**: 1.0.0
- **마지막 업데이트**: 2024-12-04
- **라이브러리**: React 18.0+, Tailwind CSS 3.0+
- **TypeScript**: 5.0+
