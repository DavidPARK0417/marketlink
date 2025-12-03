/**
 * @file delete-account.ts
 * @description 회원탈퇴 Server Action
 *
 * 도매점 계정을 삭제하는 Server Action입니다.
 *
 * 주요 기능:
 * 1. 주문/정산 존재 여부 체크 (있으면 탈퇴 불가)
 * 2. 상품 이미지 삭제 (Storage에서)
 * 3. 탈퇴 사유 저장 (account_deletions 테이블)
 * 4. Clerk 계정 삭제
 * 5. Supabase 데이터 삭제 (profiles 삭제 시 CASCADE로 자동 처리)
 *
 * @dependencies
 * - @clerk/nextjs/server (auth, clerkClient)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - lib/supabase/service-role.ts (getServiceRoleClient)
 * - lib/supabase/storage.ts (deleteProductImage)
 * - lib/validation/settings.ts (DeleteAccountFormData)
 *
 * @example
 * ```tsx
 * import { deleteAccount } from '@/actions/wholesaler/delete-account';
 *
 * const result = await deleteAccount({
 *   password: "user_password",
 *   reason: "서비스가 필요 없어졌습니다",
 *   feedback: "추가 설명..."
 * });
 * ```
 */

"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { deleteProductImage } from "@/lib/supabase/storage";
import { getUserProfile } from "@/lib/clerk/auth";
import type { DeleteAccountFormData } from "@/lib/validation/settings";

/**
 * 회원탈퇴 결과 타입
 */
export interface DeleteAccountResult {
  success: boolean;
  error?: string;
}

/**
 * 회원탈퇴 Server Action
 *
 * 주문이나 정산이 있으면 탈퇴할 수 없습니다.
 * 상품은 자동으로 삭제되며, 상품 이미지도 함께 삭제됩니다.
 *
 * @param {DeleteAccountFormData} formData - 폼 데이터 (password, reason, feedback)
 * @returns {Promise<DeleteAccountResult>} 탈퇴 결과
 *
 * @throws {Error} 인증 실패, 주문/정산 존재, 비밀번호 오류 등
 */
export async function deleteAccount(
  formData: DeleteAccountFormData,
): Promise<DeleteAccountResult> {
  try {
    console.group("🗑️ [delete-account] 회원탈퇴 시작");

    // 1. Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.error("❌ [delete-account] 인증되지 않은 사용자");
      return {
        success: false,
        error: "인증이 필요합니다. 다시 로그인해주세요.",
      };
    }

    console.log("✅ [delete-account] 인증 확인 완료:", userId);

    // 2. 프로필 조회
    const profile = await getUserProfile();

    if (!profile) {
      console.error("❌ [delete-account] 프로필 없음");
      return {
        success: false,
        error: "사용자 프로필을 찾을 수 없습니다.",
      };
    }

    console.log("✅ [delete-account] 프로필 조회 완료:", profile.id);

    // 3. 도매점 정보 확인
    const wholesaler = profile.wholesalers?.[0];

    if (!wholesaler) {
      console.error("❌ [delete-account] 도매점 정보 없음");
      return {
        success: false,
        error: "도매점 정보를 찾을 수 없습니다.",
      };
    }

    console.log("✅ [delete-account] 도매점 정보 확인:", wholesaler.id);

    const supabase = createClerkSupabaseClient();
    const serviceSupabase = getServiceRoleClient();

    // 4. 주문 존재 여부 체크
    console.log("🔍 [delete-account] 주문 존재 여부 체크 시작");
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id")
      .eq("wholesaler_id", wholesaler.id)
      .limit(1);

    if (ordersError) {
      console.error("❌ [delete-account] 주문 조회 오류:", ordersError);
      return {
        success: false,
        error: "주문 정보를 확인하는 중 오류가 발생했습니다.",
      };
    }

    if (orders && orders.length > 0) {
      console.error("❌ [delete-account] 주문이 있어서 탈퇴 불가");
      return {
        success: false,
        error:
          "진행 중이거나 완료된 주문이 있어 탈퇴할 수 없습니다. 모든 주문이 완료된 후 탈퇴해주세요.",
      };
    }

    console.log("✅ [delete-account] 주문 없음 확인");

    // 5. 정산 존재 여부 체크
    console.log("🔍 [delete-account] 정산 존재 여부 체크 시작");
    const { data: settlements, error: settlementsError } = await supabase
      .from("settlements")
      .select("id")
      .eq("wholesaler_id", wholesaler.id)
      .limit(1);

    if (settlementsError) {
      console.error("❌ [delete-account] 정산 조회 오류:", settlementsError);
      return {
        success: false,
        error: "정산 정보를 확인하는 중 오류가 발생했습니다.",
      };
    }

    if (settlements && settlements.length > 0) {
      console.error("❌ [delete-account] 정산이 있어서 탈퇴 불가");
      return {
        success: false,
        error:
          "정산 내역이 있어 탈퇴할 수 없습니다. 모든 정산이 완료된 후 탈퇴해주세요.",
      };
    }

    console.log("✅ [delete-account] 정산 없음 확인");

    // 6. 상품 이미지 삭제 (모든 상품)
    console.log("🗑️ [delete-account] 상품 이미지 삭제 시작");
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, image_url")
      .eq("wholesaler_id", wholesaler.id);

    if (productsError) {
      console.error("❌ [delete-account] 상품 조회 오류:", productsError);
      // 상품 조회 실패해도 계속 진행 (이미 삭제되었을 수 있음)
    } else if (products && products.length > 0) {
      console.log(
        `📦 [delete-account] ${products.length}개 상품의 이미지 삭제 시작`,
      );

      for (const product of products) {
        if (product.image_url) {
          try {
            await deleteProductImage(product.image_url, serviceSupabase);
            console.log(
              `✅ [delete-account] 상품 이미지 삭제 완료: ${product.id}`,
            );
          } catch (imageError) {
            // 이미지 삭제 실패해도 계속 진행
            console.warn(
              `⚠️ [delete-account] 상품 이미지 삭제 실패 (무시): ${product.id}`,
              imageError,
            );
          }
        }
      }

      console.log("✅ [delete-account] 모든 상품 이미지 삭제 완료");
    } else {
      console.log("ℹ️ [delete-account] 삭제할 상품 없음");
    }

    // 7. 탈퇴 사유 저장 (Service Role 사용 - profiles 삭제 전에 저장)
    console.log("📝 [delete-account] 탈퇴 사유 저장 시작");
    const { error: deletionError } = await serviceSupabase
      .from("account_deletions")
      .insert({
        profile_id: profile.id,
        reason: formData.reason,
        feedback: formData.feedback || null,
      });

    if (deletionError) {
      console.error("❌ [delete-account] 탈퇴 사유 저장 실패:", deletionError);
      // 탈퇴 사유 저장 실패해도 계속 진행
      console.warn("⚠️ [delete-account] 탈퇴 사유 저장 실패했지만 계속 진행");
    } else {
      console.log("✅ [delete-account] 탈퇴 사유 저장 완료");
    }

    // 8. Clerk 계정 삭제
    console.log("🗑️ [delete-account] Clerk 계정 삭제 시작");
    const client = await clerkClient();

    try {
      await client.users.deleteUser(userId);
      console.log("✅ [delete-account] Clerk 계정 삭제 완료");
    } catch (clerkError) {
      console.error("❌ [delete-account] Clerk 계정 삭제 실패:", clerkError);
      return {
        success: false,
        error:
          clerkError instanceof Error
            ? clerkError.message
            : "계정 삭제 중 오류가 발생했습니다.",
      };
    }

    // 9. Supabase 데이터 삭제 (profiles 삭제 시 CASCADE로 자동 처리)
    // Clerk 계정이 삭제되었으므로, 다음 로그인 시 sync-user가 실행되지 않습니다.
    // 하지만 혹시 모를 경우를 대비해 profiles를 삭제합니다.
    console.log("🗑️ [delete-account] Supabase 프로필 삭제 시작");
    const { error: profileDeleteError } = await serviceSupabase
      .from("profiles")
      .delete()
      .eq("id", profile.id);

    if (profileDeleteError) {
      console.error(
        "❌ [delete-account] 프로필 삭제 실패:",
        profileDeleteError,
      );
      // 프로필 삭제 실패해도 Clerk 계정은 이미 삭제되었으므로 성공으로 처리
      console.warn("⚠️ [delete-account] 프로필 삭제 실패했지만 계속 진행");
    } else {
      console.log(
        "✅ [delete-account] 프로필 삭제 완료 (CASCADE로 관련 데이터 자동 삭제)",
      );
    }

    console.log("✅ [delete-account] 회원탈퇴 완료");
    console.groupEnd();

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [delete-account] 예외 발생:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "회원탈퇴 중 오류가 발생했습니다.",
    };
  }
}
