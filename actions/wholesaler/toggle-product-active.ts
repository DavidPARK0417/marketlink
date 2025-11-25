/**
 * @file actions/wholesaler/toggle-product-active.ts
 * @description 상품 활성화/비활성화 토글 Server Action
 *
 * 도매점이 자신의 상품을 활성화하거나 비활성화하는 Server Action입니다.
 * RLS 정책을 통해 자신의 상품만 수정할 수 있습니다.
 *
 * 주요 기능:
 * 1. 상품 ID로 상품 조회
 * 2. is_active 상태 토글
 * 3. updated_at 자동 업데이트 (DB 트리거)
 * 4. 에러 처리 및 로깅
 *
 * @dependencies
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - next/cache (revalidatePath)
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 상품 활성화/비활성화 토글 결과
 */
export interface ToggleProductActiveResult {
  success: boolean;
  error?: string;
  isActive?: boolean;
}

/**
 * 상품 활성화/비활성화 토글
 *
 * 현재 로그인한 도매점의 상품만 수정할 수 있습니다 (RLS 정책).
 *
 * @param {string} productId - 상품 ID
 * @returns {Promise<ToggleProductActiveResult>} 토글 결과
 *
 * @example
 * ```tsx
 * const result = await toggleProductActive(productId);
 * if (result.success) {
 *   // 성공 처리
 * }
 * ```
 */
export async function toggleProductActive(
  productId: string
): Promise<ToggleProductActiveResult> {
  try {
    console.group("🔄 [product-action] 상품 상태 토글 시작");
    console.log("productId:", productId);

    const supabase = createClerkSupabaseClient();

    // 1. 현재 상품 상태 조회
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("is_active")
      .eq("id", productId)
      .single();

    if (fetchError) {
      console.error("❌ [product-action] 상품 조회 오류:", fetchError);
      return {
        success: false,
        error: "상품을 찾을 수 없습니다.",
      };
    }

    if (!product) {
      console.error("❌ [product-action] 상품 없음");
      return {
        success: false,
        error: "상품을 찾을 수 없습니다.",
      };
    }

    const newStatus = !product.is_active;

    console.log("현재 상태:", product.is_active);
    console.log("변경할 상태:", newStatus);

    // 2. 상품 상태 업데이트
    const { error: updateError } = await supabase
      .from("products")
      .update({ is_active: newStatus })
      .eq("id", productId);

    if (updateError) {
      console.error("❌ [product-action] 상품 상태 업데이트 오류:", updateError);
      return {
        success: false,
        error: "상품 상태 변경에 실패했습니다.",
      };
    }

    console.log("✅ [product-action] 상품 상태 업데이트 완료");

    // 3. 캐시 무효화 (상품 목록 페이지)
    revalidatePath("/wholesaler/products");

    return {
      success: true,
      isActive: newStatus,
    };
  } catch (error) {
    console.error("❌ [product-action] 예외 발생:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "상품 상태 변경 중 오류가 발생했습니다.",
    };
  } finally {
    console.groupEnd();
  }
}

