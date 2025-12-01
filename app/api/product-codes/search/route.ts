/**
 * @file app/api/product-codes/search/route.ts
 * @description 코드표 검색 API Route
 *
 * 품목명으로 코드표를 검색하여 자동완성 기능을 제공합니다.
 */

import { NextResponse } from "next/server";
import { searchProductCodes } from "@/lib/supabase/queries/product-codes";

/**
 * GET /api/product-codes/search
 * 코드표 검색 (자동완성용)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || "";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!keyword || keyword.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const codes = await searchProductCodes(keyword, limit);

    return NextResponse.json({
      success: true,
      data: codes,
      count: codes.length,
    });
  } catch (error) {
    console.error("❌ [코드표 검색] 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "코드표 검색 실패",
        data: [],
      },
      { status: 500 },
    );
  }
}
