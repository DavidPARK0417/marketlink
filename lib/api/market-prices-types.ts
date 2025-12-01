/**
 * @file lib/api/market-prices-types.ts
 * @description 시세 조회 관련 타입 정의
 */

export interface MarketPriceParams {
  itemName?: string; // 품목명
  productClsCode?: "01" | "02" | "all"; // "01": 소매, "02": 도매, "all": 전체
  countryCode?: string; // 지역 코드 (기존 호환성 유지)
  startDay?: string; // 조회 시작일 (YYYY-MM-DD) (기존 호환성 유지)
  endDay?: string; // 조회 종료일 (YYYY-MM-DD) (기존 호환성 유지)
}

export interface DailyPriceItem {
  productClsCode: "01" | "02"; // "01": 소매, "02": 도매
  productClsName: string; // "소매" | "도매"
  categoryCode: string; // 카테고리 코드 (예: "100", "200")
  categoryName: string; // 카테고리명 (예: "식량작물", "과일류")
  productno: string; // 품목 번호
  lastestDay: string; // 최신일자 (YYYY-MM-DD)
  productName: string; // 품목명
  itemName: string; // 품목명 (동일)
  unit: string; // 단위 (예: "20kg", "1kg")
  day1: string; // "당일"
  dpr1: number; // 당일 가격
  day2: string; // "1일전"
  dpr2: number; // 1일전 가격
  day3: string; // "1개월전"
  dpr3: number; // 1개월전 가격
  day4: string; // "1년전"
  dpr4: number; // 1년전 가격
  direction: "0" | "1" | "2"; // "0": 보합, "1": 상승, "2": 하락
  value: number; // 증감률
}

export interface PriceItem {
  cfmtnYmd: string; // 확정일자 (YYYY-MM-DD)
  itemName: string; // 품목명
  varietyName: string; // 품종명
  marketName: string; // 도매시장명
  avgPrice: number; // 평균가 (원)
  unitName: string; // 단위명
  source: "kamis" | "public"; // 데이터 출처
}
