/**
 * @file app/api/payments/callback/route.ts
 * @description TossPayments 결제 콜백 API 라우트
 *
 * TossPayments 웹훅을 수신하여 결제 완료 시:
 * 1. 주문 상태 및 결제 정보 업데이트 (orders 테이블)
 * 2. 정산 데이터 자동 생성 (settlements 테이블)
 * 3. 결제 데이터 저장 (payments 테이블)
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
 * PAYMENT_STATUS_CHANGED 이벤트 형식
 */
interface TossPaymentsWebhook {
  eventType: string; // "PAYMENT_STATUS_CHANGED" 등
  data: {
    paymentKey: string;
    orderId: string;
    status: string; // "DONE", "CANCELED" 등
    totalAmount: number;
    approvedAt: string; // ISO 8601 형식
    method?: string; // "카드", "계좌이체" 등 (선택사항)
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
    // PAYMENT_STATUS_CHANGED 이벤트이고 status가 "DONE"인 경우만 처리
    if (
      body.eventType !== "PAYMENT_STATUS_CHANGED" ||
      body.data?.status !== "DONE"
    ) {
      console.log("⚠️ [payment-callback] 결제 완료 이벤트가 아님, 무시", {
        eventType: body.eventType,
        status: body.data?.status,
      });
      console.groupEnd();
      return NextResponse.json({ message: "Ignored" }, { status: 200 });
    }

    const { orderId, approvedAt, paymentKey, totalAmount, method } = body.data;

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

    // 2. 주문 상태 및 결제 정보 업데이트
    console.log("📝 [payment-callback] 주문 상태 및 결제 정보 업데이트");
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "pending", // 결제 완료 후 주문 대기 상태
        payment_key: paymentKey || null, // 토스페이먼츠 결제 키
        paid_at: approvedAt || null, // 결제 완료 시간
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
    let settlement;
    try {
      settlement = await createSettlement({
        ...(order as Order),
        paid_at: approvedAt,
      });

      console.log("✅ [payment-callback] 정산 생성 성공:", settlement.id);
    } catch (settlementError) {
      console.error("❌ [payment-callback] 정산 생성 실패:", settlementError);
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

    // 4. payments 테이블에 결제 데이터 저장
    console.log("💳 [payment-callback] 결제 데이터 저장 시작");
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        order_id: orderId,
        settlement_id: settlement.id,
        method: method || "CARD", // 웹훅에서 받은 결제 방법, 없으면 기본값
        amount: totalAmount || order.total_amount,
        payment_key: paymentKey || null,
        status: "paid", // 결제 완료 상태
        paid_at: approvedAt || null,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("❌ [payment-callback] 결제 데이터 저장 실패:", paymentError);
      // 결제 데이터 저장 실패는 치명적이지 않으므로 로그만 남기고 계속 진행
      console.warn(
        "⚠️ [payment-callback] 정산은 생성되었으나 결제 데이터 저장 실패",
      );
    } else {
      console.log("✅ [payment-callback] 결제 데이터 저장 성공:", payment.id);
    }

    console.groupEnd();

      return NextResponse.json({
        success: true,
        orderId,
        settlementId: settlement.id,
        paymentId: payment?.id,
        message: "결제 완료 및 정산 생성 완료",
      });
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
