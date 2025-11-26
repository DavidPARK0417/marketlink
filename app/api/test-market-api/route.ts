/**
 * @file app/api/test-market-api/route.ts
 * @description 공공데이터포털 API 대분류 코드 체계 파악용 테스트
 *
 * 다양한 대분류 코드로 API를 호출하여 실제 코드 체계를 파악합니다.
 */

import { NextResponse } from "next/server";

const rawApiKey = process.env.PUBLIC_DATA_API_KEY;
const API_KEY = rawApiKey?.trim().replace(/^["']|["']$/g, "") || null;
const TEST_API_KEY =
  "637bda9c5cbfe57e5f9bd8d403344dc96c3b8ec57e6ad52c980a355a554cffcc";
const FINAL_API_KEY = API_KEY || TEST_API_KEY;
const BASE_URL = "https://apis.data.go.kr/B552845/katRealTime/trades";

interface TestResult {
  testName: string;
  url: string;
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
  uniqueLclsfCodes?: string[];
  uniqueLclsfNames?: string[];
  sampleItems?: any[];
}

export async function GET(request: Request) {
  try {
    console.group("🧪 [test-market-api] 대분류 코드 체계 파악 시작");

    if (!FINAL_API_KEY) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const results: TestResult[] = [];

    // 대량 데이터 조회하여 다양한 대분류 코드 수집
    const testCodes = [
      { code: null, name: "전체 데이터 (대분류 코드 체계 파악)" },
      { code: "01", name: "코드 01 테스트" },
      { code: "02", name: "코드 02 테스트" },
      { code: "03", name: "코드 03 테스트" },
      { code: "04", name: "코드 04 테스트" },
      { code: "05", name: "코드 05 테스트" },
      { code: "06", name: "코드 06 테스트" },
      { code: "07", name: "코드 07 테스트" },
      { code: "08", name: "코드 08 테스트" },
      { code: "09", name: "코드 09 테스트" },
      { code: "10", name: "코드 10 테스트" },
      { code: "11", name: "코드 11 테스트" },
      { code: "12", name: "코드 12 테스트" },
    ];

    for (const test of testCodes) {
      try {
        console.log(`📊 테스트: ${test.name}`);

        let url = `${BASE_URL}?serviceKey=${encodeURIComponent(
          FINAL_API_KEY,
        )}&pageNo=1&numOfRows=50&returnType=json`;
        if (test.code) {
          url += `&gds_lclsf_cd=${test.code}`;
        }

        console.log("URL:", url.replace(FINAL_API_KEY, "***"));

        const response = await fetch(url, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        const responseText = await response.text();
        const data = JSON.parse(responseText);

        // 대분류 코드 및 이름 추출
        const lclsfCodes = new Set<string>();
        const lclsfNames = new Set<string>();
        const sampleItems: any[] = [];

        if (data?.response?.body?.items?.item) {
          const items = Array.isArray(data.response.body.items.item)
            ? data.response.body.items.item
            : [data.response.body.items.item];

          items.forEach((item: any, index: number) => {
            if (item.gds_lclsf_cd) lclsfCodes.add(item.gds_lclsf_cd);
            if (item.gds_lclsf_nm) lclsfNames.add(item.gds_lclsf_nm);

            // 처음 3개 아이템만 샘플로 저장
            if (index < 3) {
              sampleItems.push({
                itemName: item.corp_gds_item_nm,
                lclsfCd: item.gds_lclsf_cd,
                lclsfNm: item.gds_lclsf_nm,
                mclsfCd: item.gds_mclsf_cd,
                mclsfNm: item.gds_mclsf_nm,
                sclsfCd: item.gds_sclsf_cd,
                sclsfNm: item.gds_sclsf_nm,
              });
            }
          });
        }

        console.log(`✅ ${test.name} 성공:`, {
          status: response.status,
          totalCount: data?.response?.body?.totalCount,
          uniqueLclsfCodes: Array.from(lclsfCodes),
          uniqueLclsfNames: Array.from(lclsfNames),
        });

        results.push({
          testName: test.name,
          url: url.replace(FINAL_API_KEY, "***"),
          success: response.ok,
          data: {
            totalCount: data?.response?.body?.totalCount,
            numOfRows: data?.response?.body?.numOfRows,
          },
          status: response.status,
          uniqueLclsfCodes: Array.from(lclsfCodes).sort(),
          uniqueLclsfNames: Array.from(lclsfNames).sort(),
          sampleItems: sampleItems,
        });

        // API 부하 방지를 위한 딜레이 (0.5초)
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ ${test.name} 실패:`, error);
        results.push({
          testName: test.name,
          url: "",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    console.groupEnd();

    return NextResponse.json(
      {
        success: true,
        message: "대분류 코드 체계 파악 완료",
        results: results,
        summary: {
          total: results.length,
          success: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ [test-market-api] 예상치 못한 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
