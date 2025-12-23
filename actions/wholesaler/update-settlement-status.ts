/**
 * @file actions/wholesaler/update-settlement-status.ts
 * @description 정산 상태 변경 Server Action
 *
 * 도매점이 정산 상태를 변경하는 Server Action입니다.
 * RLS 정책을 통해 자신의 정산만 변경할 수 있습니다.
 *
 * 주요 기능:
 * 1. 정산 ID로 정산 조회 및 권한 확인
 * 2. 정산 상태 업데이트
 * 3. completed 상태일 때 completed_at 자동 설정
 * 4. pending 상태일 때 completed_at null로 설정
 * 5. 에러 처리 및 로깅
 * 6. 캐시 무효화
 *
 * @dependencies
 * - lib/supabase/queries/settlements.ts
 * - next/cache (revalidatePath)
 */

"use server";

import { updateSettlementStatus as updateSettlementStatusQuery } from "@/lib/supabase/queries/settlements";
import { revalidatePath } from "next/cache";
import type { SettlementStatus } from "@/types/database";

/**
 * 정산 상태 변경 결과
 */
export interface UpdateSettlementStatusResult {
  success: boolean;
  error?: string;
}

/**
 * 정산 상태 변경
 *
 * 현재 로그인한 도매점의 정산만 변경할 수 있습니다 (RLS 정책).
 *
 * @param {string} settlementId - 정산 ID
 * @param {SettlementStatus} status - 새로운 상태
 * @returns {Promise<UpdateSettlementStatusResult>} 변경 결과
 *
 * @example
 * ```tsx
 * const result = await updateSettlementStatus(settlementId, "completed");
 * if (result.success) {
 *   // 성공 처리
 * }
 * ```
 */
export async function updateSettlementStatus(
  settlementId: string,
  status: SettlementStatus,
): Promise<UpdateSettlementStatusResult> {
  try {
    console.group("🔄 [settlement-action] 정산 상태 변경 시작");
    console.log("settlementId:", settlementId);
    console.log("status:", status);

    await updateSettlementStatusQuery(settlementId, status);

    console.log("✅ [settlement-action] 정산 상태 변경 완료");
    console.groupEnd();

    // 캐시 무효화
    revalidatePath("/wholesaler/settlements");
    revalidatePath(`/wholesaler/settlements/${settlementId}`);

    return { success: true };
  } catch (error) {
    console.error("❌ [settlement-action] 정산 상태 변경 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "정산 상태 변경 중 오류가 발생했습니다.",
    };
  }
}
