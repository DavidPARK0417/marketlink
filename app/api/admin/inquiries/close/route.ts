/**
 * @file app/api/admin/inquiries/close/route.ts
 * @description 관리자용 문의 종료 API
 *
 * 관리자가 문의를 종료하는 API 엔드포인트입니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { closeInquiry } from "@/lib/supabase/queries/inquiries";

export async function POST(request: NextRequest) {
  try {
    console.group(
      "🔒 [api/admin/inquiries/close] 관리자용 문의 종료 API 시작",
    );

    const body = await request.json();
    const { inquiry_id } = body;

    if (!inquiry_id) {
      return NextResponse.json(
        { error: "문의 ID는 필수입니다." },
        { status: 400 },
      );
    }

    console.log("요청 파라미터:", { inquiry_id });

    const inquiry = await closeInquiry(inquiry_id);

    console.log("✅ [api/admin/inquiries/close] 관리자용 문의 종료 성공");
    console.groupEnd();

    return NextResponse.json({ success: true, inquiry });
  } catch (error) {
    console.error(
      "❌ [api/admin/inquiries/close] 관리자용 문의 종료 오류:",
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "문의 종료 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

