/**
 * @file app/api/wholesaler/inquiries/[id]/follow-up/route.ts
 * @description 문의 추가 질문 작성 API
 *
 * 문의자가 답변을 받은 후 추가 질문을 작성하는 API 엔드포인트입니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { addInquiryMessage } from "@/lib/supabase/queries/inquiries";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.group(
      "📝 [api/wholesaler/inquiries/follow-up] 추가 질문 작성 API 시작",
    );

    const { id: inquiryId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "질문 내용을 입력해주세요." },
        { status: 400 },
      );
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: "질문 내용은 최소 10자 이상 입력해주세요." },
        { status: 400 },
      );
    }

    if (content.trim().length > 5000) {
      return NextResponse.json(
        { error: "질문 내용은 최대 5000자까지 입력할 수 있습니다." },
        { status: 400 },
      );
    }

    console.log("요청 파라미터:", { inquiryId });

    const message = await addInquiryMessage(inquiryId, content, "user");

    console.log("✅ [api/wholesaler/inquiries/follow-up] 추가 질문 작성 성공");
    console.groupEnd();

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error(
      "❌ [api/wholesaler/inquiries/follow-up] 추가 질문 작성 오류:",
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "추가 질문 작성 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

