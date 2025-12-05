# 레이아웃 (Global Layout) 디자인 명세서

## 1. 개요
- **화면 ID**: `WH-LAYOUT-001`
- **화면명**: 공통 레이아웃
- **역할**: 사이드바, 헤더, 푸터를 포함한 전체 페이지의 기본 구조를 정의합니다.

## 2. 사이드바 (Sidebar) - Desktop
- **위치**: 좌측 고정 (Width: 256px / `w-64`)
- **스타일**:
  - 배경: White
  - Border: Right Border (`border-gray-200`)
- **로고 영역**:
  - Gradient Logo Icon: `from-[#10B981] to-[#059669]`
  - 텍스트: `Farm` (Black) `to` (Green) `Biz` (Black)
- **네비게이션 메뉴**:
  - Active: `text-[#10B981] bg-[#10B981]/10` + Left Border Indicator
  - Inactive: `text-gray-600 hover:bg-gray-50`
- **하단 프로필**:
  - `bg-gradient-to-br from-emerald-50 to-white` 박스 스타일.
  - 로그아웃 버튼 포함.

## 3. 헤더 (Header)
- **Desktop**:
  - Sticky Top (`sticky top-0`)
  - 배경: `bg-white/80 backdrop-blur-xl`
  - 검색창: 중앙 배치
  - 유틸리티 버튼: 알림, 설정, 고객센터 (Icon + Text)
- **Mobile**:
  - Logo + Hamburger Menu
  - 메뉴 오픈 시 전체 화면 Dropdown (`bg-[#10B981]` 테마)

## 4. 푸터 (Footer)
- **스타일**: `bg-gradient-to-b from-[#F8F9FA] to-gray-100`
- **내용**: 사업자 정보, 고객센터 정보, 이용약관/개인정보처리방침 링크.

## 5. 모달 (Global Modals)
- `TermsModal`: 이용약관, 개인정보처리방침 등 약관 내용을 보여주는 공통 모달.
