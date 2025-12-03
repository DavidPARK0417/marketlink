/**
 * @file app/api/wholesaler/voc/route.ts
 * @description VOC 피드백 제출 API 라우트
 *
 * 도매사업자가 고객의 소리(VOC) 피드백을 제출하는 API입니다.
 *
 * 주요 기능:
 * 1. VOC 피드백 제출
 * 2. 인증 확인 및 사용자 정보 조회
 *
 * @dependencies
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 * - lib/clerk/auth.ts (getUserProfile)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/clerk/auth";
import type { CreateVOCFeedbackRequest } from "@/types/voc";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    console.group("📝 [api/voc] VOC 피드백 제출 시작");

    // 1. 인증 확인 및 사용자 정보 조회
    const profile = await getUserProfile();

    if (!profile) {
      console.error("❌ [api/voc] 인증되지 않은 사용자");
      return NextResponse.json(
        { error: "인증이 필요합니다. 다시 로그인해주세요." },
        { status: 401 },
      );
    }

    // 도매사업자 권한 확인
    if (profile.role !== "wholesaler") {
      console.error("❌ [api/voc] 도매사업자 권한 없음:", profile.role);
      return NextResponse.json(
        { error: "도매사업자만 사용할 수 있는 기능입니다." },
        { status: 403 },
      );
    }

    console.log("✅ [api/voc] 인증 확인 완료, profile_id:", profile.id);

    // 2. 요청 본문 파싱
    const body: CreateVOCFeedbackRequest = await request.json();
    const { title, content } = body;

    // 3. 입력 데이터 검증
    if (!title || title.trim().length < 2) {
      return NextResponse.json(
        { error: "제목은 최소 2자 이상 입력해주세요." },
        { status: 400 },
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: "제목은 최대 200자까지 입력할 수 있습니다." },
        { status: 400 },
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: "내용은 최소 10자 이상 입력해주세요." },
        { status: 400 },
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "내용은 최대 2000자까지 입력할 수 있습니다." },
        { status: 400 },
      );
    }

    // 4. Supabase 클라이언트 생성
    const supabase = await createClerkSupabaseClient();

    // 5. VOC 피드백 저장
    const { data: feedback, error } = await supabase
      .from("voc_feedbacks")
      .insert({
        profile_id: profile.id,
        title: title.trim(),
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [api/voc] VOC 피드백 저장 오류:", error);
      return NextResponse.json(
        { error: "피드백 제출 실패", details: error.message },
        { status: 500 },
      );
    }

    console.log("✅ [api/voc] VOC 피드백 제출 성공:", feedback.id);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("❌ [api/voc] 예외 발생:", error);
    return NextResponse.json(
      {
        error: "피드백 제출 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

