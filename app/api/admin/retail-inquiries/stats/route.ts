/**
 * @file app/api/admin/retail-inquiries/stats/route.ts
 * @description 관리자용 소매→관리자 문의 통계 조회 API
 */

import { NextRequest, NextResponse } from "next/server";
import { getRetailerToAdminStatsForAdmin } from "@/lib/supabase/queries/inquiries";
import { getUserProfile } from "@/lib/clerk/auth";

export async function GET(request: NextRequest) {
  try {
    console.group("🔍 [api/admin/retail-inquiries/stats] 시작");

    const profile = await getUserProfile();
    if (!profile) {
      console.error("❌ 프로필 없음");
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    if (profile.role !== "admin") {
      console.error("❌ 관리자 권한 없음");
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 },
      );
    }

    const stats = await getRetailerToAdminStatsForAdmin();

    console.log("✅ 통계 조회 성공", stats);
    console.groupEnd();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("❌ 통계 조회 오류:", error);
    console.groupEnd();

    const errorMessage =
      error instanceof Error
        ? error.message
        : "소매 문의 통계를 불러오는 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}


