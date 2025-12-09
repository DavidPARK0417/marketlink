/**
 * @file app/api/admin/retail-inquiries/route.ts
 * @description 관리자용 소매 문의(소매→도매) 목록 조회 API
 *
 * 관리자 계정이 소매→도매 문의를 조회할 때 사용합니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 * - types/inquiry.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getRetailerInquiriesForAdmin } from "@/lib/supabase/queries/inquiries";
import type { InquiryFilter, GetInquiriesOptions } from "@/types/inquiry";

export async function POST(request: NextRequest) {
  try {
    console.group("🔍 [api/admin/retail-inquiries] 관리자용 소매 문의 목록 조회 시작");

    const body = await request.json();
    const {
      filter = {},
      page = 1,
      pageSize = 20,
      sortOrder = "desc",
      sortBy = "created_at",
    } = body;

    console.log("요청 파라미터:", { filter, page, pageSize, sortOrder, sortBy });

    const options: GetInquiriesOptions = {
      page,
      pageSize,
      sortOrder,
      sortBy,
      filter: filter as InquiryFilter,
    };

    const result = await getRetailerInquiriesForAdmin(options);

    console.log("✅ [api/admin/retail-inquiries] 조회 성공", {
      count: result.inquiries.length,
      total: result.total,
    });
    console.groupEnd();

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ [api/admin/retail-inquiries] 조회 오류:", error);
    console.groupEnd();

    const errorMessage =
      error instanceof Error
        ? error.message
        : "소매 문의를 불러오는 중 오류가 발생했습니다.";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}


