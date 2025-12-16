/**
 * @file app/api/payments/confirm/route.ts
 * @description 토스페이먼츠 결제 승인 API 라우트
 *
 * 결제 성공 후 토스페이먼츠 결제 승인 API를 호출하고 DB에 저장합니다.
 *
 * 처리 흐름:
 * 1. 요청 본문 검증
 * 2. 주문 조회 및 금액 검증 (보안 필수)
 * 3. 토스페이먼츠 결제 승인 API 호출
 * 4. DB 저장 (processPaymentAfterApproval 호출)
 *
 * @dependencies
 * - lib/payments/process-payment.ts
 * - lib/supabase/service-role.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { processPaymentAfterApproval } from "@/lib/payments/process-payment";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 결제 승인 요청 본문 타입
 */
interface ConfirmPaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

/**
 * 토스페이먼츠 결제 승인 API 응답 타입
 */
interface TossPaymentsConfirmResponse {
  mId: string;
  version: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string; // "DONE" 등
  requestedAt: string;
  approvedAt: string; // ISO 8601 형식
  method: string | null; // "카드", "계좌이체" 등 (null 가능)
  totalAmount: number;
  currency: string;
  // ... 기타 필드
}

/**
 * 토스페이먼츠 API 에러 응답 타입
 */
interface TossPaymentsErrorResponse {
  code: string;
  message: string;
}

/**
 * POST /api/payments/confirm
 * 토스페이먼츠 결제 승인 API 호출 및 DB 저장
 */
export async function POST(request: NextRequest) {
  console.group("💳 [payment-confirm] 결제 승인 API 호출 시작");

  try {
    // 1. 요청 본문 파싱 및 검증
    const body: ConfirmPaymentRequest = await request.json();
    const { paymentKey, orderId, amount } = body;

    console.log("요청 파라미터:", {
      paymentKey,
      orderId,
      amount,
    });

    // 필수 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      console.error("❌ [payment-confirm] 필수 파라미터 누락");
      console.groupEnd();
      return NextResponse.json(
        { error: "필수 파라미터가 누락되었습니다." },
        { status: 400 },
      );
    }

    // 금액 검증 (양수)
    if (typeof amount !== "number" || amount <= 0) {
      console.error("❌ [payment-confirm] 잘못된 금액:", amount);
      console.groupEnd();
      return NextResponse.json(
        { error: "결제 금액이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    // 2. 주문 조회 및 금액 검증 (보안 필수 - 토스페이먼츠 문서 요구사항)
    console.log("🔍 [payment-confirm] 주문 조회 및 금액 검증:", orderId);
    const supabase = getServiceRoleClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total_amount, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("❌ [payment-confirm] 주문 조회 실패:", orderError);
      console.groupEnd();
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 금액 검증: 요청된 금액과 주문 금액 비교 (보안 필수)
    if (order.total_amount !== amount) {
      console.error("❌ [payment-confirm] 금액 불일치:", {
        주문금액: order.total_amount,
        요청금액: amount,
      });
      console.groupEnd();
      return NextResponse.json(
        {
          error: "결제 금액이 주문 금액과 일치하지 않습니다.",
          details:
            process.env.NODE_ENV === "development"
              ? `주문 금액: ${order.total_amount}, 요청 금액: ${amount}`
              : undefined,
        },
        { status: 400 },
      );
    }

    console.log("✅ [payment-confirm] 주문 조회 및 금액 검증 성공");

    // 3. 환경 변수 확인
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      console.error("❌ [payment-confirm] TOSS_SECRET_KEY 환경 변수 없음");
      console.groupEnd();
      return NextResponse.json(
        { error: "서버 설정 오류: 결제 키가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    // 4. 토스페이먼츠 결제 승인 API 호출
    console.log("📡 [payment-confirm] 토스페이먼츠 API 호출 중...");
    const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;

    let tossResponse: Response;
    try {
      tossResponse = await fetch(
        "https://api.tosspayments.com/v1/payments/confirm",
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
          }),
        },
      );
    } catch (networkError) {
      console.error("❌ [payment-confirm] 네트워크 오류:", networkError);
      console.groupEnd();
      return NextResponse.json(
        {
          error: "결제 승인 API 호출 중 네트워크 오류가 발생했습니다.",
          details:
            process.env.NODE_ENV === "development"
              ? networkError instanceof Error
                ? networkError.message
                : "알 수 없는 오류"
              : undefined,
        },
        { status: 500 },
      );
    }

    // 5. 토스페이먼츠 API 응답 처리
    const responseData = await tossResponse.json();

    if (!tossResponse.ok) {
      // 토스페이먼츠 API 에러 처리
      const errorData = responseData as TossPaymentsErrorResponse;
      console.error("❌ [payment-confirm] 토스페이먼츠 API 오류:", {
        code: errorData.code,
        message: errorData.message,
        status: tossResponse.status,
      });

      // 에러 코드별 HTTP 상태 코드 매핑
      let httpStatus = 500;
      if (errorData.code === "NOT_FOUND_PAYMENT_SESSION") {
        httpStatus = 404;
      } else if (
        errorData.code === "REJECT_CARD_COMPANY" ||
        errorData.code === "FORBIDDEN_REQUEST"
      ) {
        httpStatus = 400;
      } else if (errorData.code === "UNAUTHORIZED_KEY") {
        httpStatus = 401;
      }

      console.groupEnd();
      return NextResponse.json(
        {
          error: errorData.message || "결제 승인에 실패했습니다.",
          code: errorData.code,
          details:
            process.env.NODE_ENV === "development"
              ? errorData.message
              : undefined,
        },
        { status: httpStatus },
      );
    }

    // 결제 승인 성공
    const paymentData = responseData as TossPaymentsConfirmResponse;
    console.log("✅ [payment-confirm] 토스페이먼츠 API 응답 성공:", {
      status: paymentData.status,
      method: paymentData.method,
      approvedAt: paymentData.approvedAt,
    });

    // status가 "DONE"이 아니면 에러 처리
    if (paymentData.status !== "DONE") {
      console.error("❌ [payment-confirm] 결제 상태가 DONE이 아님:", {
        status: paymentData.status,
      });
      console.groupEnd();
      return NextResponse.json(
        {
          error: "결제 승인 상태가 올바르지 않습니다.",
          details:
            process.env.NODE_ENV === "development"
              ? `상태: ${paymentData.status}`
              : undefined,
        },
        { status: 400 },
      );
    }

    // 6. DB 저장 처리
    console.log("💾 [payment-confirm] DB 저장 시작...");
    try {
      const result = await processPaymentAfterApproval({
        orderId,
        paymentKey,
        approvedAt: paymentData.approvedAt,
        totalAmount: amount,
        method: paymentData.method || undefined, // null이면 undefined로 변환 (기본값 "CARD" 사용)
      });

      console.log("✅ [payment-confirm] 결제 승인 완료:", {
        orderId: result.order.id,
        settlementId: result.settlement.id,
        paymentId: result.payment?.id || "저장 실패",
      });
      console.groupEnd();

      return NextResponse.json({
        success: true,
        orderId: result.order.id,
        settlementId: result.settlement.id,
        paymentId: result.payment?.id || null,
        message: "결제 완료 및 정산 생성 완료",
      });
    } catch (dbError) {
      console.error("❌ [payment-confirm] DB 저장 실패:", dbError);
      console.groupEnd();

      return NextResponse.json(
        {
          error: "결제 승인은 완료되었으나 DB 저장에 실패했습니다.",
          details:
            process.env.NODE_ENV === "development"
              ? dbError instanceof Error
                ? dbError.message
                : "알 수 없는 오류"
              : undefined,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ [payment-confirm] 예상치 못한 오류:", error);
    console.groupEnd();

    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
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

