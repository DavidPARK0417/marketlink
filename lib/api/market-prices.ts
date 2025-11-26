/**
 * @file lib/api/market-prices.ts
 * @description 시세 조회 API 함수
 *
 * 공공데이터포털 전국 공영도매시장 실시간 경매정보 API를 사용하여 시세를 조회합니다.
 * API 엔드포인트: https://apis.data.go.kr/B552845/katRealTime/trades
 * 현재는 공공 API만 사용하며, 향후 KAMIS API fallback 추가 예정입니다.
 *
 * 주요 기능:
 * 1. 시세 조회 (거래정산일자, 대분류/중분류/소분류 코드 기반)
 * 2. 일주일 시세 추이 조회
 * 3. 주요 도매시장 및 품목 카테고리 정의
 *
 * @dependencies
 * - 환경 변수: PUBLIC_DATA_API_KEY
 *
 * @example
 * ```tsx
 * import { getMarketPrices } from '@/lib/api/market-prices';
 *
 * const prices = await getMarketPrices({
 *   date: '2025-11-26',
 *   lclsfCd: '06', // 과실류
 * });
 * ```
 */

// 타입 정의
export interface MarketPriceParams {
  date?: string; // 확정일자 (YYYY-MM-DD 형식)
  dateRange?: { from: string; to: string }; // 🆕 날짜 범위 (여러 날짜 조회)
  lclsfCd?: string; // 대분류 코드 (⚠️ API에서 무시됨)
  mclsfCd?: string; // 중분류 코드 (⚠️ API에서 무시됨)
  sclsfCd?: string; // 소분류 코드 (⚠️ API에서 무시됨)
  whslMrktCd?: string; // 🆕 도매시장 코드
  pageNo?: number; // 페이지 번호 (기본 1)
  numOfRows?: number; // 한 페이지 결과 수 (기본 10)
}

export interface PriceItem {
  cfmtnYmd: string; // 확정일자
  lclsfNm: string; // 대분류명
  mclsfNm: string; // 중분류명
  sclsfNm: string; // 소분류명
  avgPrice: number; // 평균가 (원)
  minPrice: number; // 최소가 (원)
  maxPrice: number; // 최고가 (원)
  source: "public"; // 데이터 출처
  // 🆕 추가 필드
  itemName: string; // 품목명
  varietyName: string; // 품종명 (원산지 정보 포함)
  marketCode: string; // 도매시장 코드
  marketName: string; // 도매시장명
  quality?: string; // 품질 등급 (특/상/중/하 - 있는 경우만)
  // 🆕 단위 및 수량 정보
  unitCode?: string; // 단위 코드
  unitName: string; // 단위명 (예: "kg", "박스")
  unitQuantity: number; // 단위당 수량 (예: 1.0, 4.0)
  quantity: number; // 거래 수량
  // 🆕 포장 및 출하지 정보
  packageCode?: string; // 포장 코드
  packageName?: string; // 포장명 (예: "상자")
  originCode?: string; // 출하지 코드
  originName?: string; // 출하지명 (예: "경상북도 의성군")
  // 🆕 기타 정보
  corporationName?: string; // 법인명
  auctionDate?: string; // 낙찰일시
  tradeType?: string; // 거래구분 (예: "경매")
}

export interface PriceTrendItem {
  date: string; // 날짜 (YYYY-MM-DD)
  price: number; // 평균 가격 (원)
  source?: "public";
}

// API 응답 타입 (실제 응답 구조에 맞게 조정 필요)
interface ApiResponse {
  response?: {
    header?: {
      resultCode?: string;
      resultMsg?: string;
    };
    body?: {
      items?: {
        item?: any | any[];
      };
      totalCount?: number;
    };
  };
  [key: string]: any; // 기타 필드 허용
}

/**
 * 날짜 범위 내의 모든 날짜를 배열로 반환
 * @param from YYYY-MM-DD
 * @param to YYYY-MM-DD
 */
function getDatesInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const startDate = new Date(from);
  const endDate = new Date(to);
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    dates.push(dateStr);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * 공공 API 호출 함수 (내부 함수)
 * 
 * ⚠️ API 제약사항:
 * - 실시간 경매 데이터만 반환 (특정 시점에는 특정 품목만 거래)
 * - 대분류 코드 필터링 미지원 (gds_lclsf_cd 파라미터 무시됨)
 * - 품목 다양성 확보를 위해 dateRange 파라미터 사용 권장
 */
async function fetchMarketPricesFromAPI(
  params: MarketPriceParams = {},
): Promise<PriceItem[]> {
  // 날짜 범위가 지정된 경우 여러 날짜의 데이터를 조회
  if (params.dateRange) {
    console.group("📊 [API 호출] 날짜 범위 시세 데이터 조회");
    console.log("날짜 범위:", params.dateRange.from, "~", params.dateRange.to);
    
    const allItems: PriceItem[] = [];
    const dates = getDatesInRange(params.dateRange.from, params.dateRange.to);
    
    console.log("조회할 날짜:", dates);
    
    for (const date of dates) {
      try {
        // 날짜별로 API 호출 (재귀 방지를 위해 dateRange 제거)
        const items = await fetchMarketPricesFromAPI({
          ...params,
          dateRange: undefined,
          date: date.replace(/-/g, ""), // YYYYMMDD 형식으로 변환
        });
        allItems.push(...items);
        console.log(`${date}: ${items.length}건 조회`);
        
        // API 부하 방지를 위한 딜레이 (0.3초)
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.warn(`${date} 조회 실패:`, error);
        // 에러가 나도 계속 진행
      }
    }
    
    console.log("총 조회 건수:", allItems.length);
    console.groupEnd();
    
    // 중복 제거 (동일 품목, 동일 날짜, 동일 가격)
    const uniqueItems = Array.from(
      new Map(
        allItems.map(item => [
          `${item.itemName}-${item.varietyName}-${item.cfmtnYmd}-${item.avgPrice}`,
          item
        ])
      ).values()
    );
    
    console.log("중복 제거 후:", uniqueItems.length, "건");
    return uniqueItems;
  }

  // 환경변수에서 API 키 가져오기 (따옴표 제거)
  const rawApiKey = process.env.PUBLIC_DATA_API_KEY;
  const apiKey = rawApiKey?.trim().replace(/^["']|["']$/g, "") || null;

  // 🔧 임시 테스트: 환경변수가 없을 때 하드코딩된 키 사용 (테스트 후 제거 필요)
  const TEST_API_KEY = "637bda9c5cbfe57e5f9bd8d403344dc96c3b8ec57e6ad52c980a355a554cffcc";
  const finalApiKey = apiKey || TEST_API_KEY;

  console.group("🔍 [market-prices] 환경변수 확인");
  console.log("환경변수 존재 여부:", !!rawApiKey);
  console.log("환경변수 원본 값:", rawApiKey ? `${rawApiKey.substring(0, 10)}...` : "없음");
  console.log("환경변수 길이:", rawApiKey?.length || 0);
  console.log("처리된 API 키 길이:", apiKey?.length || 0);
  console.log("최종 사용 API 키 길이:", finalApiKey?.length || 0);
  console.log("테스트 키 사용 여부:", !apiKey ? "⚠️ 예 (환경변수 없음, 테스트 키 사용)" : "✅ 아니오 (환경변수 사용)");
  console.groupEnd();

  if (!finalApiKey) {
    throw new Error("공공데이터포털 API 키가 설정되지 않았습니다.");
  }

  const baseUrl = "https://apis.data.go.kr/B552845/katRealTime/trades";

  // 기본 파라미터 설정
  const queryParams = new URLSearchParams({
    serviceKey: finalApiKey,
    pageNo: params.pageNo?.toString() || "1",
    numOfRows: params.numOfRows?.toString() || "10",
    returnType: "json",
  });

  // 검색 조건 파라미터 추가
  if (params.date) {
    queryParams.append("trd_clcln_ymd", params.date);
  }
  // 주의: API가 카테고리 코드로 필터링해도 실제로는 다른 카테고리의 데이터를 반환할 수 있음
  // 따라서 클라이언트 사이드에서 추가 필터링이 필요함
  if (params.lclsfCd) {
    queryParams.append("gds_lclsf_cd", params.lclsfCd);
    console.log("🔍 [API 호출] 대분류 코드 필터:", params.lclsfCd);
  }
  if (params.mclsfCd) {
    queryParams.append("gds_mclsf_cd", params.mclsfCd);
    console.log("🔍 [API 호출] 중분류 코드 필터:", params.mclsfCd);
  }
  if (params.sclsfCd) {
    queryParams.append("gds_sclsf_cd", params.sclsfCd);
  }
  // 🆕 도매시장 코드 파라미터
  if (params.whslMrktCd) {
    queryParams.append("whsl_mrkt_cd", params.whslMrktCd);
  }

  console.group("📊 [market-prices] 공공 API 호출");
  console.log("파라미터:", JSON.stringify(params, null, 2));
  console.log(
    "URL:",
    `${baseUrl}?${queryParams.toString().replace(finalApiKey, "***")}`,
  );
  console.log("API 키 길이:", finalApiKey.length);
  console.log("요청 시작 시간:", new Date().toISOString());

  const startTime = Date.now();

  try {
    const response = await fetch(`${baseUrl}?${queryParams}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const fetchDuration = Date.now() - startTime;
    console.log("📡 API 응답 수신:", {
      상태코드: response.status,
      상태텍스트: response.statusText,
      소요시간: `${fetchDuration}ms`,
      ContentType: response.headers.get("content-type"),
    });

    if (!response.ok) {
      // 응답 본문 읽기 시도
      let errorBody = "";
      try {
        errorBody = await response.text();
        console.error("❌ API 오류 응답 본문:", errorBody);
      } catch (e) {
        console.error("❌ 응답 본문 읽기 실패:", e);
      }

      throw new Error(
        `API 호출 실패: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody.substring(0, 200)}` : ""}`,
      );
    }

    let data: ApiResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("❌ JSON 파싱 실패:", parseError);
      const textResponse = await response.text();
      console.error("응답 본문 (텍스트):", textResponse.substring(0, 500));
      throw new Error(`API 응답 파싱 실패: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }

    console.log("📦 API 응답 데이터 구조:", {
      hasResponse: !!data.response,
      hasHeader: !!data.response?.header,
      resultCode: data.response?.header?.resultCode,
      resultMsg: data.response?.header?.resultMsg,
      hasBody: !!data.response?.body,
      hasItems: !!data.response?.body?.items,
      totalCount: data.response?.body?.totalCount,
      응답키: Object.keys(data),
    });

    // API 응답 확인 (새 API는 resultCode "0"이 정상)
    if (data.response?.header?.resultCode !== "0" && data.response?.header?.resultCode !== "00") {
      const errorMsg = data.response?.header?.resultMsg || "알 수 없는 오류";
      const resultCode = data.response?.header?.resultCode || "UNKNOWN";
      
      console.warn("⚠️ API 응답 오류:", {
        resultCode,
        resultMsg: errorMsg,
        전체응답: JSON.stringify(data, null, 2),
      });
      
      throw new Error(`API 응답 오류 [${resultCode}]: ${errorMsg}`);
    }

    // 데이터가 없는 경우
    if (!data.response?.body?.items?.item) {
      console.warn("⚠️ 경매 데이터가 없습니다:", {
        totalCount: data.response?.body?.totalCount,
        bodyKeys: Object.keys(data.response?.body || {}),
        itemsKeys: Object.keys(data.response?.body?.items || {}),
      });
      console.groupEnd();
      return [];
    }

    const items = Array.isArray(data.response.body.items.item)
      ? data.response.body.items.item
      : [data.response.body.items.item];

    console.log("📋 데이터 변환 시작:", {
      원본항목수: items.length,
      첫번째항목키: items[0] ? Object.keys(items[0]) : [],
    });
    
    // 첫 번째 항목의 실제 데이터 구조 로깅 (디버깅용)
    if (items.length > 0) {
      console.log("📋 첫 번째 항목 샘플 데이터:", {
        corp_gds_item_nm: items[0].corp_gds_item_nm,
        gds_mclsf_nm: items[0].gds_mclsf_nm,
        gds_sclsf_nm: items[0].gds_sclsf_nm,
        gds_lclsf_nm: items[0].gds_lclsf_nm,
        corp_gds_vrty_nm: items[0].corp_gds_vrty_nm,
        gds_lclsf_cd: items[0].gds_lclsf_cd,
        gds_mclsf_cd: items[0].gds_mclsf_cd,
      });
    }

    // API 응답 데이터를 PriceItem 형태로 변환
    // 새 API는 개별 거래 데이터를 반환하므로, 낙찰가격(scsbd_prc)을 사용
    const result = items.map((item: any, index: number) => {
      try {
        const price = parseFloat(item.scsbd_prc || "0");
        const varietyName = item.corp_gds_vrty_nm || "";
        const unitQuantity = parseFloat(item.unit_qty || "1.0");
        const quantity = parseFloat(item.qty || "0");
        
        const qualityValue = extractQuality(varietyName);
        
        // 거래일자: scsbd_dt (낙찰일시)에서 날짜 추출, 없으면 trd_clcln_ymd (정산일자) 사용
        // scsbd_dt가 있으면 항상 우선 사용 (실제 거래일)
        let tradeDate = "";
        if (item.scsbd_dt) {
          // scsbd_dt 형식: "2025-11-26 15:33:27" -> "2025-11-26"
          const dateMatch = item.scsbd_dt.match(/^(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            tradeDate = dateMatch[1];
          }
        }
        // scsbd_dt가 없을 때만 trd_clcln_ymd 사용 (정산일자는 거래 다음 날이므로 최후의 수단)
        if (!tradeDate && item.trd_clcln_ymd) {
          // trd_clcln_ymd 형식: "2025-11-27" 또는 "20251127"
          const dateStr = item.trd_clcln_ymd.replace(/-/g, "");
          if (dateStr.length === 8) {
            tradeDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
          } else {
            tradeDate = item.trd_clcln_ymd;
          }
        }
        
        const priceItem: PriceItem = {
          cfmtnYmd: tradeDate, // 낙찰일시에서 추출한 날짜 사용
          lclsfNm: item.gds_lclsf_nm || "",
          mclsfNm: item.gds_mclsf_nm || "",
          sclsfNm: item.gds_sclsf_nm || "",
          avgPrice: price,
          minPrice: price,
          maxPrice: price,
          source: "public" as const,
          // 🆕 추가 필드
          itemName: item.corp_gds_item_nm || item.gds_mclsf_nm || "",
          varietyName: varietyName,
          marketCode: item.whsl_mrkt_cd || "",
          marketName: item.whsl_mrkt_nm || "",
          // 🆕 단위 및 수량 정보
          unitName: item.unit_nm || "",
          unitQuantity: unitQuantity,
          quantity: quantity,
        };
        
        // 선택적 필드 추가
        if (qualityValue) priceItem.quality = qualityValue;
        if (item.unit_cd) priceItem.unitCode = item.unit_cd;
        if (item.pkg_cd) priceItem.packageCode = item.pkg_cd;
        if (item.pkg_nm) priceItem.packageName = item.pkg_nm;
        if (item.plor_cd) priceItem.originCode = item.plor_cd;
        if (item.plor_nm) priceItem.originName = item.plor_nm;
        if (item.corp_nm) priceItem.corporationName = item.corp_nm;
        if (item.scsbd_dt) priceItem.auctionDate = item.scsbd_dt;
        if (item.trd_se) priceItem.tradeType = item.trd_se;
        
        return priceItem;
      } catch (itemError) {
        console.error(`❌ 항목 ${index} 변환 실패:`, itemError, "원본 데이터:", item);
        return null;
      }
    }).filter((item): item is PriceItem => item !== null);

    const totalDuration = Date.now() - startTime;
    console.log("✅ 공공 API 성공:", {
      항목수: result.length,
      총소요시간: `${totalDuration}ms`,
      fetch소요시간: `${fetchDuration}ms`,
    });
    console.groupEnd();
    return result;
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.group("❌ 공공 API 실패");
    console.error("에러 타입:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("에러 메시지:", error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      console.error("에러 스택:", error.stack);
      console.error("에러 이름:", error.name);
    }
    
    console.error("소요 시간:", `${totalDuration}ms`);
    console.error("요청 URL:", `${baseUrl}?${queryParams.toString().replace(finalApiKey, "***")}`);
    console.groupEnd();
    throw error;
  }
}

/**
 * 시세 조회 함수
 *
 * @param params - 조회 파라미터
 * @returns 시세 정보 배열
 */
export async function getMarketPrices(
  params: MarketPriceParams = {},
): Promise<PriceItem[]> {
  // 현재: 공공 API만 사용
  return await fetchMarketPricesFromAPI(params);

  // 향후: KAMIS fallback 추가 시 아래 코드로 교체
  // try {
  //   return await fetchMarketPricesFromAPI(params);
  // } catch (publicError) {
  //   console.warn("⚠️ 공공 API 실패, KAMIS API로 전환:", publicError);
  //   return await fetchMarketPricesFromKAMIS(params);
  // }
}

/**
 * 일별 시세 추이 조회
 *
 * @param lclsfCd - 대분류 코드
 * @param mclsfCd - 중분류 코드 (선택)
 * @param sclsfCd - 소분류 코드 (선택)
 * @param itemName - 품목명 (선택, 필터링용)
 * @param days - 조회 일수 (기본 30일)
 * @returns 날짜별 평균 가격 배열
 */
export async function getDailyPriceTrend(
  lclsfCd: string,
  mclsfCd?: string,
  sclsfCd?: string,
  itemName?: string,
  days: number = 30,
): Promise<PriceTrendItem[]> {
  const results: PriceTrendItem[] = [];
  const today = new Date();

  console.group("📊 [getDailyPriceTrend] 일별 시세 추이 조회");
  console.log("대분류 코드:", lclsfCd);
  console.log("조회 일수:", days);
  console.log("품목명 필터:", itemName || "없음");

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}${month}${day}`; // YYYYMMDD 형식

    try {
      const prices = await getMarketPrices({
        date: dateString,
        lclsfCd,
        mclsfCd,
        sclsfCd,
        numOfRows: 1000, // 충분한 데이터 조회
      });

      // 품목명 필터링 (있는 경우)
      let filteredPrices = prices;
      if (itemName) {
        const keyword = itemName.toLowerCase();
        filteredPrices = prices.filter(
          (p) =>
            p.itemName.toLowerCase().includes(keyword) ||
            p.varietyName.toLowerCase().includes(keyword) ||
            p.mclsfNm.toLowerCase().includes(keyword),
        );
      }

      if (filteredPrices.length > 0) {
        // 같은 품목의 평균 가격 계산
        const avgPrice =
          filteredPrices.reduce((sum, p) => sum + p.avgPrice, 0) /
          filteredPrices.length;
        results.push({
          date: `${year}-${month}-${day}`, // YYYY-MM-DD 형식으로 저장
          price: Math.round(avgPrice),
          source: "public",
        });
      }
    } catch (error) {
      console.error(`${dateString} 데이터 조회 실패:`, error);
    }
  }

  console.log("✅ 일별 시세 추이 조회 완료:", results.length, "일");
  console.groupEnd();

  return results.reverse(); // 오래된 날짜부터 정렬
}

/**
 * 월별 시세 추이 조회
 *
 * @param lclsfCd - 대분류 코드
 * @param mclsfCd - 중분류 코드 (선택)
 * @param sclsfCd - 소분류 코드 (선택)
 * @param itemName - 품목명 (선택, 필터링용)
 * @param months - 조회 월수 (기본 12개월)
 * @returns 월별 평균 가격 배열
 */
export async function getMonthlyPriceTrend(
  lclsfCd: string,
  mclsfCd?: string,
  sclsfCd?: string,
  itemName?: string,
  months: number = 12,
): Promise<PriceTrendItem[]> {
  const results: PriceTrendItem[] = [];
  const today = new Date();

  console.group("📊 [getMonthlyPriceTrend] 월별 시세 추이 조회");
  console.log("대분류 코드:", lclsfCd);
  console.log("조회 월수:", months);
  console.log("품목명 필터:", itemName || "없음");

  for (let i = 0; i < months; i++) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${month}`;

    // 해당 월의 모든 데이터 수집 (매일 조회)
    const monthPrices: number[] = [];
    const daysInMonth = new Date(year, parseInt(month), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, "0");
      const dateString = `${year}${month}${dayStr}`;

      try {
        const prices = await getMarketPrices({
          date: dateString,
          lclsfCd,
          mclsfCd,
          sclsfCd,
          numOfRows: 1000,
        });

        // 품목명 필터링 (있는 경우)
        let filteredPrices = prices;
        if (itemName) {
          const keyword = itemName.toLowerCase();
          filteredPrices = prices.filter(
            (p) =>
              p.itemName.toLowerCase().includes(keyword) ||
              p.varietyName.toLowerCase().includes(keyword) ||
              p.mclsfNm.toLowerCase().includes(keyword),
          );
        }

        if (filteredPrices.length > 0) {
          const avgPrice =
            filteredPrices.reduce((sum, p) => sum + p.avgPrice, 0) /
            filteredPrices.length;
          monthPrices.push(avgPrice);
        }
      } catch (error) {
        // 일부 날짜 실패는 무시하고 계속 진행
        console.warn(`${dateString} 데이터 조회 실패:`, error);
      }
    }

    if (monthPrices.length > 0) {
      const monthlyAvg = monthPrices.reduce((sum, p) => sum + p, 0) / monthPrices.length;
      results.push({
        date: monthKey,
        price: Math.round(monthlyAvg),
        source: "public",
      });
    }
  }

  console.log("✅ 월별 시세 추이 조회 완료:", results.length, "개월");
  console.groupEnd();

  return results.reverse(); // 오래된 월부터 정렬
}

/**
 * 연별 시세 추이 조회
 *
 * @param lclsfCd - 대분류 코드
 * @param mclsfCd - 중분류 코드 (선택)
 * @param sclsfCd - 소분류 코드 (선택)
 * @param itemName - 품목명 (선택, 필터링용)
 * @param years - 조회 연수 (기본 5년)
 * @returns 연별 평균 가격 배열
 */
export async function getYearlyPriceTrend(
  lclsfCd: string,
  mclsfCd?: string,
  sclsfCd?: string,
  itemName?: string,
  years: number = 5,
): Promise<PriceTrendItem[]> {
  const results: PriceTrendItem[] = [];
  const today = new Date();

  console.group("📊 [getYearlyPriceTrend] 연별 시세 추이 조회");
  console.log("대분류 코드:", lclsfCd);
  console.log("조회 연수:", years);
  console.log("품목명 필터:", itemName || "없음");

  for (let i = 0; i < years; i++) {
    const date = new Date(today);
    date.setFullYear(date.getFullYear() - i);
    
    const year = date.getFullYear();
    const yearKey = `${year}`;

    // 해당 연도의 모든 데이터 수집 (월별로 샘플링)
    const yearPrices: number[] = [];
    
    // 각 월의 중간 날짜를 샘플로 조회 (성능 최적화)
    for (let month = 1; month <= 12; month++) {
      const monthStr = String(month).padStart(2, "0");
      const dayStr = "15"; // 월 중간 날짜
      const dateString = `${year}${monthStr}${dayStr}`;

      try {
        const prices = await getMarketPrices({
          date: dateString,
          lclsfCd,
          mclsfCd,
          sclsfCd,
          numOfRows: 1000,
        });

        // 품목명 필터링 (있는 경우)
        let filteredPrices = prices;
        if (itemName) {
          const keyword = itemName.toLowerCase();
          filteredPrices = prices.filter(
            (p) =>
              p.itemName.toLowerCase().includes(keyword) ||
              p.varietyName.toLowerCase().includes(keyword) ||
              p.mclsfNm.toLowerCase().includes(keyword),
          );
        }

        if (filteredPrices.length > 0) {
          const avgPrice =
            filteredPrices.reduce((sum, p) => sum + p.avgPrice, 0) /
            filteredPrices.length;
          yearPrices.push(avgPrice);
        }
      } catch (error) {
        // 일부 날짜 실패는 무시하고 계속 진행
        console.warn(`${dateString} 데이터 조회 실패:`, error);
      }
    }

    if (yearPrices.length > 0) {
      const yearlyAvg = yearPrices.reduce((sum, p) => sum + p, 0) / yearPrices.length;
      results.push({
        date: yearKey,
        price: Math.round(yearlyAvg),
        source: "public",
      });
    }
  }

  console.log("✅ 연별 시세 추이 조회 완료:", results.length, "년");
  console.groupEnd();

  return results.reverse(); // 오래된 연도부터 정렬
}

/**
 * 일주일 시세 추이 조회 (하위 호환성 유지)
 *
 * @deprecated getDailyPriceTrend를 사용하세요
 */
export async function getPriceTrend(
  lclsfCd: string,
  mclsfCd?: string,
  sclsfCd?: string,
  days: number = 7,
): Promise<PriceTrendItem[]> {
  return await getDailyPriceTrend(lclsfCd, mclsfCd, sclsfCd, undefined, days);
}

/**
 * 전국 주요 도매시장 코드 매핑
 * 전국 공영도매시장 실시간 경매정보 API 기준
 * 
 * 주요 도매시장:
 * - 서울: 가락시장 (송파구), 강서시장, 노량진수산시장
 * - 부산: 엄궁시장, 반여농산물시장
 * - 기타 지역별 중앙농수산물도매시장
 */
export const majorMarketCodes = {
  전체: undefined,
  "서울(가락)": "110001",
  "부산(엄궁)": "210001",
  "대구(북부)": "220001",
  "인천(구월)": "230001",
  광주: "250001",
  대전: "240001",
  울산: "260001",
  "경기(수원)": "410001",
  "강원(춘천)": "420001",
  "충북(청주)": "430001",
  "충남(천안)": "440001",
  "전북(전주)": "450001",
  "전남(목포)": "460001",
  "경북(안동)": "470001",
  "경남(진주)": "480001",
  제주: "500001",
} as const;

/**
 * 품질 등급 추출 함수
 * 품종명에서 품질 등급 정보를 추출합니다 (특/상/중/하)
 */
export function extractQuality(varietyName: string): string | undefined {
  if (!varietyName) return undefined;
  
  // 패턴: "특", "상", "중", "하", "(특)", "(상)", "특품", "상품" 등
  const patterns = [
    /\(특\)/,
    /\(상\)/,
    /\(중\)/,
    /\(하\)/,
    /특급/,
    /특품/,
    /상품/,
    /중품/,
    /\s특\s/,
    /\s상\s/,
    /\s중\s/,
    /\s하\s/,
  ];
  
  for (const pattern of patterns) {
    const match = varietyName.match(pattern);
    if (match) {
      // "특", "상", "중", "하"로 정규화
      const quality = match[0].replace(/[()품급\s]/g, "");
      if (["특", "상", "중", "하"].includes(quality)) {
        return quality;
      }
    }
  }
  
  return undefined;
}

/**
 * 주요 품목 카테고리 (대분류 코드 매핑)
 * 전국 공영도매시장 실시간 경매정보 API 기준
 */
export const itemCategories = {
  채소류: {
    code: "10",
    items: ["배추", "무", "고추", "마늘", "양파", "대파"],
  },
  과실류: {
    code: "06",
    items: ["사과", "배", "포도", "감귤", "딸기", "수박", "레몬"],
  },
  축산물: {
    code: "03",
    items: ["쇠고기", "돼지고기", "닭고기"],
  },
} as const;

/**
 * 품목명을 대분류 코드로 매핑하는 테이블
 * 검색 키워드에 따라 자동으로 카테고리 코드를 설정하기 위해 사용
 */
// ⚠️ 주의: 공공 API가 대분류 코드 필터링을 지원하지 않음
// 아래 매핑은 클라이언트 필터링용으로만 사용됨
export const itemNameToCategory: Record<string, { lclsfCd: string; mclsfCd?: string }> = {
  // 과실류 (추정 코드: 06, 실제 API 필터링 불가)
  "사과": { lclsfCd: "06" },
  "감귤": { lclsfCd: "06" },
  "단감": { lclsfCd: "06" },
  "감": { lclsfCd: "06" },
  "곶감": { lclsfCd: "06" },
  "배": { lclsfCd: "06" },
  "포도": { lclsfCd: "06" },
  "딸기": { lclsfCd: "06" },
  "수박": { lclsfCd: "06" },
  "레몬": { lclsfCd: "06" },
  "오렌지": { lclsfCd: "06" },
  "귤": { lclsfCd: "06" },
  "참외": { lclsfCd: "06" },
  "복숭아": { lclsfCd: "06" },
  "자두": { lclsfCd: "06" },
  "체리": { lclsfCd: "06" },
  "키위": { lclsfCd: "06" },
  "바나나": { lclsfCd: "06" },
  "파인애플": { lclsfCd: "06" },
  "망고": { lclsfCd: "06" },
  "토마토": { lclsfCd: "06" },
  "멜론": { lclsfCd: "06" },
  "석류": { lclsfCd: "06" },
  "무화과": { lclsfCd: "06" },
  "용과": { lclsfCd: "06" },
  "아보카도": { lclsfCd: "06" },
  
  // 채소류 (대분류 코드: 10)
  "배추": { lclsfCd: "10" },
  "무": { lclsfCd: "10" },
  "고추": { lclsfCd: "10" },
  "마늘": { lclsfCd: "10" },
  "양파": { lclsfCd: "10" },
  "대파": { lclsfCd: "10" },
  "파": { lclsfCd: "10" },
  "상추": { lclsfCd: "10" },
  "시금치": { lclsfCd: "10" },
  "당근": { lclsfCd: "10" },
  "오이": { lclsfCd: "10" },
  "가지": { lclsfCd: "10" },
  "호박": { lclsfCd: "10" },
  "애호박": { lclsfCd: "10" },
  "단호박": { lclsfCd: "10" },
  "브로콜리": { lclsfCd: "10" },
  "양배추": { lclsfCd: "10" },
  "파프리카": { lclsfCd: "10" },
  "피망": { lclsfCd: "10" },
  "고구마": { lclsfCd: "10" },
  "감자": { lclsfCd: "10" },
  "옥수수": { lclsfCd: "10" },
  "콩나물": { lclsfCd: "10" },
  "미나리": { lclsfCd: "10" },
  "냉이": { lclsfCd: "10" },
  "쪽파": { lclsfCd: "10" },
  "깐쪽파": { lclsfCd: "10" },
  "쌈배추": { lclsfCd: "10" },
  "부추": { lclsfCd: "10" },
  "케일": { lclsfCd: "10" },
  "청경채": { lclsfCd: "10" },
  "배추김치": { lclsfCd: "10" },
  "깻잎": { lclsfCd: "10" },
  "생강": { lclsfCd: "10" },
  "연근": { lclsfCd: "10" },
  "우엉": { lclsfCd: "10" },
  "셀러리": { lclsfCd: "10" },
  "아스파라거스": { lclsfCd: "10" },
  
  // 곡물류 (대분류 코드: 01 - API 확인 필요)
  "쌀": { lclsfCd: "01" },
  "현미": { lclsfCd: "01" },
  "찹쌀": { lclsfCd: "01" },
  "보리": { lclsfCd: "01" },
  "밀": { lclsfCd: "01" },
  "귀리": { lclsfCd: "01" },
  "수수": { lclsfCd: "01" },
  "조": { lclsfCd: "01" },
  "기장": { lclsfCd: "01" },
  
  // 두류/특용작물 (대분류 코드: 02 - API 확인 필요)
  "콩": { lclsfCd: "02" },
  "대두": { lclsfCd: "02" },
  "검은콩": { lclsfCd: "02" },
  "흰콩": { lclsfCd: "02" },
  "완두콩": { lclsfCd: "02" },
  "강낭콩": { lclsfCd: "02" },
  "팥": { lclsfCd: "02" },
  "녹두": { lclsfCd: "02" },
  "참깨": { lclsfCd: "02" },
  "깨": { lclsfCd: "02" },
  "들깨": { lclsfCd: "02" },
  "땅콩": { lclsfCd: "02" },
  
  // 견과류 (대분류 코드: 04 - API 확인 필요)
  "호두": { lclsfCd: "04" },
  "아몬드": { lclsfCd: "04" },
  "잣": { lclsfCd: "04" },
  "밤": { lclsfCd: "04" },
  "은행": { lclsfCd: "04" },
  "캐슈넛": { lclsfCd: "04" },
  "피스타치오": { lclsfCd: "04" },
  "마카다미아": { lclsfCd: "04" },
  "헤이즐넛": { lclsfCd: "04" },
  "피칸": { lclsfCd: "04" },
  
  // 수산물 (대분류 코드: 05 - API 확인 필요)
  "고등어": { lclsfCd: "05" },
  "갈치": { lclsfCd: "05" },
  "삼치": { lclsfCd: "05" },
  "명태": { lclsfCd: "05" },
  "조기": { lclsfCd: "05" },
  "광어": { lclsfCd: "05" },
  "우럭": { lclsfCd: "05" },
  "도미": { lclsfCd: "05" },
  "연어": { lclsfCd: "05" },
  "참치": { lclsfCd: "05" },
  "오징어": { lclsfCd: "05" },
  "낙지": { lclsfCd: "05" },
  "문어": { lclsfCd: "05" },
  "주꾸미": { lclsfCd: "05" },
  "새우": { lclsfCd: "05" },
  "게": { lclsfCd: "05" },
  "대게": { lclsfCd: "05" },
  "꽃게": { lclsfCd: "05" },
  "전복": { lclsfCd: "05" },
  "멍게": { lclsfCd: "05" },
  "미역": { lclsfCd: "05" },
  "다시마": { lclsfCd: "05" },
  "김": { lclsfCd: "05" },
  "굴": { lclsfCd: "05" },
  "바지락": { lclsfCd: "05" },
  "조개": { lclsfCd: "05" },
  
  // 축산물 (대분류 코드: 03)
  "쇠고기": { lclsfCd: "03" },
  "소고기": { lclsfCd: "03" },
  "돼지고기": { lclsfCd: "03" },
  "삼겹살": { lclsfCd: "03" },
  "닭고기": { lclsfCd: "03" },
  "오리고기": { lclsfCd: "03" },
  "계란": { lclsfCd: "03" },
  "달걀": { lclsfCd: "03" },
  "우유": { lclsfCd: "03" },
  "치즈": { lclsfCd: "03" },
  "버터": { lclsfCd: "03" },
  "요구르트": { lclsfCd: "03" },
} as const;

/**
 * 검색 키워드로부터 대분류 코드를 찾는 함수
 * 
 * @param keyword - 검색 키워드
 * @returns 대분류 코드와 중분류 코드 (없으면 undefined)
 */
export function getCategoryFromKeyword(keyword: string): { lclsfCd: string; mclsfCd?: string } | undefined {
  if (!keyword) return undefined;
  
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  // 정확한 매칭 먼저 시도
  if (itemNameToCategory[normalizedKeyword]) {
    return itemNameToCategory[normalizedKeyword];
  }
  
  // 부분 매칭 시도 (키워드가 품목명에 포함되거나, 품목명이 키워드에 포함되는 경우)
  for (const [itemName, category] of Object.entries(itemNameToCategory)) {
    if (normalizedKeyword.includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(normalizedKeyword)) {
      return category;
    }
  }
  
  return undefined;
}