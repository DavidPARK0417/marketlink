/**
 * @file create-retailer.ts
 * @description 소매점 생성 Server Action
 *
 * 소매점 회원가입 시 기본 정보를 입력받아 `retailers` 테이블에 저장합니다.
 * 승인 절차가 없으므로 바로 활성화됩니다.
 *
 * 주요 기능:
 * 1. Clerk 인증 확인
 * 2. role이 null이면 'retailer'로 자동 설정
 * 3. 현재 사용자의 `profile_id` 조회
 * 4. 이메일 업데이트 (profiles 테이블)
 * 5. `retailers` 테이블에 INSERT
 * 6. 에러 처리 및 로깅
 *
 * @dependencies
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/supabase/service-role.ts (getServiceRoleClient)
 * - lib/utils/format.ts (formatPhone)
 * - lib/validation/retailer.ts (RetailerOnboardingFormData)
 *
 * @example
 * ```tsx
 * import { createRetailer } from '@/actions/retailer/create-retailer';
 *
 * const result = await createRetailer({
 *   business_name: "강남식자재마트",
 *   phone: "01012345678",
 *   address: "서울시 강남구 테헤란로 123",
 *   email: "retailer@example.com"
 * });
 * ```
 */

"use server";

import { getUserProfile } from "@/lib/clerk/auth";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { formatPhone } from "@/lib/utils/format";
import type { RetailerOnboardingFormData } from "@/lib/validation/retailer";

/**
 * 소매점 생성 결과 타입
 */
export interface CreateRetailerResult {
  success: boolean;
  error?: string;
  retailerId?: string;
}

/**
 * 소매점 생성 Server Action
 *
 * 기본 정보를 입력받아 `retailers` 테이블에 저장합니다.
 * role이 null인 경우 자동으로 'retailer'로 설정합니다.
 * 이메일은 profiles 테이블에 업데이트됩니다.
 *
 * @param {RetailerOnboardingFormData} formData - 폼 데이터
 * @returns {Promise<CreateRetailerResult>} 생성 결과
 *
 * @throws {Error} 인증 실패, 프로필 없음, 중복 등록 등
 */
export async function createRetailer(
  formData: RetailerOnboardingFormData,
): Promise<CreateRetailerResult> {
  try {
    console.group("📝 [retailer] 소매점 생성 시작");
    console.log("formData:", formData);

    // 1. Clerk 인증 확인 및 profile_id 조회
    const profile = await getUserProfile();

    if (!profile) {
      console.error("❌ [retailer] 인증되지 않은 사용자");
      return {
        success: false,
        error: "인증이 필요합니다. 다시 로그인해주세요.",
      };
    }

    // role이 null이 아니고 retailer가 아니면 에러
    if (profile.role !== null && profile.role !== "retailer") {
      console.error("❌ [retailer] 소매점 역할이 아닌 사용자:", profile.role);
      return {
        success: false,
        error: "소매점 회원만 사용할 수 있는 기능입니다.",
      };
    }

    // role이 null이면 retailer로 설정
    if (profile.role === null) {
      console.log("📝 [retailer] 역할 없음, retailer로 설정 시작");

      const supabaseForRoleUpdate = getServiceRoleClient();
      const { error: updateError } = await supabaseForRoleUpdate
        .from("profiles")
        .update({ role: "retailer" })
        .eq("id", profile.id);

      if (updateError) {
        console.error("❌ [retailer] 역할 설정 실패:", updateError);
        return {
          success: false,
          error: "역할 설정 중 오류가 발생했습니다. 다시 시도해주세요.",
        };
      }

      console.log("✅ [retailer] 역할 설정 완료: retailer");
    }

    console.log("✅ [retailer] 인증 확인 완료, profile_id:", profile.id);

    // 2. 이미 등록된 소매점 정보가 있는지 확인
    const supabase = getServiceRoleClient();

    const { data: existingRetailer, error: checkError } = await supabase
      .from("retailers")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116은 "no rows returned" 에러 (정상적인 경우)
      console.error("❌ [retailer] 기존 소매점 조회 오류:", checkError);
      return {
        success: false,
        error: "소매점 정보 조회 중 오류가 발생했습니다.",
      };
    }

    if (existingRetailer) {
      console.log("⚠️ [retailer] 이미 등록된 소매점:", existingRetailer.id);
      return {
        success: false,
        error: "이미 등록된 소매점 정보가 있습니다.",
      };
    }

    // 3. 이메일 업데이트 (profiles 테이블)
    const { error: emailUpdateError } = await supabase
      .from("profiles")
      .update({ email: formData.email.trim().toLowerCase() })
      .eq("id", profile.id);

    if (emailUpdateError) {
      console.error("❌ [retailer] 이메일 업데이트 실패:", emailUpdateError);
      return {
        success: false,
        error: "이메일 업데이트 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [retailer] 이메일 업데이트 완료:", formData.email);

    // 4. 전화번호 포맷팅
    const formattedPhone = formatPhone(formData.phone);

    // 5. retailers 테이블에 INSERT
    const { data: newRetailer, error: insertError } = await supabase
      .from("retailers")
      .insert({
        profile_id: profile.id,
        business_name: formData.business_name.trim(),
        phone: formattedPhone,
        address: formData.address.trim(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("❌ [retailer] 소매점 생성 오류:", insertError);

      return {
        success: false,
        error: "소매점 등록 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [retailer] 소매점 생성 완료:", newRetailer.id);
    console.groupEnd();

    return {
      success: true,
      retailerId: newRetailer.id,
    };
  } catch (error) {
    console.error("❌ [retailer] createRetailer 예외:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "소매점 등록 중 예상치 못한 오류가 발생했습니다.",
    };
  }
}

