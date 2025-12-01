/**
 * @file app/api/check-wholesaler-status/route.ts
 * @description 도매점 상태 확인 API
 *
 * 현재 로그인한 사용자의 도매점 정보와 상태를 확인합니다.
 * 온보딩 페이지에서 반려/승인 대기 상태를 확인하기 위해 사용합니다.
 *
 * @returns { wholesaler: { id: string, status: string } | null }
 */

import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    console.log("🔍 [check-wholesaler-status] 도매점 상태 확인 시작");

    const profile = await getUserProfile();

    if (!profile) {
      console.log("ℹ️ [check-wholesaler-status] 프로필 없음");
      return NextResponse.json({ wholesaler: null }, { status: 200 });
    }

    const supabase = createClerkSupabaseClient();

    const { data: wholesaler, error } = await supabase
      .from("wholesalers")
      .select("id, status")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (error) {
      console.error("❌ [check-wholesaler-status] 도매점 조회 오류:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch wholesaler",
          details: error.message,
        },
        { status: 500 },
      );
    }

    if (!wholesaler) {
      console.log("ℹ️ [check-wholesaler-status] 도매점 정보 없음");
      return NextResponse.json({ wholesaler: null }, { status: 200 });
    }

    console.log("✅ [check-wholesaler-status] 도매점 상태 확인 완료:", wholesaler.status);

    return NextResponse.json({ wholesaler }, { status: 200 });
  } catch (error) {
    console.error("❌ [check-wholesaler-status] 예상치 못한 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

