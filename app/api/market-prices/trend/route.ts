/**
 * @file app/api/market-prices/trend/route.ts
 * @description 시세 추이 조회 API Route
 *
 * 일주일 시세 추이를 조회합니다.
 *
 * @dependencies
 * - lib/api/market-prices.ts
 */

import { NextResponse } from "next/server";
import {
  getDailyPriceTrend,
  getMonthlyPriceTrend,
  getYearlyPriceTrend,
} from "@/lib/api/market-prices";

/**
 * GET /api/market-prices/trend
 * 시세 추이 조회 (일별/월별/연별)
 */
export async function GET(request: Request) {
  const requestId = Date.now().toString(36);

  try {
    const { searchParams } = new URL(request.url);

    const lclsfCd = searchParams.get("lclsfCd");
    const mclsfCd = searchParams.get("mclsfCd") || undefined;
    const sclsfCd = searchParams.get("sclsfCd") || undefined;
    const itemName = searchParams.get("itemName") || undefined;
    const productno = searchParams.get("productno") || undefined; // 테이블 데이터에서 추출한 품목 코드
    const categoryCode = searchParams.get("categoryCode") || undefined; // 테이블 데이터에서 추출한 카테고리 코드
    const period = searchParams.get("period") || "daily"; // daily, monthly, yearly

    // lclsfCd 또는 productno 중 하나는 필수
    if (!lclsfCd && !productno) {
      console.warn(`⚠️ [api/market-prices/trend] 필수 파라미터 누락 [${requestId}]:`, {
        요청URL: request.url,
        lclsfCd: lclsfCd || "없음",
        productno: productno || "없음",
      });

      return NextResponse.json(
        {
          success: false,
          error: "대분류 코드(lclsfCd) 또는 품목 코드(productno)가 필요합니다.",
          requestId,
        },
        { status: 400 },
      );
    }

    console.group(`📈 [api/market-prices/trend] 시세 추이 조회 요청 [${requestId}]`);
    console.log("요청 URL:", request.url);
    console.log("파라미터:", JSON.stringify({ lclsfCd, mclsfCd, sclsfCd, itemName, productno, categoryCode, period }, null, 2));
    console.log("타임스탬프:", new Date().toISOString());

    const startTime = Date.now();
    let data;

    // productno와 categoryCode가 있으면 직접 사용, 없으면 기존 방식 사용
    const effectiveLclsfCd = lclsfCd || "10"; // 기본값 (채소류)
    
    switch (period) {
      case "daily":
        data = await getDailyPriceTrend(
          effectiveLclsfCd, 
          mclsfCd, 
          sclsfCd, 
          itemName, 
          30,
          productno, // 추가 파라미터
          categoryCode // 추가 파라미터
        );
        break;
      case "monthly":
        data = await getMonthlyPriceTrend(
          effectiveLclsfCd, 
          mclsfCd, 
          sclsfCd, 
          itemName, 
          12,
          productno,
          categoryCode
        );
        break;
      case "yearly":
        data = await getYearlyPriceTrend(
          effectiveLclsfCd, 
          mclsfCd, 
          sclsfCd, 
          itemName, 
          5,
          productno,
          categoryCode
        );
        break;
      default:
        data = await getDailyPriceTrend(
          effectiveLclsfCd, 
          mclsfCd, 
          sclsfCd, 
          itemName, 
          30,
          productno,
          categoryCode
        );
    }

    const duration = Date.now() - startTime;

    console.log("✅ 시세 추이 조회 성공:", {
      기간: period,
      항목수: data.length,
      소요시간: `${duration}ms`,
    });
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      period,
      requestId,
    });
  } catch (error) {
    // 더 자세한 에러 로깅
    console.group(`❌ [api/market-prices/trend] 시세 추이 조회 실패 [${requestId}]`);
    console.error("에러 타입:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("에러 메시지:", error instanceof Error ? error.message : String(error));

    if (error instanceof Error) {
      console.error("에러 스택:", error.stack);
      console.error("에러 이름:", error.name);
    }

    console.error("요청 URL:", request.url);
    console.error("타임스탬프:", new Date().toISOString());
    console.groupEnd();

    // 에러 상세 정보 포함
    const errorMessage =
      error instanceof Error
        ? error.message
        : "시세 추이 조회 중 오류가 발생했습니다.";

    const errorDetails: Record<string, any> = {
      requestId,
      timestamp: new Date().toISOString(),
    };

    if (error instanceof Error && error.stack) {
      errorDetails.stack = error.stack;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 },
    );
  }
}

