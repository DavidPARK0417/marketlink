# 상품 관리 (Products) 디자인 명세서

## 1. 개요
- **화면 ID**: `WH-PROD-001`
- **화면명**: 상품 목록 및 관리
- **역할**: 등록된 상품을 조회, 검색, 수정, 삭제 및 상태 변경을 수행하는 화면입니다.
- **Route**: `/wholesaler/products`

## 2. 주요 UI 요소

### 2.1 필터 및 검색 바 (Filter Bar)
- **배경**: White (`bg-white`)
- **Shadow**: `shadow-sm`
- **구성**:
  - **검색창**: 상품명 검색 (Input with Left Icon)
    - Focus Color: `#10B981` (Emerald)
  - **카테고리 필터**: Dropdown Select
  - **상태 필터**: Dropdown Select (활성/비활성)

### 2.2 상품 목록 테이블 (Product List)
- **헤더**: `bg-gradient-to-r from-gray-50 to-gray-100`
- **행 (Row)**:
  - Hover 시: `bg-gradient-to-r from-[#10B981]/5 to-transparent` (부드러운 녹색 하이라이트)
  - 이미지 플레이스홀더: `w-16 h-16 rounded-xl` (그라데이션 배경)
- **상태 뱃지**:
  - 활성: Blue theme (`bg-blue-100 text-blue-700`)
  - 비활성: Gray theme (`bg-gray-100 text-gray-600`)
- **액션 버튼**:
  - 상태 토글(Eye): Green theme
  - 수정(Edit): Blue theme
  - 삭제(Trash): Red theme
  - 각 버튼은 `hover:scale-110` 인터랙션 포함

### 2.3 상품 등록 버튼 (Floating/Header Action)
- **스타일**: `bg-gradient-to-r from-[#10B981] to-[#059669]`
- **Shadow**: `shadow-[0_4px_20px_rgba(16,185,129,0.3)]` (Green glow)
- **Hover**: `hover:-translate-y-1`

## 3. 모달 (Edit Modal)
- `EditProductModal` 컴포넌트를 호출하여 사용.
- 배경 흐림 효과 (`backdrop-blur-sm`) 적용.

## 4. 반응형 동작
- **모바일**: 테이블은 가로 스크롤(`overflow-x-auto`)로 대응하거나 카드 뷰로 전환 가능 (현재 코드는 테이블 유지).
- 필터 바는 `flex-col`로 수직 정렬됨.

## 5. 색상 코드
- **Primary Action**: `#10B981`
- **Secondary Action**: `#3b82f6` (Blue - 수정/활성상태 표시)
- **Delete Action**: `#ef4444` (Red)
- **Text**: `#111827` (Headings), `#6B7280` (Body)


