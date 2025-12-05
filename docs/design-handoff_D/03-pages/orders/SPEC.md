# 주문 관리 (Orders) 디자인 명세서

## 1. 개요
- **화면 ID**: `WH-ORD-001`
- **화면명**: 주문 목록 및 상태 관리
- **역할**: 들어온 주문을 확인하고, 처리 상태(신규 -> 확인 -> 출고 -> 배송)를 변경하는 화면입니다.
- **Route**: `/wholesaler/orders`

## 2. 주요 UI 요소

### 2.1 상태 필터 탭 (Filter Tabs)
- **스타일**: Pill Button Style
- **상태별 디자인**:
  - **Active (선택됨)**: `bg-gradient-to-r from-[#10B981] to-[#059669]` (Green Gradient), White Text
  - **Inactive (비선택)**: `bg-white`, `border border-gray-300`, `hover:bg-gray-50`
- **Shadow Effect**: 선택된 탭은 Green Glow Shadow (`shadow-[0_4px_20px_rgba(16,185,129,0.3)]`) 적용

### 2.2 주문 상태 뱃지 & 드롭다운
- 주문 상태는 색상으로 구분하며, 즉시 변경 가능한 Select Dropdown 형태입니다.
- **색상 매핑**:
  - `pending` (신규): `#fbbf24` (Yellow)
  - `confirmed` (확인완료): `#10B981` (Green)
  - `shipped` (출고완료): `#3b82f6` (Blue)
  - `completed` (배송완료): `#9ca3af` (Gray)
- **스타일**: `rounded-full`, `font-semibold`, `text-xs`

### 2.3 테이블/리스트 뷰
- **데스크톱**:
  - 전체 정보를 보여주는 Table 형태.
  - `whitespace-nowrap`으로 줄바꿈 방지.
- **모바일**:
  - 카드 형태의 리스트.
  - 핵심 정보(상품명, 상태, 금액)를 상단에 배치.
  - 상세 정보(주문자, 수량, 배송지)는 회색 박스(`bg-gray-50`) 안에 정리.

## 3. 데이터 표시 형식
- **금액**: 3자리 콤마(`,`) + "원"
- **날짜**: `MM월 dd일 HH:mm` (한국식 표기)
- **수량**: 숫자 + "박스"

## 4. 인터랙션
- 필터 탭 클릭 시 즉시 리스트 필터링.
- 상태 변경(Select Change) 시 즉시 반영 (낙관적 업데이트/State Update).


