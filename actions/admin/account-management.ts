/**
 * @file actions/admin/account-management.ts
 * @description 계정 정지/해제 Server Action
 *
 * 관리자가 도매사업자 및 소매사업자의 계정을 정지하거나 해제하는 Server Action입니다.
 * 정지/해제 처리 후 감사 로그를 기록하고 페이지를 새로고침합니다.
 *
 * 주요 기능:
 * 1. 도매사업자 정지 (suspendWholesaler)
 *    - wholesalers.status를 'suspended'로 변경
 *    - suspension_reason 저장
 *    - audit_logs에 기록 (action: 'wholesaler_suspend')
 * 2. 도매사업자 해제 (unsuspendWholesaler)
 *    - wholesalers.status를 'approved'로 복구
 *    - suspension_reason을 null로 설정
 *    - audit_logs에 기록 (action: 'wholesaler_unsuspend')
 * 3. 소매사업자 정지 (suspendRetailer)
 *    - retailers.status를 'suspended'로 변경
 *    - suspension_reason 저장
 *    - audit_logs에 기록 (action: 'retailer_suspend')
 * 4. 소매사업자 해제 (unsuspendRetailer)
 *    - retailers.status를 'active'로 복구
 *    - suspension_reason을 null로 설정
 *    - audit_logs에 기록 (action: 'retailer_unsuspend')
 *
 * 공통 기능:
 * - IP 주소 추출 및 기록
 * - 에러 처리 및 로깅
 * - 캐시 무효화
 *
 * @dependencies
 * - lib/supabase/service-role.ts (getServiceRoleClient)
 * - lib/clerk/auth.ts (requireAdmin)
 * - next/headers (headers)
 * - next/cache (revalidatePath)
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/clerk/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * IP 주소 추출
 *
 * Next.js 15에서는 headers()가 Promise를 반환합니다.
 * x-forwarded-for 또는 x-real-ip 헤더에서 IP 주소를 추출합니다.
 *
 * @returns {Promise<string>} IP 주소 (추출 실패 시 "unknown")
 */
async function getIpAddress(): Promise<string> {
  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  console.log("🔍 [admin/account-management] IP 주소 추출:", ipAddress);
  return ipAddress;
}

/**
 * 도매사업자 계정 정지
 *
 * 도매사업자의 상태를 'suspended'로 변경하고,
 * 정지 사유를 저장한 후 감사 로그를 기록합니다.
 *
 * @param {string} wholesalerId - 도매사업자 ID
 * @param {string} suspensionReason - 정지 사유 (최소 10자)
 * @throws {Error} 정지 처리 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await suspendWholesaler(wholesalerId, "부정 거래 의심");
 * ```
 */
export async function suspendWholesaler(
  wholesalerId: string,
  suspensionReason: string,
) {
  try {
    console.group("🔴 [admin] 도매사업자 정지 시작");
    console.log("wholesalerId:", wholesalerId);
    console.log("suspensionReason:", suspensionReason);

    // 관리자 권한 확인
    const profile = await requireAdmin();
    const adminId = profile.id;

    // 정지 사유 유효성 검증
    if (!suspensionReason || suspensionReason.trim().length < 10) {
      throw new Error("정지 사유는 최소 10자 이상 입력해주세요.");
    }

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 1. 도매사업자 정보 조회 (존재 여부 확인)
    const { data: wholesaler, error: fetchError } = await supabase
      .from("wholesalers")
      .select("id, status, business_name")
      .eq("id", wholesalerId)
      .single();

    if (fetchError || !wholesaler) {
      console.error("❌ [admin] 도매사업자 조회 오류:", fetchError);
      throw new Error("도매사업자 정보를 찾을 수 없습니다.");
    }

    // 이미 정지된 경우 확인
    if (wholesaler.status === "suspended") {
      throw new Error("이미 정지된 계정입니다.");
    }

    console.log("✅ [admin] 도매사업자 정보 확인:", {
      id: wholesaler.id,
      business_name: wholesaler.business_name,
      current_status: wholesaler.status,
    });

    // 2. 도매사업자 정지 처리
    const { error: updateError } = await supabase
      .from("wholesalers")
      .update({
        status: "suspended",
        suspension_reason: suspensionReason.trim(),
      })
      .eq("id", wholesalerId);

    if (updateError) {
      console.error("❌ [admin] 도매사업자 정지 오류:", updateError);
      throw new Error("정지 처리 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin] 도매사업자 상태 업데이트 완료: suspended");

    // 3. 감사 로그 기록
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: "wholesaler_suspend",
      target_type: "wholesaler",
      target_id: wholesalerId,
      details: {
        wholesaler_id: wholesalerId,
        business_name: wholesaler.business_name,
        suspension_reason: suspensionReason.trim(),
        suspended_at: new Date().toISOString(),
        previous_status: wholesaler.status,
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin] 감사 로그 기록 오류:", logError);
      // 감사 로그 실패는 치명적이지 않으므로 경고만 하고 계속 진행
      console.warn("⚠️ [admin] 감사 로그 기록 실패했지만 정지 처리는 완료됨");
    } else {
      console.log("✅ [admin] 감사 로그 기록 완료");
    }

    console.log("✅ [admin] 도매사업자 정지 완료:", wholesalerId);
    console.groupEnd();

    // 캐시 무효화
    revalidatePath(`/admin/wholesalers/${wholesalerId}`);
    revalidatePath("/admin/wholesalers");
  } catch (error) {
    console.error("❌ [admin] suspendWholesaler 예외:", error);
    throw error;
  }
}

/**
 * 도매사업자 계정 해제
 *
 * 도매사업자의 상태를 'approved'로 복구하고,
 * suspension_reason을 null로 설정한 후 감사 로그를 기록합니다.
 *
 * @param {string} wholesalerId - 도매사업자 ID
 * @throws {Error} 해제 처리 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await unsuspendWholesaler(wholesalerId);
 * ```
 */
export async function unsuspendWholesaler(wholesalerId: string) {
  try {
    console.group("🟢 [admin] 도매사업자 해제 시작");
    console.log("wholesalerId:", wholesalerId);

    // 관리자 권한 확인
    const profile = await requireAdmin();
    const adminId = profile.id;

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 1. 도매사업자 정보 조회
    const { data: wholesaler, error: fetchError } = await supabase
      .from("wholesalers")
      .select("id, status, business_name, suspension_reason")
      .eq("id", wholesalerId)
      .single();

    if (fetchError || !wholesaler) {
      console.error("❌ [admin] 도매사업자 조회 오류:", fetchError);
      throw new Error("도매사업자 정보를 찾을 수 없습니다.");
    }

    // 정지되지 않은 경우 확인
    if (wholesaler.status !== "suspended") {
      throw new Error("정지된 계정이 아닙니다.");
    }

    console.log("✅ [admin] 도매사업자 정보 확인:", {
      id: wholesaler.id,
      business_name: wholesaler.business_name,
      current_status: wholesaler.status,
      suspension_reason: wholesaler.suspension_reason,
    });

    // 2. 도매사업자 해제 처리
    const { error: updateError } = await supabase
      .from("wholesalers")
      .update({
        status: "approved",
        suspension_reason: null,
      })
      .eq("id", wholesalerId);

    if (updateError) {
      console.error("❌ [admin] 도매사업자 해제 오류:", updateError);
      throw new Error("해제 처리 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin] 도매사업자 상태 업데이트 완료: approved");

    // 3. 감사 로그 기록
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: "wholesaler_unsuspend",
      target_type: "wholesaler",
      target_id: wholesalerId,
      details: {
        wholesaler_id: wholesalerId,
        business_name: wholesaler.business_name,
        previous_suspension_reason: wholesaler.suspension_reason,
        unsuspended_at: new Date().toISOString(),
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin] 감사 로그 기록 오류:", logError);
      console.warn("⚠️ [admin] 감사 로그 기록 실패했지만 해제 처리는 완료됨");
    } else {
      console.log("✅ [admin] 감사 로그 기록 완료");
    }

    console.log("✅ [admin] 도매사업자 해제 완료:", wholesalerId);
    console.groupEnd();

    // 캐시 무효화
    revalidatePath(`/admin/wholesalers/${wholesalerId}`);
    revalidatePath("/admin/wholesalers");
  } catch (error) {
    console.error("❌ [admin] unsuspendWholesaler 예외:", error);
    throw error;
  }
}

/**
 * 소매사업자 계정 정지
 *
 * 소매사업자의 상태를 'suspended'로 변경하고,
 * 정지 사유를 저장한 후 감사 로그를 기록합니다.
 *
 * @param {string} retailerId - 소매사업자 ID
 * @param {string} suspensionReason - 정지 사유 (최소 10자)
 * @throws {Error} 정지 처리 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await suspendRetailer(retailerId, "부정 거래 의심");
 * ```
 */
export async function suspendRetailer(
  retailerId: string,
  suspensionReason: string,
) {
  try {
    console.group("🔴 [admin] 소매사업자 정지 시작");
    console.log("retailerId:", retailerId);
    console.log("suspensionReason:", suspensionReason);

    // 관리자 권한 확인
    const profile = await requireAdmin();
    const adminId = profile.id;

    // 정지 사유 유효성 검증
    if (!suspensionReason || suspensionReason.trim().length < 10) {
      throw new Error("정지 사유는 최소 10자 이상 입력해주세요.");
    }

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 1. 소매사업자 정보 조회 (존재 여부 확인)
    const { data: retailer, error: fetchError } = await supabase
      .from("retailers")
      .select("id, status, business_name")
      .eq("id", retailerId)
      .single();

    if (fetchError || !retailer) {
      console.error("❌ [admin] 소매사업자 조회 오류:", fetchError);
      throw new Error("소매사업자 정보를 찾을 수 없습니다.");
    }

    // 이미 정지된 경우 확인
    if (retailer.status === "suspended") {
      throw new Error("이미 정지된 계정입니다.");
    }

    console.log("✅ [admin] 소매사업자 정보 확인:", {
      id: retailer.id,
      business_name: retailer.business_name,
      current_status: retailer.status,
    });

    // 2. 소매사업자 정지 처리
    const { error: updateError } = await supabase
      .from("retailers")
      .update({
        status: "suspended",
        suspension_reason: suspensionReason.trim(),
      })
      .eq("id", retailerId);

    if (updateError) {
      console.error("❌ [admin] 소매사업자 정지 오류:", updateError);
      throw new Error("정지 처리 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin] 소매사업자 상태 업데이트 완료: suspended");

    // 3. 감사 로그 기록
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: "retailer_suspend",
      target_type: "retailer",
      target_id: retailerId,
      details: {
        retailer_id: retailerId,
        business_name: retailer.business_name,
        suspension_reason: suspensionReason.trim(),
        suspended_at: new Date().toISOString(),
        previous_status: retailer.status,
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin] 감사 로그 기록 오류:", logError);
      console.warn("⚠️ [admin] 감사 로그 기록 실패했지만 정지 처리는 완료됨");
    } else {
      console.log("✅ [admin] 감사 로그 기록 완료");
    }

    console.log("✅ [admin] 소매사업자 정지 완료:", retailerId);
    console.groupEnd();

    // 캐시 무효화
    revalidatePath(`/admin/retailers/${retailerId}`);
    revalidatePath("/admin/retailers");
  } catch (error) {
    console.error("❌ [admin] suspendRetailer 예외:", error);
    throw error;
  }
}

/**
 * 소매사업자 계정 해제
 *
 * 소매사업자의 상태를 'active'로 복구하고,
 * suspension_reason을 null로 설정한 후 감사 로그를 기록합니다.
 *
 * @param {string} retailerId - 소매사업자 ID
 * @throws {Error} 해제 처리 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await unsuspendRetailer(retailerId);
 * ```
 */
export async function unsuspendRetailer(retailerId: string) {
  try {
    console.group("🟢 [admin] 소매사업자 해제 시작");
    console.log("retailerId:", retailerId);

    // 관리자 권한 확인
    const profile = await requireAdmin();
    const adminId = profile.id;

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 1. 소매사업자 정보 조회
    const { data: retailer, error: fetchError } = await supabase
      .from("retailers")
      .select("id, status, business_name, suspension_reason")
      .eq("id", retailerId)
      .single();

    if (fetchError || !retailer) {
      console.error("❌ [admin] 소매사업자 조회 오류:", fetchError);
      throw new Error("소매사업자 정보를 찾을 수 없습니다.");
    }

    // 정지되지 않은 경우 확인
    if (retailer.status !== "suspended") {
      throw new Error("정지된 계정이 아닙니다.");
    }

    console.log("✅ [admin] 소매사업자 정보 확인:", {
      id: retailer.id,
      business_name: retailer.business_name,
      current_status: retailer.status,
      suspension_reason: retailer.suspension_reason,
    });

    // 2. 소매사업자 해제 처리
    const { error: updateError } = await supabase
      .from("retailers")
      .update({
        status: "active",
        suspension_reason: null,
      })
      .eq("id", retailerId);

    if (updateError) {
      console.error("❌ [admin] 소매사업자 해제 오류:", updateError);
      throw new Error("해제 처리 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin] 소매사업자 상태 업데이트 완료: active");

    // 3. 감사 로그 기록
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: "retailer_unsuspend",
      target_type: "retailer",
      target_id: retailerId,
      details: {
        retailer_id: retailerId,
        business_name: retailer.business_name,
        previous_suspension_reason: retailer.suspension_reason,
        unsuspended_at: new Date().toISOString(),
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin] 감사 로그 기록 오류:", logError);
      console.warn("⚠️ [admin] 감사 로그 기록 실패했지만 해제 처리는 완료됨");
    } else {
      console.log("✅ [admin] 감사 로그 기록 완료");
    }

    console.log("✅ [admin] 소매사업자 해제 완료:", retailerId);
    console.groupEnd();

    // 캐시 무효화
    revalidatePath(`/admin/retailers/${retailerId}`);
    revalidatePath("/admin/retailers");
  } catch (error) {
    console.error("❌ [admin] unsuspendRetailer 예외:", error);
    throw error;
  }
}

