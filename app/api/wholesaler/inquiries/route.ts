/**
 * @file app/api/wholesaler/inquiries/route.ts
 * @description 문의 목록 조회 API
 *
 * 도매점의 문의 목록을 조회하는 API 엔드포인트입니다.
 * 관리자 계정으로 접근 시 모든 도매점의 문의를 조회할 수 있습니다.
 *
 * @dependencies
 * - lib/supabase/queries/inquiries.ts
 * - lib/clerk/auth.ts
 * - types/inquiry.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getInquiries } from "@/lib/supabase/queries/inquiries";
import { getUserProfile } from "@/lib/clerk/auth";
import type { InquiryFilter, GetInquiriesOptions } from "@/types/inquiry";

export async function POST(request: NextRequest) {
  try {
    console.group("🔍 [api/inquiries] 문의 목록 조회 API 시작");

    const body = await request.json();
    const { filter = {}, page = 1, pageSize = 20 } = body;

    console.log("요청 파라미터:", { filter, page, pageSize });

    // 사용자 역할 확인
    const profile = await getUserProfile();
    
    if (!profile) {
      console.error("❌ [api/inquiries] 프로필 없음 - 인증되지 않음");
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    console.log("👤 [api/inquiries] 사용자 역할:", profile.role);

    const options: GetInquiriesOptions = {
      page,
      pageSize,
      filter: filter as InquiryFilter,
    };

    // getInquiries 함수가 관리자와 도매점 모두 지원
    // 관리자: 모든 도매점의 retailer_to_wholesaler 문의 조회
    // 도매점: 자신의 retailer_to_wholesaler 문의만 조회
    const result = await getInquiries(options);

    console.log("✅ [api/inquiries] 문의 목록 조회 성공", {
      count: result.inquiries.length,
      total: result.total,
    });
    console.groupEnd();

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ [api/inquiries] 문의 목록 조회 오류:", error);

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
