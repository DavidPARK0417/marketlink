import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Clerk 사용자를 Supabase profiles + users 테이블에 동기화하는 API
 *
 * 2-tier 구조:
 * 1. profiles 테이블: Clerk 인증 정보 + 역할 (clerk_user_id, email, role, status)
 * 2. users 테이블: 상세 프로필 정보 (profile_id, name, phone, avatar_url)
 *
 * 클라이언트에서 로그인 후 이 API를 호출하여 사용자 정보를 Supabase에 저장합니다.
 * 이미 존재하는 경우 업데이트하고, 없으면 새로 생성합니다.
 */
export async function POST() {
  try {
    console.log("🔄 [sync-user] 동기화 시작");

    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.error("❌ [sync-user] 인증 실패: userId 없음");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ [sync-user] Clerk userId:", userId);

    // Clerk에서 사용자 정보 가져오기
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      console.error("❌ [sync-user] Clerk 사용자 없음:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ [sync-user] Clerk 사용자 정보:", {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      name: clerkUser.fullName,
    });

    const supabase = getServiceRoleClient();

    // 1단계: profiles 테이블에 upsert (Clerk 인증 정보)
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";

    console.log("📝 [sync-user] profiles 테이블 upsert 시도...");

    // 기존 프로필이 있는지 확인 (role 유지하기 위해 + 중복 가입 감지)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, clerk_user_id, email, role, created_at")
      .eq("clerk_user_id", clerkUser.id)
      .maybeSingle();

    // 중복 가입 감지: 이미 존재하는 계정인지 확인
    if (existingProfile) {
      const createdAt = new Date(existingProfile.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - createdAt.getTime();
      const minutesDiff = timeDiff / (1000 * 60);

      // 5분 이내에 생성된 계정이면 신규 가입으로 간주, 그 외는 중복 가입 시도
      if (minutesDiff > 5) {
        console.log("⚠️ [sync-user] 중복 가입 시도 감지:", {
          clerkUserId: clerkUser.id,
          email: email,
          existingProfileId: existingProfile.id,
          createdAt: existingProfile.created_at,
          minutesSinceCreation: minutesDiff.toFixed(2),
        });

        return NextResponse.json(
          {
            success: false,
            isDuplicate: true,
            message: "이미 가입된 계정입니다",
            profile: existingProfile,
          },
          { status: 409 }, // 409 Conflict
        );
      }
    }

    // 기존 role이 있으면 유지, 없으면 NULL (역할 선택 페이지에서 설정)
    const role = existingProfile?.role || null;

    console.log("📋 [sync-user] 사용할 role:", {
      existing: existingProfile?.role,
      final: role,
    });

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          clerk_user_id: clerkUser.id,
          email: email,
          role: role, // 기존 role 유지, 없으면 NULL (역할 선택 페이지에서 설정)
          status: "active",
        },
        {
          onConflict: "clerk_user_id",
        },
      )
      .select()
      .single();

    if (profileError) {
      // 상세 에러 정보 로깅
      console.error("❌ [sync-user] profiles 동기화 실패:", {
        error: profileError,
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        // 추가 디버깅 정보
        attemptedData: {
          clerk_user_id: clerkUser.id,
          email: email,
          role: role,
          status: "active",
        },
      });

      return NextResponse.json(
        {
          error: "Failed to sync profile",
          details: profileError.message,
          code: profileError.code,
          hint: "Supabase Dashboard에서 profiles 테이블이 존재하는지 확인하세요. role 컬럼이 NULL을 허용하는지 확인하세요. SQL Editor에서 마이그레이션을 실행했는지 확인하세요. (supabase/SQL_EDITOR_allow_null_role.sql 파일 참고)",
        },
        { status: 500 },
      );
    }

    console.log("✅ [sync-user] profiles 저장 완료:", profile.id);

    // 2단계: users 테이블에 upsert (상세 프로필)
    const name =
      clerkUser.fullName ||
      clerkUser.username ||
      email.split("@")[0] ||
      "Unknown";

    console.log("📝 [sync-user] users 테이블 upsert 시도...");

    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert(
        {
          profile_id: profile.id,
          name: name,
          phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
          avatar_url: clerkUser.imageUrl || null,
        },
        {
          onConflict: "profile_id",
        },
      )
      .select()
      .single();

    if (userError) {
      console.error("❌ [sync-user] users 동기화 실패:", userError);
      return NextResponse.json(
        {
          error: "Failed to sync user",
          details: userError.message,
          hint: "Supabase Dashboard에서 users 테이블이 존재하고 profile_id 컬럼이 있는지 확인하세요",
        },
        { status: 500 },
      );
    }

    console.log("✅ [sync-user] users 저장 완료:", user.id);
    console.log("🎉 [sync-user] 동기화 성공!");

    return NextResponse.json({
      success: true,
      profile: profile,
      user: user,
      message: "사용자 동기화 완료",
    });
  } catch (error) {
    console.error("❌ [sync-user] 예상치 못한 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
