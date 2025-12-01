"server-only";

/**
 * @file lib/api/market-prices.ts
 * @description 시세 조회 API 함수
 *
 * KAMIS Open API dailySalesList를 사용하여 최근일자 도.소매가격정보를 조회합니다.
 * 오늘 거래가 없는 품목의 경우 periodProductList로 최근 기간을 조회하여 최신 시세를 제공합니다.
 */

import { XMLParser } from "fast-xml-parser";
import type { MarketPriceParams, DailyPriceItem, PriceItem } from "./market-prices-types";

/**
 * KAMIS dailySalesList API 호출 함수
 */
async function fetchKAMISDailySales(params: {
  certKey: string;
  certId: string;
  productClsCode?: "01" | "02" | "all";
}): Promise<DailyPriceItem[]> {
  const baseUrl = "http://www.kamis.co.kr/service/price/xml.do";
  
  // 도매/소매 구분 처리
  const productClsCodes: ("01" | "02")[] = 
    params.productClsCode === "01" ? ["01"] :
    params.productClsCode === "02" ? ["02"] :
    ["01", "02"]; // 전체인 경우 둘 다 조회

  const allItems: DailyPriceItem[] = [];

  // 도매/소매 각각 조회
  for (const clsCode of productClsCodes) {
    const queryParams = new URLSearchParams({
      action: "dailySalesList",
      p_cert_key: params.certKey,
      p_cert_id: params.certId,
      p_returntype: "xml",
      p_product_cls_code: clsCode,
    });

    const apiUrl = `${baseUrl}?${queryParams.toString()}`;

    console.log("🔍 [KAMIS dailySalesList] 호출:", apiUrl.replace(params.certKey, "***"));

    try {
      const response = await fetch(apiUrl, {
        cache: "no-store",
        headers: {
          Accept: "application/xml, text/xml",
        },
      });

      if (!response.ok) {
        console.error(`❌ [KAMIS dailySalesList] HTTP ${response.status}`);
        continue; // 하나 실패해도 다른 것은 계속 시도
      }

      const xmlText = await response.text();

      // XML 파싱
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text",
      });

      const parsedData = parser.parse(xmlText);

      // 에러 코드 확인
      const errorCode = parsedData?.document?.error_code;
      if (errorCode && errorCode !== "000") {
        console.warn(`⚠️ [KAMIS dailySalesList] 에러 코드: ${errorCode}`);
        continue;
      }

      // price.item 배열 추출
      const items = parsedData?.document?.price?.item;
      if (!items) {
        console.warn(`⚠️ [KAMIS dailySalesList] 데이터 없음 (${clsCode})`);
        continue;
      }

      // 배열이 아닌 경우 배열로 변환
      const itemArray = Array.isArray(items) ? items : [items];

      // DailyPriceItem 형태로 변환
      const convertedItems: DailyPriceItem[] = itemArray
        .map((item: any) => {
          try {
            // 가격 문자열을 숫자로 변환 (쉼표 제거)
            const parsePrice = (priceStr: string | undefined): number => {
              if (!priceStr) return 0;
              return parseFloat(String(priceStr).replace(/,/g, "")) || 0;
            };

            // 날짜 포맷팅 (YYYYMMDD -> YYYY-MM-DD)
            const formatDate = (dateStr: string | undefined): string => {
              if (!dateStr) return "";
              // YYYY-MM-DD 형식이면 그대로 반환
              if (dateStr.includes("-")) return dateStr;
              // YYYYMMDD 형식이면 변환
              if (dateStr.length === 8) {
                return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
              }
              return "";
            };

            const dailyPriceItem: DailyPriceItem = {
              productClsCode: (item.product_cls_code || clsCode) as "01" | "02",
              productClsName: item.product_cls_name || (clsCode === "01" ? "소매" : "도매"),
              categoryCode: String(item.category_code || ""),
              categoryName: String(item.category_name || ""),
              productno: String(item.productno || ""),
              lastestDay: formatDate(item.lastest_day) || formatDate(item.regday),
              productName: String(item.productName || item.item_name || ""),
              itemName: String(item.item_name || item.productName || ""),
              unit: String(item.unit || ""),
              day1: String(item.day1 || "당일"),
              dpr1: parsePrice(item.dpr1),
              day2: String(item.day2 || "1일전"),
              dpr2: parsePrice(item.dpr2),
              day3: String(item.day3 || "1개월전"),
              dpr3: parsePrice(item.dpr3),
              day4: String(item.day4 || "1년전"),
              dpr4: parsePrice(item.dpr4),
              direction: String(item.direction || "0") as "0" | "1" | "2",
              value: parseFloat(String(item.value || "0")) || 0,
            };

            return dailyPriceItem;
          } catch (error) {
            console.error("❌ 항목 변환 실패:", error);
            return null;
          }
        })
        .filter((item): item is DailyPriceItem => item !== null);

      allItems.push(...convertedItems);
      console.log(`✅ [KAMIS dailySalesList] ${clsCode} 조회 완료: ${convertedItems.length}건`);
    } catch (error) {
      console.error(`❌ [KAMIS dailySalesList] ${clsCode} 호출 실패:`, error);
    }
  }

  return allItems;
}

/**
 * KAMIS productInfo API 호출 함수 - 품목명으로 품목 코드 찾기
 */
async function fetchKAMISProductInfo(params: {
  certKey: string;
  certId: string;
  itemName: string;
}): Promise<Array<{
  itemCode: string;
  itemName: string;
  categoryCode: string;
  categoryName: string;
}>> {
  const baseUrl = "http://www.kamis.co.kr/service/price/xml.do";
  const queryParams = new URLSearchParams({
    action: "productInfo",
    p_cert_key: params.certKey,
    p_cert_id: params.certId,
    p_returntype: "json",
  });

  const apiUrl = `${baseUrl}?${queryParams.toString()}`;

  console.log("🔍 [KAMIS productInfo] 호출:", apiUrl.replace(params.certKey, "***"));

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`❌ [KAMIS productInfo] HTTP ${response.status}`);
      return [];
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    // 에러 코드 확인
    if (data.error_code && data.error_code !== "000") {
      console.warn(`⚠️ [KAMIS productInfo] 에러 코드: ${data.error_code}`);
      return [];
    }

    const items: Array<{
      itemCode: string;
      itemName: string;
      categoryCode: string;
      categoryName: string;
    }> = [];

    // 품목 정보 추출
    if (data.info && Array.isArray(data.info)) {
      const keyword = params.itemName.toLowerCase().trim();
      const seen = new Set<string>();

      for (const item of data.info) {
        const itemCode = String(item.itemcode || item.itemCode || "");
        const itemName = String(item.itemname || item.itemName || "");
        const categoryCode = String(item.itemcategorycode || item.itemCategoryCode || "");
        const categoryName = String(item.itemcategoryname || item.itemCategoryName || "");

        // 검색어와 매칭되는 품목만 추가
        if (itemCode && itemName && itemName.toLowerCase().includes(keyword)) {
          const key = `${itemCode}_${categoryCode}`;
          if (!seen.has(key)) {
            seen.add(key);
            items.push({
              itemCode,
              itemName,
              categoryCode,
              categoryName,
            });
          }
        }
      }
    }

    console.log(`✅ [KAMIS productInfo] 품목 코드 찾기 완료: ${items.length}개`);
    return items;
  } catch (error) {
    console.error("❌ [KAMIS productInfo] 호출 실패:", error);
    return [];
  }
}

/**
 * KAMIS periodProductList API 호출 함수 - 기간별 상품 조회
 */
async function fetchKAMISPeriodProduct(params: {
  certKey: string;
  certId: string;
  itemCode: string;
  categoryCode: string;
  startDay: string; // YYYY-MM-DD
  endDay: string; // YYYY-MM-DD
  productClsCode: "01" | "02"; // "01": 소매, "02": 도매
}): Promise<DailyPriceItem[]> {
  const baseUrl = "http://www.kamis.co.kr/service/price/xml.do";
  
  // 도매/소매에 따라 다른 액션 사용
  const action = params.productClsCode === "02" 
    ? "periodWholesaleProductList" 
    : "periodProductList";

  const queryParams = new URLSearchParams({
    action,
    p_cert_key: params.certKey,
    p_cert_id: params.certId,
    p_startday: params.startDay.replace(/-/g, ""), // YYYYMMDD 형식
    p_endday: params.endDay.replace(/-/g, ""), // YYYYMMDD 형식
    p_itemcategorycode: params.categoryCode,
    p_itemcode: params.itemCode,
    p_kindcode: "00", // 전체
    p_productrankcode: "04", // 전체
    p_countrycode: "1101", // 서울
    p_convert_kg_yn: "Y",
    p_returntype: "json",
  });

  const apiUrl = `${baseUrl}?${queryParams.toString()}`;

  console.log("🔍 [KAMIS periodProductList] 호출:", apiUrl.replace(params.certKey, "***"));

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`❌ [KAMIS periodProductList] HTTP ${response.status}`);
      return [];
    }

    const responseText = await response.text();
    const data = JSON.parse(responseText);

    // 에러 코드 확인
    if (data.error_code && data.error_code !== "000") {
      console.warn(`⚠️ [KAMIS periodProductList] 에러 코드: ${data.error_code}`);
      return [];
    }

    const items: DailyPriceItem[] = [];

    // 응답 구조 파싱 (periodProductList와 periodWholesaleProductList 구조가 다를 수 있음)
    let rawItems: any[] = [];
    
    if (data.data?.item) {
      rawItems = Array.isArray(data.data.item) ? data.data.item : [data.data.item];
    } else if (Array.isArray(data.data)) {
      rawItems = data.data;
    }

    // 가격 문자열을 숫자로 변환
    const parsePrice = (priceStr: string | undefined): number => {
      if (!priceStr) return 0;
      return parseFloat(String(priceStr).replace(/,/g, "")) || 0;
    };

    // 날짜 포맷팅 (YYYYMMDD -> YYYY-MM-DD)
    const formatDate = (dateStr: string | undefined): string => {
      if (!dateStr) return "";
      if (dateStr.includes("-")) return dateStr;
      if (dateStr.length === 8) {
        return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
      }
      return "";
    };

    // DailyPriceItem 형태로 변환
    for (const item of rawItems) {
      try {
        const regday = formatDate(item.regday || item.regDay || item.date);
        const price = parsePrice(item.price || item.dpr1 || item.avgPrice);

        if (!regday || !price) continue;

        const dailyPriceItem: DailyPriceItem = {
          productClsCode: params.productClsCode,
          productClsName: params.productClsCode === "01" ? "소매" : "도매",
          categoryCode: params.categoryCode,
          categoryName: item.itemcategoryname || item.categoryName || "",
          productno: params.itemCode,
          lastestDay: regday,
          productName: item.itemname || item.itemName || "",
          itemName: item.itemname || item.itemName || "",
          unit: item.unit || item.unitname || item.unitName || "",
          day1: regday,
          dpr1: price,
          day2: "",
          dpr2: 0,
          day3: "",
          dpr3: 0,
          day4: "",
          dpr4: 0,
          direction: "0" as const,
          value: 0,
        };

        items.push(dailyPriceItem);
      } catch (error) {
        console.error("❌ 항목 변환 실패:", error);
      }
    }

    console.log(`✅ [KAMIS periodProductList] 조회 완료: ${items.length}건`);
    return items;
  } catch (error) {
    console.error("❌ [KAMIS periodProductList] 호출 실패:", error);
    return [];
  }
}

/**
 * 시세 조회 함수 (dailySalesList + 폴백)
 * 오늘 거래가 없는 품목의 경우 최근 기간을 조회하여 최신 시세를 제공합니다.
 */
export async function getDailyMarketPrices(
  params: MarketPriceParams = {},
): Promise<DailyPriceItem[]> {
  const certId = process.env.KAMIS_CERT_ID;
  const certKey = process.env.KAMIS_CERT_KEY?.trim().replace(
    /^["']|["']$/g,
    "",
  );

  if (!certId || !certKey) {
    throw new Error(
      "KAMIS API 인증 정보가 설정되지 않았습니다. KAMIS_CERT_ID와 KAMIS_CERT_KEY를 확인하세요.",
    );
  }

  console.log("📊 [시세 조회] 파라미터:", {
    itemName: params.itemName || "전체",
    productClsCode: params.productClsCode || "전체",
  });

  // 1단계: KAMIS API 호출 (오늘 거래된 상품)
  let items = await fetchKAMISDailySales({
    certKey,
    certId,
    productClsCode: params.productClsCode,
  });

  // 품목명 필터링 (있는 경우)
  if (params.itemName) {
    const keyword = params.itemName.toLowerCase().trim();
    items = items.filter((item) => {
      const productName = (item.productName || "").toLowerCase();
      const itemName = (item.itemName || "").toLowerCase();
      return productName.includes(keyword) || itemName.includes(keyword);
    });
  }

  // 2단계: 검색어가 있고 결과가 없으면 폴백 (최근 기간 조회)
  if (params.itemName && items.length === 0) {
    console.log("🔄 [시세 조회] 오늘 거래 없음, 최근 기간 조회 시도...");

    // 품목 코드 찾기
    const productInfos = await fetchKAMISProductInfo({
      certKey,
      certId,
      itemName: params.itemName,
    });

    if (productInfos.length > 0) {
      // 날짜 범위 설정 (최근 1년)
      const today = new Date();
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
      const startDay = yearAgo.toISOString().split("T")[0];
      const endDay = today.toISOString().split("T")[0];

      // 도매/소매 구분 처리
      const productClsCodes: ("01" | "02")[] = 
        params.productClsCode === "01" ? ["01"] :
        params.productClsCode === "02" ? ["02"] :
        ["01", "02"];

      const periodItems: DailyPriceItem[] = [];

      // 각 품목 코드와 도매/소매 조합으로 조회
      for (const productInfo of productInfos.slice(0, 5)) { // 최대 5개만 시도
        for (const clsCode of productClsCodes) {
          const periodResults = await fetchKAMISPeriodProduct({
            certKey,
            certId,
            itemCode: productInfo.itemCode,
            categoryCode: productInfo.categoryCode,
            startDay,
            endDay,
            productClsCode: clsCode,
          });

          periodItems.push(...periodResults);
        }
      }

      // 가장 최신 날짜의 데이터만 필터링
      if (periodItems.length > 0) {
        // 날짜별로 그룹화
        const itemsByDate = new Map<string, DailyPriceItem[]>();
        for (const item of periodItems) {
          const date = item.lastestDay;
          if (!itemsByDate.has(date)) {
            itemsByDate.set(date, []);
          }
          itemsByDate.get(date)!.push(item);
        }

        // 가장 최신 날짜 찾기
        const latestDate = Array.from(itemsByDate.keys()).sort().reverse()[0];
        if (latestDate) {
          items = itemsByDate.get(latestDate)!;
          console.log(`✅ [시세 조회] 최신 시세 발견: ${latestDate} (${items.length}건)`);
        }
      }
    }
  }

  // lastestDay 기준 내림차순 정렬
  items.sort((a, b) => {
    if (a.lastestDay > b.lastestDay) return -1;
    if (a.lastestDay < b.lastestDay) return 1;
    return 0;
  });

  console.log("✅ [시세 조회] 완료:", items.length, "건");
  return items;
}

/**
 * 기존 호환성을 위한 함수 (하위 호환성 유지)
 */
export async function getMarketPrices(
  params: MarketPriceParams = {},
): Promise<PriceItem[]> {
  // dailySalesList를 사용하도록 변경
  const dailyItems = await getDailyMarketPrices(params);
  
  // PriceItem 형태로 변환 (기존 인터페이스 유지)
  return dailyItems.map((item) => ({
    cfmtnYmd: item.lastestDay,
    itemName: item.productName,
    varietyName: item.categoryName,
    marketName: item.productClsName,
    avgPrice: item.dpr1,
    unitName: item.unit,
    source: "kamis" as const,
  }));
}
