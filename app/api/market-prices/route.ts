/**
 * @file app/api/market-prices/route.ts
 * @description 시세 조회 API Route
 *
 * 공공데이터포털 API를 서버 사이드에서 호출하여 CORS 문제를 해결합니다.
 * 클라이언트 컴포넌트에서 이 API Route를 통해 시세를 조회합니다.
 *
 * @dependencies
 * - lib/api/market-prices.ts
 */

import { NextResponse } from "next/server";
import { getMarketPrices, getPriceTrend, MarketPriceParams } from "@/lib/api/market-prices";

/**
 * GET /api/market-prices
 * 시세 조회
 */
export async function GET(request: Request) {
  const requestId = Date.now().toString(36);
  
  try {
    const { searchParams } = new URL(request.url);

    // 쿼리 파라미터에서 조회 조건 추출
    const params: MarketPriceParams = {
      date: searchParams.get("date") || undefined,
      lclsfCd: searchParams.get("lclsfCd") || undefined,
      mclsfCd: searchParams.get("mclsfCd") || undefined,
      sclsfCd: searchParams.get("sclsfCd") || undefined,
      whslMrktCd: searchParams.get("whslMrktCd") || undefined, // 🆕 도매시장 코드
      pageNo: searchParams.get("pageNo")
        ? parseInt(searchParams.get("pageNo")!)
        : undefined,
      numOfRows: searchParams.get("numOfRows")
        ? parseInt(searchParams.get("numOfRows")!)
        : undefined,
    };

    console.group(`📊 [api/market-prices] 시세 조회 요청 [${requestId}]`);
    console.log("요청 URL:", request.url);
    console.log("파라미터:", JSON.stringify(params, null, 2));
    console.log("타임스탬프:", new Date().toISOString());

    const startTime = Date.now();
    const data = await getMarketPrices(params);
    const duration = Date.now() - startTime;

    console.log("✅ 시세 조회 성공:", {
      항목수: data.length,
      소요시간: `${duration}ms`,
    });
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      requestId,
    });
  } catch (error) {
    // 더 자세한 에러 로깅
    console.group(`❌ [api/market-prices] 시세 조회 실패 [${requestId}]`);
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
    const errorMessage = error instanceof Error 
      ? error.message 
      : "시세 조회 중 오류가 발생했습니다.";
    
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

