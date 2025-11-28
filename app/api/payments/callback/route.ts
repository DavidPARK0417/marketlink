/**
 * @file app/api/payments/callback/route.ts
 * @description TossPayments 결제 콜백 API 라우트
 *
 * TossPayments 웹훅을 수신하여 결제 완료 시:
 * 1. 주문 상태 업데이트 (paid_at 설정)
 * 2. 정산 데이터 자동 생성
 *
 * @dependencies
 * - lib/supabase/service-role.ts
 * - lib/supabase/queries/settlements.ts
 * - lib/supabase/queries/orders.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { createSettlement } from "@/lib/supabase/queries/settlements";
import type { Order } from "@/types/order";

/**
 * TossPayments 웹훅 요청 본문 타입
 * (실제 TossPayments 문서에 맞게 수정 필요)
 */
interface TossPaymentsWebhook {
  eventType: string; // "PAYMENT_CONFIRMED" 등
  data: {
    paymentKey: string;
    orderId: string;
    status: string;
    totalAmount: number;
    approvedAt: string; // ISO 8601 형식
  };
}

/**
 * POST /api/payments/callback
 * TossPayments 웹훅 수신 및 처리
 */
export async function POST(request: NextRequest) {
  console.group("💳 [payment-callback] 결제 콜백 수신");

  try {
    const body: TossPaymentsWebhook = await request.json();

    console.log("웹훅 데이터:", {
      eventType: body.eventType,
      orderId: body.data?.orderId,
      status: body.data?.status,
    });

    // 결제 완료 이벤트만 처리
    if (
      body.eventType !== "PAYMENT_CONFIRMED" &&
      body.data?.status !== "DONE"
    ) {
      console.log("⚠️ [payment-callback] 결제 완료 이벤트가 아님, 무시");
      console.groupEnd();
      return NextResponse.json({ message: "Ignored" }, { status: 200 });
    }

    const { orderId, approvedAt } = body.data;

    if (!orderId || !approvedAt) {
      console.error("❌ [payment-callback] 필수 데이터 누락:", {
        orderId,
        approvedAt,
      });
      console.groupEnd();
      return NextResponse.json({ error: "필수 데이터 누락" }, { status: 400 });
    }

    const supabase = getServiceRoleClient();

    // 1. 주문 조회
    console.log("🔍 [payment-callback] 주문 조회:", orderId);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("❌ [payment-callback] 주문 조회 실패:", orderError);
      console.groupEnd();
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다" },
        { status: 404 },
      );
    }

    // 이미 결제 완료된 주문인지 확인
    if (order.paid_at) {
      console.log("⚠️ [payment-callback] 이미 결제 완료된 주문");
      console.groupEnd();
      return NextResponse.json(
        { message: "Already processed" },
        { status: 200 },
      );
    }

    // 2. 주문 상태 업데이트 (paid_at 설정)
    console.log("📝 [payment-callback] 주문 상태 업데이트");
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        paid_at: approvedAt,
        status: "pending", // 결제 완료 후 주문 대기 상태
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("❌ [payment-callback] 주문 업데이트 실패:", updateError);
      console.groupEnd();
      return NextResponse.json(
        { error: "주문 업데이트 실패" },
        { status: 500 },
      );
    }

    // 3. 정산 데이터 생성
    console.log("💰 [payment-callback] 정산 데이터 생성 시작");
    try {
      const settlement = await createSettlement({
        ...(order as Order),
        paid_at: approvedAt,
      });

      console.log("✅ [payment-callback] 정산 생성 성공:", settlement.id);
      console.groupEnd();

      return NextResponse.json({
        success: true,
        orderId,
        settlementId: settlement.id,
        message: "결제 완료 및 정산 생성 완료",
      });
    } catch (settlementError) {
      console.error("❌ [payment-callback] 정산 생성 실패:", settlementError);

      // 정산 생성 실패 시 주문은 이미 업데이트되었으므로,
      // 나중에 재시도할 수 있도록 로그 남기기
      console.error(
        "⚠️ [payment-callback] 주문은 업데이트되었으나 정산 생성 실패",
      );
      console.groupEnd();

      return NextResponse.json(
        {
          error: "정산 생성 실패",
          orderId,
          // 개발 환경에서만 상세 에러 포함
          ...(process.env.NODE_ENV === "development" && {
            details:
              settlementError instanceof Error
                ? settlementError.message
                : "알 수 없는 오류",
          }),
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ [payment-callback] 예상치 못한 오류:", error);
    console.groupEnd();

    return NextResponse.json(
      {
        error: "서버 오류",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : "알 수 없는 오류",
        }),
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/payments/callback
 * 웹훅 검증용 (TossPayments가 필요시 사용)
 */
export async function GET() {
  return NextResponse.json({ message: "Payment callback endpoint" });
}
