import { NextResponse } from "next/server";

/**
 * KAMIS periodProductList API 테스트 엔드포인트
 * 사과 검색 문제 해결을 위한 테스트
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemName = searchParams.get("itemName") || "사과";

  const certId = process.env.KAMIS_CERT_ID || "6836";
  const certKey =
    process.env.KAMIS_CERT_KEY?.trim().replace(/^["']|["']$/g, "") ||
    "0efbb7e6-0d61-4f8e-b617-a7bd50853d70";

  // 날짜 범위 설정
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(today.getDate() - 30);
  const startDay = monthAgo.toISOString().split("T")[0];
  const endDay = today.toISOString().split("T")[0];

  const results: any[] = [];

  // 1. productInfo로 사과의 품목 코드 찾기
  console.log("🔍 [1단계] productInfo로 품목 코드 찾기");
  const productInfoUrl = `http://www.kamis.or.kr/service/price/xml.do?action=productInfo&p_cert_key=${certKey}&p_cert_id=${certId}&p_returntype=json`;

  try {
    const productInfoResponse = await fetch(productInfoUrl, {
      cache: "no-store",
    });
    const productInfoText = await productInfoResponse.text();
    const productInfoData = JSON.parse(productInfoText);

    const appleItems = (productInfoData.info || []).filter((item: any) => {
      const name = (item.itemname || item.itemName || "").toLowerCase();
      return name.includes("사과") || name.includes(itemName.toLowerCase());
    });

    results.push({
      step: "1. productInfo 조회",
      success: true,
      foundItems: appleItems.length,
      items: appleItems.slice(0, 5).map((item: any) => ({
        itemCode: item.itemcode || item.itemCode,
        itemName: item.itemname || item.itemName,
        categoryCode: item.itemcategorycode || item.itemCategoryCode,
        categoryName: item.itemcategoryname || item.itemCategoryName,
      })),
    });

    // 2. 찾은 품목 코드로 periodProductList 테스트
    if (appleItems.length > 0) {
      const testItem = appleItems[0];
      const itemCode = testItem.itemcode || testItem.itemCode;
      const categoryCode =
        testItem.itemcategorycode || testItem.itemCategoryCode;

      console.log(
        `🔍 [2단계] periodProductList 테스트: itemCode=${itemCode}, categoryCode=${categoryCode}`,
      );

      const periodProductUrl = `http://www.kamis.or.kr/service/price/xml.do?action=periodProductList&p_cert_key=${certKey}&p_cert_id=${certId}&p_startday=${startDay}&p_endday=${endDay}&p_itemcategorycode=${categoryCode}&p_itemcode=${itemCode}&p_kindcode=00&p_productrankcode=04&p_countrycode=1101&p_convert_kg_yn=Y&p_returntype=json`;

      try {
        const periodResponse = await fetch(periodProductUrl, {
          cache: "no-store",
        });
        const periodText = await periodResponse.text();
        const periodData = JSON.parse(periodText);

        results.push({
          step: "2. periodProductList 조회",
          success: true,
          itemCode,
          categoryCode,
          requestUrl: periodProductUrl.replace(certKey, "***"),
          responseStructure: {
            hasData: !!periodData.data,
            dataType: Array.isArray(periodData.data)
              ? "array"
              : typeof periodData.data,
            dataLength: Array.isArray(periodData.data)
              ? periodData.data.length
              : 0,
            errorCode: periodData.error_code,
            hasCondition: !!periodData.condition,
          },
          sampleData: Array.isArray(periodData.data)
            ? periodData.data.slice(0, 3)
            : periodData.data,
        });
      } catch (error) {
        results.push({
          step: "2. periodProductList 조회",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // 3. periodWholesaleProductList 테스트 (현재 사용 중인 API)
    // 여러 품목 코드 시도 (과일류 200번대)
    const fruitItemCodes = [
      "211",
      "212",
      "213",
      "214",
      "215",
      "216",
      "217",
      "218",
      "219",
      "220",
    ];
    let foundAppleCode: string | null = null;

    for (const testItemCode of fruitItemCodes) {
      const wholesaleUrl = `http://www.kamis.or.kr/service/price/xml.do?action=periodWholesaleProductList&p_cert_key=${certKey}&p_cert_id=${certId}&p_startday=${startDay}&p_endday=${endDay}&p_itemcategorycode=200&p_itemcode=${testItemCode}&p_kindcode=00&p_productrankcode=04&p_countrycode=1101&p_convert_kg_yn=Y&p_returntype=json`;

      try {
        const wholesaleResponse = await fetch(wholesaleUrl, {
          cache: "no-store",
        });
        const wholesaleText = await wholesaleResponse.text();
        const wholesaleData = JSON.parse(wholesaleText);

        const rawData = wholesaleData.data;
        let items: any[] = [];

        if (rawData?.item && rawData.error_code === "000") {
          items = Array.isArray(rawData.item) ? rawData.item : [rawData.item];
        }

        // 품목명으로 필터링
        const appleItems = items.filter((item: any) => {
          const itemName = (item.itemname || "").toLowerCase();
          return itemName.includes("사과");
        });

        if (appleItems.length > 0) {
          foundAppleCode = testItemCode;
          results.push({
            step: `3. periodWholesaleProductList 조회 (품목 코드 ${testItemCode} - 사과 발견!)`,
            success: true,
            itemCode: testItemCode,
            categoryCode: "200",
            requestUrl: wholesaleUrl.replace(certKey, "***"),
            responseStructure: {
              hasData: !!rawData,
              errorCode: rawData?.error_code,
              hasItem: !!rawData?.item,
            },
            totalItems: items.length,
            appleItems: appleItems.length,
            sampleItems: appleItems.slice(0, 5).map((item: any) => ({
              itemname: item.itemname,
              kindname: item.kindname,
              price: item.price,
              regday: item.regday,
              countyname: item.countyname,
              marketname: item.marketname,
            })),
          });
          break; // 사과를 찾았으면 중단
        } else if (items.length > 0 && rawData?.error_code === "000") {
          // 사과는 아니지만 데이터가 있는 경우 (디버깅용)
          const sampleItemName = items[0]?.itemname || "알 수 없음";
          if (testItemCode === "211" || testItemCode === "212") {
            results.push({
              step: `3. periodWholesaleProductList 조회 (품목 코드 ${testItemCode} - ${sampleItemName})`,
              success: true,
              itemCode: testItemCode,
              categoryCode: "200",
              totalItems: items.length,
              sampleItemName: sampleItemName,
              note: "사과가 아니지만 데이터가 있음",
            });
          }
        }
      } catch (error) {
        // 에러는 무시하고 계속
        continue;
      }
    }

    if (!foundAppleCode) {
      results.push({
        step: "3. periodWholesaleProductList 조회",
        success: false,
        note: "과일류 200번대 코드 중 사과를 찾을 수 없음",
      });
    }
  } catch (error) {
    results.push({
      step: "1. productInfo 조회",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return NextResponse.json({
    testItem: itemName,
    dateRange: { startDay, endDay },
    results,
  });
}
