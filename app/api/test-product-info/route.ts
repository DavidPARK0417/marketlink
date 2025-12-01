import { NextResponse } from "next/server";

/**
 * KAMIS productInfo API 테스트 엔드포인트
 * 실제 API 응답 구조를 확인하기 위한 테스트용
 */
export async function GET() {
  const certId = process.env.KAMIS_CERT_ID;
  const certKey = process.env.KAMIS_CERT_KEY?.trim().replace(
    /^["']|["']$/g,
    "",
  );

  if (!certId || !certKey) {
    return NextResponse.json(
      { error: "KAMIS API 인증 정보가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const baseUrl = "http://www.kamis.or.kr/service/price/xml.do";
  const params = new URLSearchParams({
    action: "productInfo",
    p_cert_key: certKey,
    p_cert_id: certId,
    p_returntype: "json",
  });

  const apiUrl = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API 호출 실패: ${response.status} ${response.statusText}` },
        { status: response.status },
      );
    }

    const responseText = await response.text();
    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      return NextResponse.json(
        {
          error: "JSON 파싱 실패",
          responseText: responseText.substring(0, 500),
          contentType: response.headers.get("content-type"),
        },
        { status: 500 },
      );
    }

    // 품목 정보 추출
    const items: Array<{
      itemCode: string;
      itemName: string;
      categoryCode: string;
      categoryName: string;
    }> = [];

    if (data.info && Array.isArray(data.info)) {
      const seen = new Set<string>();
      for (const item of data.info) {
        const itemCode = item.itemcode || item.itemCode;
        const itemName = item.itemname || item.itemName;
        const categoryCode = item.itemcategorycode || item.itemCategoryCode;
        const categoryName = item.itemcategoryname || item.itemCategoryName;

        if (itemCode && itemName) {
          const key = `${itemCode}_${itemName}`;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({
              itemCode: String(itemCode),
              itemName: String(itemName),
              categoryCode: String(categoryCode || ""),
              categoryName: String(categoryName || ""),
            });
          }
        }
      }
    }

    // "사과" 검색 테스트
    const appleItems = items.filter(
      (item) =>
        item.itemName.includes("사과") ||
        item.itemName.toLowerCase().includes("사과"),
    );

    // 과일류(200) 전체 확인
    const fruitItems = items.filter((item) => item.categoryCode === "200");

    // 과일류 품목명 샘플 (사과 찾기)
    const fruitItemNames = fruitItems.slice(0, 20).map((item) => ({
      itemCode: item.itemCode,
      itemName: item.itemName,
      categoryCode: item.categoryCode,
    }));

    return NextResponse.json({
      success: true,
      totalItems: items.length,
      appleItems: appleItems.length,
      sampleAppleItems: appleItems.slice(0, 5),
      fruitItemsCount: fruitItems.length,
      fruitItemNames: fruitItemNames,
      sampleItems: items.slice(0, 10),
      responseStructure: {
        hasInfo: !!data.info,
        infoIsArray: Array.isArray(data.info),
        infoLength: Array.isArray(data.info) ? data.info.length : 0,
        errorCode: data.error_code,
        hasCondition: !!data.condition,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "API 호출 중 오류 발생",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
