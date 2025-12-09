/**
 * @file app/api/wholesaler/inquiries/stats/route.ts
 * @description 상품문의 통계 조회 API
 *
 * 도매점의 상품문의(소매→도매) 통계를 조회하는 API 엔드포인트입니다.
 * 전체, 미답변, 답변완료, 종료 건수를 반환합니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 * - lib/clerk/auth.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getInquiryStats, getInquiryStatsForAdmin } from "@/lib/supabase/queries/inquiries";
import { getUserProfile } from "@/lib/clerk/auth";

export async function GET(request: NextRequest) {
  try {
    console.group("🔍 [api/inquiries/stats] 상품문의 통계 조회 API 시작");

    // 사용자 역할 확인
    const profile = await getUserProfile();
    
    if (!profile) {
      console.error("❌ [api/inquiries/stats] 프로필 없음 - 인증되지 않음");
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 도매점 또는 관리자만 허용
    if (profile.role !== "wholesaler" && profile.role !== "admin") {
      console.error("❌ [api/inquiries/stats] 권한 없음", { role: profile.role });
      return NextResponse.json(
        { error: "도매점 또는 관리자 권한이 필요합니다." },
        { status: 403 },
      );
    }

    console.log("👤 [api/inquiries/stats] 사용자 역할:", profile.role);

    // 관리자: 전체 문의 통계, 도매점: 자신의 문의 통계
    const stats =
      profile.role === "admin" ? await getInquiryStatsForAdmin() : await getInquiryStats();

    console.log("✅ [api/inquiries/stats] 상품문의 통계 조회 성공", stats);
    console.groupEnd();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("❌ [api/inquiries/stats] 상품문의 통계 조회 오류:", error);
    console.error("❌ [api/inquiries/stats] 에러 스택:", error instanceof Error ? error.stack : "스택 없음");
    console.groupEnd();

    const errorMessage =
      error instanceof Error
        ? error.message
        : "상품문의 통계를 불러오는 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage || "상품문의 통계를 불러오는 중 오류가 발생했습니다.",
        details: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

