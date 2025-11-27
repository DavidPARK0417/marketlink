/**
 * @file actions/wholesaler/update-order-status.ts
 * @description 주문 상태 변경 Server Action
 *
 * 도매점이 주문 상태를 변경하는 Server Action입니다.
 * RLS 정책을 통해 자신의 주문만 변경할 수 있습니다.
 *
 * 주요 기능:
 * 1. 주문 ID로 주문 조회 및 권한 확인
 * 2. 주문 상태 업데이트
 * 3. updated_at 자동 업데이트 (DB 트리거)
 * 4. 에러 처리 및 로깅
 * 5. 캐시 무효화
 *
 * @dependencies
 * - lib/supabase/queries/orders.ts
 * - next/cache (revalidatePath)
 */

"use server";

import { updateOrderStatus as updateOrderStatusQuery } from "@/lib/supabase/queries/orders";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types/database";

/**
 * 주문 상태 변경 결과
 */
export interface UpdateOrderStatusResult {
  success: boolean;
  error?: string;
}

/**
 * 주문 상태 변경
 *
 * 현재 로그인한 도매점의 주문만 변경할 수 있습니다 (RLS 정책).
 *
 * @param {string} orderId - 주문 ID
 * @param {OrderStatus} status - 새로운 상태
 * @returns {Promise<UpdateOrderStatusResult>} 변경 결과
 *
 * @example
 * ```tsx
 * const result = await updateOrderStatus(orderId, "confirmed");
 * if (result.success) {
 *   // 성공 처리
 * }
 * ```
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<UpdateOrderStatusResult> {
  try {
    console.group("🔄 [order-action] 주문 상태 변경 시작");
    console.log("orderId:", orderId);
    console.log("status:", status);

    await updateOrderStatusQuery(orderId, status);

    console.log("✅ [order-action] 주문 상태 변경 완료");
    console.groupEnd();

    // 캐시 무효화
    revalidatePath("/wholesaler/orders");
    revalidatePath(`/wholesaler/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    console.error("❌ [order-action] 주문 상태 변경 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "주문 상태 변경 중 오류가 발생했습니다.",
    };
  }
}
