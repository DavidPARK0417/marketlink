# 설정 (Settings) 디자인 명세서

## 1. 개요
- **화면 ID**: `WH-SET-001`
- **화면명**: 설정 및 계정 관리 (마이페이지)
- **역할**: 사업자 정보 수정, 알림 설정, 비밀번호 변경, 회원 탈퇴 등 계정 관련 설정을 수행합니다.
- **Route**: `/wholesaler/settings`

## 2. 주요 UI 요소

### 2.1 섹션 카드 (Section Card)
- **스타일**: `bg-white rounded-2xl shadow-sm border border-gray-100`
- **Padding**: `p-8`
- **헤더**: `text-lg font-bold` 제목 + `text-sm text-gray-500` 설명

### 2.2 폼 요소 (Form Elements)
- **Input/Select**:
  - Default: `border-gray-200`
  - Focus: `ring-2 ring-[#10B981]/20 border-[#10B981]` (Green Focus)
  - Radius: `rounded-xl`
- **Checkbox**:
  - Custom Styled Checkbox (using tailwind forms plugin or accent color).
  - Checked: `text-[#10B981]` (Green)
- **Buttons**:
  - Primary: `bg-[#10B981] text-white hover:bg-[#059669]` (Green)
  - Secondary/Cancel: `border border-gray-300 hover:bg-gray-50`
  - Danger (탈퇴): `bg-red-600 text-white hover:bg-red-700`

### 2.3 아이콘 및 배지
- 사용자 아바타 배지: `bg-[#10B981]` (Green)
- 아이콘: Lucide React Icons (`Mail`, `Bell`, `AlertTriangle` 등)

## 3. 인터랙션
- **입력 폼**: Focus 시 부드러운 Green Glow 효과.
- **탈퇴 모달**:
  - 배경 흐림 (`backdrop-blur-sm`)
  - 위험 안내 박스 (`bg-red-50 border-red-100`) 포함.
  - 체크박스 동의 후 버튼 활성화.

## 4. 데이터 항목
- **계정 정보**: Read-only (수정 불가).
- **사업자 정보**: 수정 가능 (상호명, 연락처, 주소, 계좌 등).
- **알림 설정**: 이메일/푸시 토글.

## 5. 색상 수정 사항 (Fixed)
- 기존 Blue 계열의 버튼 및 하이라이트를 모두 **Green (#10B981)** 계열로 통일하여 브랜드 아이덴티티 강화.


