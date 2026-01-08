/**
 * @file app/api/wholesaler/settlements/route.ts
 * @description 정산 목록 조회 API 라우트
 *
 * 클라이언트 컴포넌트에서 정산 목록을 조회하기 위한 API 엔드포인트입니다.
 *
 * @dependencies
 * - lib/supabase/queries/settlements.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getSettlements } from "@/lib/supabase/queries/settlements";
import type { SettlementFilter } from "@/types/settlement";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [settlements-api] API 요청 수신");

    const body = await request.json();
    const {
      filter = {},
      page = 1,
      pageSize = 20,
      sortBy = "created_at",
      sortOrder = "desc",
    }: {
      filter?: SettlementFilter;
      page?: number;
      pageSize?: number;
      sortBy?: "created_at" | "scheduled_payout_at" | "order_amount";
      sortOrder?: "asc" | "desc";
    } = body;

    console.log("🔍 [settlements-api] 정산 목록 조회 요청", {
      filter,
      page,
      pageSize,
      sortBy,
      sortOrder,
    });

    const result = await getSettlements({
      filter,
      page,
      pageSize,
      sortBy,
      sortOrder,
    });

    console.log("✅ [settlements-api] 정산 목록 조회 성공", {
      settlementsCount: result.settlements.length,
      total: result.total,
    });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("❌ [settlements-api] 정산 목록 조회 오류:", {
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
        error: "정산 목록 조회 실패",
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
