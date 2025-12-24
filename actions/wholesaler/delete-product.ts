/**
 * @file actions/wholesaler/delete-product.ts
 * @description 상품 삭제 Server Action
 *
 * 도매점은 자신의 상품만 삭제할 수 있습니다 (RLS 정책).
 * 관리자는 모든 상품을 삭제할 수 있습니다 (Service Role 사용).
 *
 * 주요 기능:
 * 1. 사용자 역할 확인 (관리자/도매점)
 * 2. 상품 ID로 상품 조회 및 권한 확인
 * 3. 해당 상품을 참조하는 주문 확인 (주문이 있으면 삭제 불가)
 * 4. 상품 이미지 삭제 (Storage에서)
 * 5. 상품 삭제 (DB에서)
 * 6. 에러 처리 및 로깅
 *
 * @dependencies
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - lib/supabase/service-role.ts (getServiceRoleClient)
 * - lib/supabase/storage.ts (deleteProductImage)
 * - lib/clerk/auth.ts (getUserProfile)
 * - next/cache (revalidatePath)
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { deleteProductImage } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";
import { getUserProfile } from "@/lib/clerk/auth";

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
 * 도매점은 자신의 상품만 삭제할 수 있습니다 (RLS 정책).
 * 관리자는 모든 상품을 삭제할 수 있습니다.
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

    // RLS 정책에 관리자 허용이 추가되었으므로 일반 클라이언트 사용
    // Service Role은 RLS를 완전히 우회하지만, 일반 클라이언트로도 관리자는 삭제 가능
    const supabase = createClerkSupabaseClient();

    console.log("🔑 [product-action] Supabase 클라이언트 선택:", {
      isAdmin,
      clientType: isAdmin ? "Service Role" : "Clerk Client",
    });

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

    // 관리자가 아닌 경우, 자신의 상품인지 확인
    if (!isAdmin) {
      // 도매점인 경우 자신의 상품만 삭제 가능
      // RLS 정책으로 이미 필터링되지만, 추가 확인
      const wholesalerSupabase = createClerkSupabaseClient();
      const { data: currentWholesaler } = await wholesalerSupabase
        .from("wholesalers")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (
        !currentWholesaler ||
        product.wholesaler_id !== currentWholesaler.id
      ) {
        console.error("❌ [product-action] 권한 없음:", {
          productWholesalerId: product.wholesaler_id,
          currentWholesalerId: currentWholesaler?.id,
        });
        return {
          success: false,
          error: "이 상품을 삭제할 권한이 없습니다.",
        };
      }
    }

    console.log("✅ [product-action] 상품 조회 완료:", {
      productId: product.id,
      wholesalerId: product.wholesaler_id,
      isAdmin,
    });
    console.log("image_url:", product.image_url);

    // 2. 해당 상품을 참조하는 주문이 있는지 확인
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, order_number, status")
      .eq("product_id", productId)
      .limit(1);

    if (ordersError) {
      console.error("❌ [product-action] 주문 조회 오류:", ordersError);
      // 주문 조회 실패해도 삭제 시도는 계속 진행 (에러는 DB에서 처리됨)
    } else if (orders && orders.length > 0) {
      const orderCount = orders.length;
      console.warn(
        "⚠️ [product-action] 주문이 있는 상품은 삭제할 수 없습니다:",
        {
          productId,
          orderCount,
          sampleOrder: orders[0],
        },
      );

      // 전체 주문 개수 조회 (더 정확한 메시지를 위해)
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("product_id", productId);

      return {
        success: false,
        error: `이 상품은 ${
          count || orderCount
        }개의 주문과 연결되어 있어 삭제할 수 없습니다. 주문이 완료되거나 취소된 후 다시 시도해주세요.`,
      };
    }

    console.log("✅ [product-action] 주문 확인 완료 - 삭제 가능");

    // 3. 상품 이미지 삭제 (Storage에서)
    // 관리자인 경우 Service Role 클라이언트 사용 (Storage 정책 우회)
    // 도매점인 경우 일반 클라이언트 사용
    const imageSupabase = isAdmin
      ? getServiceRoleClient()
      : createClerkSupabaseClient();

    if (product.image_url) {
      try {
        console.log("🗑️ [product-action] 이미지 삭제 시작");
        await deleteProductImage(product.image_url, imageSupabase);
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

    // 4. 상품 삭제 (DB에서)
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

    // 5. 캐시 무효화 (상품 목록 페이지)
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
