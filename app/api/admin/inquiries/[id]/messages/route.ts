/**
 * @file app/api/admin/inquiries/[id]/messages/route.ts
 * @description 관리자용 문의 대화 히스토리 조회 API
 *
 * 관리자가 문의의 대화 히스토리를 조회하는 API 엔드포인트입니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getInquiryMessages } from "@/lib/supabase/queries/inquiries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.group(
      "🔍 [api/admin/inquiries/messages] 관리자용 대화 히스토리 조회 API 시작",
    );

    const { id: inquiryId } = await params;

    console.log("요청 파라미터:", { inquiryId });

    const messages = await getInquiryMessages(inquiryId);

    console.log("✅ [api/admin/inquiries/messages] 관리자용 대화 히스토리 조회 성공", {
      messageCount: messages.length,
    });
    console.groupEnd();

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error(
      "❌ [api/admin/inquiries/messages] 관리자용 대화 히스토리 조회 오류:",
      error,
    );

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

