/**
 * @file app/api/wholesaler/inquiries/reply/route.ts
 * @description 문의 답변 작성 API
 *
 * 도매점이 문의에 답변을 작성하는 API 엔드포인트입니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 * - types/inquiry.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { replyToInquiry } from "@/lib/supabase/queries/inquiries";
import type { ReplyInquiryRequest } from "@/types/inquiry";

export async function POST(request: NextRequest) {
  try {
    console.group("🔍 [api/inquiries/reply] 문의 답변 작성 API 시작");

    const body = await request.json();
    const { inquiry_id, admin_reply } = body;

    if (!inquiry_id || !admin_reply) {
      return NextResponse.json(
        { error: "문의 ID와 답변 내용은 필수입니다." },
        { status: 400 },
      );
    }

    console.log("요청 파라미터:", { inquiry_id });

    const requestData: ReplyInquiryRequest = {
      inquiry_id,
      admin_reply,
    };

    const result = await replyToInquiry(requestData);

    console.log("✅ [api/inquiries/reply] 문의 답변 작성 성공");
    console.groupEnd();

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ [api/inquiries/reply] 문의 답변 작성 오류:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "답변을 작성하는 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
