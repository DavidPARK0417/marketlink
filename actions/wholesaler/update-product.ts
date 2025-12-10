/**
 * @file actions/wholesaler/update-product.ts
 * @description 상품 수정 Server Action
 *
 * 도매점이 자신의 상품을 수정하는 Server Action입니다.
 * RLS 정책을 통해 자신의 상품만 수정할 수 있습니다.
 *
 * 주요 기능:
 * 1. 상품 ID로 상품 조회 및 권한 확인
 * 2. 상품 정보 업데이트
 * 3. updated_at 자동 업데이트 (DB 트리거)
 * 4. 에러 처리 및 로깅
 *
 * @dependencies
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - lib/validation/product.ts (ProductFormData)
 * - next/cache (revalidatePath)
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProductFormData } from "@/lib/validation/product";

/**
 * specification_value와 unit을 합쳐서 specification 생성
 * 예: "10" + "kg" → "10kg"
 */
function combineSpecification(
  value: string | undefined,
  unit: string | undefined,
): string | null {
  if (!value || !value.trim()) {
    return null;
  }
  const trimmedValue = value.trim();
  const trimmedUnit = unit?.trim() || "ea";
  return `${trimmedValue}${trimmedUnit}`;
}

/**
 * 상품 수정 결과
 */
export interface UpdateProductResult {
  success: boolean;
  error?: string;
  productId?: string;
}

/**
 * 상품 수정
 *
 * 현재 로그인한 도매점의 상품만 수정할 수 있습니다 (RLS 정책).
 *
 * @param {string} productId - 상품 ID
 * @param {ProductFormData} data - 수정할 상품 데이터
 * @returns {Promise<UpdateProductResult>} 수정 결과
 *
 * @example
 * ```tsx
 * const result = await updateProduct(productId, formData);
 * if (result.success) {
 *   // 성공 처리
 * }
 * ```
 */
export async function updateProduct(
  productId: string,
  data: ProductFormData,
): Promise<UpdateProductResult> {
  try {
    console.group("📝 [product-action] 상품 수정 시작");
    console.log("productId:", productId);
    console.log("form data:", {
      ...data,
      images: data.images?.length || 0,
    });

    const supabase = createClerkSupabaseClient();

    // 1. 상품 존재 여부 및 권한 확인
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("id, wholesaler_id")
      .eq("id", productId)
      .single();

    if (fetchError) {
      console.error("❌ [product-action] 상품 조회 오류:", fetchError);
      return {
        success: false,
        error: "상품을 찾을 수 없습니다.",
      };
    }

    if (!existingProduct) {
      console.error("❌ [product-action] 상품 없음");
      return {
        success: false,
        error: "상품을 찾을 수 없습니다.",
      };
    }

    console.log("✅ [product-action] 상품 조회 완료:", existingProduct.id);

    // 2. specification 생성 (specification_value + unit)
    const specification = combineSpecification(
      data.specification_value,
      data.unit,
    );

    console.log("specification:", specification);

    // 3. 이미지 배열 + 대표 이미지 (첫 번째 이미지)
    const images = data.images && data.images.length > 0 ? data.images : [];
    const imageUrl = images.length > 0 ? images[0] : null;

    console.log("images:", images.length, "image_url:", imageUrl);

    // 4. 상품 정보 업데이트
    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: data.name,
        category: data.category,
        specification: specification,
        description: data.description || null,
        price: data.price,
        moq: data.moq,
        shipping_fee: data.delivery_fee,
        delivery_method: data.delivery_method,
        stock_quantity: data.stock,
        images,
        image_url: imageUrl,
        // updated_at은 DB 트리거로 자동 업데이트됨
      })
      .eq("id", productId);

    if (updateError) {
      console.error("❌ [product-action] 상품 수정 실패:", updateError);
      return {
        success: false,
        error:
          updateError.message || "상품 수정 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [product-action] 상품 수정 완료");
    console.groupEnd();

    // 5. 캐시 무효화 (상품 목록 페이지 및 상세 페이지)
    revalidatePath("/wholesaler/products");
    revalidatePath(`/wholesaler/products/${productId}`);

    return {
      success: true,
      productId: productId,
    };
  } catch (error) {
    console.error("❌ [product-action] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "상품 수정 중 오류가 발생했습니다.",
    };
  }
}

