/**
 * @file app/api/wholesaler/inquiries/to-admin/route.ts
 * @description 도매사업자 → 관리자 문의 목록 조회 API
 *
 * 도매사업자가 관리자에게 보낸 문의 목록을 조회하는 API 엔드포인트입니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 * - types/inquiry.ts
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getInquiriesForAdmin,
  getInquiriesToAdmin,
} from "@/lib/supabase/queries/inquiries";
import { getUserProfile } from "@/lib/clerk/auth";
import type { InquiryFilter, GetInquiriesOptions } from "@/types/inquiry";

export async function POST(request: NextRequest) {
  try {
    console.group("🔍 [api/inquiries/to-admin] 관리자 문의 목록 조회 API 시작");

    const body = await request.json();
    const { filter = {}, page = 1, pageSize = 20, sortOrder = "desc" } = body;

    console.log("요청 파라미터:", { filter, page, pageSize, sortOrder });

    const options: GetInquiriesOptions = {
      page,
      pageSize,
      sortOrder,
      filter: filter as InquiryFilter,
    };

    // 관리자 모드일 때는 모든 도매→관리자 문의를 조회
    const profile = await getUserProfile();

    const isAdmin = profile?.role === "admin";
    console.log("요청자 권한:", profile?.role);

    const result = isAdmin
      ? await getInquiriesForAdmin(options)
      : await getInquiriesToAdmin(options);

    console.log("✅ [api/inquiries/to-admin] 관리자 문의 목록 조회 성공", {
      count: result.inquiries.length,
      total: result.total,
    });
    console.groupEnd();

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "❌ [api/inquiries/to-admin] 관리자 문의 목록 조회 오류:",
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
