/**
 * @file app/api/market-prices/route.ts
 * @description 시세 조회 API Route
 */

import { NextResponse } from "next/server";
import { getDailyMarketPrices } from "@/lib/api/market-prices";
import type { MarketPriceParams } from "@/lib/api/market-prices-types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const params: MarketPriceParams = {
      itemName: searchParams.get("itemName") || undefined,
      productClsCode:
        (searchParams.get("productClsCode") as "01" | "02" | "all") ||
        undefined,
      countyCode: searchParams.get("countyCode") || undefined,
    };

    console.log("📊 [API] 시세 조회 요청:", params);

    const data = await getDailyMarketPrices(params);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("❌ [API] 시세 조회 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
}
