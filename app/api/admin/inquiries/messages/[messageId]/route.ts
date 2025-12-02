/**
 * @file app/api/admin/inquiries/messages/[messageId]/route.ts
 * @description 관리자용 문의 메시지 수정/삭제 API
 *
 * 관리자가 자신이 작성한 문의 메시지를 수정하거나 삭제하는 API 엔드포인트입니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { updateInquiryMessage, deleteInquiryMessage } from "@/lib/supabase/queries/inquiries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    console.group(
      "✏️ [api/admin/inquiries/messages] 관리자용 메시지 수정 API 시작",
    );

    const { messageId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "내용을 입력해주세요." },
        { status: 400 },
      );
    }

    console.log("요청 파라미터:", { messageId });

    const message = await updateInquiryMessage(messageId, content);

    console.log("✅ [api/admin/inquiries/messages] 관리자용 메시지 수정 성공");
    console.groupEnd();

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error(
      "❌ [api/admin/inquiries/messages] 관리자용 메시지 수정 오류:",
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "메시지를 수정하는 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    console.group(
      "🗑️ [api/admin/inquiries/messages] 관리자용 메시지 삭제 API 시작",
    );

    const { messageId } = await params;
    console.log("요청 파라미터:", { messageId });

    await deleteInquiryMessage(messageId);

    console.log("✅ [api/admin/inquiries/messages] 관리자용 메시지 삭제 성공");
    console.groupEnd();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "❌ [api/admin/inquiries/messages] 관리자용 메시지 삭제 오류:",
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "메시지를 삭제하는 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

