/**
 * @file app/api/wholesaler/inquiries/[id]/route.ts
 * @description 문의 상세 조회 API
 *
 * 문의 ID로 상세 정보를 조회하는 API 엔드포인트입니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getInquiryById } from "@/lib/supabase/queries/inquiries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.group("🔍 [api/inquiries/[id]] 문의 상세 조회 API 시작");
    console.log("문의 ID:", id);

    const inquiry = await getInquiryById(id);

    if (!inquiry) {
      console.log("⚠️ [api/inquiries/[id]] 문의를 찾을 수 없음");
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    console.log("✅ [api/inquiries/[id]] 문의 상세 조회 성공");
    console.groupEnd();

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("❌ [api/inquiries/[id]] 문의 상세 조회 오류:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "문의를 불러오는 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
