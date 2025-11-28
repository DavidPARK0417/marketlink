/**
 * @file app/api/admin/inquiries/reply/route.ts
 * @description 관리자용 문의 답변 작성 API
 *
 * 관리자가 도매사업자 문의에 답변을 작성하는 API 엔드포인트입니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { replyToInquiry } from "@/lib/supabase/queries/inquiries";

export async function POST(request: NextRequest) {
  try {
    console.group(
      "📝 [api/admin/inquiries/reply] 관리자용 문의 답변 작성 API 시작",
    );

    const body = await request.json();
    const { inquiry_id, admin_reply } = body;

    if (!inquiry_id || !admin_reply) {
      return NextResponse.json(
        { error: "문의 ID와 답변 내용을 모두 입력해주세요." },
        { status: 400 },
      );
    }

    console.log("요청 파라미터:", { inquiry_id });

    const result = await replyToInquiry({
      inquiry_id,
      admin_reply,
    });

    if (!result.success) {
      console.error(
        "❌ [api/admin/inquiries/reply] 답변 작성 실패:",
        result.error,
      );
      return NextResponse.json(
        { error: result.error || "답변 작성에 실패했습니다." },
        { status: 500 },
      );
    }

    console.log("✅ [api/admin/inquiries/reply] 관리자용 문의 답변 작성 성공");
    console.groupEnd();

    return NextResponse.json({ success: true, inquiry: result.inquiry });
  } catch (error) {
    console.error(
      "❌ [api/admin/inquiries/reply] 관리자용 문의 답변 작성 오류:",
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "답변 작성 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
