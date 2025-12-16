/**
 * @file app/api/payments/callback/route.ts
 * @description TossPayments 결제 콜백 API 라우트
 *
 * TossPayments 웹훅을 수신하여 결제 완료 시:
 * 1. 웹훅 이벤트 검증 (PAYMENT_STATUS_CHANGED, status: "DONE")
 * 2. 공통 DB 저장 함수 호출 (processPaymentAfterApproval)
 *
 * @dependencies
 * - lib/payments/process-payment.ts
 *
 * @note
 * - 웹훅은 10초 이내에 200 응답을 보내야 함 (토스페이먼츠 재전송 정책)
 * - 실패 시 최대 7회 재전송 (최초 전송으로부터 3일 19시간 후까지)
 */

import { NextRequest, NextResponse } from "next/server";
import { processPaymentAfterApproval } from "@/lib/payments/process-payment";

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

    // 필수 데이터 검증
    if (!orderId || !approvedAt || !paymentKey) {
      console.error("❌ [payment-callback] 필수 데이터 누락:", {
        orderId,
        approvedAt,
        paymentKey,
      });
      console.groupEnd();
      return NextResponse.json(
        { error: "필수 데이터 누락" },
        { status: 400 },
      );
    }

    // 공통 DB 저장 함수 호출
    console.log("💾 [payment-callback] DB 저장 시작...");
    try {
      const result = await processPaymentAfterApproval({
        orderId,
        paymentKey,
        approvedAt,
        totalAmount: totalAmount || undefined, // 웹훅에서 받은 금액, 없으면 undefined (주문의 total_amount 사용)
        method: method || undefined, // 웹훅에서 받은 결제 방법 (없으면 기본값 "CARD" 사용)
      });

      console.log("✅ [payment-callback] 결제 처리 완료:", {
        orderId: result.order.id,
        settlementId: result.settlement.id,
        paymentId: result.payment?.id || "저장 실패",
      });
      console.groupEnd();

      // 웹훅은 10초 이내에 200 응답을 보내야 함 (토스페이먼츠 재전송 정책)
      return NextResponse.json({
        success: true,
        orderId: result.order.id,
        settlementId: result.settlement.id,
        paymentId: result.payment?.id || null,
        message: "결제 완료 및 정산 생성 완료",
      });
    } catch (dbError) {
      console.error("❌ [payment-callback] DB 저장 실패:", dbError);
      console.groupEnd();

      // 에러 타입에 따라 적절한 HTTP 상태 코드 반환
      const errorMessage =
        dbError instanceof Error ? dbError.message : "알 수 없는 오류";

      // 주문을 찾을 수 없는 경우 404
      if (errorMessage.includes("주문을 찾을 수 없습니다")) {
        return NextResponse.json(
          {
            error: "주문을 찾을 수 없습니다",
            orderId,
            ...(process.env.NODE_ENV === "development" && {
              details: errorMessage,
            }),
          },
          { status: 404 },
        );
      }

      // 기타 에러는 500
      return NextResponse.json(
        {
          error: "결제 처리 실패",
          orderId,
          ...(process.env.NODE_ENV === "development" && {
            details: errorMessage,
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
