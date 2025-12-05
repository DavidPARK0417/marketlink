# 대시보드 (Dashboard) 디자인 명세서

## 1. 개요
- **화면 ID**: `WH-DASH-001`
- **화면명**: 도매 파트너 대시보드
- **역할**: 파트너의 주요 현황(주문, 정산, 재고)을 한눈에 파악하고 긴급한 작업을 처리하는 메인 화면입니다.
- **Route**: `/wholesaler/dashboard`

## 2. 주요 색상 (Color Palette)
- **Primary Green**: `#10B981` (Emerald 500) - 주요 강조, 상승 지표, 활성 상태
- **Secondary Green**: `#059669` (Emerald 600) - 버튼 호버, 그라데이션 끝점
- **Alert Yellow**: `#fbbf24` (Amber 400) - 처리 대기, 주의 필요
- **Alert Orange**: `#f97316` (Orange 500) - 재고 부족 경고
- **Background**: `#F8F9FA` (Gray 50) - 페이지 배경
- **Card Background**: `#FFFFFF` (White) - 카드 배경

## 3. 레이아웃 및 그리드
- **반응형 그리드**:
  - **모바일 (< 640px)**: 1열 배치 (Cards Stack)
  - **태블릿 (640px - 1024px)**: 2열 배치
  - **데스크톱 (> 1024px)**: 4열 배치 (상단 통계 카드)
- **Spacing**: `gap-4` (16px) ~ `gap-6` (24px)

## 4. UI 컴포넌트 상세

### 4.1 알림 배너 (Alert Banner)
- **조건**: `todayOrders > 0`일 때 표시
- **스타일**:
  - 배경: `bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857]` (Fresh Green Gradient)
  - 그림자: `shadow-[0_20px_50px_rgba(16,185,129,0.3)]` (부드러운 확산 그림자)
  - 효과: Hover 시 `-translate-y-1` (살짝 떠오름)

### 4.2 통계 카드 (Stat Cards)
- **스타일**:
  - 배경: `bg-gradient-to-br from-white to-gray-50`
  - 테두리: `border border-gray-100/50`
  - 둥근 모서리: `rounded-3xl`
  - 아이콘: 대형 이모지 (📦, ⏰, 💰, 🏪) 사용
- **인터랙션**:
  - Hover: 카드 전체가 위로 떠오름 (`-translate-y-2`)
  - 배경 효과: Hover 시 해당 테마 색상의 은은한 그라데이션 오버레이 표시

### 4.3 최근 주문 목록 (Recent Orders)
- **헤더**: 아이콘(`Truck`)과 함께 제목 표시, '더보기' 링크 포함
- **데스크톱 뷰**:
  - 테이블 형태 (`table`)
  - 헤더 배경: `#F8F9FA`
  - 상태 뱃지: Pill shape (`rounded-full`), 상태별 색상 적용
    - 신규: `#fbbf24`
    - 확인완료: `#10B981`
    - 출고완료: `#3b82f6`
- **모바일 뷰**:
  - 카드 리스트 형태 (`div` stack)
  - 주요 정보(상품명, 수량, 금액) 위주로 간소화

### 4.4 재고 부족 알림 (Low Stock Alert)
- **스타일**: `bg-[#FFF7ED]` (Orange 50) 테마
- **기능**: 재고 100개 미만 상품 표시
- **액션**: '재고 추가' 버튼 클릭 시 상품 관리 페이지로 이동

## 5. 데이터 연동 가이드 (Dummy Data)
- `dummyOrders`: 최근 주문 내역 및 오늘 주문 수 계산
- `dummySettlements`: 주간 정산 예상 금액 계산
- `dummyProducts`: 전체 상품 수 및 재고 부족 상품 필터링

## 6. 애니메이션 (Motion)
- **Hover Effects**: 모든 카드와 버튼은 호버 시 `transform`, `shadow` 변화가 `duration-300`으로 부드럽게 적용되어야 함.
