# 시세 조회 (Market Prices) 디자인 명세서

## 1. 개요
- **화면 ID**: `WH-MKT-001`
- **화면명**: 전국 도매시장 시세 조회
- **역할**: 주요 품목의 도매시장 경락 시세를 조회하여 가격 책정에 참고하는 화면입니다.
- **Route**: `/wholesaler/market-prices`

## 2. 주요 UI 요소

### 2.1 필터 바 (Filter Bar)
- **지역 선택**: `select` element with custom style (`appearance-none` + Custom Arrow Icon).
- **품목 검색**: `input` element with Search Icon.
- **조회 버튼**: `bg-[#10B981]` (Primary Green).

### 2.2 시세 테이블 (Table)
- **헤더**: `#F8F9FA` (Gray 50).
- **당일 가격**: `text-[#10B981]` (Green) & Bold로 강조.
- **증감률 (Fluctuation)**:
  - 상승(Positive): `text-red-500` (Red) + `TrendingUp` Icon
  - 하락(Negative): `text-blue-500` (Blue) + `TrendingDown` Icon
  - 변동없음: `text-gray-500` + `Minus` Icon
- **참고사항**: 테이블 하단에 작은 글씨(`text-xs`)로 데이터 출처 명시.

## 3. 색상 가이드 (농산물 시세 관행)
- 한국 주식/시세 시장 관행에 따라 **상승은 빨강(Red)**, **하락은 파랑(Blue)**으로 표시합니다.
  - *참고: 이는 서구권(상승=Green, 하락=Red)과 반대이므로 주의가 필요합니다.*
  - 단, '당일 가격' 자체는 긍정적 의미의 강조색인 Green을 사용합니다.

## 4. 인터랙션
- 지역 선택 변경 시 즉시 필터링 (현재 Client-side filtering).
- 검색어 입력 후 '조회하기' 또는 엔터 키 입력 시 필터링.


