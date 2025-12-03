/**
 * @file app/api/admin/voc/route.ts
 * @description 관리자 VOC 피드백 조회 API 라우트
 *
 * 관리자가 VOC 피드백 목록을 조회하는 API입니다.
 *
 * 주요 기능:
 * 1. VOC 피드백 목록 조회
 * 2. 검색 및 필터링
 *
 * @dependencies
 * - lib/clerk/auth.ts (requireAdmin)
 * - actions/admin/voc.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/clerk/auth";
import { getVOCFeedbacks } from "@/actions/admin/voc";
import type { VOCFeedbackFilter } from "@/types/voc";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.group("📋 [api/admin/voc] VOC 피드백 목록 조회 시작");

    // 관리자 권한 확인
    await requireAdmin();

    // 검색 파라미터 읽기
    const searchParams = request.nextUrl.searchParams;
    const filter: VOCFeedbackFilter = {};

    if (searchParams.get("search")) {
      filter.search = searchParams.get("search") || undefined;
    }
    if (searchParams.get("profile_id")) {
      filter.profile_id = searchParams.get("profile_id") || undefined;
    }
    if (searchParams.get("start_date")) {
      filter.start_date = searchParams.get("start_date") || undefined;
    }
    if (searchParams.get("end_date")) {
      filter.end_date = searchParams.get("end_date") || undefined;
    }

    console.log("filter:", filter);

    const result = await getVOCFeedbacks(filter);

    if (!result.success) {
      console.error("❌ [api/admin/voc] VOC 피드백 조회 오류:", result.error);
      return NextResponse.json(
        { error: result.error || "VOC 피드백 조회 실패" },
        { status: 500 },
      );
    }

    console.log("✅ [api/admin/voc] VOC 피드백 목록 조회 성공:", result.feedbacks?.length ?? 0);
    console.groupEnd();

    return NextResponse.json({
      feedbacks: result.feedbacks || [],
    });
  } catch (error) {
    console.error("❌ [api/admin/voc] 예외 발생:", error);
    return NextResponse.json(
      {
        error: "VOC 피드백 조회 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

