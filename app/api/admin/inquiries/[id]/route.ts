/**
 * @file app/api/admin/inquiries/[id]/route.ts
 * @description 관리자용 문의 상세 조회 API
 *
 * 관리자가 특정 문의의 상세 정보를 조회하는 API 엔드포인트입니다.
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
    console.group("🔍 [api/admin/inquiries] 관리자용 문의 상세 조회 API 시작");
    console.log("문의 ID:", id);

    const inquiry = await getInquiryById(id);

    if (!inquiry) {
      console.log("⚠️ [api/admin/inquiries] 문의를 찾을 수 없음");
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 관리자 권한 확인 (getInquiryById 내부에서 처리됨)
    // 도매→관리자 문의만 조회 가능
    if (inquiry.inquiry_type !== "wholesaler_to_admin") {
      console.error(
        "❌ [api/admin/inquiries] 잘못된 문의 유형:",
        inquiry.inquiry_type,
      );
      return NextResponse.json(
        { error: "이 문의는 관리자가 조회할 수 없습니다." },
        { status: 403 },
      );
    }

    console.log("✅ [api/admin/inquiries] 관리자용 문의 상세 조회 성공");
    console.groupEnd();

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error(
      "❌ [api/admin/inquiries] 관리자용 문의 상세 조회 오류:",
      error,
    );

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
