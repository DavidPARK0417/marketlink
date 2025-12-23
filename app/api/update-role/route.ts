import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type { UserRole } from "@/types/database";

/**
 * 사용자 역할 업데이트 API
 *
 * 역할 선택 페이지에서 사용자가 소매점 또는 도매점을 선택했을 때
 * profiles 테이블의 role을 업데이트합니다.
 *
 * @body { role: 'retailer' | 'wholesaler' }
 *
 * @returns { success: boolean, redirectUrl: string }
 */
export async function POST(request: Request) {
  try {
    console.log("🔄 [update-role] 역할 업데이트 시작");

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.error("❌ [update-role] 인증 실패: userId 없음");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ [update-role] Clerk userId:", userId);

    // 요청 본문에서 role 가져오기
    const body = await request.json();
    const { role } = body;

    if (!role) {
      console.error("❌ [update-role] role 파라미터 없음");
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // role 유효성 검증
    const validRoles: UserRole[] = ["retailer", "wholesaler", "admin"];
    if (!validRoles.includes(role as UserRole)) {
      console.error("❌ [update-role] 유효하지 않은 role:", role);
      return NextResponse.json(
        { error: "Invalid role. Must be 'retailer' or 'wholesaler'" },
        { status: 400 },
      );
    }

    // admin 역할은 직접 선택 불가 (보안상 이유)
    if (role === "admin") {
      console.error("❌ [update-role] admin 역할은 직접 선택할 수 없음");
      return NextResponse.json(
        { error: "Admin role cannot be selected directly" },
        { status: 403 },
      );
    }

    const supabase = getServiceRoleClient();

    // profiles 테이블에서 기존 프로필 확인
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116은 "no rows returned" 에러
      console.error("❌ [update-role] 프로필 조회 실패:", fetchError);
      return NextResponse.json(
        {
          error: "Failed to fetch profile",
          details: fetchError.message,
        },
        { status: 500 },
      );
    }

    // 프로필이 없으면 먼저 생성 (sync-user API가 아직 호출되지 않은 경우)
    if (!existingProfile) {
      console.log("⚠️ [update-role] 프로필 없음, 먼저 생성 필요");
      return NextResponse.json(
        {
          error: "Profile not found. Please sync user first.",
          hint: "Call /api/sync-user first",
        },
        { status: 404 },
      );
    }

    // 이미 같은 역할이면 업데이트 불필요
    if (existingProfile.role === role) {
      console.log("ℹ️ [update-role] 이미 같은 역할:", role);
      const redirectUrl = getRedirectUrl(role as UserRole);
      return NextResponse.json({
        success: true,
        role: role,
        redirectUrl: redirectUrl,
        message: "Role already set",
      });
    }

    // 역할 업데이트
    console.log("📝 [update-role] 역할 업데이트 시도:", {
      from: existingProfile.role,
      to: role,
    });

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ role: role, updated_at: new Date().toISOString() })
      .eq("clerk_user_id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ [update-role] 역할 업데이트 실패:", updateError);
      return NextResponse.json(
        {
          error: "Failed to update role",
          details: updateError.message,
        },
        { status: 500 },
      );
    }

    console.log("✅ [update-role] 역할 업데이트 완료:", updatedProfile.id);

    // 역할에 따른 리다이렉트 URL 결정
    const redirectUrl = getRedirectUrl(role as UserRole);

    console.log("🎉 [update-role] 성공! 리다이렉트 URL:", redirectUrl);

    return NextResponse.json({
      success: true,
      role: role,
      redirectUrl: redirectUrl,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("❌ [update-role] 예상치 못한 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * 역할에 따른 리다이렉트 URL 반환
 */
function getRedirectUrl(role: UserRole): string {
  switch (role) {
    case "retailer":
      return "/retailer/dashboard";
    case "wholesaler":
      return "/wholesaler-onboarding"; // 하이픈 추가 (올바른 경로)
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}
