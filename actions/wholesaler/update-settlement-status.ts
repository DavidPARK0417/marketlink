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

    // 입력 검증
    if (!settlementId || typeof settlementId !== "string") {
      console.error("❌ [settlement-action] 잘못된 settlementId:", settlementId);
      console.groupEnd();
      return {
        success: false,
        error: "정산 ID가 올바르지 않습니다.",
      };
    }

    if (status !== "pending" && status !== "completed") {
      console.error("❌ [settlement-action] 잘못된 status:", status);
      console.groupEnd();
      return {
        success: false,
        error: "정산 상태가 올바르지 않습니다.",
      };
    }

    await updateSettlementStatusQuery(settlementId, status);

    console.log("✅ [settlement-action] 정산 상태 변경 완료");
    console.groupEnd();

    // 캐시 무효화
    try {
      revalidatePath("/wholesaler/settlements");
      revalidatePath(`/wholesaler/settlements/${settlementId}`);
    } catch (revalidateError) {
      // revalidatePath 실패는 치명적이지 않으므로 로그만 남기고 계속 진행
      console.warn("⚠️ [settlement-action] 캐시 무효화 실패 (무시됨):", revalidateError);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ [settlement-action] 정산 상태 변경 오류:", error);
    console.groupEnd();
    
    // 에러 메시지 추출
    let errorMessage = "정산 상태 변경 중 오류가 발생했습니다.";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // 특정 에러 타입에 대한 더 명확한 메시지
      if (error.message.includes("프로필")) {
        errorMessage = "사용자 프로필을 찾을 수 없습니다. 로그인 상태를 확인해주세요.";
      } else if (error.message.includes("권한")) {
        errorMessage = "정산 상태를 변경할 권한이 없습니다.";
      } else if (error.message.includes("찾을 수 없")) {
        errorMessage = "정산 정보를 찾을 수 없습니다.";
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}
