/**
 * @file lib/api/product-codes.ts
 * @description 농축수산물 품목 및 등급 코드표 관리
 *
 * CSV 파일 기반 코드표를 파싱하고 조회하는 기능을 제공합니다.
 * KAMIS API와의 코드 매핑도 지원합니다.
 *
 * @dependencies
 * - CSV 파일: docs/Wholesaler/농축수산물 품목 및 등급 코드표.csv
 */

/**
 * 품목 코드 정보 인터페이스
 */
export interface ProductCode {
  productNo: number; // 품목번호
  대분류명: string;
  대분류코드: string; // 01, 02, 07, 200, 300, 400, 600
  중분류명: string;
  중분류코드: string;
  소분류명: string;
  소분류코드: string;
  품목명: string;
  품목코드: string; // 등급/규격 구분
  단위명: string; // 소매, 도매, 소포장
  단위코드: string; // 04: 소매, 05: 도매, 07/08: 소포장
  표시단위: string; // 10kg, 20kg, 1kg 등
}

/**
 * KAMIS API 코드 매핑 결과
 */
export interface KAMISCodeMapping {
  itemCode: string; // 품목 코드
  itemCategoryCode: string; // 부류 코드
  productRankCode: string; // 등급 코드 (01: 특, 02: 상, 03: 중, 04: 전체)
}

/**
 * 단위 코드 매핑
 */
export const UNIT_CODE_MAP = {
  소매: "04",
  도매: "05",
  소포장: ["07", "08"],
} as const;

/**
 * 등급 코드 매핑 (KAMIS API 기준)
 */
export const GRADE_CODE_MAP: Record<string, string> = {
  "00": "04", // 전체
  "01": "01", // 특
  "02": "02", // 상
  "03": "03", // 중
  "04": "04", // 전체
  "05": "02", // 상 (추정)
  "06": "01", // 특 (추정)
  특: "01",
  상: "02",
  중: "03",
  하: "04",
  전체: "04",
};

/**
 * CSV 파일을 파싱하여 ProductCode 배열로 변환
 * @param csvContent - CSV 파일 내용
 * @returns ProductCode 배열
 */
export function parseProductCodesCSV(csvContent: string): ProductCode[] {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  const codes: ProductCode[] = [];

  // 헤더 스킵 (1-2번째 줄)
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSV 파싱 (쉼표로 분리)
    const columns = line.split(",").map((col) => col.trim());

    if (columns.length < 12) continue;

    try {
      const productNo = parseInt(columns[0], 10);
      if (isNaN(productNo)) continue;

      codes.push({
        productNo,
        대분류명: columns[1] || "",
        대분류코드: columns[2] || "",
        중분류명: columns[3] || "",
        중분류코드: columns[4] || "",
        소분류명: columns[5] || "",
        소분류코드: columns[6] || "",
        품목명: columns[7] || "",
        품목코드: columns[8] || "",
        단위명: columns[9] || "",
        단위코드: columns[10] || "",
        표시단위: columns[11] || "",
      });
    } catch (error) {
      console.warn(`⚠️ [코드표 파싱] 라인 ${i + 1} 파싱 실패:`, error);
    }
  }

  return codes;
}

/**
 * 품목명으로 코드표에서 정확한 코드 찾기
 * @param itemName - 검색할 품목명
 * @param unitType - 단위 타입 필터 (선택)
 * @param codes - 코드표 배열 (선택, 없으면 전체 검색)
 * @returns 매칭되는 ProductCode 배열
 */
export function findProductCodes(
  itemName: string,
  unitType?: "소매" | "도매" | "소포장",
  codes?: ProductCode[],
): ProductCode[] {
  if (!itemName || !codes || codes.length === 0) return [];

  const keyword = itemName.toLowerCase().trim();
  const results: ProductCode[] = [];

  for (const code of codes) {
    const 품목명 = code.품목명.toLowerCase();
    const 대분류명 = code.대분류명.toLowerCase();
    const 소분류명 = code.소분류명.toLowerCase();

    // 정확한 일치 또는 부분 일치 확인
    const matches =
      품목명 === keyword ||
      품목명.includes(keyword) ||
      keyword.includes(품목명) ||
      대분류명.includes(keyword) ||
      소분류명.includes(keyword);

    if (matches) {
      // 단위 타입 필터링
      if (unitType) {
        if (unitType === "소매" && code.단위코드 === "04") {
          results.push(code);
        } else if (unitType === "도매" && code.단위코드 === "05") {
          results.push(code);
        } else if (
          unitType === "소포장" &&
          (code.단위코드 === "07" || code.단위코드 === "08")
        ) {
          results.push(code);
        }
      } else {
        results.push(code);
      }
    }
  }

  // 정확도 순으로 정렬 (정확한 일치 우선)
  return results.sort((a, b) => {
    const aExact = a.품목명.toLowerCase() === keyword ? 0 : 1;
    const bExact = b.품목명.toLowerCase() === keyword ? 0 : 1;
    return aExact - bExact;
  });
}

/**
 * ProductCode를 KAMIS API 코드로 변환
 * @param productCode - ProductCode 객체
 * @returns KAMIS API 코드 매핑
 */
export function convertToKAMISCode(productCode: ProductCode): KAMISCodeMapping {
  // 대분류 코드를 KAMIS 부류 코드로 매핑
  // 01: 쌀 → 100 (일반벼)
  // 02: 쌀 도정 → 100
  // 07: 과일류 소포장 → 200 (채소류) 또는 400 (과일류)
  // 200: 채소류 → 200
  // 300: 특용작물 → 300
  // 400: 과일류 → 400
  // 600: 수산물 → 600

  let itemCategoryCode = productCode.대분류코드;

  // 대분류 코드 매핑 조정
  if (productCode.대분류코드 === "01" || productCode.대분류코드 === "02") {
    // 쌀 관련은 중분류 코드 사용
    itemCategoryCode = productCode.중분류코드 || "100";
  } else if (productCode.대분류코드 === "07") {
    // 과일류 소포장은 중분류 코드 사용
    itemCategoryCode = productCode.중분류코드 || "200";
  }

  // 품목 코드는 소분류 코드 사용 (KAMIS API의 itemCode)
  const itemCode = productCode.소분류코드 || productCode.중분류코드;

  // 등급 코드 변환
  const productRankCode =
    GRADE_CODE_MAP[productCode.품목코드] ||
    GRADE_CODE_MAP[productCode.품목코드] ||
    "04"; // 기본값: 전체

  return {
    itemCode,
    itemCategoryCode,
    productRankCode,
  };
}

/**
 * 코드표에서 품목명 검색 (자동완성용)
 * @param keyword - 검색 키워드
 * @param limit - 최대 결과 수 (기본 10개)
 * @param codes - 코드표 배열
 * @returns 검색 결과 배열
 */
export function searchProductCodes(
  keyword: string,
  codes: ProductCode[],
  limit: number = 10,
): ProductCode[] {
  if (!keyword || keyword.length < 2) return [];

  const results = findProductCodes(keyword, undefined, codes);
  return results.slice(0, limit);
}

/**
 * 품목번호로 코드 찾기
 * @param productNo - 품목번호
 * @param codes - 코드표 배열
 * @returns ProductCode 또는 null
 */
export function findProductCodeByNo(
  productNo: number,
  codes: ProductCode[],
): ProductCode | null {
  return codes.find((code) => code.productNo === productNo) || null;
}
