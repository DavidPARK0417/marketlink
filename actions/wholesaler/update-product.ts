/**
 * @file actions/wholesaler/update-product.ts
 * @description 상품 수정 Server Action
 *
 * 도매점은 자신의 상품만 수정할 수 있습니다 (RLS 정책).
 * 관리자는 모든 상품을 수정할 수 있습니다.
 *
 * 주요 기능:
 * 1. 사용자 역할 확인 (관리자/도매점)
 * 2. 상품 ID로 상품 조회 및 권한 확인
 * 3. 상품 정보 업데이트
 * 4. updated_at 자동 업데이트 (DB 트리거)
 * 5. 에러 처리 및 로깅
 *
 * @dependencies
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - lib/supabase/service-role.ts (getServiceRoleClient)
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/validation/product.ts (ProductFormData)
 * - next/cache (revalidatePath)
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { getUserProfile } from "@/lib/clerk/auth";
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
 * 도매점은 자신의 상품만 수정할 수 있습니다 (RLS 정책).
 * 관리자는 모든 상품을 수정할 수 있습니다.
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

    // 현재 사용자 프로필 조회 (역할 확인용)
    const profile = await getUserProfile();
    if (!profile) {
      console.error("❌ [product-action] 사용자 인증되지 않음");
      return {
        success: false,
        error: "인증이 필요합니다.",
      };
    }

    console.log("✅ [product-action] 사용자 프로필 확인:", {
      role: profile.role,
      userId: profile.id,
    });

    // 관리자인지 확인
    const isAdmin = profile.role === "admin";
    
    // 관리자인 경우 Service Role 클라이언트 사용 (RLS 우회)
    // 도매점인 경우 일반 클라이언트 사용 (RLS 정책 적용)
    const supabase = isAdmin 
      ? getServiceRoleClient() 
      : createClerkSupabaseClient();

    console.log("🔑 [product-action] Supabase 클라이언트 선택:", {
      isAdmin,
      clientType: isAdmin ? "Service Role" : "Clerk Client",
    });

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

    // 관리자가 아닌 경우, 자신의 상품인지 확인
    if (!isAdmin) {
      // 도매점인 경우 자신의 상품만 수정 가능
      // RLS 정책으로 이미 필터링되지만, 추가 확인
      const wholesalerSupabase = createClerkSupabaseClient();
      const { data: currentWholesaler } = await wholesalerSupabase
        .from("wholesalers")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (!currentWholesaler || existingProduct.wholesaler_id !== currentWholesaler.id) {
        console.error("❌ [product-action] 권한 없음:", {
          productWholesalerId: existingProduct.wholesaler_id,
          currentWholesalerId: currentWholesaler?.id,
        });
        return {
          success: false,
          error: "이 상품을 수정할 권한이 없습니다.",
        };
      }
    }

    console.log("✅ [product-action] 상품 조회 완료:", {
      productId: existingProduct.id,
      wholesalerId: existingProduct.wholesaler_id,
      isAdmin,
    });

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

    // specifications 데이터 준비
    const specificationsData = data.specifications || {};
    console.log("specifications:", specificationsData);

    // 검색 키워드 배열로 변환 (쉼표로 구분된 문자열 → 배열)
    const keywordsArray = data.keywords
      ? data.keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
      : null;
    console.log("keywords:", keywordsArray);

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
        lead_time: data.lead_time || null, // 납기 정보 저장
        stock_quantity: data.stock,
        images,
        image_url: imageUrl,
        specifications: specificationsData,
        ai_keywords: keywordsArray && keywordsArray.length > 0 ? keywordsArray : null, // 검색 키워드 저장
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

