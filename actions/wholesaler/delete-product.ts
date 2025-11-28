/**
 * @file actions/wholesaler/delete-product.ts
 * @description 상품 삭제 Server Action
 *
 * 도매점이 자신의 상품을 삭제하는 Server Action입니다.
 * RLS 정책을 통해 자신의 상품만 삭제할 수 있습니다.
 *
 * 주요 기능:
 * 1. 상품 ID로 상품 조회 및 권한 확인
 * 2. 상품 이미지 삭제 (Storage에서)
 * 3. 상품 삭제 (DB에서)
 * 4. 에러 처리 및 로깅
 *
 * @dependencies
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - lib/supabase/storage.ts (deleteProductImage)
 * - next/cache (revalidatePath)
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { deleteProductImage } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";

/**
 * 상품 삭제 결과
 */
export interface DeleteProductResult {
  success: boolean;
  error?: string;
}

/**
 * 상품 삭제
 *
 * 현재 로그인한 도매점의 상품만 삭제할 수 있습니다 (RLS 정책).
 * 상품 삭제 시 관련 이미지도 Storage에서 함께 삭제됩니다.
 *
 * @param {string} productId - 삭제할 상품 ID
 * @returns {Promise<DeleteProductResult>} 삭제 결과
 *
 * @example
 * ```tsx
 * const result = await deleteProduct(productId);
 * if (result.success) {
 *   // 성공 처리
 * }
 * ```
 */
export async function deleteProduct(
  productId: string,
): Promise<DeleteProductResult> {
  try {
    console.group("🗑️ [product-action] 상품 삭제 시작");
    console.log("productId:", productId);

    const supabase = createClerkSupabaseClient();

    // 1. 상품 존재 여부 및 권한 확인 (이미지 URL도 함께 조회)
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id, wholesaler_id, image_url")
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

    console.log("✅ [product-action] 상품 조회 완료:", product.id);
    console.log("image_url:", product.image_url);

    // 2. 상품 이미지 삭제 (Storage에서)
    if (product.image_url) {
      try {
        console.log("🗑️ [product-action] 이미지 삭제 시작");
        await deleteProductImage(product.image_url, supabase);
        console.log("✅ [product-action] 이미지 삭제 완료");
      } catch (imageError) {
        // 이미지 삭제 실패해도 상품 삭제는 계속 진행
        // (이미지가 이미 삭제되었거나 없는 경우일 수 있음)
        console.warn(
          "⚠️ [product-action] 이미지 삭제 실패 (무시하고 계속):",
          imageError,
        );
      }
    }

    // 3. 상품 삭제 (DB에서)
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      console.error("❌ [product-action] 상품 삭제 실패:", deleteError);
      return {
        success: false,
        error: deleteError.message || "상품 삭제 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [product-action] 상품 삭제 완료");
    console.groupEnd();

    // 4. 캐시 무효화 (상품 목록 페이지)
    revalidatePath("/wholesaler/products");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [product-action] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "상품 삭제 중 오류가 발생했습니다.",
    };
  }
}
