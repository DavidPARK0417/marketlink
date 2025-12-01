/**
 * @file actions/admin/wholesaler-approval.ts
 * @description 도매사업자 승인/반려 Server Action
 *
 * 관리자가 도매사업자를 승인하거나 반려하는 Server Action입니다.
 * 승인/반려 처리 후 감사 로그를 기록하고 목록 페이지로 리다이렉트합니다.
 *
 * 주요 기능:
 * 1. 도매사업자 승인 처리 (status='approved')
 * 2. 도매사업자 반려 처리 (status='rejected', 반려 사유 포함)
 * 3. 감사 로그 기록 (audit_logs 테이블)
 * 4. IP 주소 추출 및 기록
 * 5. 캐시 무효화 및 리다이렉트
 *
 * @dependencies
 * - lib/supabase/service-role.ts (getServiceRoleClient)
 * - next/headers (headers)
 * - next/cache (revalidatePath)
 * - next/navigation (redirect)
 */

"use server";

import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

  console.log("🔍 [admin] IP 주소 추출:", ipAddress);
  return ipAddress;
}

/**
 * 도매사업자 승인
 *
 * 도매사업자의 상태를 'approved'로 변경하고,
 * 감사 로그를 기록한 후 목록 페이지로 리다이렉트합니다.
 *
 * @param {string} wholesalerId - 도매사업자 ID
 * @param {string} adminId - 관리자 ID (profiles.id)
 * @throws {Error} 승인 처리 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await approveWholesaler(wholesalerId, adminId);
 * ```
 */
export async function approveWholesaler(
  wholesalerId: string,
  adminId: string,
) {
  try {
    console.group("✅ [admin] 도매사업자 승인 시작");
    console.log("wholesalerId:", wholesalerId);
    console.log("adminId:", adminId);

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 도매사업자 승인 처리
    const { error: updateError } = await supabase
      .from("wholesalers")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq("id", wholesalerId);

    if (updateError) {
      console.error("❌ [admin] 도매사업자 승인 오류:", updateError);
      throw new Error("승인 처리 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin] 도매사업자 상태 업데이트 완료");

    // 감사 로그 기록
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: "wholesaler_approve",
      target_type: "wholesaler",
      target_id: wholesalerId,
      details: {
        wholesaler_id: wholesalerId,
        approved_at: new Date().toISOString(),
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin] 감사 로그 기록 오류:", logError);
      // 감사 로그 실패는 치명적이지 않으므로 계속 진행
    } else {
      console.log("✅ [admin] 감사 로그 기록 완료");
    }

    console.log("✅ [admin] 도매사업자 승인 완료:", wholesalerId);
    console.groupEnd();

    // 캐시 무효화 및 리다이렉트
    revalidatePath("/admin/wholesalers/pending");
    redirect("/admin/wholesalers/pending");
  } catch (error) {
    console.error("❌ [admin] approveWholesaler 예외:", error);
    throw error;
  }
}

/**
 * 도매사업자 반려
 *
 * 도매사업자의 상태를 'rejected'로 변경하고,
 * 반려 사유를 저장한 후 감사 로그를 기록하고 목록 페이지로 리다이렉트합니다.
 *
 * @param {string} wholesalerId - 도매사업자 ID
 * @param {string} adminId - 관리자 ID (profiles.id)
 * @param {string} rejectionReason - 반려 사유 (최소 10자)
 * @throws {Error} 반려 처리 중 오류 발생 시
 *
 * @example
 * ```tsx
 * await rejectWholesaler(wholesalerId, adminId, "사업자번호가 유효하지 않습니다.");
 * ```
 */
export async function rejectWholesaler(
  wholesalerId: string,
  adminId: string,
  rejectionReason: string,
) {
  try {
    console.group("❌ [admin] 도매사업자 반려 시작");
    console.log("wholesalerId:", wholesalerId);
    console.log("adminId:", adminId);
    console.log("rejectionReason:", rejectionReason);

    // 반려 사유 유효성 검증
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      throw new Error("반려 사유는 최소 10자 이상 입력해주세요.");
    }

    const supabase = getServiceRoleClient();
    const ipAddress = await getIpAddress();

    // 1. 도매사업자 정보 조회 (profile_id 가져오기 위해)
    const { data: wholesaler, error: fetchError } = await supabase
      .from("wholesalers")
      .select("profile_id")
      .eq("id", wholesalerId)
      .single();

    if (fetchError || !wholesaler) {
      console.error("❌ [admin] 도매사업자 조회 오류:", fetchError);
      throw new Error("도매사업자 정보를 찾을 수 없습니다.");
    }

    // 2. 도매사업자 반려 처리
    const { error: updateError } = await supabase
      .from("wholesalers")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason.trim(),
        approved_at: null,
      })
      .eq("id", wholesalerId);

    if (updateError) {
      console.error("❌ [admin] 도매사업자 반려 오류:", updateError);
      throw new Error("반려 처리 중 오류가 발생했습니다.");
    }

    console.log("✅ [admin] 도매사업자 상태 업데이트 완료");

    // 3. 반려 처리 시 role을 null로 리셋 (재가입 가능하도록)
    const { error: roleUpdateError } = await supabase
      .from("profiles")
      .update({ role: null })
      .eq("id", wholesaler.profile_id);

    if (roleUpdateError) {
      console.error("❌ [admin] role 리셋 오류:", roleUpdateError);
      // role 리셋 실패는 치명적이지 않으므로 경고만 하고 계속 진행
      console.warn("⚠️ [admin] role 리셋 실패했지만 반려 처리는 완료됨");
    } else {
      console.log("✅ [admin] role 리셋 완료: null");
    }

    // 감사 로그 기록
    const { error: logError } = await supabase.from("audit_logs").insert({
      user_id: adminId,
      action: "wholesaler_reject",
      target_type: "wholesaler",
      target_id: wholesalerId,
      details: {
        wholesaler_id: wholesalerId,
        rejection_reason: rejectionReason.trim(),
        rejected_at: new Date().toISOString(),
        role_reset: true, // role 리셋 여부 기록
      },
      ip_address: ipAddress,
    });

    if (logError) {
      console.error("❌ [admin] 감사 로그 기록 오류:", logError);
      // 감사 로그 실패는 치명적이지 않으므로 계속 진행
    } else {
      console.log("✅ [admin] 감사 로그 기록 완료");
    }

    console.log("✅ [admin] 도매사업자 반려 완료:", wholesalerId);
    console.groupEnd();

    // 캐시 무효화 및 리다이렉트
    revalidatePath("/admin/wholesalers/pending");
    redirect("/admin/wholesalers/pending");
  } catch (error) {
    console.error("❌ [admin] rejectWholesaler 예외:", error);
    throw error;
  }
}

