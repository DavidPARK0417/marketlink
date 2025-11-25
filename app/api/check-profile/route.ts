/**
 * @file app/api/check-profile/route.ts
 * @description 프로필 확인 API
 *
 * 현재 로그인한 사용자의 프로필 존재 여부를 확인합니다.
 * 회원가입 직후 동기화가 완료되지 않았을 때 온보딩 페이지에서 사용합니다.
 *
 * @returns { profile: ProfileWithDetails | null }
 */

import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/clerk/auth";

export async function GET() {
  try {
    console.log("🔍 [check-profile] 프로필 확인 시작");

    const profile = await getUserProfile();

    if (!profile) {
      console.log("ℹ️ [check-profile] 프로필 없음");
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    console.log("✅ [check-profile] 프로필 확인 완료:", profile.id);

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("❌ [check-profile] 예상치 못한 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

