/**
 * @file app/api/wholesaler/settlements/stats/route.ts
 * @description 정산 통계 조회 API 라우트
 *
 * 정산 통계를 조회하는 API 엔드포인트입니다.
 * 헤더에 표시할 총 정산 예정 금액 등을 제공합니다.
 *
 * @dependencies
 * - lib/supabase/queries/settlements.ts
 */

import { NextResponse } from "next/server";
import { getSettlementStats } from "@/lib/supabase/queries/settlements";

export async function GET() {
  try {
    console.log("📊 [settlements-stats-api] 정산 통계 조회 요청");

    const stats = await getSettlementStats();

    console.log("✅ [settlements-stats-api] 정산 통계 조회 성공", stats);

    return NextResponse.json(stats);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("❌ [settlements-stats-api] 정산 통계 조회 오류:", {
      message: errorMessage,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
              cause: error.cause,
            }
          : error,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: "정산 통계 조회 실패",
        details: errorMessage,
        ...(process.env.NODE_ENV === "development" &&
          errorStack && {
            stack: errorStack,
          }),
      },
      { status: 500 },
    );
  }
}
