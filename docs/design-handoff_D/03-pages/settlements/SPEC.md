# 정산 관리 (Settlements) 디자인 명세서

## 1. 개요
- **화면 ID**: `WH-SETT-001`
- **화면명**: 정산 내역 및 조회
- **역할**: 판매 금액, 수수료, 최종 정산 금액을 확인하는 화면입니다.
- **Route**: `/wholesaler/settlements`

## 2. 주요 UI 요소

### 2.1 상단 통계 카드 (Summary Cards)
- **구성**: 총 정산 금액 / 정산 대기 건수 / 정산 완료 건수
- **텍스트 색상**:
  - 총 정산 금액 & 정산 완료: `#10B981` (Green)
  - 정산 대기: `#fbbf24` (Yellow)
- **스타일**: `bg-white`, `shadow-md`, `rounded-xl`

### 2.2 필터 버튼
- `orders` 페이지와 동일한 Pill Style Tab 적용.
- Active 시 Green Gradient 적용.

### 2.3 정산 테이블 (Table)
- **수수료 표시**: Red color (`text-red-600`)와 마이너스(-) 기호로 차감됨을 명시.
- **최종 지급액**: Bold Green (`text-[#10B981]`)으로 강조.
- **상태 뱃지**:
  - 대기: Yellow
  - 완료: Green

### 2.4 안내 박스 (Info Box)
- **위치**: 페이지 하단
- **스타일**: `bg-blue-50`, `border-blue-200`
- **아이콘**: `Calendar` (Green color)
- **내용**: 정산 주기 및 수수료(5%) 정책 안내.

## 3. 반응형 동작
- **모바일**: 테이블 행을 카드 형태로 변환.
  - 판매금액 -> 수수료 -> 최종 지급액 순으로 계산 과정을 보여주는 레이아웃(`bg-gray-50` 내부 박스).


