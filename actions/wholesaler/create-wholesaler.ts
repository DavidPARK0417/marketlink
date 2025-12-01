/**
 * @file create-wholesaler.ts
 * @description 도매점 생성 Server Action
 *
 * 도매점 회원가입 시 사업자 정보를 입력받아 `wholesalers` 테이블에 저장합니다.
 * `anonymous_code`는 Database Trigger에서 자동으로 생성됩니다 (VENDOR-001, VENDOR-002 형식).
 *
 * 주요 기능:
 * 1. Clerk 인증 확인
 * 2. role이 null이면 'wholesaler'로 자동 설정
 * 3. 현재 사용자의 `profile_id` 조회
 * 4. 사업자번호 중복 확인
 * 5. `wholesalers` 테이블에 INSERT (anonymous_code는 트리거가 자동 생성)
 * 6. 에러 처리 및 로깅
 *
 * @dependencies
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/supabase/service-role.ts (getServiceRoleClient)
 * - lib/utils/format.ts (formatPhone)
 * - types/wholesaler.ts (CreateWholesalerRequest)
 *
 * @example
 * ```tsx
 * import { createWholesaler } from '@/actions/wholesaler/create-wholesaler';
 *
 * const result = await createWholesaler({
 *   business_name: "도매상사",
 *   business_number: "1234567890",
 *   representative: "홍길동",
 *   phone: "01012345678",
 *   address: "서울시 강남구",
 *   bank_name: "KB국민은행",
 *   bank_account_number: "123-456-789"
 * });
 * ```
 */

"use server";

import { getUserProfile } from "@/lib/clerk/auth";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { formatPhone } from "@/lib/utils/format";
import type { WholesalerOnboardingFormData } from "@/lib/validation/wholesaler";

/**
 * 도매점 생성 결과 타입
 */
export interface CreateWholesalerResult {
  success: boolean;
  error?: string;
  wholesalerId?: string;
}

/**
 * 도매점 생성 Server Action
 *
 * 사업자 정보를 입력받아 `wholesalers` 테이블에 저장합니다.
 * `anonymous_code`는 Database Trigger에서 자동으로 생성됩니다.
 * role이 null인 경우 자동으로 'wholesaler'로 설정합니다.
 *
 * @param {WholesalerOnboardingFormData} formData - 폼 데이터
 * @returns {Promise<CreateWholesalerResult>} 생성 결과
 *
 * @throws {Error} 인증 실패, 프로필 없음, 중복 사업자번호 등
 */
export async function createWholesaler(
  formData: WholesalerOnboardingFormData,
): Promise<CreateWholesalerResult> {
  try {
    console.group("📝 [wholesaler] 도매점 생성 시작");
    console.log("formData:", formData);

    // 1. Clerk 인증 확인 및 profile_id 조회
    const profile = await getUserProfile();

    if (!profile) {
      console.error("❌ [wholesaler] 인증되지 않은 사용자");
      return {
        success: false,
        error: "인증이 필요합니다. 다시 로그인해주세요.",
      };
    }

    // role이 null이 아니고 wholesaler가 아니면 에러
    if (profile.role !== null && profile.role !== "wholesaler") {
      console.error("❌ [wholesaler] 도매점 역할이 아닌 사용자:", profile.role);
      return {
        success: false,
        error: "도매점 회원만 사용할 수 있는 기능입니다.",
      };
    }

    // role이 null이면 wholesaler로 설정
    if (profile.role === null) {
      console.log("📝 [wholesaler] 역할 없음, wholesaler로 설정 시작");

      const supabaseForRoleUpdate = getServiceRoleClient();
      const { error: updateError } = await supabaseForRoleUpdate
        .from("profiles")
        .update({ role: "wholesaler" })
        .eq("id", profile.id);

      if (updateError) {
        console.error("❌ [wholesaler] 역할 설정 실패:", updateError);
        return {
          success: false,
          error: "역할 설정 중 오류가 발생했습니다. 다시 시도해주세요.",
        };
      }

      console.log("✅ [wholesaler] 역할 설정 완료: wholesaler");
    }

    console.log("✅ [wholesaler] 인증 확인 완료, profile_id:", profile.id);

    // 2. 이미 등록된 도매점 정보가 있는지 확인
    const supabase = getServiceRoleClient();

    const { data: existingWholesaler, error: checkError } = await supabase
      .from("wholesalers")
      .select("id, status, rejection_reason")
      .eq("profile_id", profile.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116은 "no rows returned" 에러 (정상적인 경우)
      console.error("❌ [wholesaler] 기존 도매점 조회 오류:", checkError);
      return {
        success: false,
        error: "도매점 정보 조회 중 오류가 발생했습니다.",
      };
    }

    // pending 또는 rejected 상태인 경우, 기존 레코드를 업데이트
    if (existingWholesaler) {
      if (existingWholesaler.status === "pending" || existingWholesaler.status === "rejected") {
        console.log(
          "🔄 [wholesaler] 기존 도매점 정보 업데이트 (재신청):",
          existingWholesaler.id,
        );

        // 3. 사업자번호 중복 확인 (자신의 사업자번호는 제외)
        const businessNumberDigits = formData.business_number.replace(/\D/g, "");

        const { data: duplicateBusiness, error: duplicateError } = await supabase
          .from("wholesalers")
          .select("id")
          .eq("business_number", businessNumberDigits)
          .neq("id", existingWholesaler.id) // 자신의 레코드는 제외
          .single();

        if (duplicateError && duplicateError.code !== "PGRST116") {
          console.error(
            "❌ [wholesaler] 사업자번호 중복 확인 오류:",
            duplicateError,
          );
          return {
            success: false,
            error: "사업자번호 확인 중 오류가 발생했습니다.",
          };
        }

        if (duplicateBusiness) {
          console.log("⚠️ [wholesaler] 중복된 사업자번호:", businessNumberDigits);
          return {
            success: false,
            error: "이미 등록된 사업자번호입니다.",
          };
        }

        // 4. 전화번호 포맷팅
        const formattedPhone = formatPhone(formData.phone);

        // 5. 은행명 + 계좌번호 결합
        const bankAccount = `${formData.bank_name} ${formData.bank_account_number}`;

        // 6. 기존 레코드 업데이트 (rejection_reason은 유지, status만 pending으로 변경)
        const { data: updatedWholesaler, error: updateError } = await supabase
          .from("wholesalers")
          .update({
            business_name: formData.business_name.trim(),
            business_number: businessNumberDigits,
            representative: formData.representative.trim(),
            phone: formattedPhone,
            address: formData.address.trim(),
            address_detail: formData.address_detail?.trim() || null,
            bank_account: bankAccount,
            status: "pending",
            // rejection_reason은 유지 (관리자가 이전 반려 사유를 확인할 수 있도록)
          })
          .eq("id", existingWholesaler.id)
          .select("id, anonymous_code")
          .single();

        if (updateError) {
          console.error("❌ [wholesaler] 도매점 업데이트 오류:", updateError);

          // UNIQUE 제약 위반 에러 처리
          if (updateError.code === "23505") {
            if (updateError.message.includes("business_number")) {
              return {
                success: false,
                error: "이미 등록된 사업자번호입니다.",
              };
            }
          }

          return {
            success: false,
            error: "도매점 정보 업데이트 중 오류가 발생했습니다.",
          };
        }

        console.log("✅ [wholesaler] 도매점 정보 업데이트 완료:", updatedWholesaler.id);
        console.log(
          "✅ [wholesaler] anonymous_code:",
          updatedWholesaler.anonymous_code,
        );
        console.groupEnd();

        return {
          success: true,
          wholesalerId: updatedWholesaler.id,
        };
      } else {
        // approved 또는 다른 상태인 경우
        console.log("⚠️ [wholesaler] 이미 등록된 도매점:", existingWholesaler.id);
        return {
          success: false,
          error: "이미 등록된 도매점 정보가 있습니다.",
        };
      }
    }

    // 3. 사업자번호 중복 확인
    const businessNumberDigits = formData.business_number.replace(/\D/g, "");

    const { data: duplicateBusiness, error: duplicateError } = await supabase
      .from("wholesalers")
      .select("id")
      .eq("business_number", businessNumberDigits)
      .single();

    if (duplicateError && duplicateError.code !== "PGRST116") {
      console.error(
        "❌ [wholesaler] 사업자번호 중복 확인 오류:",
        duplicateError,
      );
      return {
        success: false,
        error: "사업자번호 확인 중 오류가 발생했습니다.",
      };
    }

    if (duplicateBusiness) {
      console.log("⚠️ [wholesaler] 중복된 사업자번호:", businessNumberDigits);
      return {
        success: false,
        error: "이미 등록된 사업자번호입니다.",
      };
    }

    // 4. 전화번호 포맷팅
    const formattedPhone = formatPhone(formData.phone);

    // 5. 은행명 + 계좌번호 결합
    const bankAccount = `${formData.bank_name} ${formData.bank_account_number}`;

    // 6. wholesalers 테이블에 INSERT
    // anonymous_code는 Database Trigger에서 자동 생성됨
    const { data: newWholesaler, error: insertError } = await supabase
      .from("wholesalers")
      .insert({
        profile_id: profile.id,
        business_name: formData.business_name.trim(),
        business_number: businessNumberDigits,
        representative: formData.representative.trim(),
        phone: formattedPhone,
        address: formData.address.trim(),
        address_detail: formData.address_detail?.trim() || null,
        bank_account: bankAccount,
        status: "pending",
      })
      .select("id, anonymous_code")
      .single();

    if (insertError) {
      console.error("❌ [wholesaler] 도매점 생성 오류:", insertError);

      // UNIQUE 제약 위반 에러 처리
      if (insertError.code === "23505") {
        if (insertError.message.includes("business_number")) {
          return {
            success: false,
            error: "이미 등록된 사업자번호입니다.",
          };
        }
        if (insertError.message.includes("anonymous_code")) {
          // anonymous_code 중복 (트리거가 자동 생성하므로 거의 발생하지 않지만 처리)
          console.error(
            "❌ [wholesaler] anonymous_code 중복 에러 (트리거 실패 가능성)",
          );
          return {
            success: false,
            error: "코드 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
          };
        }
      }

      return {
        success: false,
        error: "도매점 등록 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [wholesaler] 도매점 생성 완료:", newWholesaler.id);
    console.log(
      "✅ [wholesaler] anonymous_code:",
      newWholesaler.anonymous_code,
    );
    console.groupEnd();

    return {
      success: true,
      wholesalerId: newWholesaler.id,
    };
  } catch (error) {
    console.error("❌ [wholesaler] createWholesaler 예외:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "도매점 등록 중 예상치 못한 오류가 발생했습니다.",
    };
  }
}
