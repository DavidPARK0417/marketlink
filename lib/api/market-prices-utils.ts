/**
 * @file lib/api/market-prices-utils.ts
 * @description 시세 조회 유틸리티 함수 및 상수
 *
 * 클라이언트와 서버 모두에서 사용 가능한 유틸리티 함수와 상수입니다.
 * 서버 전용 API 함수는 lib/api/market-prices.ts를 참조하세요.
 */

/**
 * KAMIS 지역 코드 매핑
 * KAMIS Open API 기준 지역 코드
 */
export const kamisCountryCodes = {
  전체: undefined,
  서울: "1101",
  부산: "2100",
  대구: "2200",
  인천: "2300",
  광주: "2500",
  대전: "2400",
  울산: "2600",
  경기: "3100",
  강원: "3200",
  충북: "3300",
  충남: "3400",
  전북: "3500",
  전남: "3600",
  경북: "3700",
  경남: "3800",
  제주: "3900",
} as const;

/**
 * KAMIS dailyCountyList API 지역 코드
 * 소매가격 선택 가능 지역 (24개)
 */
export const kamisRetailCountyCodes = {
  서울: "1101",
  부산: "2100",
  대구: "2200",
  인천: "2300",
  광주: "2401",
  대전: "2501",
  울산: "2601",
  수원: "3111",
  춘천: "3211",
  강릉: "3214",
  청주: "3311",
  전주: "3511",
  포항: "3711",
  제주: "3911",
  의정부: "3113",
  순천: "3613",
  안동: "3714",
  창원: "3814",
  용인: "3145",
  세종: "2701",
  성남: "3112",
  고양: "3138",
  천안: "3411",
  김해: "3818",
} as const;

/**
 * KAMIS dailyCountyList API 지역 코드
 * 도매가격 선택 가능 지역 (5개)
 */
export const kamisWholesaleCountyCodes = {
  서울: "1101",
  부산: "2100",
  대구: "2200",
  광주: "2401",
  대전: "2501",
} as const;

export type RetailCountyCode =
  (typeof kamisRetailCountyCodes)[keyof typeof kamisRetailCountyCodes];
export type WholesaleCountyCode =
  (typeof kamisWholesaleCountyCodes)[keyof typeof kamisWholesaleCountyCodes];

/**
 * 품목명을 대분류 코드로 매핑하는 테이블
 * 검색 키워드에 따라 자동으로 카테고리 코드를 설정하기 위해 사용
 */
export const itemNameToCategory: Record<
  string,
  { lclsfCd: string; mclsfCd?: string }
> = {
  // 과실류 (추정 코드: 06, 실제 API 필터링 불가)
  사과: { lclsfCd: "06" },
  감귤: { lclsfCd: "06" },
  단감: { lclsfCd: "06" },
  감: { lclsfCd: "06" },
  곶감: { lclsfCd: "06" },
  배: { lclsfCd: "06" },
  포도: { lclsfCd: "06" },
  딸기: { lclsfCd: "06" },
  수박: { lclsfCd: "06" },
  레몬: { lclsfCd: "06" },
  오렌지: { lclsfCd: "06" },
  귤: { lclsfCd: "06" },
  참외: { lclsfCd: "06" },
  복숭아: { lclsfCd: "06" },
  자두: { lclsfCd: "06" },
  체리: { lclsfCd: "06" },
  키위: { lclsfCd: "06" },
  바나나: { lclsfCd: "06" },
  파인애플: { lclsfCd: "06" },
  망고: { lclsfCd: "06" },
  토마토: { lclsfCd: "06" },
  멜론: { lclsfCd: "06" },
  석류: { lclsfCd: "06" },
  무화과: { lclsfCd: "06" },
  용과: { lclsfCd: "06" },
  아보카도: { lclsfCd: "06" },

  // 채소류 (대분류 코드: 10)
  배추: { lclsfCd: "10" },
  무: { lclsfCd: "10" },
  고추: { lclsfCd: "10" },
  마늘: { lclsfCd: "10" },
  양파: { lclsfCd: "10" },
  대파: { lclsfCd: "10" },
  파: { lclsfCd: "10" },
  상추: { lclsfCd: "10" },
  시금치: { lclsfCd: "10" },
  당근: { lclsfCd: "10" },
  오이: { lclsfCd: "10" },
  가지: { lclsfCd: "10" },
  호박: { lclsfCd: "10" },
  애호박: { lclsfCd: "10" },
  단호박: { lclsfCd: "10" },
  브로콜리: { lclsfCd: "10" },
  양배추: { lclsfCd: "10" },
  파프리카: { lclsfCd: "10" },
  피망: { lclsfCd: "10" },
  고구마: { lclsfCd: "10" },
  감자: { lclsfCd: "10" },
  옥수수: { lclsfCd: "10" },
  콩나물: { lclsfCd: "10" },
  미나리: { lclsfCd: "10" },
  냉이: { lclsfCd: "10" },
  쪽파: { lclsfCd: "10" },
  깐쪽파: { lclsfCd: "10" },
  쌈배추: { lclsfCd: "10" },
  부추: { lclsfCd: "10" },
  케일: { lclsfCd: "10" },
  청경채: { lclsfCd: "10" },
  배추김치: { lclsfCd: "10" },
  깻잎: { lclsfCd: "10" },
  생강: { lclsfCd: "10" },
  연근: { lclsfCd: "10" },
  우엉: { lclsfCd: "10" },
  셀러리: { lclsfCd: "10" },
  아스파라거스: { lclsfCd: "10" },

  // 곡물류 (대분류 코드: 01 - API 확인 필요)
  쌀: { lclsfCd: "01" },
  현미: { lclsfCd: "01" },
  찹쌀: { lclsfCd: "01" },
  보리: { lclsfCd: "01" },
  밀: { lclsfCd: "01" },
  귀리: { lclsfCd: "01" },
  수수: { lclsfCd: "01" },
  조: { lclsfCd: "01" },
  기장: { lclsfCd: "01" },

  // 두류/특용작물 (대분류 코드: 02 - API 확인 필요)
  콩: { lclsfCd: "02" },
  대두: { lclsfCd: "02" },
  검은콩: { lclsfCd: "02" },
  흰콩: { lclsfCd: "02" },
  완두콩: { lclsfCd: "02" },
  강낭콩: { lclsfCd: "02" },
  팥: { lclsfCd: "02" },
  녹두: { lclsfCd: "02" },
  참깨: { lclsfCd: "02" },
  깨: { lclsfCd: "02" },
  들깨: { lclsfCd: "02" },
  땅콩: { lclsfCd: "02" },

  // 견과류 (대분류 코드: 04 - API 확인 필요)
  호두: { lclsfCd: "04" },
  아몬드: { lclsfCd: "04" },
  잣: { lclsfCd: "04" },
  밤: { lclsfCd: "04" },
  은행: { lclsfCd: "04" },
  캐슈넛: { lclsfCd: "04" },
  피스타치오: { lclsfCd: "04" },
  마카다미아: { lclsfCd: "04" },
  헤이즐넛: { lclsfCd: "04" },
  피칸: { lclsfCd: "04" },

  // 수산물 (대분류 코드: 05 - API 확인 필요)
  고등어: { lclsfCd: "05" },
  갈치: { lclsfCd: "05" },
  삼치: { lclsfCd: "05" },
  명태: { lclsfCd: "05" },
  조기: { lclsfCd: "05" },
  광어: { lclsfCd: "05" },
  우럭: { lclsfCd: "05" },
  도미: { lclsfCd: "05" },
  연어: { lclsfCd: "05" },
  참치: { lclsfCd: "05" },
  오징어: { lclsfCd: "05" },
  낙지: { lclsfCd: "05" },
  문어: { lclsfCd: "05" },
  주꾸미: { lclsfCd: "05" },
  새우: { lclsfCd: "05" },
  게: { lclsfCd: "05" },
  대게: { lclsfCd: "05" },
  꽃게: { lclsfCd: "05" },
  전복: { lclsfCd: "05" },
  멍게: { lclsfCd: "05" },
  미역: { lclsfCd: "05" },
  다시마: { lclsfCd: "05" },
  김: { lclsfCd: "05" },
  굴: { lclsfCd: "05" },
  바지락: { lclsfCd: "05" },
  조개: { lclsfCd: "05" },

  // 축산물 (대분류 코드: 03)
  쇠고기: { lclsfCd: "03" },
  소고기: { lclsfCd: "03" },
  돼지고기: { lclsfCd: "03" },
  삼겹살: { lclsfCd: "03" },
  닭고기: { lclsfCd: "03" },
  오리고기: { lclsfCd: "03" },
  계란: { lclsfCd: "03" },
  달걀: { lclsfCd: "03" },
  우유: { lclsfCd: "03" },
  치즈: { lclsfCd: "03" },
  버터: { lclsfCd: "03" },
  요구르트: { lclsfCd: "03" },
} as const;

/**
 * 검색 키워드로부터 대분류 코드를 찾는 함수
 *
 * @param keyword - 검색 키워드
 * @returns 대분류 코드와 중분류 코드 (없으면 undefined)
 */
export function getCategoryFromKeyword(
  keyword: string,
): { lclsfCd: string; mclsfCd?: string } | undefined {
  if (!keyword) return undefined;

  const normalizedKeyword = keyword.toLowerCase().trim();

  // 정확한 매칭 먼저 시도
  if (itemNameToCategory[normalizedKeyword]) {
    return itemNameToCategory[normalizedKeyword];
  }

  // 부분 매칭 시도 (키워드가 품목명에 포함되거나, 품목명이 키워드에 포함되는 경우)
  for (const [itemName, category] of Object.entries(itemNameToCategory)) {
    if (
      normalizedKeyword.includes(itemName.toLowerCase()) ||
      itemName.toLowerCase().includes(normalizedKeyword)
    ) {
      return category;
    }
  }

  return undefined;
}
