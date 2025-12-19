/**
 * @file app/api/wholesaler/orders/route.ts
 * @description 주문 목록 조회 API 라우트
 *
 * 클라이언트 컴포넌트에서 주문 목록을 조회하기 위한 API 엔드포인트입니다.
 *
 * @dependencies
 * - lib/supabase/queries/orders.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/supabase/queries/orders";
import type { OrderFilter } from "@/types/order";

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 [orders-api] API 요청 수신", {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    });

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("❌ [orders-api] 요청 본문 파싱 실패:", parseError);
      return NextResponse.json(
        {
          error: "잘못된 요청 형식",
          details: "요청 본문을 JSON으로 파싱할 수 없습니다.",
        },
        { status: 400 },
      );
    }

    const {
      filter = {},
      page = 1,
      pageSize = 20,
    }: {
      filter?: OrderFilter;
      page?: number;
      pageSize?: number;
    } = body;

    console.log("🔍 [orders-api] 주문 목록 조회 요청", {
      filter,
      page,
      pageSize,
    });

    const result = await getOrders({ filter, page, pageSize });

    console.log("✅ [orders-api] 주문 목록 조회 성공", {
      ordersCount: result.orders.length,
      total: result.total,
    });

    return NextResponse.json(result);
  } catch (error) {
    // ⚠️ 개선: 더 상세한 에러 정보 로깅
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("❌ [orders-api] 주문 목록 조회 오류:", {
      message: errorMessage,
      error: error,
      stack: errorStack,
      // 에러 객체의 모든 속성 출력
      ...(error instanceof Error && {
        name: error.name,
        cause: error.cause,
      }),
    });

    // 에러 응답을 항상 JSON으로 반환 (빈 응답 방지)
    const errorResponse = {
      error: "주문 목록 조회 실패",
      details: errorMessage,
      // 개발 환경에서만 스택 트레이스 포함
      ...(process.env.NODE_ENV === "development" &&
        errorStack && {
          stack: errorStack,
        }),
    };

    console.log("📤 [orders-api] 에러 응답 전송:", errorResponse);

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
