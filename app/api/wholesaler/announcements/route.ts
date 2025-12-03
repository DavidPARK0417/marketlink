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

    // 공지사항 조회 (최신순)
    const { data: announcements, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ [api/announcements] 공지사항 조회 오류:", error);
      return NextResponse.json(
        { error: "공지사항 목록 조회 실패", details: error.message },
        { status: 500 },
      );
    }

    console.log("✅ [api/announcements] 공지사항 목록 조회 성공:", announcements?.length ?? 0);
    console.groupEnd();

    return NextResponse.json({ announcements: announcements || [] });
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

