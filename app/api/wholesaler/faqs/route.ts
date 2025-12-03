/**
 * @file app/api/wholesaler/faqs/route.ts
 * @description FAQ 조회 API 라우트
 *
 * 도매사업자가 FAQ 목록을 조회하는 API입니다.
 *
 * 주요 기능:
 * 1. FAQ 목록 조회 (표시 순서대로 정렬)
 * 2. 검색어로 필터링 (질문/답변 내용 검색)
 *
 * @dependencies
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { FAQFilter } from "@/types/faq";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    console.group("📋 [api/faqs] FAQ 목록 조회 시작");

    const supabase = await createClerkSupabaseClient();

    // 검색 파라미터 읽기
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get("search") || "";

    console.log("검색어:", searchQuery);

    // FAQ 조회 쿼리
    let query = supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    // 검색어가 있으면 필터링
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      query = query.or(
        `question.ilike.%${searchLower}%,answer.ilike.%${searchLower}%`,
      );
    }

    const { data: faqs, error } = await query;

    if (error) {
      console.error("❌ [api/faqs] FAQ 조회 오류:", error);
      return NextResponse.json(
        { error: "FAQ 목록 조회 실패", details: error.message },
        { status: 500 },
      );
    }

    console.log("✅ [api/faqs] FAQ 목록 조회 성공:", faqs?.length ?? 0);
    console.groupEnd();

    return NextResponse.json({ faqs: faqs || [] });
  } catch (error) {
    console.error("❌ [api/faqs] 예외 발생:", error);
    return NextResponse.json(
      {
        error: "FAQ 목록 조회 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

