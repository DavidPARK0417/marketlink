/**
 * @file app/api/ai/standardize/route.ts
 * @description AI 상품명 표준화 API 엔드포인트
 *
 * 클라이언트에서 호출하는 상품명 표준화 API입니다.
 * 서버 사이드에서 Gemini API를 호출하여 상품명을 표준화합니다.
 *
 * 요청 형식:
 * POST /api/ai/standardize
 * Body: { productName: string }
 *
 * 응답 형식:
 * {
 *   success: boolean;
 *   data?: StandardizeResult;
 *   error?: string;
 * }
 *
 * @dependencies
 * - @clerk/nextjs/server (auth)
 * - lib/api/ai-standardize.ts (standardizeProductName)
 * - lib/clerk/auth.ts (getUserProfile)
 * - lib/supabase/server.ts (createClerkSupabaseClient)
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { standardizeProductName } from "@/lib/api/ai-standardize";
import { getUserProfile } from "@/lib/clerk/auth";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * AI 상품명 표준화 API 엔드포인트
 *
 * POST /api/ai/standardize
 */
export async function POST(request: Request) {
  try {
    console.group("🔄 [api/ai/standardize] 표준화 요청 시작");

    // 1. Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.error("❌ [api/ai/standardize] 인증 실패: userId 없음");
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    console.log("✅ [api/ai/standardize] Clerk userId:", userId);

    // 2. 도매점 역할 확인
    const profile = await getUserProfile();

    if (!profile) {
      console.error("❌ [api/ai/standardize] 프로필 없음");
      return NextResponse.json(
        { success: false, error: "프로필을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (profile.role !== "wholesaler") {
      console.error("❌ [api/ai/standardize] 도매점 역할 아님:", profile.role);
      return NextResponse.json(
        { success: false, error: "도매점 회원만 사용할 수 있는 기능입니다." },
        { status: 403 },
      );
    }

    // 3. 도매점 ID 조회
    const supabase = createClerkSupabaseClient();
    const { data: wholesaler, error: wholesalerError } = await supabase
      .from("wholesalers")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (wholesalerError || !wholesaler) {
      console.error("❌ [api/ai/standardize] 도매점 정보 조회 실패:", wholesalerError);
      return NextResponse.json(
        { success: false, error: "도매점 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    console.log("✅ [api/ai/standardize] 도매점 ID:", wholesaler.id);

    // 4. 요청 본문 파싱
    const body = await request.json();
    const { productName } = body;

    if (!productName || typeof productName !== "string") {
      console.error("❌ [api/ai/standardize] 잘못된 요청: productName 없음");
      return NextResponse.json(
        { success: false, error: "상품명을 입력해주세요." },
        { status: 400 },
      );
    }

    console.log("📝 [api/ai/standardize] 상품명:", productName);

    // 5. 표준화 함수 호출
    try {
      const result = await standardizeProductName(productName, wholesaler.id);

      console.log("✅ [api/ai/standardize] 표준화 완료");
      console.groupEnd();

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      // Rate limit 에러 처리
      if (
        error instanceof Error &&
        error.message.includes("API 호출 한도가 초과")
      ) {
        console.error("❌ [api/ai/standardize] Rate limit 초과");
        console.groupEnd();
        return NextResponse.json(
          {
            success: false,
            error: "잠시 후 다시 시도해주세요. (API 호출 한도 초과)",
          },
          { status: 429 },
        );
      }

      // 기타 에러
      console.error("❌ [api/ai/standardize] 표준화 오류:", error);
      console.groupEnd();
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ [api/ai/standardize] 예상치 못한 오류:", error);
    console.groupEnd();
    return NextResponse.json(
      {
        success: false,
        error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

