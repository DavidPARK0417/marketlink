/**
 * @file app/api/admin/retail-inquiries/[id]/route.ts
 * @description 관리자용 소매 문의 상세 조회 API
 *
 * 관리자가 소매→관리자 문의의 상세 정보를 조회합니다.
 */

import { NextRequest, NextResponse } from "next/server";

import { getInquiryById } from "@/lib/supabase/queries/inquiries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.group("🔍 [api/admin/retail-inquiries] 문의 상세 조회 시작");
    console.log("문의 ID:", id);

    const inquiry = await getInquiryById(id);

    if (!inquiry) {
      console.warn("⚠️ [api/admin/retail-inquiries] 문의를 찾을 수 없음");
      return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
    }

    if (inquiry.inquiry_type !== "retailer_to_admin") {
      console.error(
        "❌ [api/admin/retail-inquiries] 잘못된 문의 유형:",
        inquiry.inquiry_type,
      );
      return NextResponse.json(
        { error: "소매 문의만 조회할 수 있습니다." },
        { status: 403 },
      );
    }

    console.log("✅ [api/admin/retail-inquiries] 문의 상세 조회 성공");
    console.groupEnd();

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("❌ [api/admin/retail-inquiries] 문의 상세 조회 오류:", error);
    console.groupEnd();

    const errorMessage =
      error instanceof Error ? error.message : "문의 조회 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}


