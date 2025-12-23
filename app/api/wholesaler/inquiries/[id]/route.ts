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
import { getInquiryById, deleteInquiry, updateInquiryContent } from "@/lib/supabase/queries/inquiries";

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

    // 권한 관련 오류인 경우 403 상태 코드 반환
    const isPermissionError = 
      errorMessage.includes("권한") || 
      errorMessage.includes("권한이 필요") ||
      errorMessage.includes("권한이 없습니다");

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: isPermissionError ? 403 : 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.group("🗑️ [api/wholesaler/inquiries/[id]] 문의글 삭제 API 시작");
    console.log("문의 ID:", id);

    await deleteInquiry(id);

    console.log("✅ [api/wholesaler/inquiries/[id]] 문의글 삭제 성공");
    console.groupEnd();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ [api/wholesaler/inquiries/[id]] 문의글 삭제 오류:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "문의를 삭제하는 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content } = body;

    console.group("✏️ [api/wholesaler/inquiries/[id]] 문의 수정 API 시작");
    console.log("문의 ID:", id);

    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 내용을 모두 입력해주세요." },
        { status: 400 },
      );
    }

    if (typeof title !== "string" || typeof content !== "string") {
      return NextResponse.json(
        { error: "제목과 내용 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length === 0 || trimmedTitle.length > 120) {
      return NextResponse.json(
        { error: "제목은 1~120자 사이로 입력해주세요." },
        { status: 400 },
      );
    }

    if (trimmedContent.length < 10 || trimmedContent.length > 5000) {
      return NextResponse.json(
        { error: "내용은 10자 이상 5000자 이하로 입력해주세요." },
        { status: 400 },
      );
    }

    const updated = await updateInquiryContent(id, {
      title: trimmedTitle,
      content: trimmedContent,
    });

    console.log("✅ [api/wholesaler/inquiries/[id]] 문의 수정 성공");
    console.groupEnd();

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error) {
    console.error("❌ [api/wholesaler/inquiries/[id]] 문의 수정 오류:", error);
    console.groupEnd();

    const errorMessage =
      error instanceof Error ? error.message : "문의를 수정하는 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
