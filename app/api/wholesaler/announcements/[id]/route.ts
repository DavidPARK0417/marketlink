/**
 * @file app/api/wholesaler/announcements/[id]/route.ts
 * @description 공지사항 상세 조회 API 라우트
 *
 * 도매사업자가 공지사항 상세 내용을 조회하는 API입니다.
 *
 * 주요 기능:
 * 1. 공지사항 상세 조회
 *
 * @dependencies
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.group("📋 [api/announcements] 공지사항 상세 조회 시작", { id });

    const supabase = await createClerkSupabaseClient();

    // 공지사항 상세 조회
    const { data: announcement, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ [api/announcements] 공지사항 조회 오류:", error);
      return NextResponse.json(
        { error: "공지사항 조회 실패", details: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 },
      );
    }

    if (!announcement) {
      console.error("❌ [api/announcements] 공지사항 없음");
      return NextResponse.json(
        { error: "공지사항을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    console.log("✅ [api/announcements] 공지사항 상세 조회 성공");
    console.groupEnd();

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("❌ [api/announcements] 예외 발생:", error);
    return NextResponse.json(
      {
        error: "공지사항 조회 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

