/**
 * @file lib/payments/process-payment.ts
 * @description 결제 승인 후 DB 저장 공통 함수
 *
 * 이 함수는 결제 승인 후 다음 작업을 수행합니다:
 * 1. 주문 조회 및 검증
 * 2. 주문 상태 업데이트 (status: 'pending', payment_key, paid_at)
 * 3. 정산 데이터 생성 (settlements 테이블)
 * 4. 결제 데이터 저장 (payments 테이블)
 *
 * 웹훅 콜백과 결제 승인 API에서 공통으로 사용됩니다.
 *
 * @dependencies
 * - lib/supabase/service-role.ts
 * - lib/supabase/queries/settlements.ts
 * - types/order.ts
 * - types/settlement.ts
 * - types/database.ts
 */

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { createSettlement } from "@/lib/supabase/queries/settlements";
import type { Order } from "@/types/order";
import type { Settlement } from "@/types/settlement";
import type { Payment } from "@/types/database";

/**
 * 결제 처리 파라미터 타입
 */
export interface ProcessPaymentParams {
  orderId: string;
  paymentKey: string;
  approvedAt: string; // ISO 8601 형식 (예: "2025-01-20T10:30:00Z")
  totalAmount: number;
  method?: string; // "CARD", "TRANSFER" 등 (선택사항, 기본값: "CARD")
}

/**
 * 결제 처리 결과 타입
 */
export interface ProcessPaymentResult {
  order: Order;
  settlement: Settlement;
  payment: Payment | null; // payments 저장 실패 시 null 가능
}

/**
 * 결제 승인 후 DB 저장 처리 함수
 *
 * 결제 승인 API 호출 후 또는 웹훅 수신 후 호출됩니다.
 * 주문 상태 업데이트, 정산 생성, 결제 데이터 저장을 수행합니다.
 *
 * @param params 결제 처리 파라미터
 * @returns 처리 결과 (주문, 정산, 결제 데이터)
 * @throws 주문 조회 실패, 주문 업데이트 실패, 정산 생성 실패 시 에러 발생
 *
 * @example
 * ```typescript
 * const result = await processPaymentAfterApproval({
 *   orderId: "order-uuid",
 *   paymentKey: "toss-payment-key",
 *   approvedAt: "2025-01-20T10:30:00Z",
 *   totalAmount: 10000,
 *   method: "CARD",
 * });
 * ```
 */
export async function processPaymentAfterApproval(
  params: ProcessPaymentParams,
): Promise<ProcessPaymentResult> {
  console.group("💰 [process-payment] 결제 처리 시작");
  console.log("파라미터:", {
    orderId: params.orderId,
    paymentKey: params.paymentKey,
    approvedAt: params.approvedAt,
    totalAmount: params.totalAmount,
    method: params.method,
  });

  const supabase = getServiceRoleClient();
  const { orderId, paymentKey, approvedAt, totalAmount, method } = params;

  try {
    // 1. 주문 조회
    console.log("🔍 [process-payment] 주문 조회:", orderId);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("❌ [process-payment] 주문 조회 실패:", orderError);
      console.groupEnd();
      throw new Error(`주문을 찾을 수 없습니다: ${orderId}`);
    }

    console.log("✅ [process-payment] 주문 조회 성공:", {
      orderId: order.id,
      orderNumber: order.order_number,
      totalAmount: order.total_amount,
      currentStatus: order.status,
    });

    // 2. 중복 처리 확인 (이미 같은 paymentKey로 처리된 경우)
    if (order.payment_key === paymentKey) {
      console.log(
        "⚠️ [process-payment] 이미 처리된 결제입니다. 기존 데이터 반환",
        {
          paymentKey,
        },
      );

      // 기존 정산 데이터 조회
      const { data: existingSettlement, error: settlementError } =
        await supabase
          .from("settlements")
          .select("*")
          .eq("order_id", orderId)
          .single();

      if (settlementError || !existingSettlement) {
        console.warn(
          "⚠️ [process-payment] 기존 정산 데이터를 찾을 수 없습니다. 새로 생성합니다.",
        );
        // 정산이 없으면 새로 생성 (이상 케이스이지만 처리)
      } else {
        // 기존 결제 데이터 조회
        const { data: existingPayment } = await supabase
          .from("payments")
          .select("*")
          .eq("payment_key", paymentKey)
          .single();

        console.log("✅ [process-payment] 기존 데이터 반환:", {
          settlementId: existingSettlement.id,
          paymentId: existingPayment?.id,
        });
        console.groupEnd();

        return {
          order: order as Order,
          settlement: existingSettlement as Settlement,
          payment: (existingPayment as Payment) || null,
        };
      }
    }

    // 3. 주문 상태 및 결제 정보 업데이트
    console.log("📝 [process-payment] 주문 상태 및 결제 정보 업데이트");
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "pending", // 결제 완료 후 주문 대기 상태
        payment_key: paymentKey,
        paid_at: approvedAt,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("❌ [process-payment] 주문 업데이트 실패:", updateError);
      console.groupEnd();
      throw new Error(`주문 업데이트 실패: ${updateError.message}`);
    }

    console.log("✅ [process-payment] 주문 업데이트 성공");

    // 업데이트된 주문 정보
    const updatedOrder = {
      ...order,
      status: "pending" as const,
      payment_key: paymentKey,
      paid_at: approvedAt,
    };

    // 4. 정산 데이터 생성
    console.log("💰 [process-payment] 정산 데이터 생성 시작");
    let settlement: Settlement;
    try {
      settlement = await createSettlement({
        ...(order as Order),
        paid_at: approvedAt,
      });

      console.log("✅ [process-payment] 정산 생성 성공:", settlement.id);
    } catch (settlementError) {
      console.error(
        "❌ [process-payment] 정산 생성 실패:",
        settlementError instanceof Error
          ? settlementError.message
          : "알 수 없는 오류",
      );
      console.groupEnd();

      // 정산 생성 실패는 치명적이므로 에러를 throw
      throw new Error(
        `정산 생성 실패: ${
          settlementError instanceof Error
            ? settlementError.message
            : "알 수 없는 오류"
        }`,
      );
    }

    // 5. payments 테이블에 결제 데이터 저장
    // 주의: 결제 데이터 저장 실패는 치명적이지 않으므로 로그만 남기고 계속 진행
    console.log("💳 [process-payment] 결제 데이터 저장 시작");
    let payment: Payment | null = null;

    try {
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .insert({
          order_id: orderId,
          settlement_id: settlement.id,
          method: method || "CARD", // 웹훅에서 받은 결제 방법, 없으면 기본값
          amount: totalAmount || order.total_amount,
          payment_key: paymentKey,
          status: "paid", // 결제 완료 상태
          paid_at: approvedAt,
        })
        .select()
        .single();

      if (paymentError) {
        console.error(
          "❌ [process-payment] 결제 데이터 저장 실패:",
          paymentError,
        );
        console.warn(
          "⚠️ [process-payment] 정산은 생성되었으나 결제 데이터 저장 실패",
        );
        // payment는 null로 유지
      } else {
        payment = paymentData as Payment;
        console.log(
          "✅ [process-payment] 결제 데이터 저장 성공:",
          payment.id,
        );
      }
    } catch (error) {
      console.error(
        "❌ [process-payment] 결제 데이터 저장 중 예외:",
        error instanceof Error ? error.message : "알 수 없는 오류",
      );
      console.warn(
        "⚠️ [process-payment] 정산은 생성되었으나 결제 데이터 저장 실패 (계속 진행)",
      );
      // payment는 null로 유지
    }

    console.log("✅ [process-payment] 결제 처리 완료:", {
      orderId,
      settlementId: settlement.id,
      paymentId: payment?.id || "저장 실패",
    });
    console.groupEnd();

    return {
      order: updatedOrder as Order,
      settlement,
      payment,
    };
  } catch (error) {
    console.error("❌ [process-payment] 결제 처리 실패:", error);
    console.groupEnd();

    // 에러를 그대로 전파 (호출하는 쪽에서 처리)
    throw error;
  }
}

