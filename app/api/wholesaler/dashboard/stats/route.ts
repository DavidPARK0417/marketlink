/**
 * @file app/api/wholesaler/dashboard/stats/route.ts
 * @description 대시보드 통계 데이터 API
 *
 * 도매 대시보드의 통계 데이터를 제공하는 API 엔드포인트입니다.
 */

import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/supabase/queries/dashboard";

export async function GET() {
  try {
    console.log("📊 [dashboard-api] 통계 데이터 요청");

    const stats = await getDashboardStats();

    // bfcache 최적화: 적절한 캐시 헤더 설정
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("❌ [dashboard-api] 통계 데이터 조회 오류:", {
      message: errorMessage,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      } : error,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: "통계 데이터를 불러오는 중 오류가 발생했습니다.",
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && errorStack && {
          stack: errorStack,
        }),
      },
      { status: 500 },
    );
  }
}
