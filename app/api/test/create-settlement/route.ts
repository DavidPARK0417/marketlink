/**
 * @file app/api/test/create-settlement/route.ts
 * @description 테스트 정산 데이터 생성 API 라우트
 *
 * 개발/테스트 환경에서만 사용 가능한 테스트 정산 데이터 생성 엔드포인트입니다.
 * createTestSettlement() 함수를 사용하여 더미 정산 데이터를 생성합니다.
 *
 * ⚠️ 주의: 개발 환경에서만 사용하세요. 프로덕션에서는 비활성화해야 합니다.
 *
 * @dependencies
 * - lib/supabase/queries/settlements.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { createTestSettlement } from "@/lib/supabase/queries/settlements";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 테스트 정산 생성 요청 본문 타입
 */
interface CreateTestSettlementRequest {
  orderId: string; // 주문 ID (필수)
  wholesalerId: string; // 도매점 ID (필수)
  orderAmount?: number; // 주문 금액 (기본값: 100000)
  options?: {
    platformFeeRate?: number; // 수수료율 (기본값: 0.05)
    daysToPayout?: number; // 정산 예정일까지 일수 (기본값: 7)
    status?: "pending" | "completed"; // 정산 상태 (기본값: "pending")
  };
}

/**
 * POST /api/test/create-settlement
 * 테스트 정산 데이터 생성
 */
export async function POST(request: NextRequest) {
  // 개발 환경에서만 허용
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "이 엔드포인트는 프로덕션 환경에서 사용할 수 없습니다." },
      { status: 403 },
    );
  }

  console.group("🧪 [test-create-settlement] 테스트 정산 생성 요청");

  try {
    const body: CreateTestSettlementRequest = await request.json();

    const { orderId, wholesalerId, orderAmount = 100000, options = {} } = body;

    // 필수 파라미터 검증
    if (!orderId || !wholesalerId) {
      console.error("❌ [test-create-settlement] 필수 파라미터 누락:", {
        orderId,
        wholesalerId,
      });
      console.groupEnd();
      return NextResponse.json(
        { error: "orderId와 wholesalerId는 필수입니다." },
        { status: 400 },
      );
    }

    // 주문 존재 확인
    const supabase = getServiceRoleClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, wholesaler_id, total_amount")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("❌ [test-create-settlement] 주문 조회 실패:", orderError);
      console.groupEnd();
      return NextResponse.json(
        { error: `주문을 찾을 수 없습니다: ${orderId}` },
        { status: 404 },
      );
    }

    // 도매점 ID 일치 확인
    if (order.wholesaler_id !== wholesalerId) {
      console.error("❌ [test-create-settlement] 도매점 ID 불일치:", {
        orderWholesalerId: order.wholesaler_id,
        providedWholesalerId: wholesalerId,
      });
      console.groupEnd();
      return NextResponse.json(
        { error: "주문의 도매점 ID와 일치하지 않습니다." },
        { status: 400 },
      );
    }

    // 이미 정산이 존재하는지 확인
    const { data: existingSettlement } = await supabase
      .from("settlements")
      .select("id")
      .eq("order_id", orderId)
      .single();

    if (existingSettlement) {
      console.log(
        "⚠️ [test-create-settlement] 이미 정산이 존재함:",
        existingSettlement.id,
      );
      console.groupEnd();
      return NextResponse.json(
        {
          warning: "이 주문에 대한 정산이 이미 존재합니다.",
          existingSettlementId: existingSettlement.id,
        },
        { status: 200 },
      );
    }

    // 실제 주문 금액 사용 (orderAmount가 제공되지 않은 경우)
    const finalOrderAmount = orderAmount || order.total_amount;

    console.log("📝 [test-create-settlement] 테스트 정산 생성 시작:", {
      orderId,
      wholesalerId,
      orderAmount: finalOrderAmount,
      options,
    });

    // 테스트 정산 생성
    const settlement = await createTestSettlement(
      orderId,
      wholesalerId,
      finalOrderAmount,
      options,
    );

    console.log(
      "✅ [test-create-settlement] 테스트 정산 생성 성공:",
      settlement.id,
    );
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: "테스트 정산 데이터가 생성되었습니다.",
      settlement: {
        id: settlement.id,
        order_id: settlement.order_id,
        wholesaler_id: settlement.wholesaler_id,
        order_amount: settlement.order_amount,
        platform_fee_rate: settlement.platform_fee_rate,
        platform_fee: settlement.platform_fee,
        wholesaler_amount: settlement.wholesaler_amount,
        status: settlement.status,
        scheduled_payout_at: settlement.scheduled_payout_at,
      },
    });
  } catch (error) {
    console.error("❌ [test-create-settlement] 예상치 못한 오류:", error);
    console.groupEnd();

    return NextResponse.json(
      {
        error: "테스트 정산 생성 실패",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "알 수 없는 오류"
            : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/test/create-settlement
 * 사용 방법 안내
 */
export async function GET() {
  return NextResponse.json({
    message: "테스트 정산 데이터 생성 API",
    usage: {
      method: "POST",
      endpoint: "/api/test/create-settlement",
      body: {
        orderId: "string (필수) - 주문 ID",
        wholesalerId: "string (필수) - 도매점 ID",
        orderAmount: "number (선택) - 주문 금액 (기본값: 100000)",
        options: {
          platformFeeRate: "number (선택) - 수수료율 (기본값: 0.05)",
          daysToPayout: "number (선택) - 정산 예정일까지 일수 (기본값: 7)",
          status:
            "string (선택) - 정산 상태: 'pending' | 'completed' (기본값: 'pending')",
        },
      },
    },
    example: {
      orderId: "주문 UUID",
      wholesalerId: "도매점 UUID",
      orderAmount: 100000,
      options: {
        platformFeeRate: 0.05,
        daysToPayout: 7,
        status: "pending",
      },
    },
    note: "⚠️ 이 API는 개발 환경에서만 사용 가능합니다.",
  });
}
