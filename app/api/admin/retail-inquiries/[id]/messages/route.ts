/**
 * @file app/api/admin/retail-inquiries/[id]/messages/route.ts
 * @description 관리자용 소매 문의 대화 히스토리 조회 API
 */

import { NextRequest, NextResponse } from "next/server";

import { getInquiryById, getInquiryMessages } from "@/lib/supabase/queries/inquiries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.group(
      "🔍 [api/admin/retail-inquiries/messages] 대화 히스토리 조회 시작",
    );

    const { id } = await params;
    console.log("요청 파라미터:", { inquiryId: id });

    const inquiry = await getInquiryById(id);
    if (!inquiry) {
      console.warn("⚠️ [api/admin/retail-inquiries/messages] 문의를 찾을 수 없음");
      return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
    }

    if (inquiry.inquiry_type !== "retailer_to_admin") {
      console.error(
        "❌ [api/admin/retail-inquiries/messages] 잘못된 문의 유형:",
        inquiry.inquiry_type,
      );
      return NextResponse.json(
        { error: "소매 문의만 대화 히스토리를 조회할 수 있습니다." },
        { status: 403 },
      );
    }

    const messages = await getInquiryMessages(id);

    console.log(
      "✅ [api/admin/retail-inquiries/messages] 대화 히스토리 조회 성공",
      { messageCount: messages.length },
    );
    console.groupEnd();

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error(
      "❌ [api/admin/retail-inquiries/messages] 대화 히스토리 조회 오류:",
      error,
    );
    console.groupEnd();

    const errorMessage =
      error instanceof Error
        ? error.message
        : "대화 히스토리를 조회하는 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}


