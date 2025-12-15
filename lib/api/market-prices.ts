"server-only";

/**
 * @file lib/api/market-prices.ts
 * @description 시세 조회 API 함수
 *
 * KAMIS Open API dailySalesList를 사용하여 최근일자 도.소매가격정보를 조회합니다.
 * 오늘 거래가 없는 품목의 경우 periodProductList로 최근 기간을 조회하여 최신 시세를 제공합니다.
 */

import { XMLParser } from "fast-xml-parser";
import type {
  MarketPriceParams,
  DailyPriceItem,
  PriceItem,
  PriceTrendItem,
} from "./market-prices-types";

/**
 * KAMIS dailyCountyList API 호출 함수
 * 지역별 최근일자 도.소매가격정보 조회
 */
async function fetchKAMISDailyCountyList(params: {
  certKey: string;
  certId: string;
  productClsCode: "01" | "02";
  countyCode: string;
}): Promise<DailyPriceItem[]> {
  const baseUrl = "http://www.kamis.or.kr/service/price/xml.do";

  const queryParams = new URLSearchParams({
    action: "dailyCountyList",
    p_cert_key: params.certKey,
    p_cert_id: params.certId,
    p_returntype: "xml",
    p_countycode: params.countyCode,
  });

  const apiUrl = `${baseUrl}?${queryParams.toString()}`;

  console.log(
    "🔍 [KAMIS dailyCountyList] 호출:",
    apiUrl.replace(params.certKey, "***"),
  );

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/xml, text/xml",
      },
    });

    if (!response.ok) {
      console.error(`❌ [KAMIS dailyCountyList] HTTP ${response.status}`);
      return [];
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
    const errorCode = parsedData?.document?.result_code;
    if (errorCode && errorCode !== "0") {
      console.warn(`⚠️ [KAMIS dailyCountyList] 에러 코드: ${errorCode}`);
      return [];
    }

    // price.item 배열 추출
    const items = parsedData?.document?.price?.item;
    if (!items) {
      console.warn(`⚠️ [KAMIS dailyCountyList] 데이터 없음`);
      return [];
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
              return `${dateStr.substring(0, 4)}-${dateStr.substring(
                4,
                6,
              )}-${dateStr.substring(6, 8)}`;
            }
            return "";
          };

          // 가격 파싱
          const dpr1 = parsePrice(item.dpr1);
          const dpr2 = parsePrice(item.dpr2);

          // direction과 value 계산
          let direction: "0" | "1" | "2" = String(item.direction || "0") as "0" | "1" | "2";
          let value = parseFloat(String(item.value || "0")) || 0;

          // 가격 데이터가 있으면 항상 실제 가격 비교로 계산 (API 값보다 우선)
          if (dpr1 > 0 && dpr2 > 0) {
            const changeRate = ((dpr1 - dpr2) / dpr2) * 100;
            if (Math.abs(changeRate) < 0.01) {
              // 변화가 거의 없으면 보합 (0.01% 미만)
              direction = "0";
              value = 0;
            } else if (changeRate > 0) {
              // 상승
              direction = "1";
              value = Math.abs(changeRate);
            } else {
              // 하락
              direction = "2";
              value = Math.abs(changeRate);
            }
          }

          const dailyPriceItem: DailyPriceItem = {
            productClsCode: params.productClsCode,
            productClsName: params.productClsCode === "01" ? "소매" : "도매",
            categoryCode: String(item.category_code || ""),
            categoryName: String(item.category_name || ""),
            productno: String(item.productno || ""),
            lastestDay: formatDate(
              item.lastest_date || item.lastest_day || item.day1,
            ),
            productName: String(item.productName || item.item_name || ""),
            itemName: String(item.item_name || item.productName || ""),
            unit: String(item.unit || ""),
            day1: String(item.day1 || "당일"),
            dpr1,
            day2: String(item.day2 || "1일전"),
            dpr2,
            day3: String(item.day3 || "1개월전"),
            dpr3: parsePrice(item.dpr3),
            day4: String(item.day4 || "1년전"),
            dpr4: parsePrice(item.dpr4),
            direction,
            value,
          };

          return dailyPriceItem;
        } catch (error) {
          console.error("❌ 항목 변환 실패:", error);
          return null;
        }
      })
      .filter((item): item is DailyPriceItem => item !== null);

    console.log(
      `✅ [KAMIS dailyCountyList] 조회 완료: ${convertedItems.length}건`,
    );
    return convertedItems;
  } catch (error) {
    console.error("❌ [KAMIS dailyCountyList] 호출 실패:", error);
    return [];
  }
}

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
    params.productClsCode === "01"
      ? ["01"]
      : params.productClsCode === "02"
      ? ["02"]
      : ["01", "02"]; // 전체인 경우 둘 다 조회

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

    console.log(
      "🔍 [KAMIS dailySalesList] 호출:",
      apiUrl.replace(params.certKey, "***"),
    );

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
                return `${dateStr.substring(0, 4)}-${dateStr.substring(
                  4,
                  6,
                )}-${dateStr.substring(6, 8)}`;
              }
              return "";
            };

            // 가격 파싱
            const dpr1 = parsePrice(item.dpr1);
            const dpr2 = parsePrice(item.dpr2);

            // direction과 value 계산
            let direction: "0" | "1" | "2" = String(item.direction || "0") as "0" | "1" | "2";
            let value = parseFloat(String(item.value || "0")) || 0;

            // 가격 데이터가 있으면 항상 실제 가격 비교로 계산 (API 값보다 우선)
            if (dpr1 > 0 && dpr2 > 0) {
              const changeRate = ((dpr1 - dpr2) / dpr2) * 100;
              if (Math.abs(changeRate) < 0.01) {
                // 변화가 거의 없으면 보합 (0.01% 미만)
                direction = "0";
                value = 0;
              } else if (changeRate > 0) {
                // 상승
                direction = "1";
                value = Math.abs(changeRate);
              } else {
                // 하락
                direction = "2";
                value = Math.abs(changeRate);
              }
            }

            const dailyPriceItem: DailyPriceItem = {
              productClsCode: (item.product_cls_code || clsCode) as "01" | "02",
              productClsName:
                item.product_cls_name || (clsCode === "01" ? "소매" : "도매"),
              categoryCode: String(item.category_code || ""),
              categoryName: String(item.category_name || ""),
              productno: String(item.productno || ""),
              lastestDay:
                formatDate(item.lastest_day) || formatDate(item.regday),
              productName: String(item.productName || item.item_name || ""),
              itemName: String(item.item_name || item.productName || ""),
              unit: String(item.unit || ""),
              day1: String(item.day1 || "당일"),
              dpr1,
              day2: String(item.day2 || "1일전"),
              dpr2,
              day3: String(item.day3 || "1개월전"),
              dpr3: parsePrice(item.dpr3),
              day4: String(item.day4 || "1년전"),
              dpr4: parsePrice(item.dpr4),
              direction,
              value,
            };

            return dailyPriceItem;
          } catch (error) {
            console.error("❌ 항목 변환 실패:", error);
            return null;
          }
        })
        .filter((item): item is DailyPriceItem => item !== null);

      allItems.push(...convertedItems);
      console.log(
        `✅ [KAMIS dailySalesList] ${clsCode} 조회 완료: ${convertedItems.length}건`,
      );
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
}): Promise<
  Array<{
    itemCode: string;
    itemName: string;
    categoryCode: string;
    categoryName: string;
  }>
> {
  const baseUrl = "http://www.kamis.co.kr/service/price/xml.do";
  const queryParams = new URLSearchParams({
    action: "productInfo",
    p_cert_key: params.certKey,
    p_cert_id: params.certId,
    p_returntype: "json",
  });

  const apiUrl = `${baseUrl}?${queryParams.toString()}`;

  console.log(
    "🔍 [KAMIS productInfo] 호출:",
    apiUrl.replace(params.certKey, "***"),
  );

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
        const categoryCode = String(
          item.itemcategorycode || item.itemCategoryCode || "",
        );
        const categoryName = String(
          item.itemcategoryname || item.itemCategoryName || "",
        );

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

    console.log(
      `✅ [KAMIS productInfo] 품목 코드 찾기 완료: ${items.length}개`,
    );
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
  const action =
    params.productClsCode === "02"
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

  console.log(
    "🔍 [KAMIS periodProductList] 호출:",
    apiUrl.replace(params.certKey, "***"),
  );

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
      console.warn(
        `⚠️ [KAMIS periodProductList] 에러 코드: ${data.error_code}`,
      );
      return [];
    }

    const items: DailyPriceItem[] = [];

    // 응답 구조 파싱 (periodProductList와 periodWholesaleProductList 구조가 다를 수 있음)
    let rawItems: any[] = [];

    if (data.data?.item) {
      rawItems = Array.isArray(data.data.item)
        ? data.data.item
        : [data.data.item];
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
        return `${dateStr.substring(0, 4)}-${dateStr.substring(
          4,
          6,
        )}-${dateStr.substring(6, 8)}`;
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

  // 기본값: 도매("02")로 고정
  const productClsCode = params.productClsCode || "02";

  console.log("📊 [시세 조회] 파라미터:", {
    itemName: params.itemName || "전체",
    productClsCode: productClsCode,
    countyCode: params.countyCode || "없음",
  });

  let items: DailyPriceItem[] = [];

  // 지역 코드가 있으면 dailyCountyList 사용, 없으면 dailySalesList 사용
  if (params.countyCode) {
    // 도매("02")만 조회
    const countyItems = await fetchKAMISDailyCountyList({
      certKey,
      certId,
      productClsCode: "02",
      countyCode: params.countyCode,
    });
    items.push(...countyItems);
  } else {
    // 1단계: KAMIS API 호출 (오늘 거래된 상품) - 도매만
    items = await fetchKAMISDailySales({
      certKey,
      certId,
      productClsCode: "02",
    });
  }

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

      const periodItems: DailyPriceItem[] = [];

      // 각 품목 코드로 도매만 조회
      for (const productInfo of productInfos.slice(0, 5)) {
        // 최대 5개만 시도
        const periodResults = await fetchKAMISPeriodProduct({
          certKey,
          certId,
          itemCode: productInfo.itemCode,
          categoryCode: productInfo.categoryCode,
          startDay,
          endDay,
          productClsCode: "02", // 도매만
        });

        periodItems.push(...periodResults);
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
          console.log(
            `✅ [시세 조회] 최신 시세 발견: ${latestDate} (${items.length}건)`,
          );
        }
      }
    }
  }

  // 정렬: 검색어가 있을 때는 정확히 일치하는 항목을 우선, 그 다음 날짜 기준 내림차순
  if (params.itemName) {
    const keyword = params.itemName.toLowerCase().trim();
    
    items.sort((a, b) => {
      // 정확히 일치하는 항목을 우선순위로
      const aProductName = (a.productName || "").toLowerCase();
      const aItemName = (a.itemName || "").toLowerCase();
      const bProductName = (b.productName || "").toLowerCase();
      const bItemName = (b.itemName || "").toLowerCase();
      
      // 우선순위 계산 함수
      const getPriority = (productName: string, itemName: string): number => {
        // 1순위: 정확히 일치
        if (productName === keyword || itemName === keyword) return 1;
        
        // 2순위: 검색어로 시작하고, 검색어 다음 문자가 특수문자이거나 끝나는 경우
        // 예: "배/신고", "배(부사)", "배 " 등
        const checkStartsWithBoundary = (name: string): boolean => {
          if (!name.startsWith(keyword)) return false;
          const nextChar = name[keyword.length];
          // 검색어 다음 문자가 없거나(끝), 특수문자(/, (, 공백 등)인 경우
          return !nextChar || /[\/\(\)\s\-]/.test(nextChar);
        };
        
        if (checkStartsWithBoundary(productName) || checkStartsWithBoundary(itemName)) {
          return 2;
        }
        
        // 3순위: 검색어를 포함하지만 단어 경계가 아닌 경우 (예: "배추", "양배추")
        if (productName.includes(keyword) || itemName.includes(keyword)) return 3;
        
        return 999; // 매칭 안 됨
      };
      
      const aPriority = getPriority(aProductName, aItemName);
      const bPriority = getPriority(bProductName, bItemName);
      
      // 우선순위가 높은 항목을 먼저
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // 같은 우선순위면 날짜 기준 내림차순
      if (a.lastestDay > b.lastestDay) return -1;
      if (a.lastestDay < b.lastestDay) return 1;
      
      return 0;
    });
  } else {
    // 검색어가 없으면 날짜 기준 내림차순 정렬
    items.sort((a, b) => {
      if (a.lastestDay > b.lastestDay) return -1;
      if (a.lastestDay < b.lastestDay) return 1;
      return 0;
    });
  }

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

/**
 * 일별 시세 추이 조회
 *
 * @param lclsfCd - 대분류 코드 (현재는 사용하지 않지만 호환성을 위해 유지)
 * @param mclsfCd - 중분류 코드 (선택)
 * @param sclsfCd - 소분류 코드 (선택)
 * @param itemName - 품목명 (선택)
 * @param days - 조회 일수 (기본 30일)
 * @returns 날짜별 평균 가격 배열
 */
export async function getDailyPriceTrend(
  lclsfCd: string,
  mclsfCd?: string,
  sclsfCd?: string,
  itemName?: string,
  days: number = 30,
  productno?: string, // 테이블 데이터에서 추출한 품목 코드
  categoryCode?: string, // 테이블 데이터에서 추출한 카테고리 코드
): Promise<PriceTrendItem[]> {
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

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);

  const startDay = startDate.toISOString().split("T")[0];
  const endDay = today.toISOString().split("T")[0];

  console.group("📊 [getDailyPriceTrend] 일별 시세 추이 조회");
  console.log("품목명:", itemName || "전체");
  console.log("조회 일수:", days);
  console.log("날짜 범위:", startDay, "~", endDay);

  try {
    // 품목 코드 찾기 (우선순위: 전달받은 productno > 품목명으로 검색)
    let itemCodes: Array<{ itemCode: string; categoryCode: string }> = [];

    if (productno && categoryCode) {
      // 테이블 데이터에서 추출한 정보 사용
      console.log("📊 [getDailyPriceTrend] 테이블 데이터의 품목 정보 사용:", {
        productno,
        categoryCode,
      });
      itemCodes = [{ itemCode: productno, categoryCode }];
    } else if (itemName) {
      // 품목명으로 검색
      const productInfos = await fetchKAMISProductInfo({
        certKey,
        certId,
        itemName,
      });

      itemCodes = productInfos.map((info) => ({
        itemCode: info.itemCode,
        categoryCode: info.categoryCode,
      }));
    }

    const allItems: DailyPriceItem[] = [];

    if (itemCodes.length > 0) {
      // 품목 코드가 있으면 기간별 조회
      for (const { itemCode, categoryCode } of itemCodes.slice(0, 5)) {
        // 도매/소매 각각 조회
        for (const clsCode of ["01", "02"] as const) {
          const periodItems = await fetchKAMISPeriodProduct({
            certKey,
            certId,
            itemCode,
            categoryCode,
            startDay,
            endDay,
            productClsCode: clsCode,
          });
          allItems.push(...periodItems);
        }
      }
    } else {
      // 품목명이 없으면 전체 조회 (오늘 거래된 상품)
      const dailyItems = await getDailyMarketPrices({
        itemName,
        productClsCode: "all",
      });
      allItems.push(...dailyItems);
    }

    // 날짜별로 그룹화하여 평균 가격 계산
    const priceByDate = new Map<string, number[]>();

    allItems.forEach((item) => {
      const date = item.lastestDay;
      if (date && date >= startDay && date <= endDay) {
        if (!priceByDate.has(date)) {
          priceByDate.set(date, []);
        }
        priceByDate.get(date)!.push(item.dpr1);
      }
    });

    const results: PriceTrendItem[] = [];
    priceByDate.forEach((prices, date) => {
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      results.push({
        date,
        price: Math.round(avgPrice),
        source: "kamis",
      });
    });

    // 날짜순 정렬
    results.sort((a, b) => a.date.localeCompare(b.date));

    console.log("✅ 일별 시세 추이 조회 완료:", results.length, "일");
    console.groupEnd();

    return results;
  } catch (error) {
    console.error("❌ 시세 추이 조회 실패:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 월별 시세 추이 조회
 *
 * @param lclsfCd - 대분류 코드 (현재는 사용하지 않지만 호환성을 위해 유지)
 * @param mclsfCd - 중분류 코드 (선택)
 * @param sclsfCd - 소분류 코드 (선택)
 * @param itemName - 품목명 (선택)
 * @param months - 조회 월수 (기본 12개월)
 * @returns 월별 평균 가격 배열
 */
export async function getMonthlyPriceTrend(
  lclsfCd: string,
  mclsfCd?: string,
  sclsfCd?: string,
  itemName?: string,
  months: number = 12,
  productno?: string, // 테이블 데이터에서 추출한 품목 코드
  categoryCode?: string, // 테이블 데이터에서 추출한 카테고리 코드
): Promise<PriceTrendItem[]> {
  const results: PriceTrendItem[] = [];
  const today = new Date();

  console.group("📊 [getMonthlyPriceTrend] 월별 시세 추이 조회");
  console.log("대분류 코드:", lclsfCd);
  console.log("조회 월수:", months);
  console.log("품목명 필터:", itemName || "없음");

  try {
    // 각 월의 데이터 수집
    for (let i = 0; i < months; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const monthKey = `${year}-${month}`;

      // 해당 월의 데이터 조회 (월 중간 날짜 기준)
      const dayStr = "15";
      const dateString = `${year}${month}${dayStr}`;
      const startDay = `${year}-${month}-01`;
      const endDay = new Date(year, parseInt(month), 0)
        .toISOString()
        .split("T")[0];

      const dailyItems = await getDailyMarketPrices({
        itemName,
        productClsCode: "all",
      });

      // 해당 월의 데이터 필터링
      const monthItems = dailyItems.filter((item) => {
        const itemDate = item.lastestDay;
        return itemDate >= startDay && itemDate <= endDay;
      });

      if (monthItems.length > 0) {
        const avgPrice =
          monthItems.reduce((sum, item) => sum + item.dpr1, 0) /
          monthItems.length;
        results.push({
          date: monthKey,
          price: Math.round(avgPrice),
          source: "kamis",
        });
      }
    }

    console.log("✅ 월별 시세 추이 조회 완료:", results.length, "개월");
    console.groupEnd();

    return results.reverse(); // 오래된 월부터 정렬
  } catch (error) {
    console.error("❌ 월별 시세 추이 조회 실패:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 연별 시세 추이 조회
 *
 * @param lclsfCd - 대분류 코드 (현재는 사용하지 않지만 호환성을 위해 유지)
 * @param mclsfCd - 중분류 코드 (선택)
 * @param sclsfCd - 소분류 코드 (선택)
 * @param itemName - 품목명 (선택)
 * @param years - 조회 연수 (기본 5년)
 * @returns 연별 평균 가격 배열
 */
export async function getYearlyPriceTrend(
  lclsfCd: string,
  mclsfCd?: string,
  sclsfCd?: string,
  itemName?: string,
  years: number = 5,
  productno?: string, // 테이블 데이터에서 추출한 품목 코드
  categoryCode?: string, // 테이블 데이터에서 추출한 카테고리 코드
): Promise<PriceTrendItem[]> {
  const results: PriceTrendItem[] = [];
  const today = new Date();

  console.group("📊 [getYearlyPriceTrend] 연별 시세 추이 조회");
  console.log("대분류 코드:", lclsfCd);
  console.log("조회 연수:", years);
  console.log("품목명 필터:", itemName || "없음");

  try {
    // 각 연도의 데이터 수집
    for (let i = 0; i < years; i++) {
      const date = new Date(today);
      date.setFullYear(date.getFullYear() - i);

      const year = date.getFullYear();
      const yearKey = `${year}`;

      // 해당 연도의 데이터 조회 (각 월의 중간 날짜 샘플링)
      const yearPrices: number[] = [];

      for (let month = 1; month <= 12; month++) {
        const monthStr = String(month).padStart(2, "0");
        const startDay = `${year}-${monthStr}-01`;
        const endDay = new Date(year, month, 0).toISOString().split("T")[0];

        const dailyItems = await getDailyMarketPrices({
          itemName,
          productClsCode: "all",
        });

        // 해당 월의 데이터 필터링
        const monthItems = dailyItems.filter((item) => {
          const itemDate = item.lastestDay;
          return itemDate >= startDay && itemDate <= endDay;
        });

        if (monthItems.length > 0) {
          const avgPrice =
            monthItems.reduce((sum, item) => sum + item.dpr1, 0) /
            monthItems.length;
          yearPrices.push(avgPrice);
        }
      }

      if (yearPrices.length > 0) {
        const yearlyAvg =
          yearPrices.reduce((sum, p) => sum + p, 0) / yearPrices.length;
        results.push({
          date: yearKey,
          price: Math.round(yearlyAvg),
          source: "kamis",
        });
      }
    }

    console.log("✅ 연별 시세 추이 조회 완료:", results.length, "년");
    console.groupEnd();

    return results.reverse(); // 오래된 연도부터 정렬
  } catch (error) {
    console.error("❌ 연별 시세 추이 조회 실패:", error);
    console.groupEnd();
    throw error;
  }
}

// 타입 export (하위 호환성)
export type {
  MarketPriceParams,
  DailyPriceItem,
  PriceItem,
  PriceTrendItem,
} from "./market-prices-types";
