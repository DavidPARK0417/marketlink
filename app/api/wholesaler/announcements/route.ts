/**
 * @file app/api/wholesaler/announcements/route.ts
 * @description 공지사항 조회 API 라우트
 *
 * 도매사업자가 공지사항 목록을 조회하는 API입니다.
 *
 * 주요 기능:
 * 1. 공지사항 목록 조회 (최신순 정렬)
 *
 * @dependencies
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.group("📋 [api/announcements] 공지사항 목록 조회 시작");

    const supabase = await createClerkSupabaseClient();

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20", 10);

    // 페이지네이션 적용
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 공지사항 조회 (최신순, 페이지네이션 적용)
    const { data: announcements, error, count } = await supabase
      .from("announcements")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("❌ [api/announcements] 공지사항 조회 오류:", error);
      return NextResponse.json(
        { error: "공지사항 목록 조회 실패", details: error.message },
        { status: 500 },
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize);

    console.log("✅ [api/announcements] 공지사항 목록 조회 성공:", {
      count: announcements?.length ?? 0,
      total,
      page,
      totalPages,
    });
    console.groupEnd();

    return NextResponse.json({
      announcements: announcements || [],
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("❌ [api/announcements] 예외 발생:", error);
    return NextResponse.json(
      {
        error: "공지사항 목록 조회 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

