/**
 * @file app/api/admin/inquiries/route.ts
 * @description 관리자용 도매 문의 목록 조회 API
 *
 * 관리자가 모든 도매사업자로부터 받은 문의 목록을 조회하는 API 엔드포인트입니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 * - types/inquiry.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getInquiriesForAdmin } from "@/lib/supabase/queries/inquiries";
import type { InquiryFilter, GetInquiriesOptions } from "@/types/inquiry";

export async function POST(request: NextRequest) {
  try {
    console.group("🔍 [api/admin/inquiries] 관리자용 문의 목록 조회 API 시작");

    const body = await request.json();
    const { filter = {}, page = 1, pageSize = 20 } = body;

    console.log("요청 파라미터:", { filter, page, pageSize });

    const options: GetInquiriesOptions = {
      page,
      pageSize,
      filter: filter as InquiryFilter,
    };

    const result = await getInquiriesForAdmin(options);

    console.log("✅ [api/admin/inquiries] 관리자용 문의 목록 조회 성공", {
      count: result.inquiries.length,
      total: result.total,
    });
    console.groupEnd();

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "❌ [api/admin/inquiries] 관리자용 문의 목록 조회 오류:",
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "문의 목록을 불러오는 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
